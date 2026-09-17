// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { getDefaultAttributes } from 'eslint-plugin-better-tailwindcss/api/defaults'
import prettierConfig from 'eslint-config-prettier'

export default withNuxt(
  // legacy/ 为旧静态站归档（内容移植对照源），不参与 lint；本地工具目录同理
  { ignores: ['legacy/', '.omc/', '.playwright-mcp/', '.serena/'] },
  betterTailwindcss.configs['correctness-error'],
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css',
        attributes: [...getDefaultAttributes(), ['^v-bind:ui$', [{ match: 'objectValues' }]]]
      }
    }
  },
  // prettier 独占格式权：关掉所有与 prettier 输出冲突的格式类规则
  // （member-delimiter / comma-dangle / 标签换行等）——否则 eslint --fix 与
  // prettier --write 会互相改写、永远无法同时绿（2026-09-17 实测）
  prettierConfig
)
