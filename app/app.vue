<script setup lang="ts">
/* 全局 head（对齐 legacy 各页 head 的公共面）：
   - theme-color 跟随主题切换（源 site.js applyTheme 的 meta 联动）
   - og / twitter 基础面 + Organization / WebSite JSON-LD（@graph 前两节点，
     每页 WebPage 节点由 useKaupSeo 注入）
   - Google Analytics 仅生产加载（dev 不上报） */
const colorMode = useColorMode()

const themeColor = computed(() => (colorMode.value === 'dark' ? '#0A1A2F' : '#F7F9FC'))

const OG_ALT = '智御无疆 Kaup — 以 AI 助力企业超越能力和效率的边界'

const orgWebsiteLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://kaup.ai/#organization',
      name: '智御无疆 Kaup',
      alternateName: 'KAUP',
      url: 'https://kaup.ai/',
      logo: 'https://kaup.ai/brand/logo-horizontal-1024w.png',
      image: 'https://kaup.ai/og-image.png',
      description:
        '赋能企业的 AI 全链路编排与智能调度平台，面向中国 B2B 外贸企业提供 AI Agent 平台订阅、定制开发与本地/私有化部署。',
      slogan: '以 AI 助力企业超越能力和效率的边界，重新定义无限可能',
      email: 'sales@kaup.ai',
      address: {
        '@type': 'PostalAddress',
        addressRegion: '辽宁省',
        addressLocality: '大连市',
        addressCountry: 'CN'
      },
      areaServed: { '@type': 'Country', name: '中国' },
      knowsAbout: [
        'AI Agent',
        '外贸获客',
        '智能拓客',
        'ICP 三维评分',
        '开发信自动化',
        '客户全生命周期管理',
        '本地部署',
        '私有化部署',
        'HITL 人机协同',
        'CRM/ERP 集成'
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: '+8641188309999',
          email: 'sales@kaup.ai',
          availableLanguage: ['zh-CN']
        }
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://kaup.ai/#website',
      url: 'https://kaup.ai/',
      name: '智御无疆 Kaup',
      publisher: { '@id': 'https://kaup.ai/#organization' },
      inLanguage: 'zh-CN'
    }
  ]
}

useHead({
  htmlAttrs: { lang: 'zh-CN' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: themeColor },
    { name: 'msapplication-TileColor', content: '#0E2A47' },
    { name: 'msapplication-TileImage', content: '/brand/app-icon-512.png' },
    { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large' },
    { name: 'author', content: '智御无疆 Kaup' },
    { name: 'google-site-verification', content: '01RiUMnis6pg-MivPFV0EDbT2KlpD4Yd47tbIIPHspk' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'sitemap', type: 'application/xml', href: '/sitemap.xml' },
    ...(!import.meta.dev
      ? [{ rel: 'preconnect' as const, href: 'https://www.googletagmanager.com' }]
      : [])
  ],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(orgWebsiteLd) },
    ...(!import.meta.dev
      ? [
          {
            innerHTML:
              'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","G-KY2F8QZBEN")'
          },
          { src: 'https://www.googletagmanager.com/gtag/js?id=G-KY2F8QZBEN', async: true }
        ]
      : [])
  ]
})

useSeoMeta({
  ogType: 'website',
  ogSiteName: '智御无疆 Kaup',
  ogLocale: 'zh_CN',
  ogImage: 'https://kaup.ai/og-image.png',
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: OG_ALT,
  twitterCard: 'summary_large_image',
  twitterImage: 'https://kaup.ai/og-image.png'
})
</script>

<template>
  <UApp :toaster="{ expand: false }">
    <AppHeader />

    <UMain>
      <NuxtPage />
    </UMain>

    <AppFooter />
  </UApp>
</template>
