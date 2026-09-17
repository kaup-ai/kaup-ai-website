// lint-staged.config.js — 按 staged files 扩展名路由（移植自 kaup-frontend）
// 配合 husky pre-commit；团队 pnpm install 自动装 hook（prepare: husky）
// ESM（package.json "type": "module"）
// 与 kaup-frontend 差异：无 stylelint（单 CSS 文件）、无 cargo fmt（无 src-tauri）

export default {
  // 前端 Vue/TS/JS/MJS：ESLint --fix（修语义）+ Prettier（收尾排版），
  // 顺序不可换：先修语义后排版，避免格式化与修复互相覆盖。
  '*.{vue,ts,js,mjs}': ['eslint --fix', 'prettier --write'],
  // CSS/SCSS/JSON/MD：Prettier
  '*.{css,scss,json,md}': ['prettier --write'],
  // YAML：Prettier（TOML 不含——Prettier 无 TOML parser）
  '*.{yaml,yml}': ['prettier --write'],
  // 密钥检测：secretlint（对齐 kaup-core detect-secrets）
  // secretlint 接 filenames，非零退出码 = 有密钥 → 拒绝提交
  '*.{ts,js,mjs,vue,json,yaml,yml,sh}': ['secretlint']
}
