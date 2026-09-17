<script setup lang="ts">
/* 交付模式卡（源 .mode / .is-featured）：强调只落在 mode-tag 的颜色上，
   不做边框/阴影差（单卡加 --brand 边框会被读成「被描了黑边」）；
   fit 行 mt-auto 推到底部，与另一张卡等高对齐。 */
defineProps<{
  tag: string
  title: string
  body: string
  fit: string
  featured?: boolean
}>()
</script>

<template>
  <KCard as="article" class="flex flex-col p-6">
    <!-- tag 统一样式（用户 2026-09-17 定稿：两卡一致，不做 featured 变色强调）；
         色 = legacy --muted-2（#8898AB / #5B6B82） -->
    <span class="font-mono text-xs text-[#8898AB] dark:text-[#5B6B82]">{{ tag }}</span>
    <h3 class="mt-4 mb-3 text-[15px] font-semibold">
      {{ title }}
    </h3>
    <p class="text-sm leading-relaxed text-toned">
      {{ body }}
    </p>
    <p class="mt-auto border-t border-default pt-5 text-xs text-muted">
      {{ fit }}
    </p>
  </KCard>
</template>
