<script setup lang="ts">
/* CTA 带（源 .cta-band.metal）：品牌蓝铝金属板（metal + metal-cta）+ 白帽按钮
   （metal-btn-cap）+ 白描边次按钮。h2 保持纯白（深板上不用金属墨）。
   title 的 \n 渲染为 <br class="claim-br">（窄屏断行，桌面连排）。 */
const props = defineProps<{
  title: string
  description: string
  primary: { label: string; to: string }
  secondary?: { label: string; to: string }
}>()

const titleLines = computed(() => props.title.split('\n'))
</script>

<template>
  <section class="pb-24">
    <UContainer>
      <div
        class="metal metal-cta grid items-center gap-10 rounded-[20px] border border-[var(--plate-rim)] p-[clamp(40px,6vw,72px)] text-white shadow-[var(--plate-shadow-deep)] md:grid-cols-[minmax(0,1fr)_auto]"
      >
        <div>
          <h2
            class="mb-4 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-semibold tracking-tight"
          >
            <template v-for="(line, i) in titleLines" :key="i">
              {{ line }}<br v-if="i < titleLines.length - 1" class="claim-br" />
            </template>
          </h2>
          <p class="max-w-[48ch] text-white/80">
            {{ description }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            :to="primary.to"
            class="metal-btn-cap inline-flex min-h-12 items-center justify-center rounded-lg px-6 text-base font-medium active:translate-y-[1px]"
          >
            {{ primary.label }}
          </NuxtLink>
          <NuxtLink
            v-if="secondary"
            :to="secondary.to"
            class="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 bg-white/10 px-6 text-base font-medium transition-colors hover:border-white/50 hover:bg-white/20 active:translate-y-[1px]"
          >
            {{ secondary.label }}
          </NuxtLink>
        </div>
      </div>
    </UContainer>
  </section>
</template>
