#!/usr/bin/env bash
# =============================================================================
# TLS 档本地判据（可复跑）：对应 kaup-core infra/domestic/dev-tls-check.sh 的 AC-10
#   判据 = 「换证书 + `nginx -s reload` ⇒ 服务端握手时**实际出示**的证书指纹发生变化」
#   （不以脚本退出码 / nginx -t / 容器日志为通过依据）
#   副作用：起入口（TLS 档，宿主 8443）→ 重签自签证书 → reload → 退出前不 teardown
#
# 用法：bash scripts/dev-tls-check.sh
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/env-file.sh
. "${ROOT}/scripts/lib/env-file.sh"
kaup_load_env "$ROOT"

HOST="${ENTRY_HOST:-kaup-ai.com}"
PORT="${ENTRY_DEV_TLS_PORT:-8443}"
ENTRY_NAME="kaup-site-entry"

compose() { docker compose -f "${ROOT}/docker-compose.yml" -f "${ROOT}/docker-compose.dev.yml" "$@"; }

# TLS 档取值（同一模板的变量取值差异，不是机制差异）
export ENTRY_DEV_PUBLISH="$PORT" ENTRY_DEV_LISTEN_PORT="$PORT"
export ENTRY_LISTEN_TLS="listen ${PORT} ssl;"
export ENTRY_TLS_CERT_LINES="ssl_certificate     /etc/nginx/dev-tls/site.crt;
ssl_certificate_key /etc/nginx/dev-tls/site.key;"

[ -f "${ROOT}/nginx/dev-certs/site.crt" ] || bash "${ROOT}/scripts/gen-dev-certs.sh"

fp() {  # 服务端在 SNI = 主域 下实际出示的证书指纹
  openssl s_client -connect "127.0.0.1:${PORT}" -servername "$HOST" </dev/null 2>/dev/null \
    | openssl x509 -noout -fingerprint -sha256 || true
}

echo "→ 起入口（TLS 档：宿主 ${PORT}，域名 ${HOST}）"
compose up -d nginx-proxy

for _ in $(seq 1 30); do
  [ -n "$(fp)" ] && break
  sleep 2
done
if [ -z "$(fp)" ]; then
  echo "入口未在 127.0.0.1:${PORT} 就绪" >&2
  docker logs --tail 40 "$ENTRY_NAME" >&2 || true
  exit 1
fi

before="$(fp)"
code="$(curl -sk -o /dev/null -w '%{http_code}' "https://127.0.0.1:${PORT}/")"
echo "  指纹(before) = ${before}"
echo "  GET /        = ${code}"

echo "→ 重签证书 + reload 入口"
bash "${ROOT}/scripts/gen-dev-certs.sh" --force
docker exec "$ENTRY_NAME" nginx -s reload
sleep 1
after="$(fp)"
echo "  指纹(after)  = ${after}"

if [ "$before" = "$after" ]; then
  echo "❌ 判据失败：reload 后服务端出示的证书未变（换证未生效）" >&2
  exit 1
fi
if [ "$code" != "200" ]; then
  echo "❌ 判据失败：TLS 终止后 GET / 返回 ${code}（期望 200）" >&2
  exit 1
fi

echo "✅ 判据通过：证书已更换且 reload 后即刻生效；TLS 终止可用（本档为自签证书）"
echo "   公网签发/续期由 acme-companion 承担，见 nginx/README.md"
echo "   收尾：docker compose -f docker-compose.yml -f docker-compose.dev.yml down"
