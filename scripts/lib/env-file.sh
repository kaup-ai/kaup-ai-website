#!/usr/bin/env bash
# 共用小工具（被 scripts/*.sh source，不单独执行）

# kaup_load_env <repo-root>
#   从 <repo-root>/.env 读入**尚未设置**的变量：调用方已导出的值优先，不被 .env 覆盖。
#   （.env 同时供 compose 插值与本地脚本使用，故脚本也认它；两者取值必须一致。）
kaup_load_env() {
  local root="$1" line key value
  [ -f "${root}/.env" ] || return 0
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|'#'*) continue ;; esac
    case "$line" in *=*) ;; *) continue ;; esac
    key="$(printf '%s' "${line%%=*}" | tr -d '[:space:]')"
    case "$key" in *[!A-Za-z0-9_]*) continue ;; esac
    value="${line#*=}"
    value="${value%\"}"; value="${value#\"}"
    value="${value%\'}"; value="${value#\'}"
    if [ -z "${!key:-}" ]; then
      export "$key=$value"
    fi
  done < "${root}/.env"
}
