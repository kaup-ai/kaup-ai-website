<script setup lang="ts">
/* 平台能力页（源 legacy/capabilities.html）：页头 + 架构总览（split + 表）
   + 5 个能力组（锚点 #acquisition/#agent/#crm/#knowledge/#deploy）+ CTA。
   文案在 content/capabilities.yml。 */
const { data: page } = await useAsyncData('capabilities', () =>
  queryCollection('capabilities').first()
)
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

useKaupSeo(page.value.seo, '/capabilities')
</script>

<template>
  <div v-if="page">
    <KPageHead v-bind="page.head" />

    <!-- 架构总览 -->
    <section class="py-24">
      <UContainer>
        <div class="grid items-start gap-8 md:grid-cols-2 md:gap-[clamp(32px,5vw,72px)]">
          <div class="max-w-[62ch]">
            <KEyebrow :text="page.arch.eyebrow" />
            <h2
              class="metal-ink mt-4 mb-5 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-semibold tracking-tight text-highlighted"
            >
              {{ page.arch.title }}
            </h2>
            <p class="text-[clamp(16px,1.5vw,19px)] leading-relaxed text-toned">
              {{ page.arch.lede }}
            </p>
            <p class="mt-5 text-[15px] leading-relaxed text-toned">
              {{ page.arch.body }}
            </p>
          </div>
          <KTable v-reveal caption="关键技术选型" :rows="page.arch.rows" />
        </div>
      </UContainer>
    </section>

    <!-- 能力组（deploy 组附带架构五原则清单，split 布局） -->
    <section v-for="g in page.groups" :id="g.id" :key="g.id" class="pb-24">
      <UContainer>
        <KSecHead v-reveal :eyebrow="g.eyebrow" :title="g.title" :lede="g.lede" />
        <div
          v-if="g.checks"
          class="grid items-start gap-8 md:grid-cols-2 md:gap-[clamp(32px,5vw,72px)]"
        >
          <KCard v-for="c in g.cards" :key="c.idx" v-reveal as="article" class="p-6">
            <span class="mb-4 block font-mono text-xs text-dimmed">{{ c.idx }}</span>
            <h3 class="mb-3 text-[15px] font-semibold">
              {{ c.title }}
            </h3>
            <p class="text-sm leading-relaxed text-toned">
              {{ c.body }}
            </p>
          </KCard>
          <KCheckList v-reveal :items="g.checks" />
        </div>
        <div
          v-else
          class="grid gap-6"
          :class="g.grid === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'"
        >
          <KCard v-for="c in g.cards" :key="c.idx" v-reveal as="article" class="p-6">
            <span class="mb-4 block font-mono text-xs text-dimmed">{{ c.idx }}</span>
            <h3 class="mb-3 text-[15px] font-semibold">
              {{ c.title }}
            </h3>
            <p class="text-sm leading-relaxed text-toned">
              {{ c.body }}
            </p>
          </KCard>
        </div>
      </UContainer>
    </section>

    <KCtaBand v-reveal v-bind="page.cta" />
  </div>
</template>
