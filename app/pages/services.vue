<script setup lang="ts">
/* 服务与合作页（源 legacy/services.html）：页头 + 两种交付模式（卡 + 差异表）
   + 可定制性清单 + 交付流程与内容 + CTA。文案在 content/services.yml。 */
const { data: page } = await useAsyncData('services', () => queryCollection('services').first())
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

useKaupSeo(page.value.seo, '/services')
</script>

<template>
  <div v-if="page">
    <KPageHead v-bind="page.head" />

    <!-- 两种模式 -->
    <section class="py-24">
      <UContainer>
        <KSecHead
          v-reveal
          :eyebrow="page.modes.eyebrow"
          :title="page.modes.title"
          :lede="page.modes.lede"
        />
        <div class="mb-12 grid gap-6 md:grid-cols-2">
          <KModeCard v-for="m in page.modes.cards" :key="m.tag" v-reveal v-bind="m" />
        </div>
        <KTable
          v-reveal
          :caption="page.modeTable.caption"
          :head="page.modeTable.head"
          :rows="page.modeTable.rows"
          plain
        />
        <p class="mt-4 text-xs text-dimmed">
          {{ page.modeTable.note }}
        </p>
      </UContainer>
    </section>

    <!-- 为何能定制 -->
    <section class="pb-24">
      <UContainer>
        <KSecHead :eyebrow="page.customization.eyebrow" :title="page.customization.title" />
        <KCheckList v-reveal :items="page.customization.checks" columns />
      </UContainer>
    </section>

    <!-- 流程与交付 -->
    <section class="pb-24">
      <UContainer>
        <KSecHead
          v-reveal
          :eyebrow="page.delivery.eyebrow"
          :title="page.delivery.title"
          :lede="page.delivery.lede"
        />
        <KStepsTrack v-reveal :steps="page.delivery.steps" class="mb-12" />
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KCard v-for="c in page.delivery.cards" :key="c.title" v-reveal as="article" class="p-6">
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
