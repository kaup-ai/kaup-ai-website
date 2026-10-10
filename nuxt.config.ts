// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/content', '@nuxt/ui', '@vueuse/nuxt'],

  runtimeConfig: {
    public: {
      // 站点根 URL：canonical / og:url / JSON-LD / robots / sitemap 的唯一来源。
      // 构建期注入：自托管镜像 = https://kaup-ai.com（Dockerfile 默认），Vercel = https://kaup.ai（项目环境变量）
      siteUrl: 'https://kaup.ai'
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  content: {
    experimental: {
      sqliteConnector: 'native'
    }
  },

  mdc: {
    highlight: {
      noApiRoute: false
    }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    prerender: {
      // 页面与站点级文件都在构建期定稿（后者由 server/routes 生成，不再放 public/ 硬编码域名）
      routes: [
        '/',
        '/capabilities',
        '/services',
        '/about',
        '/contact',
        '/robots.txt',
        '/sitemap.xml',
        '/llms.txt'
      ]
    },
    // 旧静态站 .html URL → 无后缀新路由（SEO 兼容，301 永久重定向）
    routeRules: {
      '/index.html': { redirect: { to: '/', statusCode: 301 } },
      '/capabilities.html': { redirect: { to: '/capabilities', statusCode: 301 } },
      '/services.html': { redirect: { to: '/services', statusCode: 301 } },
      '/about.html': { redirect: { to: '/about', statusCode: 301 } },
      '/contact.html': { redirect: { to: '/contact', statusCode: 301 } }
    }
  }
})
