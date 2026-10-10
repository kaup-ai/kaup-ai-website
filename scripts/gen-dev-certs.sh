#!/usr/bin/env bash
# 生成本地自签证书（**仅本地档**：验证 TLS 终止 / SNI / 换证书后 reload 生效）。
# 正式环境证书由 acme-companion 签发/续期，不使用本脚本。
#
# 用法：bash scripts/gen-dev-certs.sh [--force]
#   --force：覆盖重签（用于验证"换证书 + reload"判据）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/env-file.sh
. "${ROOT}/scripts/lib/env-file.sh"
kaup_load_env "$ROOT"

OUT_DIR="${ROOT}/nginx/dev-certs"
HOST="${ENTRY_HOST:-kaup-ai.com}"
ALT_HOST="${ENTRY_ALT_HOST:-www.${HOST}}"
DAYS="${DEV_CERT_DAYS:-90}"
FORCE="${1:-}"

mkdir -p "$OUT_DIR"
if [ -f "${OUT_DIR}/site.crt" ] && [ "${FORCE}" != "--force" ]; then
  echo "自签证书已存在：${OUT_DIR}/site.crt（需要重签加 --force）"
  exit 0
fi

SAN="DNS:${HOST},DNS:${ALT_HOST},DNS:localhost,IP:127.0.0.1"
openssl req -x509 -newkey rsa:2048 -nodes -sha256 \
  -days "${DAYS}" \
  -keyout "${OUT_DIR}/site.key" -out "${OUT_DIR}/site.crt" \
  -subj "/CN=${HOST}" -addext "subjectAltName=${SAN}" 2>/dev/null

echo "已生成自签证书（CN=${HOST}，SAN=${SAN}，${DAYS} 天）"
# ⚠️ 不要与 -ext 组合打印指纹：openssl 在 -ext 模式下算的是另一种摘要，指纹会与
#    TLS 握手实际出示的证书指纹不一致（实测），故拆成两行。
openssl x509 -in "${OUT_DIR}/site.crt" -noout -subject -ext subjectAltName
openssl x509 -in "${OUT_DIR}/site.crt" -noout -fingerprint -sha256
