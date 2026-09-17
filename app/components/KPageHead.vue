<script setup lang="ts">
/* 内页页头（源 site.css .page-head）：eyebrow + h1（金属墨）+ 品牌主张（claim）+ lede。
   title 的 \n 渲染为硬换行；claim 在首个全角逗号后经 claim-br 于窄屏断行。 */
const props = defineProps<{
  eyebrow: string
  title: string
  claim?: string
  lede?: string
}>()

const titleLines = computed(() => props.title.split('\n'))

const claimParts = computed(() => {
  if (!props.claim) return []
  const i = props.claim.indexOf('，')
  return i === -1 ? [props.claim] : [props.claim.slice(0, i + 1), props.claim.slice(i + 1)]
})
</script>

<template>
  <section class="border-b border-default">
    <UContainer class="pb-16 pt-[clamp(40px,6vw,80px)]">
      <KEyebrow :text="eyebrow" />
      <h1
        class="metal-ink mt-5 text-[clamp(30px,4.4vw,48px)] leading-[1.06] font-semibold tracking-tight text-highlighted"
      >
        <template v-for="(line, i) in titleLines" :key="i">
          {{ line }}<br v-if="i < titleLines.length - 1" />
        </template>
      </h1>
      <p
        v-if="claim"
        class="mt-5 max-w-[34em] border-l-[3px] border-primary pl-5 text-[clamp(16px,1.5vw,19px)] leading-relaxed font-medium text-default"
      >
        <template v-for="(part, i) in claimParts" :key="i">
          {{ part }}<br v-if="i === 0 && claimParts.length > 1" class="claim-br" />
        </template>
      </p>
      <p
        v-if="lede"
        class="mt-5 max-w-[60ch] text-[clamp(16px,1.5vw,19px)] leading-relaxed text-toned"
      >
        {{ lede }}
      </p>
    </UContainer>
  </section>
</template>
