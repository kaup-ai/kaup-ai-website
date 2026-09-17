/* v-reveal：滚动入场指令（源 site.js IntersectionObserver 行为移植）。
   - SSR 不注入任何属性（直出 HTML 无 .reveal——无 JS / 爬虫直接可读，
     优于 legacy 的 SSR 即 opacity:0）
   - reduced-motion 或无 IO 支持：mounted 直通 is-visible，内容常显
   - 命中即 unobserve（一次性入场），底部 -8% rootMargin 提前量 */
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) {
    // SSR 端注册空指令：避免模板里 v-reveal 触发 resolve 警告
    nuxtApp.vueApp.directive('reveal', { getSSRProps: () => ({}) })
    return
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let io: IntersectionObserver | null = null

  if (!reduce && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          io?.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    )
  }

  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement) {
      if (!io) {
        el.classList.add('is-visible')
        return
      }
      el.classList.add('reveal')
      io.observe(el)
    },
    unmounted(el: HTMLElement) {
      io?.unobserve(el)
    }
  })
})
