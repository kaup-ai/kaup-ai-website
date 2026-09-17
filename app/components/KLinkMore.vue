<script setup lang="ts">
/* 「查看更多」链接（源 .link）：品牌色 + 箭头 hover 平移 3px。 */
defineProps<{
  label: string
  to: string
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="group inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary hover:underline hover:underline-offset-4"
  >
    <span>{{ label }}</span>
    <UIcon
      name="i-lucide-arrow-right"
      class="size-3.5 shrink-0 transition-transform group-hover:translate-x-[3px] motion-reduce:transition-none"
    />
  </NuxtLink>
</template>
