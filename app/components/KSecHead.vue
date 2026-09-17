<script setup lang="ts">
/* 栏目头（源 .sec-head / .sec-head-split）：eyebrow + 金属墨 h2 + lede。
   split 模式：左侧标题、右侧「查看更多」链接（slot），≤760px 折为上下。 */
withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    lede?: string
    amber?: boolean
    split?: boolean
  }>(),
  {
    lede: undefined,
    amber: true,
    split: false
  }
)
</script>

<template>
  <div
    v-if="split"
    class="mb-12 flex items-end justify-between gap-8 max-[760px]:flex-col max-[760px]:items-start"
  >
    <div class="max-w-[62ch] max-[760px]:mb-8">
      <KEyebrow :text="eyebrow" :amber="amber" />
      <h2
        class="metal-ink mt-4 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-semibold tracking-tight text-highlighted"
      >
        {{ title }}
      </h2>
      <p v-if="lede" class="mt-4 text-[clamp(16px,1.5vw,19px)] leading-relaxed text-toned">
        {{ lede }}
      </p>
    </div>
    <slot />
  </div>
  <div v-else class="mb-12 max-w-[62ch]">
    <KEyebrow :text="eyebrow" :amber="amber" />
    <h2
      class="metal-ink mt-4 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-semibold tracking-tight text-highlighted"
    >
      {{ title }}
    </h2>
    <p v-if="lede" class="mt-4 text-[clamp(16px,1.5vw,19px)] leading-relaxed text-toned">
      {{ lede }}
    </p>
    <slot />
  </div>
</template>
