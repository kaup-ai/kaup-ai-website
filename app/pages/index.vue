<script setup lang="ts">
/* 首页（源 legacy/index.html）：hero 金属主视觉 + 获客链路 + facts + 痛点 + 形态对比
   + 能力图谱 + 服务模式 + 合作流程 + CTA。文案在 content/index.yml。
   琥珀预算：hero 屏 = 呼吸灯 1 处；链路屏 = eyebrow 圆点 + HITL 标签 = 2 处（封顶）。 */
const { data: page } = await useAsyncData('home', () => queryCollection('index').first())
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

useSeoMeta({
  title: page.value.seo.title,
  ogTitle: page.value.seo.title,
  description: page.value.seo.description,
  ogDescription: page.value.seo.description
})
</script>

<template>
  <div v-if="page">
    <!-- ============ HERO（金属 · 全站两处拉丝之一） ============ -->
    <section class="metal text-center">
      <UContainer
        class="flex flex-col items-center pt-[clamp(96px,16vh,150px)] pb-[clamp(40px,6vh,64px)]"
      >
        <!-- lockup 容器宽 = viewBox 框宽（中轴 = 整块墨迹中轴，元素居中即墨迹居中） -->
        <div class="flex w-[min(88%,76vh,500px)] flex-col items-center">
          <h1 class="w-full">
            <HeroLockup />
          </h1>
        </div>

        <span class="mt-[clamp(20px,3vh,32px)] text-xs font-medium tracking-[0.08em] text-muted"
          >智以为御，无疆为境 · Kaup Your Trade</span
        >

        <p
          class="mt-[clamp(32px,5vh,64px)] max-w-[32em] text-[clamp(17px,1.55vw,22px)] leading-relaxed font-medium text-default"
        >
          以 AI 助力企业超越能力和效率的边界，<br class="claim-br" />重新定义无限可能
        </p>

        <!-- 产品实拍：浅/深随主题切换；srcset 三档宽度防 UI 小字发虚，固有尺寸防 CLS -->
        <div
          class="mt-[clamp(28px,4vh,44px)] w-[min(100%,1080px)] overflow-hidden rounded-2xl border border-default shadow-[var(--elev-4),inset_0_0_0_1px_var(--edge-hi)]"
        >
          <img
            src="/hero/kaup-desktop-light.png"
            srcset="
              /hero/kaup-desktop-light-1280.png 1280w,
              /hero/kaup-desktop-light-1920.png 1920w,
              /hero/kaup-desktop-light.png      2560w
            "
            sizes="(max-width: 1160px) calc(100vw - 40px), 1080px"
            alt="智御无疆桌面端：线索工作台界面"
            width="2560"
            height="1600"
            decoding="async"
            fetchpriority="high"
            class="block w-full dark:hidden"
          />
          <img
            src="/hero/kaup-desktop-dark.png"
            srcset="
              /hero/kaup-desktop-dark-1280.png 1280w,
              /hero/kaup-desktop-dark-1920.png 1920w,
              /hero/kaup-desktop-dark.png      2560w
            "
            sizes="(max-width: 1160px) calc(100vw - 40px), 1080px"
            alt=""
            aria-hidden="true"
            width="2560"
            height="1600"
            decoding="async"
            loading="lazy"
            class="hidden w-full dark:block"
          />
        </div>

        <div class="mt-[clamp(24px,3.5vh,40px)] flex flex-wrap justify-center gap-3">
          <NuxtLink
            to="/contact"
            class="metal-btn inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 text-base font-medium active:translate-y-[1px]"
          >
            预约方案沟通
          </NuxtLink>
          <UButton to="/capabilities" size="xl" color="neutral" variant="outline">
            查看能力图谱
          </UButton>
        </div>

        <p class="mt-5 max-w-[48em] text-sm text-muted">
          {{ page.hero.note }}
        </p>

        <a
          href="#chain"
          class="mt-[clamp(24px,4vh,48px)] inline-flex items-center gap-2 text-xs tracking-[0.08em] text-muted hover:text-default"
        >
          <span>向下了解</span>
          <UIcon name="i-lucide-arrow-down" class="size-3.5" />
        </a>
      </UContainer>
    </section>

    <!-- ============ 获客链路 ============ -->
    <section id="chain" class="pt-10 pb-24">
      <UContainer>
        <KSecHead :eyebrow="page.chain.eyebrow" :title="page.chain.title" :lede="page.chain.lede" />
        <ol
          aria-label="外贸获客链路的五个环节"
          class="grid grid-cols-5 gap-6 max-[900px]:grid-cols-1 max-[900px]:pl-10"
        >
          <li
            v-for="s in page.chain.steps"
            :key="s.n"
            class="relative flex flex-col gap-2 rounded-xl border border-default bg-[image:var(--metal-card)] px-5 py-4 shadow-[var(--plate-shadow)] after:pointer-events-none after:absolute after:top-1/2 after:-right-6 after:w-6 after:-translate-y-1/2 after:text-center after:text-sm after:text-dimmed after:content-['→'] last:after:content-none max-[900px]:flex-row max-[900px]:flex-wrap max-[900px]:items-center max-[900px]:gap-x-2 max-[900px]:rounded-none max-[900px]:border-0 max-[900px]:bg-none max-[900px]:p-0 max-[900px]:shadow-none max-[900px]:after:content-none not-last:max-[900px]:before:absolute not-last:max-[900px]:before:top-3 not-last:max-[900px]:before:-bottom-9 not-last:max-[900px]:before:-left-8 not-last:max-[900px]:before:w-0.5 not-last:max-[900px]:before:bg-default not-last:max-[900px]:before:content-['']"
          >
            <span class="mb-1 flex items-center justify-between gap-2 max-[900px]:contents">
              <span
                class="font-mono text-xs text-dimmed max-[900px]:absolute max-[900px]:-left-11 max-[900px]:-top-0.5 max-[900px]:z-10 max-[900px]:flex max-[900px]:size-7 max-[900px]:items-center max-[900px]:justify-center max-[900px]:rounded-full max-[900px]:border max-[900px]:border-default max-[900px]:bg-default"
                :class="
                  s.hitl ? 'max-[900px]:border-viking-400 max-[900px]:text-viking-700' : undefined
                "
                >{{ s.n }}</span
              >
              <span
                class="order-2 inline-flex h-[22px] shrink-0 items-center whitespace-nowrap rounded-full border border-transparent px-2 text-[11px] font-medium tracking-[0.02em]"
                :class="
                  s.hitl
                    ? 'bg-viking-50 text-viking-700 dark:bg-viking-950 dark:text-viking-300'
                    : 'bg-fjord-100 text-fjord-600 dark:bg-[#152D4D] dark:text-fjord-500'
                "
                >{{ s.hitl ? '人工确认' : 'Agent' }}</span
              >
            </span>
            <span class="order-1 flex items-center gap-2 text-base font-semibold">
              <UIcon :name="s.icon" class="size-[18px] shrink-0 text-primary" />{{ s.name }}
            </span>
            <span
              class="text-xs text-muted max-[900px]:order-3 max-[900px]:mt-1 max-[900px]:basis-full"
              >{{ s.desc }}</span
            >
          </li>
        </ol>
        <p class="mt-6 text-xs text-muted">
          {{ page.chain.note }}
        </p>
      </UContainer>
    </section>

    <!-- ============ FACTS ============ -->
    <section>
      <UContainer>
        <div class="grid border-y border-default md:grid-cols-3">
          <div
            v-for="(f, i) in page.facts"
            :key="f.num"
            class="border-default py-8 max-md:border-b last:max-md:border-b-0 md:border-r last:md:border-r-0"
            :class="i === 0 ? 'md:pr-8' : 'md:px-8'"
          >
            <UIcon :name="f.icon" class="mb-3 block size-[22px] text-primary" />
            <span
              class="metal-ink block font-mono text-[clamp(28px,3.4vw,40px)] leading-[1.05] font-semibold tracking-[-0.03em]"
              >{{ f.num
              }}<span
                v-if="f.unit"
                class="ml-1.5 text-[0.5em] font-medium tracking-normal text-muted [-webkit-text-fill-color:var(--ui-text-muted)]"
                >{{ f.unit }}</span
              ></span
            >
            <p class="mt-3 text-sm text-toned">
              {{ f.label }}
            </p>
            <span class="mt-2 block text-xs text-dimmed">{{ f.src }}</span>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ============ 痛点 ============ -->
    <section class="py-24">
      <UContainer>
        <KSecHead :eyebrow="page.pain.eyebrow" :title="page.pain.title" :lede="page.pain.lede" />
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <KCard v-for="c in page.pain.cards" :key="c.title" as="article" class="p-6">
            <span
              class="mb-5 inline-flex size-[34px] items-center justify-center rounded-lg bg-[image:var(--chip-bg)] text-primary shadow-[inset_0_1px_0_var(--edge-hi),var(--elev-1)]"
            >
              <UIcon :name="c.icon" class="size-[17px]" />
            </span>
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

    <!-- ============ 形态对比 ============ -->
    <section class="pb-24">
      <UContainer>
        <KSecHead
          :eyebrow="page.compare.eyebrow"
          :title="page.compare.title"
          :lede="page.compare.lede"
        />
        <div
          class="grid overflow-hidden rounded-xl border border-default bg-default shadow-[var(--plate-shadow)] md:grid-cols-2"
        >
          <div
            v-for="p in page.compare.panels"
            :key="p.tag"
            class="border-default p-8 max-[760px]:border-t max-[760px]:first:border-t-0 md:border-l md:first:border-l-0"
          >
            <div class="mb-5 flex items-center gap-3 border-b border-default pb-5 font-medium">
              <span
                class="inline-flex h-[22px] shrink-0 items-center whitespace-nowrap rounded-full border px-2 text-[11px] font-medium tracking-[0.02em]"
                :class="
                  p.agent
                    ? 'border-transparent bg-fjord-100 text-fjord-600 dark:bg-[#152D4D] dark:text-fjord-500'
                    : 'border-default text-muted'
                "
                >{{ p.tag }}</span
              >
              <span>{{ p.head }}</span>
            </div>
            <ul class="flex flex-col gap-3 text-sm text-toned">
              <li v-for="item in p.items" :key="item" class="flex gap-2.5">
                <span
                  class="mt-[9px] size-[5px] shrink-0 rounded-full"
                  :class="p.agent ? 'bg-primary' : 'bg-accented'"
                />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ============ 能力图谱 ============ -->
    <section class="pb-24">
      <UContainer>
        <KSecHead
          :eyebrow="page.capabilities.eyebrow"
          :title="page.capabilities.title"
          :lede="page.capabilities.lede"
          split
        >
          <KLinkMore :label="page.capabilities.more.label" :to="page.capabilities.more.to" />
        </KSecHead>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <KCard
            v-for="g in page.capabilities.groups"
            :key="g.title"
            as="article"
            class="flex flex-col p-6"
          >
            <div class="mb-5 flex items-baseline gap-3">
              <h3 class="flex items-center gap-2 text-[15px] font-semibold">
                <UIcon :name="g.icon" class="size-[18px] shrink-0 text-primary" />{{ g.title }}
              </h3>
              <span class="ml-auto font-mono text-xs text-dimmed">{{ g.count }}</span>
            </div>
            <p class="text-sm text-toned">
              {{ g.lede }}
            </p>
            <ul class="mt-5 flex flex-col gap-4">
              <li v-for="item in g.items" :key="item.n" class="flex gap-3 text-sm text-toned">
                <span class="w-5 shrink-0 pt-0.5 font-mono text-xs text-dimmed">{{ item.n }}</span>
                <span
                  ><strong class="font-medium text-default">{{ item.strong }}</strong> ·
                  {{ item.desc }}</span
                >
              </li>
            </ul>
          </KCard>

          <KCard as="article" class="flex flex-col justify-center p-6">
            <h3 class="text-base font-semibold">
              {{ page.capabilities.help.title }}
            </h3>
            <p class="mt-3 text-sm text-toned">
              {{ page.capabilities.help.body }}
            </p>
            <p class="mt-5">
              <KLinkMore
                :label="page.capabilities.help.link.label"
                :to="page.capabilities.help.link.to"
              />
            </p>
          </KCard>
        </div>
      </UContainer>
    </section>

    <!-- ============ 服务模式 ============ -->
    <section class="pb-24">
      <UContainer>
        <KSecHead
          :eyebrow="page.modes.eyebrow"
          :title="page.modes.title"
          :lede="page.modes.lede"
          split
        >
          <KLinkMore :label="page.modes.more.label" :to="page.modes.more.to" />
        </KSecHead>
        <div class="grid gap-6 md:grid-cols-2">
          <KModeCard v-for="m in page.modes.cards" :key="m.tag" v-bind="m" />
        </div>
      </UContainer>
    </section>

    <!-- ============ 合作流程 ============ -->
    <section class="pb-24">
      <UContainer>
        <KSecHead
          :eyebrow="page.process.eyebrow"
          :title="page.process.title"
          :lede="page.process.lede"
        />
        <KStepsTrack :steps="page.process.steps" />
      </UContainer>
    </section>

    <!-- ============ CTA（金属 · 全站两处拉丝之二） ============ -->
    <KCtaBand v-bind="page.cta" />
  </div>
</template>
