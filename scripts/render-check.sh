#!/usr/bin/env bash
# =============================================================================
# 入口 conf 渲染判据（可复跑；**不连 docker daemon**，只做静态渲染 + 不变量断言）
#   1) 白名单单一事实源：从 docker-compose.yml 的 entrypoint 抽出真实渲染白名单
#   2) 用 compose 求值后的容器环境（`docker compose config` 是纯文本层）复现容器内渲染
#   3) 断言：白名单变量全替换（无 ENTRY_* 残留）、nginx 自身变量保留、档位要素齐备、
#      结构要素齐备；模板注释里不得出现带 $ 的白名单变量（多行值会拆出非注释行）
#   4) 若 docker daemon 可用：额外跑一次真实 `nginx -t`（HTTP 档；TLS 档由 dev-tls-check.sh 覆盖）
#
# 用法：bash scripts/render-check.sh          # 跳过 nginx -t：NGINX_T=0
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT}/docker-compose.yml"
DEV_FILE="${ROOT}/docker-compose.dev.yml"
NGINX_IMAGE="nginxproxy/nginx-proxy:1.11-alpine"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fail() { echo "❌ $*" >&2; exit 1; }
ok() { echo "  ✓ $*"; }

# ── 0. 模板静态不变量：注释里不得出现带 $ 的白名单变量（envsubst 连注释一起替换）──
WL_RAW="$(sed -n "s/^ *WL='\(.*\)';$/\1/p" "$COMPOSE_FILE" | head -1)"
[ -n "$WL_RAW" ] || fail "未能在 docker-compose.yml 中解析出渲染白名单（WL=…）"
WL="$(printf '%s' "$WL_RAW" | sed 's/\$\$/$/g')"
WL_NAMES="$(printf '%s' "$WL" | tr -d '$')"
WL_ALT="$(printf '%s' "$WL" | tr ' ' '|' | sed 's/|/|/g')"
ok "白名单来源 = docker-compose.yml entrypoint（$(printf '%s' "$WL_NAMES" | tr -s ' ' '\n' | grep -c .) 个变量）"

for t in entry.conf.template entry-routing.conf entry-location.conf; do
  if grep -nE "^[[:space:]]*#.*\\\$(${WL_ALT})" "${ROOT}/nginx/${t}" > "${TMP}/comment-hit"; then
    cat "${TMP}/comment-hit" >&2
    fail "模板 ${t} 的注释里出现带 \$ 的白名单变量：多行值会把注释拆出非注释行"
  fi
done
ok "模板注释未内嵌白名单变量"

# ── 1. 取 compose 求值后的容器环境（prod 档 / 本地档）───────────────────────────
extract_env() {  # extract_env <outfile> [compose extra args...]
  local out="$1"; shift
  docker compose -f "$COMPOSE_FILE" "$@" config --format json > "${TMP}/cfg.json" \
    || fail "docker compose config 失败（缺 .env？先 cp .env.example .env）"
  python3 - "${TMP}/cfg.json" "$out" <<'PY'
import json, shlex, sys
cfg = json.load(open(sys.argv[1]))
env = cfg["services"]["nginx-proxy"].get("environment") or {}
with open(sys.argv[2], "w") as fh:
    fh.write("# 由 scripts/render-check.sh 生成：容器真实取值\n")
    for k, v in env.items():
        if v is None:
            continue
        # `docker compose config` 把 $ 重新转义成 $$（便于再次投喂 compose），而容器里是单个 $
        # ——已实测：容器内 ENTRY_HTTP_VHOST 为 `return 301 https://$host$request_uri;`。
        # 多行值用 shlex 引号安全落盘，供 render() source（单行 read 会截断多行值）。
        fh.write(f"export {k}={shlex.quote(v.replace('$$', '$'))}\n")
PY
}

render() {  # render <envfile> <out> <src>
  local envfile="$1" out="$2" src="$3"
  # 在子 shell 内 source（含多行值）后调用真实 envsubst，等价于容器 entrypoint 的渲染
  # shellcheck disable=SC1090
  ( set -a; . "$envfile"; set +a; envsubst "$WL" < "$src" > "$out" )
}

render_templates() {  # render_templates <envfile> <tag>
  local envfile="$1" tag="$2"
  render "$envfile" "${TMP}/entry.conf.${tag}" "${ROOT}/nginx/entry.conf.template"
  render "$envfile" "${TMP}/entry-routing.conf.${tag}" "${ROOT}/nginx/entry-routing.conf"
  render "$envfile" "${TMP}/entry-location.conf.${tag}" "${ROOT}/nginx/entry-location.conf"
  # 片段在容器内由 nginx include：内联后才是 nginx 实际解析的文本（断言与 nginx -t 都基于它）
  python3 - "${TMP}" "$tag" "${ROOT}/nginx/entry-security-headers.conf" <<'PY'
import pathlib, sys
tmp, tag, sec_path = sys.argv[1], sys.argv[2], sys.argv[3]
d = pathlib.Path(tmp)
sec = pathlib.Path(sec_path).read_text()
conf = (d / f"entry.conf.{tag}").read_text()
conf = conf.replace("include /etc/nginx/entry-routing.conf;", (d / f"entry-routing.conf.{tag}").read_text())
conf = conf.replace("include /etc/nginx/entry-location.conf;", (d / f"entry-location.conf.{tag}").read_text())
conf = conf.replace("include /etc/nginx/fragments/entry-security-headers.conf;", sec)
(d / f"inlined.{tag}").write_text(conf)
PY
}

assert_render() {  # assert_render <tag> <tls: 1|0>
  # 注意：`local a="$1" b="...${a}..."` 在 bash 5.3 会先展开再赋值 ⇒ a 未定义。故分两行。
  local tag="$1" tls="$2"
  local f="${TMP}/inlined.${tag}"
  [ -s "$f" ] || fail "渲染产物为空：${tag}"

  if grep -nE '\$ENTRY_[A-Z_]+' "$f" > "${TMP}/leftover"; then
    cat "${TMP}/leftover" >&2
    fail "渲染后仍有白名单变量残留（${tag}）"
  fi
  ok "白名单变量全部替换（${tag}）"

  for v in '$uri' '$host' '$scheme' '$request_id' '$binary_remote_addr' '$http_x_request_id' '$proxy_add_x_forwarded_for'; do
    grep -qF -- "$v" "$f" || fail "nginx 自身变量被误替换或丢失：${v}（${tag}）"
  done
  ok "nginx 自身变量保留（${tag}）"

  if [ "$tls" = "1" ]; then
    grep -qF 'listen 443 ssl;' "$f" || fail "TLS 档缺 ssl 监听（${tag}）"
    grep -qF 'ssl_certificate ' "$f" || fail "TLS 档缺证书行（${tag}）"
    grep -qF 'return 301 https' "$f" || fail "TLS 档缺 80→443 跳转 vhost（${tag}）"
    grep -qF 'acme-challenge' "$f" || fail "TLS 档缺 ACME 挑战 location（${tag}）"
    ok "TLS 档要素齐备（${tag}）"
  else
    if grep -qF 'ssl_certificate ' "$f"; then fail "HTTP 档不应出现证书行（${tag}）"; fi
    if grep -qF 'return 301 https' "$f"; then fail "HTTP 档不应出现跳转 vhost（${tag}）"; fi
    grep -qF 'listen ' "$f" || fail "HTTP 档缺监听（${tag}）"
    ok "HTTP 档要素正确（${tag}）"
  fi

  while IFS= read -r need; do
    [ -n "$need" ] || continue
    grep -qF -- "$need" "$f" || fail "渲染产物缺少结构要素：${need}（${tag}）"
  done <<'NEEDS'
limit_req_zone $binary_remote_addr zone=site_in
log_format entry_json
location = /entry-health
location /_nuxt/
Cache-Control "public, max-age=31536000, immutable"
Strict-Transport-Security
resolver 
proxy_pass http://
proxy_set_header X-Real-IP
server_name 
NEEDS
  ok "结构要素齐备（${tag}）"
}

echo "→ prod 档渲染（docker-compose.yml）"
extract_env "${TMP}/env.prod"
render_templates "${TMP}/env.prod" prod
assert_render prod 1

echo "→ 本地档渲染（+ docker-compose.dev.yml）"
extract_env "${TMP}/env.dev" -f "$DEV_FILE"
render_templates "${TMP}/env.dev" dev
assert_render dev 0

# ── 2. 可选：真实 nginx 语法检查（HTTP 档无证书依赖，最干净）─────────────────────
if [ "${NGINX_T:-1}" = "1" ] && docker info >/dev/null 2>&1; then
  echo "→ nginx -t（本地档渲染产物，容器 ${NGINX_IMAGE}）"
  docker run --rm \
    -v "${TMP}/inlined.dev:/etc/nginx/conf.d/entry.conf:ro" \
    --entrypoint nginx "$NGINX_IMAGE" -t 2>&1 | sed 's/^/  /'
  ok "nginx -t 通过"
else
  echo "→ 跳过 nginx -t（docker daemon 不可用，或 NGINX_T=0）"
  echo "   需要时：docker compose exec nginx-proxy nginx -t"
fi

echo "✅ 渲染判据通过（prod + 本地档）"
