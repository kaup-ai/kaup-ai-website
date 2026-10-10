/** 站点根 URL 归一化（去尾斜杠 + 兜底）。
 *
 * 为什么需要它：官网页面是**预渲染**的，canonical / og:url / JSON-LD 以及 robots、sitemap 里的
 * 绝对 URL 必须在构建期定稿；而两条部署通道域名不同（本项目既定约定）：
 *   - 自托管（Docker）→ `https://kaup-ai.com`：Dockerfile 以 `NUXT_PUBLIC_SITE_URL` 固化
 *   - Vercel          → `https://kaup.ai`  ：项目环境变量 `NUXT_PUBLIC_SITE_URL`
 * 未注入时回退到主域默认值（DEFAULT_SITE_URL），保证本地 `pnpm dev` / `pnpm build` 无需任何配置即可跑。
 */
export const DEFAULT_SITE_URL = 'https://kaup.ai'

export function normalizeSiteUrl(raw?: string | null, fallback: string = DEFAULT_SITE_URL): string {
  const value = (raw ?? '').trim()
  return (value || fallback).replace(/\/+$/, '')
}

/** 商务邮箱的本地部分（@ 之前）。只此一处定义，改邮箱名不必翻代码。 */
export const SALES_EMAIL_LOCAL_PART = 'sales'

/** 商务邮箱：**域名跟随站点根 URL**（自托管 → `sales@kaup-ai.com`；Vercel → `sales@kaup.ai`）。
 *
 * 为什么不单独配一个邮箱变量：两条通道的站点域名已由 NUXT_PUBLIC_SITE_URL 唯一确定，
 * 邮箱再配一次就多一个会漂移的旋钮——历史上它正是被硬编码在页面、页脚、JSON-LD、
 * 表单报错与 llms.txt 五处，才会两边串味。解析失败时回退主域，不抛错。
 * `www.` 前缀会被剥掉（邮箱域不带 www）。
 */
export function salesEmailFor(siteUrl: string, localPart: string = SALES_EMAIL_LOCAL_PART): string {
  let host: string
  try {
    host = new URL(siteUrl).hostname
  } catch {
    host = new URL(DEFAULT_SITE_URL).hostname
  }
  return `${localPart}@${host.replace(/^www\./i, '')}`
}
