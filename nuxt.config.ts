// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/content', '@nuxt/ui', '@vueuse/nuxt'],

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
      routes: ['/', '/capabilities', '/services', '/about', '/contact']
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
