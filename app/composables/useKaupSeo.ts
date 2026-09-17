/* 每页 SEO：title / description / canonical / og / twitter + WebPage JSON-LD。
   文案与字段面对齐 Phase 1 基线（.playwright-mcp/baseline/seo-extract.txt）：
   og:description 与 meta description 在基线里是两套文案，故独立可选字段。 */
export interface KaupSeo {
  title: string
  description: string
  /** og / twitter 专用文案；缺省回退 description */
  ogDescription?: string
}

export function useKaupSeo(seo: KaupSeo, path: string) {
  const url = `https://kaup.ai${path}`
  const ogDesc = seo.ogDescription ?? seo.description

  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: seo.title,
    ogDescription: ogDesc,
    ogUrl: url,
    twitterTitle: seo.title,
    twitterDescription: ogDesc
  })

  useHead({
    link: [{ rel: 'canonical', href: url }],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: seo.title,
          description: ogDesc,
          isPartOf: { '@id': 'https://kaup.ai/#website' },
          about: { '@id': 'https://kaup.ai/#organization' },
          inLanguage: 'zh-CN'
        })
      }
    ]
  })
}
