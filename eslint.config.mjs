// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { getDefaultAttributes } from 'eslint-plugin-better-tailwindcss/api/defaults'

export default withNuxt(
  // legacy/ 为旧静态站归档（内容移植对照源），不参与 lint；本地工具目录同理
  { ignores: ['legacy/', '.omc/', '.playwright-mcp/', '.serena/'] },
  betterTailwindcss.configs['correctness-error'],
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css',
        attributes: [...getDefaultAttributes(), ['^v-bind:ui$', [{ match: 'objectValues' }]]],
      },
    },
  },
)
