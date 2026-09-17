<script setup lang="ts">
/* 凸起金属板材卡片：--metal-card 亮度曲线 + 机加工板投影（tokens 见 main.css 金属层）。
   hover=true 加抬升反馈（阴影加深；reduced-motion 下全局禁过渡，仅剩即时切换）。 */
withDefaults(
  defineProps<{
    as?: string
    hover?: boolean
  }>(),
  { as: 'div', hover: false }
)
</script>

<template>
  <component
    :is="as"
    class="rounded-xl border border-default bg-[image:var(--metal-card)] shadow-[var(--plate-shadow)]"
    :class="
      hover
        ? 'transition-[box-shadow,transform] duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--plate-shadow-hover)]'
        : undefined
    "
  >
    <slot />
  </component>
</template>
