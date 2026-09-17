<script setup lang="ts">
/* 栏目标签：琥珀小圆点 + 大写小字（站内统一模式）。
   amber=false 时为 kicker 变体（无圆点）——页面用它控制琥珀 ≤2 处/屏的预算。 */
withDefaults(defineProps<{ text: string; amber?: boolean }>(), { amber: true })
</script>

<template>
  <span
    class="inline-flex items-center gap-2 text-xs font-mono tracking-[0.08em] uppercase text-neutral-600 dark:text-neutral-400"
  >
    <span v-if="amber" class="size-1.5 shrink-0 rounded-full bg-viking-400" aria-hidden="true" />
    {{ text }}
  </span>
</template>
