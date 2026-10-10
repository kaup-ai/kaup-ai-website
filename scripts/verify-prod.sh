#!/usr/bin/env bash
# =============================================================================
# 线上验证清单（**只读**：只有 GET 与容器内只读命令；不写飞书、不改配置、不动证书）
#
# 用法（服务器上、仓库根目录）：
#   bash scripts/verify-prod.sh              # 服务器内视角（经入口连 127.0.0.1）
#   bash scripts/verify-prod.sh --external   # 额外跑外部视角（需该网络能直连域名，不能有代理劫持）
#
# 判据：逐项打印 PASS/FAIL，退出码 = 失败项数（0 = 全绿）。
# ⚠️ 不要用 POST /api/contact 做"验证"：那会真的往飞书表格写一行并 @all 群。
# =============================================================================
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/env-file.sh
. "${ROOT}/scripts/lib/env-file.sh"
kaup_load_env "$ROOT"

EXTERNAL=0
[ "${1:-}" = "--external" ] && EXTERNAL=1

HOSTNAME_DOMAIN="${ENTRY_HOST:-kaup-ai.com}"
ALT_DOMAIN="${ENTRY_ALT_HOST:-}"
OTHER_DOMAIN="kaup.ai" # 另一条通道（Vercel）的域名：本档任何地方都不应出现它
WEB_CONTAINER="kaup-site-web"
ENTRY_CONTAINER="kaup-site-entry"
ACME_CONTAINER="kaup-site-entry-acme"

pass=0; fail=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; pass=$((pass + 1)); }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=$((fail + 1)); }
check(){ # check <描述> <期望子串> <实际值>
  if printf '%s' "$3" | rg -q -- "$2"; then ok "$1"; else bad "$1（期望含 '$2'，实际：${3:0:120}）"; fi
}
has()  { printf '%s' "$2" | rg -q -- "$1"; }

echo "== 目标：主域 ${HOSTNAME_DOMAIN}$([ -n "$ALT_DOMAIN" ] && printf ' / 附加域 %s' "$ALT_DOMAIN") =="

# ── 1. 容器与配置 ────────────────────────────────────────────────────────────
echo '-- 容器与配置'
check 'web 容器 healthy' 'healthy' "$(docker inspect --format '{{.State.Health.Status}}' "$WEB_CONTAINER" 2>&1 | tail -1)"
check '入口容器在运行' 'true' "$(docker inspect --format '{{.State.Running}}' "$ENTRY_CONTAINER" 2>&1 | tail -1)"
check 'acme 容器在运行' 'true' "$(docker inspect --format '{{.State.Running}}' "$ACME_CONTAINER" 2>&1 | tail -1)"
check '入口 conf 语法（nginx -t）' 'syntax is ok' "$(docker compose exec -T nginx-proxy nginx -t 2>&1 | tr -d '\r')"
check '证书已落盘' 'fullchain.pem' "$(docker compose exec -T nginx-proxy ls /etc/nginx/certs/"$HOSTNAME_DOMAIN" 2>&1 | tr -d '\r')"

# ── 2. 经入口的本机验证（TLS 用真实证书，不带 -k）──────────────────────────────
echo '-- 入口转发与 TLS（127.0.0.1 + SNI/Host）'
check 'HTTPS GET / = 200' '^200$' "$(curl -sS -o /dev/null -w '%{http_code}' -m 15 --resolve "$HOSTNAME_DOMAIN:443:127.0.0.1" "https://$HOSTNAME_DOMAIN/" 2>&1)"
check 'HTTP 80 → 301 跳 HTTPS' '^301 ' "$(curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' -m 15 -H "Host: $HOSTNAME_DOMAIN" http://127.0.0.1/ 2>&1)"
check '入口探针 /entry-health' '^ok$' "$(curl -sS -m 15 --resolve "$HOSTNAME_DOMAIN:443:127.0.0.1" "https://$HOSTNAME_DOMAIN/entry-health" 2>&1)"
check '安全头 HSTS' 'strict-transport-security' "$(curl -sSI -m 15 --resolve "$HOSTNAME_DOMAIN:443:127.0.0.1" "https://$HOSTNAME_DOMAIN/" 2>&1 | tr -d '\r')"
check '安全头 nosniff' 'x-content-type-options: nosniff' "$(curl -sSI -m 15 --resolve "$HOSTNAME_DOMAIN:443:127.0.0.1" "https://$HOSTNAME_DOMAIN/" 2>&1 | tr -d '\r')"
asset=$(curl -sS -m 15 --resolve "$HOSTNAME_DOMAIN:443:127.0.0.1" "https://$HOSTNAME_DOMAIN/" 2>/dev/null | grep -o '/_nuxt/[A-Za-z0-9_.-]*\.js' | head -1)
check '_nuxt 资产 immutable 缓存' 'max-age=31536000, immutable' "$(curl -sSI -m 15 --resolve "$HOSTNAME_DOMAIN:443:127.0.0.1" "https://$HOSTNAME_DOMAIN$asset" 2>&1 | tr -d '\r')"

# ── 3. 站点级文件与 SEO（域名必须是本档域名）──────────────────────────────────
echo '-- 站点级文件与 SEO'
base() { curl -sS -m 20 --resolve "$HOSTNAME_DOMAIN:443:127.0.0.1" "https://$HOSTNAME_DOMAIN$1" 2>/dev/null; }
check 'canonical 指向本档域名' "https://$HOSTNAME_DOMAIN/" "$(base / | grep -o '<link rel="canonical"[^>]*>' | head -1)"
check 'JSON-LD email 域名跟随' "sales@$HOSTNAME_DOMAIN" "$(base / | grep -o '"email":"[^"]*"' | head -1)"
check 'robots.txt 指向本档域名' "https://$HOSTNAME_DOMAIN" "$(base /robots.txt | head -1)"
check 'sitemap 首条 loc' "<loc>https://$HOSTNAME_DOMAIN/</loc>" "$(base /sitemap.xml | grep -o '<loc>[^<]*</loc>' | head -1)"
check 'llms.txt 官网行' "https://$HOSTNAME_DOMAIN" "$(base /llms.txt | grep -m1 '官网')"
arts="$(base / ; base /robots.txt; base /sitemap.xml; base /llms.txt)"
if [ -z "${arts//[[:space:]]/}" ]; then
  bad '站点级文件取不到内容（入口或上游不正常？）'
elif has "$OTHER_DOMAIN" "$arts"; then
  bad "站点级文件里出现了另一条通道的域名 $OTHER_DOMAIN（串味）"
else
  ok "站点级文件未串入 $OTHER_DOMAIN"
fi

# ── 4. 证书健康度 ────────────────────────────────────────────────────────────
echo '-- 证书'
handshake() { openssl s_client -connect 127.0.0.1:443 -servername "$HOSTNAME_DOMAIN" </dev/null 2>/dev/null; }
cert="$(handshake | openssl x509 -noout -issuer -ext subjectAltName 2>/dev/null | tr -s ' ')"
check '签发者不是 staging' 'Let.s Encrypt' "$(printf '%s' "$cert" | tr -d '\n')"
if has 'STAGING' "$cert"; then bad '证书来自 staging CA（应切回生产 CA 重签）'; else ok '非 staging 证书'; fi
check 'SAN 含主域' "$HOSTNAME_DOMAIN" "$cert"
[ -n "$ALT_DOMAIN" ] && check 'SAN 含附加域' "$ALT_DOMAIN" "$cert"
end="$(handshake | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"
if [ -n "${end:-}" ]; then
  ts=$(date -d "$end" +%s 2>/dev/null || date -j -f '%b %d %T %Y %Z' "$end" +%s 2>/dev/null || echo 0)
  days=$(( (ts - $(date +%s)) / 86400 ))
  check "证书剩余有效期 ≥ 30 天（当前 ${days} 天）" '^[3-9][0-9]$|^[0-9]{3,}$' "$days"
fi

# ── 5. 自动续期通道 ──────────────────────────────────────────────────────────
echo '-- acme-companion'
if ! log="$(docker logs --tail 200 "$ACME_CONTAINER" 2>&1 | tr -d '\r')"; then
  bad "读不到 ${ACME_CONTAINER} 的日志：$(printf '%s' "$log" | head -1)"
elif [ -z "${log//[[:space:]]/}" ]; then
  bad "${ACME_CONTAINER} 日志为空（容器刚起？）"
else
  if has 'Verification error|verify error|Verify error' "$log"; then
    bad 'acme 日志里有校验错误（docker logs kaup-site-entry-acme 细看）'
  else
    ok 'acme 日志无校验错误'
  fi
  if has 'Skipping|next renewal|Renewing|Creating/renewal|Certificate' "$log"; then
    ok '续期/签发循环已运行'
  else
    bad '未看到续期/签发循环记录'
  fi
fi

# ── 6. 镜像与版本 ────────────────────────────────────────────────────────────
echo '-- 镜像'
check 'web 镜像来自 GHCR' "ghcr.io/.*/kaup-ai-website" "$(docker inspect --format '{{index .Config.Image}}' "$WEB_CONTAINER" 2>&1)"
check '入口镜像 tag' 'nginx-proxy:1.11-alpine' "$(docker inspect --format '{{index .Config.Image}}' "$ENTRY_CONTAINER" 2>&1)"
check 'acme 镜像 tag' 'acme-companion:2.8' "$(docker inspect --format '{{index .Config.Image}}' "$ACME_CONTAINER" 2>&1)"

# ── 7. 外部视角（可选）──────────────────────────────────────────────────────
if [ "$EXTERNAL" = "1" ]; then
  echo '-- 外部视角（需本机可直连域名，且不能有代理劫持）'
  check '公网 HTTPS GET / = 200' '^200$' "$(curl -sS -o /dev/null -w '%{http_code}' -m 20 "https://$HOSTNAME_DOMAIN/" 2>&1)"
  check '公网证书校验通过（verify=0）' '^0$' "$(curl -sS -o /dev/null -w '%{ssl_verify_result}' -m 20 "https://$HOSTNAME_DOMAIN/" 2>&1)"
  check '公网 HTTP → 301' '^301 ' "$(curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' -m 20 "http://$HOSTNAME_DOMAIN/" 2>&1)"
fi

echo
echo "结果：${pass} 项通过，${fail} 项失败"
[ "$fail" -eq 0 ] || echo '失败项排查见 nginx/README.md 第 8 节与 docs/deploy-prod.md'
exit "$fail"
