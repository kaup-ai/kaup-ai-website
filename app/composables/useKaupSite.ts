/** 站点级取值（app 侧统一入口）：域名与商务邮箱的唯一来源都是 NUXT_PUBLIC_SITE_URL，
 *  归一化与兜底逻辑在 shared/utils/site-url.ts；页面为预渲染 ⇒ 取值在构建期定稿。 */
export function useKaupSiteUrl(): string {
  return normalizeSiteUrl(useRuntimeConfig().public.siteUrl as string | undefined)
}

/** 商务邮箱（域名跟随站点根 URL）：自托管 `sales@kaup-ai.com` / Vercel `sales@kaup.ai`。 */
export function useKaupSalesEmail(): string {
  return salesEmailFor(useKaupSiteUrl())
}
