<script setup lang="ts">
/* 清单条目（源 .check-list）：序号 + 加粗标题 + 说明；分隔线首尾收敛（首条无上距、末条无线）。
   columns：双栏排布（services 可定制性 5 条，列间距 40px、行间距 0，同 legacy）。 */
withDefaults(
  defineProps<{
    items: { m: string; title: string; body: string }[]
    columns?: boolean
  }>(),
  {
    columns: false
  }
)
</script>

<template>
  <ul :class="columns ? 'grid md:grid-cols-2 md:gap-x-10' : 'flex flex-col'">
    <li
      v-for="item in items"
      :key="item.m"
      class="flex gap-4 border-b border-default py-5 first:pt-0 last:border-b-0 last:pb-0"
    >
      <span class="w-5 shrink-0 pt-[3px] font-mono text-xs text-dimmed">{{ item.m }}</span>
      <span>
        <strong class="mb-1 block font-medium">{{ item.title }}</strong>
        <p class="text-sm text-toned">
          {{ item.body }}
        </p>
      </span>
    </li>
  </ul>
</template>
