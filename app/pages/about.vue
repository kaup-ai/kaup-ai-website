<script setup lang="ts">
/* 关于我们页（源 legacy/about.html）：页头 + 品牌四字 + 定位（split + 层级表）
   + 使命 + CTA。文案在 content/about.yml。 */
const { data: page } = await useAsyncData('about', () => queryCollection('about').first())
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

useKaupSeo(page.value.seo, '/about')
</script>

<template>
  <div v-if="page">
    <KPageHead v-bind="page.head" />

    <!-- 品牌四字 -->
    <section class="py-24">
      <UContainer>
        <KSecHead v-reveal :eyebrow="page.chars.eyebrow" :title="page.chars.title" />
        <div class="grid gap-6 md:grid-cols-2">
          <KCard v-for="c in page.chars.cards" :key="c.glyph" v-reveal as="article" class="p-8">
            <span class="mb-5 block text-[44px] leading-none font-semibold text-primary">{{
              c.glyph
            }}</span>
            <h3 class="mb-4 text-[15px] font-semibold">
              {{ c.title }}
            </h3>
            <p
              v-for="(para, i) in c.paras"
              :key="i"
              class="text-sm leading-relaxed text-toned"
              :class="i > 0 ? 'mt-4' : undefined"
            >
              {{ para }}
            </p>
          </KCard>
        </div>
      </UContainer>
    </section>

    <!-- 定位 -->
    <section class="pb-24">
      <UContainer>
        <div class="grid items-start gap-8 md:grid-cols-2 md:gap-[clamp(32px,5vw,72px)]">
          <div class="max-w-[62ch]">
            <KEyebrow :text="page.position.eyebrow" />
            <h2
              class="metal-ink mt-4 mb-5 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-semibold tracking-tight text-highlighted"
            >
              {{ page.position.title }}
            </h2>
            <p class="text-[clamp(16px,1.5vw,19px)] leading-relaxed text-toned">
              {{ page.position.lede }}
            </p>
            <div class="mt-8 flex flex-col gap-3">
              <div v-for="f in page.position.fields" :key="f.k">
                <KEyebrow :text="f.k" :amber="false" class="mb-1.5" />
                <p :class="f.slogan ? 'text-lg font-semibold' : undefined">
                  {{ f.v }}
                </p>
              </div>
            </div>
          </div>
          <KTable
            v-reveal
            :caption="page.position.table.caption"
            :head="page.position.table.head"
            :rows="page.position.table.rows"
            plain
          />
        </div>
      </UContainer>
    </section>

    <!-- 使命 -->
    <section class="pb-24">
      <UContainer>
        <div class="max-w-[62ch]">
          <KEyebrow :text="page.mission.eyebrow" />
          <h2
            class="metal-ink mt-4 mb-5 text-[clamp(26px,3.4vw,38px)] leading-[1.12] font-semibold tracking-tight text-highlighted"
          >
            {{ page.mission.title }}
          </h2>
          <p class="text-[clamp(16px,1.5vw,19px)] leading-relaxed text-toned">
            {{ page.mission.lede }}
          </p>
          <p class="mt-8 text-[15px] leading-relaxed text-default">
            {{ page.mission.closing }}
          </p>
        </div>
      </UContainer>
    </section>

    <KCtaBand v-reveal v-bind="page.cta" />
  </div>
</template>
