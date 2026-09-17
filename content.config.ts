import { defineCollection, z } from '@nuxt/content'

/* Kaup 官网四页 · 结构化内容（文案唯一事实源；布局在 app/pages/*.vue）。
   共享形状：seo / 栏目头 / 链接 / 步骤 / 表格行 / 清单条目。 */

const seo = z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty(),
  /** og / twitter 专用文案（基线里与 meta description 是两套），缺省回退 description */
  ogDescription: z.string().optional(),
  /** og 专用标题（基线首页与 meta title 不同），缺省回退 title */
  ogTitle: z.string().optional()
})

const secHead = z.object({
  eyebrow: z.string().nonempty(),
  title: z.string().nonempty(),
  lede: z.string().optional()
})

const ctaLink = z.object({
  label: z.string().nonempty(),
  to: z.string().nonempty()
})

const step = z.object({
  n: z.string(),
  title: z.string(),
  desc: z.string(),
  icon: z.string().optional()
})

const tableRow = z.object({
  head: z.string(),
  cells: z.array(z.string())
})

const checkItem = z.object({
  m: z.string(),
  title: z.string(),
  body: z.string()
})

const modeCard = z.object({
  tag: z.string(),
  title: z.string(),
  body: z.string(),
  fit: z.string(),
  featured: z.boolean().optional()
})

const pageHead = z.object({
  eyebrow: z.string(),
  title: z.string(),
  claim: z.string(),
  lede: z.string()
})

const cta = z.object({
  title: z.string(),
  description: z.string(),
  primary: ctaLink,
  secondary: ctaLink.optional()
})

export const collections = {
  index: defineCollection({
    source: 'index.yml',
    type: 'page',
    schema: z.object({
      seo,
      hero: z.object({ note: z.string() }),
      chain: secHead.extend({
        steps: z.array(
          z.object({
            n: z.string(),
            name: z.string(),
            desc: z.string(),
            icon: z.string(),
            hitl: z.boolean().optional()
          })
        ),
        note: z.string()
      }),
      facts: z.array(
        z.object({
          icon: z.string(),
          num: z.string(),
          unit: z.string().optional(),
          label: z.string(),
          src: z.string()
        })
      ),
      pain: secHead.extend({
        cards: z.array(
          z.object({
            icon: z.string(),
            title: z.string(),
            body: z.string()
          })
        )
      }),
      compare: secHead.extend({
        panels: z.array(
          z.object({
            tag: z.string(),
            agent: z.boolean(),
            head: z.string(),
            items: z.array(z.string())
          })
        )
      }),
      capabilities: secHead.extend({
        more: ctaLink,
        groups: z.array(
          z.object({
            icon: z.string(),
            title: z.string(),
            count: z.string(),
            lede: z.string(),
            items: z.array(
              z.object({
                n: z.string(),
                strong: z.string(),
                desc: z.string()
              })
            )
          })
        ),
        help: z.object({
          title: z.string(),
          body: z.string(),
          link: ctaLink
        })
      }),
      modes: secHead.extend({
        more: ctaLink,
        cards: z.array(modeCard)
      }),
      process: secHead.extend({ steps: z.array(step) }),
      cta
    })
  }),

  capabilities: defineCollection({
    source: 'capabilities.yml',
    type: 'page',
    schema: z.object({
      seo,
      head: pageHead,
      arch: secHead.extend({
        body: z.string(),
        rows: z.array(tableRow)
      }),
      groups: z.array(
        secHead.extend({
          id: z.string(),
          grid: z.union([z.literal(2), z.literal(3)]),
          cards: z.array(
            z.object({
              idx: z.string(),
              title: z.string(),
              body: z.string()
            })
          ),
          checks: z.array(checkItem).optional()
        })
      ),
      cta
    })
  }),

  services: defineCollection({
    source: 'services.yml',
    type: 'page',
    schema: z.object({
      seo,
      head: pageHead,
      modes: secHead.extend({ cards: z.array(modeCard) }),
      modeTable: z.object({
        caption: z.string(),
        head: z.array(z.string()),
        rows: z.array(tableRow),
        note: z.string()
      }),
      customization: secHead.extend({ checks: z.array(checkItem) }),
      delivery: secHead.extend({
        steps: z.array(step),
        cards: z.array(
          z.object({
            title: z.string(),
            body: z.string()
          })
        )
      }),
      cta
    })
  }),

  about: defineCollection({
    source: 'about.yml',
    type: 'page',
    schema: z.object({
      seo,
      head: pageHead,
      chars: secHead.extend({
        cards: z.array(
          z.object({
            glyph: z.string(),
            title: z.string(),
            paras: z.array(z.string())
          })
        )
      }),
      position: z.object({
        eyebrow: z.string(),
        title: z.string(),
        lede: z.string(),
        fields: z.array(
          z.object({
            k: z.string(),
            v: z.string(),
            slogan: z.boolean().optional()
          })
        ),
        table: z.object({
          caption: z.string(),
          head: z.array(z.string()),
          rows: z.array(tableRow)
        })
      }),
      mission: z.object({
        eyebrow: z.string(),
        title: z.string(),
        lede: z.string(),
        closing: z.string()
      }),
      cta
    })
  })
}
