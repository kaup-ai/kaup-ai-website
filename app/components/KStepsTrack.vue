<script setup lang="ts">
/* 合作流程步骤条（源 .steps-track）：桌面整宽五步（顶轨道线 + 节点圆点，
   首节点品牌色），≤900px 转竖向时间线（左轨道 + 描边圆点）——与获客链路同一语言。 */
defineProps<{
  steps: { n: string; title: string; desc: string; icon?: string }[]
}>()
</script>

<template>
  <ol
    class="grid grid-cols-5 border-t border-default max-[900px]:grid-cols-1 max-[900px]:gap-6 max-[900px]:border-0 max-[900px]:pl-10"
  >
    <li
      v-for="s in steps"
      :key="s.n"
      class="relative pr-5 pt-6 max-[900px]:p-0 before:absolute before:top-[-4px] before:left-0 before:size-[7px] before:rounded-full before:bg-accented before:content-[''] first:before:bg-primary max-[900px]:before:top-[3px] max-[900px]:before:left-[-33px] max-[900px]:before:size-[9px] max-[900px]:before:border-2 max-[900px]:before:border-accented max-[900px]:before:bg-default first:max-[900px]:before:border-primary not-last:max-[900px]:after:absolute not-last:max-[900px]:after:top-2.5 not-last:max-[900px]:after:-bottom-9 not-last:max-[900px]:after:left-[-27px] not-last:max-[900px]:after:w-0.5 not-last:max-[900px]:after:bg-default not-last:max-[900px]:after:content-['']"
    >
      <span class="font-mono text-xs text-dimmed">{{ s.n }}</span>
      <h3 class="mt-3 mb-2 flex items-center gap-2 text-base font-semibold">
        <UIcon v-if="s.icon" :name="s.icon" class="size-[17px] shrink-0 text-primary" />
        {{ s.title }}
      </h3>
      <p class="text-sm text-muted">
        {{ s.desc }}
      </p>
    </li>
  </ol>
</template>
