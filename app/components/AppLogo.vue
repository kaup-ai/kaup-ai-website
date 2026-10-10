<script setup lang="ts">
/* 明暗两版 logo 同时渲染，用 dark: 变体显隐（与 UColorModeButton 的做法一致）。

   不要改回「用 useColorMode() 计算 src」：预渲染/SSR 出的 payload 里
   colorMode.value 只能是 'system'（unknown: true），而 color-mode 的 head 内联脚本
   会在 hydration 之前就把 .dark 打到 <html> 上，于是水合时两端的 src 必然不同。
   属性级 mismatch 在生产环境不会被 Vue 修正，深色访客会一直看到浅色 logo。
   CSS 切换没有这个问题，且首帧即为正确配色、无闪换。 */
defineOptions({ inheritAttrs: false })
</script>

<template>
  <img
    v-bind="$attrs"
    src="/brand/logo-horizontal.svg"
    alt="智御无疆 Kaup"
    class="h-8 w-auto dark:hidden"
    height="32"
  />
  <img
    v-bind="$attrs"
    src="/brand/logo-horizontal-dark.svg"
    alt="智御无疆 Kaup"
    class="hidden h-8 w-auto dark:inline"
    height="32"
  />
</template>
