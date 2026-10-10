/* /sitemap.xml —— 由站点根 URL 生成（构建期预渲染成静态文件，见 nuxt.config.ts 的 prerender.routes）。
   页面清单、lastmod、changefreq、priority 与 image 条目与原 public/sitemap.xml 逐项一致，
   仅把域名参数化（原先硬编码 https://kaup.ai）。
   normalizeSiteUrl 来自 shared/utils/（Nuxt 4 约定：app 与 server 两侧都自动导入）。 */
interface SitemapImage {
  path: string
  title?: string
}

interface SitemapPage {
  path: string
  lastmod: string
  changefreq: string
  priority: string
  images: SitemapImage[]
}

const PAGES: SitemapPage[] = [
  {
    path: '/',
    lastmod: '2026-09-17',
    changefreq: 'weekly',
    priority: '1.0',
    images: [
      { path: '/og-image.png', title: '智御无疆 Kaup — 以 AI 助力企业超越能力和效率的边界' },
      { path: '/hero/kaup-desktop-light.png', title: '智御无疆桌面端：线索工作台界面' }
    ]
  },
  {
    path: '/capabilities',
    lastmod: '2026-09-17',
    changefreq: 'monthly',
    priority: '0.8',
    images: [{ path: '/og-image.png' }]
  },
  {
    path: '/services',
    lastmod: '2026-09-17',
    changefreq: 'monthly',
    priority: '0.8',
    images: [{ path: '/og-image.png' }]
  },
  {
    path: '/about',
    lastmod: '2026-09-17',
    changefreq: 'monthly',
    priority: '0.6',
    images: [{ path: '/og-image.png' }]
  },
  {
    path: '/contact',
    lastmod: '2026-09-17',
    changefreq: 'monthly',
    priority: '0.7',
    images: [
      { path: '/og-image.png' },
      { path: '/qr/official-account.jpg', title: '智御无疆微信公众号二维码' }
    ]
  }
]

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function renderPage(siteUrl: string, page: SitemapPage): string {
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(`${siteUrl}${page.path}`)}</loc>`,
    `    <lastmod>${page.lastmod}</lastmod>`,
    `    <changefreq>${page.changefreq}</changefreq>`,
    `    <priority>${page.priority}</priority>`
  ]

  for (const image of page.images) {
    lines.push(
      '    <image:image>',
      `      <image:loc>${escapeXml(`${siteUrl}${image.path}`)}</image:loc>`
    )
    if (image.title) {
      lines.push(`      <image:title>${escapeXml(image.title)}</image:title>`)
    }
    lines.push('    </image:image>')
  }

  lines.push('  </url>')
  return lines.join('\n')
}

export default defineEventHandler((event) => {
  const siteUrl = normalizeSiteUrl(useRuntimeConfig(event).public.siteUrl as string | undefined)

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${PAGES.map((page) => renderPage(siteUrl, page)).join('\n')}
</urlset>
`
})
