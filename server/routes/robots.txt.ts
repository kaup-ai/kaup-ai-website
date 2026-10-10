/* /robots.txt —— 由站点根 URL 生成（构建期预渲染成静态文件，见 nuxt.config.ts 的 prerender.routes）。
   原先由 public/robots.txt 硬编码 https://kaup.ai；双通道并存（自托管 kaup-ai.com / Vercel kaup.ai）下
   会互相串味，故改为单一事实源生成。文本内容与原文件逐行一致，只把域名参数化。
   normalizeSiteUrl 来自 shared/utils/（Nuxt 4 约定：app 与 server 两侧都自动导入）。 */
export default defineEventHandler((event) => {
  const siteUrl = normalizeSiteUrl(useRuntimeConfig(event).public.siteUrl as string | undefined)

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return `# KAUP Website - ${siteUrl}

User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml

# LLM 站点索引（供 AI 助手读取的站点摘要）
# LLMs: ${siteUrl}/llms.txt

# Crawl-delay (polite crawling)
Crawl-delay: 1

# Block internal paths
Disallow: /.git/
Disallow: /.nuxt/
Disallow: /api/
`
})
