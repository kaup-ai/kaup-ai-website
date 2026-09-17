<script setup lang="ts">
/* 联系表单：状态机移植自 legacy site.js「联系表单」一节。
   契约：校验规则与 server/api/contact.ts 一致（公司 ≥2 字 / 姓名 ≥1 / 11 位手机或区号座机）；
   honeypot 移出视口 + tabindex -1（不用 aria-hidden：内部可聚焦 input 会违反 axe 规则）；
   成功重置表单并页内反馈（aria-live=polite），失败透传服务端中文错误文案。 */
const RE_MOBILE = /^1[3-9]\d{9}$/
const RE_LANDLINE = /^0\d{2,3}-?\d{7,8}$/

const company = ref('')
const name = ref('')
const phone = ref('')
const website = ref('') // honeypot，正常人留空

const errors = reactive<{ company: string, name: string, phone: string }>({
  company: '',
  name: '',
  phone: ''
})
const status = ref<{ state: '' | 'ok' | 'error', message: string }>({ state: '', message: '' })
const submitting = ref(false)

function validate(): boolean {
  errors.company = company.value.trim().length >= 2 ? '' : '请填写公司名称'
  errors.name = name.value.trim() ? '' : '请填写联系人姓名'
  const p = phone.value.replace(/\s+/g, '')
  errors.phone = (RE_MOBILE.test(p) || RE_LANDLINE.test(p)) ? '' : '请填写 11 位手机号，或带区号的座机号'
  return !errors.company && !errors.name && !errors.phone
}

async function onSubmit() {
  status.value = { state: '', message: '' }
  if (!validate()) return

  submitting.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        company: company.value.trim(),
        name: name.value.trim(),
        phone: phone.value.replace(/\s+/g, ''),
        website: website.value
      }
    })
    company.value = ''
    name.value = ''
    phone.value = ''
    status.value = { state: 'ok', message: '已收到，我们会在一个工作日内按你留的电话回电。' }
  } catch (err) {
    /* $fetch 非 2xx 抛 FetchError，服务端中文错误文案在 data.error */
    const { data } = err as { data?: { error?: string } }
    status.value = {
      state: 'error',
      message: data?.error || '提交失败，请稍后重试，或直接发邮件至 sales@kaup.ai。'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form
    class="space-y-5"
    novalidate
    @submit.prevent="onSubmit"
  >
    <div>
      <label
        for="cf-company"
        class="block text-sm font-medium"
      >公司名称</label>
      <input
        id="cf-company"
        v-model="company"
        type="text"
        required
        maxlength="100"
        autocomplete="organization"
        placeholder="例：大连某某贸易有限公司"
        class="mt-2 w-full rounded-lg border border-accented bg-default px-4 py-2.5 text-sm text-default placeholder:text-dimmed focus-visible:outline-3 focus-visible:outline-primary/25 shadow-[var(--slot-shadow)]"
        :class="errors.company ? 'border-error' : undefined"
      >
      <p
        v-if="errors.company"
        class="mt-2 text-xs text-error"
        role="alert"
      >
        {{ errors.company }}
      </p>
    </div>

    <div>
      <label
        for="cf-name"
        class="block text-sm font-medium"
      >联系人姓名</label>
      <input
        id="cf-name"
        v-model="name"
        type="text"
        required
        maxlength="50"
        autocomplete="name"
        placeholder="怎么称呼您"
        class="mt-2 w-full rounded-lg border border-accented bg-default px-4 py-2.5 text-sm text-default placeholder:text-dimmed focus-visible:outline-3 focus-visible:outline-primary/25 shadow-[var(--slot-shadow)]"
        :class="errors.name ? 'border-error' : undefined"
      >
      <p
        v-if="errors.name"
        class="mt-2 text-xs text-error"
        role="alert"
      >
        {{ errors.name }}
      </p>
    </div>

    <div>
      <label
        for="cf-phone"
        class="block text-sm font-medium"
      >联系电话</label>
      <input
        id="cf-phone"
        v-model="phone"
        type="tel"
        required
        autocomplete="tel"
        inputmode="tel"
        placeholder="手机号，或带区号座机（如 0411-8XXXXXXX）"
        class="mt-2 w-full rounded-lg border border-accented bg-default px-4 py-2.5 text-sm text-default placeholder:text-dimmed focus-visible:outline-3 focus-visible:outline-primary/25 shadow-[var(--slot-shadow)]"
        :class="errors.phone ? 'border-error' : undefined"
      >
      <p
        v-if="errors.phone"
        class="mt-2 text-xs text-error"
        role="alert"
      >
        {{ errors.phone }}
      </p>
      <p
        v-else
        class="mt-2 text-xs text-muted"
      >
        回电只用这个号码，请填写商务时间方便接听的
      </p>
    </div>

    <!-- honeypot：对真人不可见（CSS 移出视口 + tabindex -1），爬虫填了即被识别 -->
    <div
      class="absolute -left-[9999px] -top-[9999px] size-px overflow-hidden"
      aria-hidden="false"
    >
      <label for="cf-website">网站</label>
      <input
        id="cf-website"
        v-model="website"
        type="text"
        tabindex="-1"
        autocomplete="off"
      >
    </div>

    <UButton
      type="submit"
      size="xl"
      block
      :disabled="submitting"
      :loading="submitting"
      loading-icon="i-lucide-loader-circle"
    >
      {{ submitting ? '提交中…' : '提交，等待回电' }}
    </UButton>

    <p class="text-xs text-muted">
      提交即表示同意我们仅将以上信息用于业务联系。
    </p>
    <p
      role="status"
      aria-live="polite"
      class="text-sm"
      :class="status.state === 'ok' ? 'text-success' : status.state === 'error' ? 'text-error' : undefined"
    >
      {{ status.message }}
    </p>
  </form>
</template>
