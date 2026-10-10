/* /llms.txt —— 面向 AI 助手的站点摘要，由站点根 URL 生成
   （构建期预渲染成静态文件，见 nuxt.config.ts 的 prerender.routes）。
   正文保存在 server/assets/llms.txt（Nitro server asset，字节序不变地随产物分发），
   此处把其中的绝对站点 URL 与商务邮箱统一替换为 NUXT_PUBLIC_SITE_URL 的取值 ——
   双通道并存下不能再硬编码域名（邮箱域名同样跟随站点域名）。 */
import { normalizeSiteUrl } from '../../shared/utils/site-url'

export default defineEventHandler(async (event) => {
  const siteUrl = normalizeSiteUrl(useRuntimeConfig(event).public.siteUrl as string | undefined)
  const template = await useStorage('assets:server').getItem<string>('llms.txt')

  if (!template) {
    throw createError({ statusCode: 500, statusMessage: 'llms.txt asset missing' })
  }

  const salesEmail = salesEmailFor(siteUrl)

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return template.replace(/https:\/\/kaup\.ai/g, siteUrl).replace(/sales@kaup\.ai/g, salesEmail)
})
