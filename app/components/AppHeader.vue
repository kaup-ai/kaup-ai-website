<script setup lang="ts">
/* Kaup 页头：五页导航 + 主题切换 + 预约演示 CTA。
   UNavigationMenu 按 to 精确匹配路由自动高亮当前页（对齐 legacy aria-current 语义）。 */
const items = computed(() => [
  { label: '首页', to: '/' },
  { label: '平台能力', to: '/capabilities' },
  { label: '服务与合作', to: '/services' },
  { label: '关于我们', to: '/about' },
  { label: '联系我们', to: '/contact' }
])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="focus-visible:outline-3 outline-primary/25 rounded-md p-1 -ms-1" aria-label="智御无疆 Kaup — 首页">
        <AppLogo class="h-7 w-auto shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu :items="items" variant="link" />

    <template #right>
      <UColorModeButton />
      <UButton
        to="/contact"
        label="预约演示"
        color="neutral"
        variant="outline"
      />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-ms-2.5" />
      <USeparator class="my-4" />
      <UColorModeButton size="sm" class="ms-1.5" />
      <UButton to="/contact" label="预约演示" class="mt-4 w-full" />
    </template>
  </UHeader>
</template>
