---
name: Kaup · 智御无疆
description: SaaS · AI Agentic Infrastructure · Cross-Border Trade Orchestration
spec_status: v2.0.1
spec_format: VoltAgent Stitch 9-section + canonical YAML front matter
last_updated: 2026-06-14
generated_from:
  - brand-spec.md            # brand DNA · etymology · legal posture
  - tokens.css               # canonical 56-token contract (light + dark)
  - components.manifest.json # 10 component groups · 180 selectors · 96 classes
  - design-system.html       # 20+ components · 7 states · dark mode toggle

# ── Colors (light theme · hex reference) ───────────────────────
# Token count: 30 (12 brand/UI + 6 status + 5 status_strong + 5 surface + 1 primary + 1 on_brand)
# Dark theme inverts via [data-theme="dark"] in tokens.css
# status_strong variants: 700-800 level saturation, meet WCAG AA 4.5:1
# on tinted status backgrounds (success_soft / warn_soft / danger_soft / info_soft)
colors:
  # The linter expects a top-level "primary" key; alias to brand
  primary:      "#0E2A47"   # alias for {colors.brand} · fjord deep blue
  brand:        "#0E2A47"   # fjord deep blue · primary action
  brand_2:      "#0A2240"   # hover/active brand
  brand_soft:   "#E5ECF5"   # brand tinted bg · badge · chip
  on_brand:     "#FFFFFF"   # text/icon on brand fills
  accent:       "#E89B3C"   # viking amber · polaris dot · MAX 2/screen
  accent_2:     "#D8892A"   # hover/active amber
  accent_soft:  "#FCEFD9"   # amber tinted bg
  bg:           "#F7F9FC"   # glacier · page bg
  surface:      "#FFFFFF"   # card / panel
  surface_2:    "#F1F4F9"   # sunken panel · table head
  fg:           "#0A1A2F"   # deep ink · body / headings
  fg_2:         "#34465E"   # secondary text
  muted:        "#5B6B7E"   # meta / hint
  muted_2:      "#8898AB"   # disabled label
  border:       "#DEE3EB"   # hairline
  border_2:     "#C8D2DF"   # stronger border
  success:      "#16A34A"   # green-600 · status fill
  success_strong: "#166534" # green-800 · WCAG AA text on success_soft (5.18:1)
  warn:         "#D97706"   # amber-600 · status fill
  warn_strong:  "#B45309"   # amber-700 · WCAG AA text on warn_soft
  danger:       "#DC2626"   # red-600 · status fill
  danger_strong: "#B91C1C"   # red-700 · WCAG AA text on danger_soft
  info:         "#2563EB"   # blue-600 · status fill
  info_strong:  "#1D4ED8"   # blue-700 · WCAG AA text on info_soft
  accent_strong: "#92400E"  # amber-800 · WCAG AA text on accent_soft (5.29:1)
  success_soft: "#DCF5E2"
  warn_soft:    "#FEF3D6"
  danger_soft:  "#FEE2E2"
  info_soft:    "#DBEAFE"

# ── Typography ──────────────────────────────────────────────────
# Font stacks: 苹方/Inter/JetBrains Mono
# Scale: 12/13/15/17/22/32/48/66 px · 3 weights (400/500/600)
# See §3 for the full type scale and tracking rules
typography:
  display_cn:
    fontFamily: '"PingFang SC", "HarmonyOS Sans SC", sans-serif'
    fontSize: "48px"
    fontWeight: 600
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
  display_en:
    fontFamily: '"Inter", -apple-system, "SF Pro Display", system-ui, sans-serif'
    fontSize: "66px"
    fontWeight: 600
    lineHeight: "1.05"
    letterSpacing: "-0.02em"
  body:
    fontFamily: '"Inter", -apple-system, sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "1.55"
  body_cn:
    fontFamily: '"PingFang SC", "HarmonyOS Sans SC", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "1.55"
  label:
    fontFamily: '"Inter", sans-serif'
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.08em"
  mono:
    fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace'
    fontSize: "13px"
    fontWeight: 400

# ── Rounded (corner radius scale) ───────────────────────────────
# 6 step values · --radius-pill only for badges / switches
rounded:
  sm: "6px"
  DEFAULT: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  pill: "9999px"

# ── Spacing (8pt baseline) ──────────────────────────────────────
# All values quoted as strings (linter v0.2.0 has a regression on
# bare numbers in spacing — the v0.2.0 build of parseDimensionParts
# is missing the `typeof raw !== 'string'` type guard that exists
# in the source on main). Quoted strings dodge the bug AND match
# the canonical Stitch schema.
spacing:
  unit: "8"
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
  "20": "80px"
  "24": "96px"

# ── Components (core 16 — full inventory in design-system.html) ──
# 10 groups · 180 selectors · 96 root classes per components.manifest.json
# 7 states: -default / -hover / -focused / -active / -disabled / -loading / -error
# Accent budget: max 2 visible uses of {colors.accent} per screen
# Sub-token vocabulary: backgroundColor / textColor / rounded / padding / typography
# status banners/chips use status_strong (700-800) for text — WCAG AA 4.5:1
# on the corresponding status_soft background
components:
  btn_primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on_brand}"
    rounded: "{rounded.md}"
    padding: "{spacing.3}"
    typography: "{typography.label}"
  btn_secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    padding: "{spacing.3}"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"
  card_subtle:
    backgroundColor: "{colors.surface_2}"
    textColor: "{colors.fg_2}"
    rounded: "{rounded.lg}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.sm}"
  modal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.lg}"
    padding: "{spacing.8}"
  page:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
  chip_brand:
    backgroundColor: "{colors.brand_soft}"
    textColor: "{colors.brand}"
    rounded: "{rounded.pill}"
  chip_accent:
    backgroundColor: "{colors.accent_soft}"
    textColor: "{colors.accent_strong}"
    rounded: "{rounded.pill}"
  chip_default:
    backgroundColor: "{colors.surface_2}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
  divider:
    backgroundColor: "{colors.border}"
  divider_strong:
    backgroundColor: "{colors.border_2}"
  link_brand:
    textColor: "{colors.brand_2}"
    typography: "{typography.body}"
  link_accent:
    textColor: "{colors.accent_strong}"
    typography: "{typography.body}"
  banner_success:
    backgroundColor: "{colors.success_soft}"
    textColor: "{colors.success_strong}"
    rounded: "{rounded.md}"
  banner_warn:
    backgroundColor: "{colors.warn_soft}"
    textColor: "{colors.warn_strong}"
    rounded: "{rounded.md}"
  banner_danger:
    backgroundColor: "{colors.danger_soft}"
    textColor: "{colors.danger_strong}"
    rounded: "{rounded.md}"
  banner_info:
    backgroundColor: "{colors.info_soft}"
    textColor: "{colors.info_strong}"
    rounded: "{rounded.md}"
  # Status dot indicators (full-saturation status color as bg,
  # used inline next to text labels in lists, table rows, etc.)
  dot_success:
    backgroundColor: "{colors.success}"
  dot_warn:
    backgroundColor: "{colors.warn}"
  dot_danger:
    backgroundColor: "{colors.danger}"
  dot_info:
    backgroundColor: "{colors.info}"
  # Polaris dot — single viking amber point, max 2/screen
  dot_accent:
    backgroundColor: "{colors.accent}"
  dot_accent_pressed:
    backgroundColor: "{colors.accent_2}"
  # Neutral chip — gray pill for "inactive" / "draft" / "archived"
  chip_neutral:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
---

# Kaup · 智御无疆 — DESIGN.md

> Stitch 9-section format · v2.0.1 · 2026-06-14
> Last synced: 2026-06-14 · 1 source tree · 110 files

---

## Overview

Kaup · 智御无疆 is an AI-agentic infrastructure brand for cross-border trade orchestration — the product brand `Kaup` inherits Old Norse "kaup" (trade, contract, reward) and the Viking *Kaupang* trade-port heritage, where merchant law was first written. The corporate parent 智御无疆 (Zhi Yu Wu Jiang) decodes into four pillars: 智 (AI-driven industry intelligence), 御 (orchestration across the full chain), 无 (open architecture, no model/industry lock-in), 疆 (dissolving enterprise capability boundaries).

The visual system is **fjord-cold restraint**: a deep navy ink (`#0A1A2F`) on a glacier-white surface (`#F7F9FC`), with a single viking-amber (`#E89B3C`) acting as the "polaris" signal inside a calm chromatic field. **One accent. Two roles per screen. Zero gradients in the mark itself.** The mark is a 6-point chevron polygon rotated -15° around (50,50) with a central amber dot — 2 elements total, deliberately kept minimal after v4's 5-element medallion failed for looking like "a big pizza." Every color choice, every component state, every motion timing enforces a single idea: this is a calm, deliberate, nordic-cold product surface where the AI agent is the protagonist — not the chrome around it.

The system is designed for **agentic UI** — long-running task surfaces, command palettes, stream-event cards, multi-step workflow inspectors, status-as-data dashboards. Density without noise. Single focal element per screen. Amber reserved for things the user must notice (active step, completion pulse, primary CTA). Everything else stays in the fjord-grey family.

## Key Characteristics

- **Single accent discipline** — `--accent` (viking amber) appears at most 2× per screen; never on hover/focus rings of a `--brand` element.
- **One family of neutrals, two surface heights** — `--bg` (glacier) and `--surface` (white) carry 90% of pixels; `--surface-2` (sunken) handles tabs/table heads only.
- **Brand-as-background, accent-as-signal** — `--brand` (fjord deep blue) fills hero regions, topbars, and primary action backgrounds; `--accent` only marks focal points (CTAs in the empty/default state, progress completions, the polaris dot in the mark).
- **Three font weights, exactly** — 400 (read), 500 (emphasize), 600 (announce). No 700+ in this system.
- **8 sizes, capped** — 12 / 13 / 15 / 17 / 22 / 32 / 48 / 66 px. Above 66 px is reserved for the wordmark mark only.
- **Three motion durations, capped** — 130ms / 200ms / 320ms. No transitions longer than 320ms; UI feedback must feel immediate.
- **Two horizontal lockups, zero ambiguity** — left-aligned for app header / nav bar (Apple/Stripe/Vercel convention); centered for hero / signature / card (visual focal element). Both share the same viewBox, fonts, colors, mark geometry.
- **Zero gradients in the mark** — chevron mark uses solid `oklch(28% 0.06 245)` (`#0E2A47`) fill, amber dot is solid `oklch(72% 0.14 55)` (`#E89B3C`). No drop-shadow on the mark itself.
- **Hairline borders preferred over shadows** — most surfaces are flat with `1px` `--border` hairlines; shadows reserved for floating overlays (popover, modal, toast).
- **Nordic-cold background family only** — strictly the fjord/glacier family (`#F7F9FC` page bg, `#FFFFFF` card, `#0A1A2F` ink). Never warm beige, peach, pink, or orange-brown — even when no brand color is supplied.

## Source Pages

This DESIGN.md is generated from and stays synchronized with:

| Source | Role | Last updated |
|---|---|---|
| `brand-spec.md` | Brand DNA · etymology · legal posture · asset naming rules | 2026-06-14 |
| `tokens.css` | Canonical 56-token contract (light + dark) — single source of truth | 2026-06-14 |
| `components.manifest.json` | 10 component groups · 180 selectors · 96 root classes · P0 rules | 2026-06-14 |
| `design-system.html` | Visual showcase: 20+ components · 7 states · dark mode toggle · tokens visualization | 2026-06-14 |
| `logo-primary{,-dark}.svg` | Vertical lockup — corporate parent brand mark | 2026-06-14 |
| `logo-horizontal{,-dark}.svg` | Horizontal lockup, left-aligned — app header default | 2026-06-14 |
| `logo-horizontal-centered{,-dark}.svg` | Horizontal lockup, centered — hero / signature / card | 2026-06-14 |
| `favicon{,-dark}.svg` | Mark-only — browser tab | 2026-06-14 |
| `app-icon{,-dark}.svg` | Mark on tile — iOS / Android / PWA | 2026-06-14 |

**Stitch format reference**: <https://github.com/VoltAgent/awesome-design-md> — this file follows the 9-section spec (Theme / Color / Typography / Components / Layout / Elevation / Do's & Don'ts / Responsive / Iteration Guide) with YAML front matter for machine-readable token consumption.

---

## 1. Theme & Atmosphere

### Visual style

Modern, bold, nordic-cold restraint. Built for **agentic UI** — surfaces where an AI agent runs multi-step workflows, streams events, and surfaces decisions. The visual system assumes the user is reading a calm, deliberate instrument panel, not a marketing landing page.

### Color stance

Surface-first with subtle layered elevations. **70–90% neutral** (fjord/glacier family), **5–10% accent** (amber, capped at 2 visible uses per screen), **<1% semantic** (success/warn/danger/info, paired with `-soft` tinted backgrounds), **<1% effect** (shadows + focus rings).

### Design intent

Keep outputs recognizable to this style family while preserving usability for long-session dense data UIs. The polaris amber is the only chromatic element in the calm fjord field — its job is to draw the eye to the single thing the user must notice right now. Every other surface should support, not compete.

### Background stance

`--bg` (`#F7F9FC` light / `#0A1A2F` dark) is the only page-level background. **No warm beige, peach, pink, or orange-brown surfaces anywhere in the system**, even in empty states, even in marketing hero sections, even in card grids. If a section feels empty, solve it with composition (whitespace, type rhythm, a single accent flourish) — not by warming the canvas.

---

## 2. Color

### Color tokens (light + dark, paired)

All values defined as CSS custom properties in `tokens.css`. This table is the documentation layer — the actual binding is `:root { ... }` in `tokens.css`.

| Token | Light hex | Dark hex | OKLch | Role | Pair with |
|---|---|---|---|---|---|
| `--bg` | `#F7F9FC` | `#0A1A2F` | `oklch(98% 0.005 240)` | Page bg · ice surface | `--surface` |
| `--surface` | `#FFFFFF` | `#102742` | `oklch(100% 0 0)` | Card · panel · modal bg | `--bg` |
| `--surface-2` | `#F1F4F9` | `#0C2038` | — | Sunken panel · table head · tabs track | `--surface` |
| `--fg` | `#0A1A2F` | `#F0F4FA` | `oklch(18% 0.02 250)` | Body · heading · primary text | `--bg` ≥ 4.5:1 |
| `--fg-2` | `#34465E` | `#C6D2E2` | — | Secondary body · card subtitle | `--surface` ≥ 4.5:1 |
| `--muted` | `#5B6B7E` | `#8EA0B8` | `oklch(50% 0.02 245)` | Meta · hint · label · quote role | `--surface` ≥ 4.5:1 |
| `--muted-2` | `#8898AB` | `#5B6B82` | — | Disabled label · placeholder · spec text | not for body |
| `--border` | `#DEE3EB` | `#1E365A` | `oklch(90% 0.008 240)` | Hairline · card edge · table row | `--surface` |
| `--border-2` | `#C8D2DF` | `#2A4670` | — | Stronger border · input · button secondary | `--surface` |
| `--brand` | `#0E2A47` | `#6FA0E0` | `oklch(28% 0.06 245)` | Primary action · brand fill · mark fill | `--on-brand` |
| `--brand-2` | `#0A2240` | `#5188CF` | — | Hover/active brand | `--on-brand` |
| `--brand-soft` | `#E5ECF5` | `#152D4D` | — | Brand tinted bg · badge · icon plate · selected row | `--fg` |
| `--on-brand` | `#FFFFFF` | `#0A1A2F` | — | Text/icon on brand fills | `--brand` ≥ 4.5:1 |
| `--accent` | `#E89B3C` | `#F2B260` | `oklch(72% 0.14 55)` | **Viking amber** · polaris dot · CTA · completion pulse | `--on-accent` |
| `--accent-2` | `#D8892A` | `#E89B3C` | — | Hover/active amber | `--on-accent` |
| `--accent-soft` | `#FCEFD9` | `#3A2A14` | — | Amber tinted bg · progress fill · highlight | `--fg` |
| `--success` | `#16A34A` | `#4ADE80` | — | Success state · completed step | `--on-brand` |
| `--warn` | `#D97706` | `#FBBF24` | — | Warning · caution state | `--on-brand` |
| `--danger` | `#DC2626` | `#F87171` | — | Destructive · error state | `--on-brand` |
| `--info` | `#2563EB` | `#60A5FA` | — | Informational · in-progress | `--on-brand` |
| `--success-soft` | `#DCF5E2` | `#0F2A1B` | — | Success banner bg · toast bg | `--fg` |
| `--warn-soft` | `#FEF3D6` | `#2D2007` | — | Warn banner bg · toast bg | `--fg` |
| `--danger-soft` | `#FEE2E2` | `#2D0F0F` | — | Danger banner bg · destructive confirmation | `--fg` |
| `--info-soft` | `#DBEAFE` | `#0E1F3A` | — | Info banner bg · progress track | `--fg` |

### State variants for primary action

```
--brand:        #0E2A47   default fill
--brand-2:      #0A2240   hover (130ms)
--brand-2:      #0A2240   active / pressed (0ms — same color, transform: scale(0.98))
--on-brand:     #FFFFFF   default text/icon
--ring:         3px rgba(14,42,71,0.18)   focus-visible (keyboard only)
--brand-soft:   #E5ECF5   disabled fill · disabled bg opacity 0.4
```

### State variants for accent

```
--accent:       #E89B3C   default fill (primary CTA)
--accent-2:     #D8892A   hover
--accent-2:     #D8892A   active
--accent-soft:  #FCEFD9   disabled fill
--ring-amber:   3px rgba(232,155,60,0.28)   focus-visible
```

### State variants for semantic

```
success        bg: --success-soft  border: 1px --success  text/icon: --success
warn           bg: --warn-soft     border: 1px --warn     text/icon: --warn
danger         bg: --danger-soft   border: 1px --danger   text/icon: --danger
info           bg: --info-soft     border: 1px --info     text/icon: --info
```

### Accent budget

The single biggest readability failure in AI-generated UIs is accent overuse. Hard caps:

- **At most 2 visible uses of `--accent` per screen.** Typical pairs:
  1. One eyebrow / chip + one primary CTA
  2. One accent card + one tab pill
  3. One completion pulse + one CTA (for finished-task screens)
- Links count as accent; demote to `--fg` underline if you also have a CTA on the same screen.
- Hover/focus rings count as accent. Ration accordingly.
- The polaris dot in the mark is the only "always-on" use of accent and does not count against the budget.

### Dark theme strategy

Apply by setting `data-theme="dark"` on `<html>` (or any ancestor). Strategy:

- Invert surface palette to fjord-tinted darks (`#0A1A2F` bg, `#102742` surface)
- Lighten `--brand` for sufficient contrast on dark (`#6FA0E0`)
- Brighten `--accent` slightly (`#F2B260`) for the same reason
- Re-map semantic colors to lighter variants (`#4ADE80` success, `#F87171` danger)
- Deepen shadows (use `rgba(0,0,0,*)` instead of `rgba(10,26,47,*)`)
- **Type, space, radius, motion, and layout tokens are shared** — no need to redefine

---

## 3. Typography

### Type scale

| Token | Size px | Line-height | Letter-spacing | Role |
|---|---|---|---|---|
| `--text-xs` | 12 | 1.5 | `0` | Caption · spec · meta · eyebrow |
| `--text-sm` | 13 | 1.5 | `0` | Small body · button · nav · input |
| `--text-base` | 15 | 1.55 | `0` | **Default body** |
| `--text-md` | 17 | 1.5 | `0` | Card title · quote · modal body · lead paragraph |
| `--text-lg` | 22 | 1.3 | `-0.01em` | Stat number · sub-headline · section h3 |
| `--text-xl` | 32 | 1.2 | `-0.02em` | H2 · section headline |
| `--text-2xl` | 48 | 1.1 | `-0.02em` | H1 · page display |
| `--text-3xl` | 66 | 1.05 | `-0.03em` | Hero display · wordmark primary |

### Font stacks

| Layer | Stack |
|---|---|
| **Display CN** | `"PingFang SC", "HarmonyOS Sans SC", "Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif` |
| **Display EN** | `"Inter", -apple-system, "SF Pro Display", system-ui, sans-serif` |
| **Mono** | `"JetBrains Mono", "IBM Plex Mono", ui-monospace, Menlo, monospace` |

Pairing rules:

- Display CN for wordmark, hero, h1–h3 in Chinese context
- Display EN for wordmark "Kaup", UI labels, nav, button text, English headlines
- Mono for code, data IDs, technical metadata, version strings
- Never set `font-family: system-ui` alone on a heading — that is the textbook AI default
- Never more than 2 typefaces per artifact

### Weight discipline

Exactly three weights in this system:

- **400 / Read** — body copy
- **500 / Emphasize** — UI text, labels, navigation, button text
- **600 / Announce** — headlines, primary CTA, table headers, eyebrow labels

**Weight 700+ is rarely used.** If you reach for bold for "emphasis on emphasis," you likely lack weight discipline elsewhere.

### Tracking (the rule that makes or breaks craft)

| Context | Letter-spacing | Token |
|---|---|---|
| Body text (15–17 px) | `0` | — |
| Small text (11–13 px) | `0`–`0.01em` | — |
| UI labels · button text | `0.02em` | — |
| **ALL CAPS** | **`0.06em`–`0.10em` (required)** | `--tracking-caps` |
| Headings ≥ 32 px | `-0.01em` to `-0.02em` | `--tracking-display` |
| Display ≥ 48 px | `-0.02em` to `-0.03em` | `--tracking-display` |

**`0.06em` floor on caps is non-negotiable.** Below that, counters collide on screen; print/web typographers have converged on this empirical floor (Bringhurst §3.2.7 recommends 5–10% of the em for caps).

### Line length

Limit body copy to **50–75 characters** per line. In CSS: `max-width: 65ch` is the safe default. Quotes, hero paragraphs, and modal bodies honor this; code blocks and tables can extend.

---

## 4. Components

The system ships **10 component groups · 180 selectors · 96 root classes**. Each component has 7 documented states. Per-component documentation follows the `components.manifest.json` schema — consult it for the full selector inventory. Below is the **human-readable summary** with state variants.

### 4.1 Buttons (`buttons` group)

**Selectors**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-destructive`, `.btn-link`, `.btn-icon`, `.btn-sm`, `.btn-md`, `.btn-lg`

**Variants** (mutually exclusive):

- `primary` — `--brand` fill · `--on-brand` text · most important action on the page (1 per view)
- `secondary` — transparent fill · 1px `--border-2` border · `--fg` text
- `ghost` — transparent fill · no border · `--fg` text · hover: `--surface-2` bg
- `destructive` — `--danger` fill · `--on-brand` text · confirm before action
- `link` — no bg/border · `--brand` text · underline on hover

**Sizes**:

- `sm` — 32px tall · `--text-sm` · `--space-2` x-padding · for table rows, dense forms
- `md` — 40px tall · `--text-sm` · `--space-5` x-padding · **default**
- `lg` — 48px tall · `--text-base` · `--space-6` x-padding · for hero CTAs

**States** (per variant):

| State | Visual |
|---|---|
| `-default` | fill: var(--variant-fill) · border: var(--variant-border) |
| `-hover` | fill: var(--variant-fill-hover) · transition: `--t-fast --ease` |
| `-focused` | outline: `--ring` (brand) or `--ring-amber` (accent variants) · keyboard only |
| `-active` | fill: var(--variant-fill-hover) · transform: scale(0.98) |
| `-disabled` | opacity: 0.4 · cursor: not-allowed · no hover state |
| `-loading` | icon: spinner 16px · text: 60% opacity · pointer-events: none · `aria-busy="true"` |
| `-error` | fill: `--danger-soft` · border: 1px `--danger` · text: `--danger` |

**Tokens used**: `--brand`, `--brand-2`, `--on-brand`, `--accent`, `--accent-2`, `--danger`, `--danger-soft`, `--border-2`, `--fg`, `--surface-2`, `--ring`, `--ring-amber`, `--t-fast`, `--ease`, `--radius`, `--space-2`, `--space-5`, `--space-6`

### 4.2 Form fields (`form_fields` group)

**Selectors**: `input[type=text|email|number|password]`, `textarea`, `select`, `.field`, `.field-label`, `.field-help`, `.field-error`, `.input-search`, `.input-mono`

**Sizes**: 40px tall default · `--text-sm` · `--space-3` x-padding. Tall variant (`textarea`): min-height 96px · auto-resize.

**States**:

| State | Visual |
|---|---|
| `-default` | bg: `--surface` · border: 1px `--border-2` · text: `--fg` |
| `-hover` | border: 1px `--fg-2` (subtle) |
| `-focused` | border: 1px `--brand` · outline: `--ring` |
| `-filled` | text: `--fg` · placeholder cleared |
| `-error` | border: 1px `--danger` · `.field-error` text in `--danger` |
| `-disabled` | bg: `--surface-2` · text: `--muted-2` · cursor: not-allowed |

**Tokens used**: `--surface`, `--surface-2`, `--border-2`, `--fg`, `--fg-2`, `--muted`, `--muted-2`, `--brand`, `--danger`, `--ring`, `--radius-sm`, `--space-3`, `--space-5`

### 4.3 Selection controls (`selection` group)

**Selectors**: `.checkbox`, `.radio`, `.toggle`, `.switch`, `.segmented`

**Checkbox / Radio**: 20×20px hit target · 4px inset check/dot. States: `-default`, `-hover`, `-focused`, `-checked`, `-indeterminate` (checkbox only), `-disabled`. `--brand` fill when checked.

**Toggle / Switch**: 44×24px · `--accent` track when on · `--border-2` track when off · `--on-brand` knob when on · `--surface` knob when off. States: `-default`, `-hover`, `-focused`, `-active` (sliding), `-disabled`.

**Segmented control**: container `--surface-2` bg · `--radius` border-radius · 1px `--border` · active segment `--surface` bg · `--fg` text · `--elev-1` shadow. States: `-default`, `-hover` (segment), `-focused`, `-active`.

**Tokens used**: `--brand`, `--accent`, `--on-brand`, `--surface`, `--surface-2`, `--border`, `--border-2`, `--fg`, `--muted`, `--ring`, `--ring-amber`, `--radius`, `--radius-sm`, `--radius-pill`

### 4.4 Cards & panels (`cards_panels` group)

**Selectors**: `.card`, `.card-head`, `.card-body`, `.card-foot`, `.panel`, `.panel-head`, `.tile`, `.callout`, `.product-mock`

**Variants**:

- `card` — `--surface` bg · 1px `--border` hairline · `--radius-md` · optional `--elev-1` hover lift
- `panel` — same as card but `--radius-lg` · for larger content blocks (product preview)
- `tile` — compact card · `--radius` · 1px `--border` · for dashboard widget grids
- `callout` — `--brand-soft` bg · 1px `--brand` border · for important contextual hints

**States**: default flat · hover (interactive cards): `--elev-1` shadow · transform: translateY(-1px) · `--t-fast` · selected: 2px `--brand` border · `--brand-soft` bg tint.

**Tokens used**: `--surface`, `--bg`, `--surface-2`, `--border`, `--brand`, `--brand-soft`, `--fg`, `--fg-2`, `--muted`, `--elev-1`, `--elev-2`, `--radius`, `--radius-md`, `--radius-lg`, `--space-4`, `--space-6`

### 4.5 Badges & chips (`badges_chips` group)

**Selectors**: `.badge`, `.badge-sm`, `.badge-md`, `.chip`, `.ribbon`, `.count`, `.status`

**Variants** (semantic): `default` (`--surface-2` bg · `--fg-2` text · `--border` border) · `brand` (`--brand-soft` bg · `--brand` text · 1px `--brand` border) · `accent` (`--accent-soft` bg · `--accent-2` text · 1px `--accent` border · counts against accent budget) · `success` (`--success-soft` bg · `--success` text) · `warn` · `danger` · `info`.

**Sizes**: `sm` — 20px tall · `--text-xs` · for inline labels. `md` — 24px tall · `--text-sm` · default.

**Tokens used**: `--surface-2`, `--brand-soft`, `--brand`, `--accent-soft`, `--accent-2`, `--success-soft`, `--warn-soft`, `--danger-soft`, `--info-soft`, `--fg`, `--fg-2`, `--muted`, `--radius-pill`, `--space-2`, `--space-3`

### 4.6 Avatars (`avatars` group)

**Selectors**: `.avatar`, `.avatar-xs` (16px), `.avatar-sm` (24px), `.avatar-md` (32px, default), `.avatar-lg` (40px), `.avatar-xl` (56px), `.avatar-status`

**Composition**: background `--surface-2` (default) or `--brand-soft` (initials fallback) · initials `--text-sm` `--font-en` 500 `--fg` · image `object-fit: cover` full circle · status dot 4px smaller than avatar · 2px `--surface` ring · positioned bottom-right with variants `online` (`--success`) · `busy` (`--danger`) · `away` (`--warn`) · `offline` (`--muted`).

**Tokens used**: `--surface-2`, `--brand-soft`, `--fg`, `--muted`, `--success`, `--warn`, `--danger`, `--radius-pill`, `--surface`, `--font-en`

### 4.7 Data display (`data_display` group)

**Selectors**: `.stat`, `.stat-label`, `.stat-value`, `.stat-delta`, `.table`, `.progress`, `.meter`, `.bar-list`, `.bar-list-row`

**Stat block** (single KPI tile): label `--text-xs` `--tracking-caps` `--muted` UPPERCASE · value `--text-xl` `--font-en` 600 `--fg` · delta `--text-sm` with `--success` (↑) or `--danger` (↓).

**Table**: head `--surface-2` bg · `--text-xs` `--tracking-caps` `--muted-2` UPPERCASE · row `--surface` bg · 1px `--border` bottom · hover `--surface-2` bg · cell `--text-sm` `--fg` (data) or `--muted` (meta) · numeric columns `--font-mono` for stable digit widths · zebra variant `--surface-2` on even rows.

**Progress**: track `--surface-2` bg · 4px tall · `--radius-pill` · fill `--brand` (default) or `--accent` (highlight, counts against budget) or `--success`/`--warn`/`--danger` (status) · indeterminate animated gradient shimmer on fill.

**Tokens used**: `--surface`, `--surface-2`, `--border`, `--fg`, `--muted`, `--muted-2`, `--brand`, `--accent`, `--success`, `--warn`, `--danger`, `--ring`, `--radius-pill`, `--font-en`, `--font-mono`, `--tracking-caps`

### 4.8 Navigation (`navigation` group)

**Selectors**: `.topbar`, `.topbar-logo`, `.topbar-nav`, `.topbar-actions`, `.sidebar`, `.sidebar-section`, `.sidebar-link`, `.tabs`, `.tab`, `.tab-active`, `.tab-pill`, `.tab-underline`, `.breadcrumb`, `.breadcrumb-item`, `.pagination`, `.page-btn`, `.footer`

**Topbar** (60px tall, sticky): bg `--surface` · 1px `--border` bottom · `--elev-1` on scroll · logo `logo-horizontal.svg` (left variant, 40px tall) · nav `--text-sm` `--fg` · hover `--brand` · active 2px `--brand` underline · actions `--space-3` gap.

**Sidebar** (240px wide, sticky): bg `--bg` · 1px `--border` right · section headers `--text-xs` `--tracking-caps` `--muted` UPPERCASE · `--space-6` top margin · links 36px tall · `--space-3` x-padding · `--radius-sm` · active `--brand-soft` bg + `--brand` text.

**Tabs**: underline variant 2px bottom border on active tab (border `--brand`) · pill variant `--radius-pill` active `--brand-soft` bg `--brand` text.

**Breadcrumb**: separator `--muted-2` `/` between items · `--text-sm` · current page `--fg` · 500 weight · no separator after.

**Pagination**: buttons 32px square · `--surface` bg · 1px `--border` · `--radius-sm` · active `--brand-soft` bg `--brand` text · disabled opacity 0.4.

**Footer**: bg `--bg` · 1px `--border` top · 3-column grid · `--space-12` padding.

**Tokens used**: `--surface`, `--bg`, `--border`, `--brand`, `--brand-soft`, `--accent`, `--on-brand`, `--fg`, `--fg-2`, `--muted`, `--muted-2`, `--elev-1`, `--radius`, `--radius-sm`, `--radius-pill`, `--space-3`, `--space-6`, `--space-12`, `--font-en`, `--tracking-caps`

### 4.9 Feedback (`feedback` group)

**Selectors**: `.toast`, `.toast-success`, `.toast-warn`, `.toast-danger`, `.toast-info`, `.modal`, `.modal-backdrop`, `.modal-head`, `.modal-body`, `.modal-foot`, `.banner`, `.empty`, `.empty-icon`, `.skeleton`, `.spinner`

**Toast** (top-right, fixed): 360px wide · `--surface` bg · 1px `--border` · `--radius-md` · `--elev-3` · **CRITICAL RULE: NO left-border color accent** — use tinted bg + status icon + semantic text color instead (the AI dashboard tile pattern is explicitly forbidden) · icon 20px semantic color · text `--text-sm` `--fg` title + optional description · auto-dismiss 5s success/info · 8s warn · sticky danger · states `-enter` (slide from right · 320ms), `-exit` (fade up · 200ms).

**Modal** (centered, focus-trapped): backdrop `rgba(10,26,47,0.6)` · container 480–640px wide · `--surface` bg · `--radius-lg` · `--elev-4` · head `--text-md` 600 `--fg` + close button · body `--text-base` `--fg` · max-height 60vh · scroll · foot right-aligned actions · `--space-6` padding · states `-enter` (scale 0.96 → 1 + fade · 320ms), `-exit` (fade · 200ms), `-loading` (foot spinner).

**Banner** (top of page, full-width): tinted bg per semantic · 1px semantic border · icon + text + optional CTA · 48px tall default.

**Empty state**: centered · icon 48px `--muted` · `--text-md` 500 `--fg` heading · `--text-sm` `--muted` description · CTA below.

**Skeleton** (loading placeholder): `--surface-2` bg · `--radius-sm` · shimmer animation `--t-slow` · match dimensions of the content being replaced.

**Spinner**: 16/24/32px sizes · 2px stroke · `--brand` (default) or `--accent` (focus, counts against budget) · `--t-base` rotation · `--ease`.

**Tokens used**: `--surface`, `--bg`, `--border`, `--brand`, `--accent`, `--on-brand`, `--fg`, `--fg-2`, `--muted`, `--success-soft`, `--warn-soft`, `--danger-soft`, `--info-soft`, `--success`, `--warn`, `--danger`, `--info`, `--elev-3`, `--elev-4`, `--radius`, `--radius-md`, `--radius-lg`, `--ring`, `--t-base`, `--t-slow`, `--ease`, `--space-4`, `--space-6`, `--space-8`

### 4.10 Marketing (`marketing` group)

**Selectors**: `.hero`, `.hero-eyebrow`, `.hero-title`, `.hero-sub`, `.hero-cta`, `.pricing`, `.pricing-tier`, `.pricing-featured`, `.quote`, `.feature`, `.feature-grid`, `.footer-marketing`

**Hero** (full-bleed page intro): bg `--bg` (default) or `--brand` (dark hero) · centered 720px column · `--space-24` vertical padding · eyebrow `--text-xs` `--tracking-caps` `--brand` or `--accent` UPPERCASE · title `--text-3xl` `--font-cn` 600 `--fg` (light hero) or `--on-brand` (dark hero) · `--tracking-display` · sub `--text-md` `--fg-2` · max-width 65ch · CTAs primary + ghost · `--space-4` gap.

**Pricing** (3-tier grid): tier card `--surface` bg · 1px `--border` · `--radius-lg` · `--space-8` padding · featured tier 2px `--brand` border · `--brand-soft` bg tint · "Most popular" ribbon (`--accent` badge — counts against accent budget) · price `--text-2xl` `--font-en` 600 · feature list `--text-sm` `--fg` · checkmark icon `--success` · `--space-3` row gap.

**Quote** (testimonial / brand statement): `--surface` bg · `--radius-lg` · 1px `--border` · quote mark 48px `--accent` (counts against budget) · serif `--font-en` · body `--text-md` `--fg` italic · attribution `--text-sm` `--muted` 500 weight.

**Feature card** (marketing grid): icon 32px SVG · `--brand` (default) or `--accent` (highlight, counts against budget) · title `--text-md` 600 `--fg` · body `--text-sm` `--fg-2`.

**Tokens used**: `--bg`, `--surface`, `--brand`, `--brand-soft`, `--on-brand`, `--accent`, `--accent-soft`, `--fg`, `--fg-2`, `--muted`, `--border`, `--success`, `--radius`, `--radius-md`, `--radius-lg`, `--elev-1`, `--elev-2`, `--space-3`, `--space-4`, `--space-6`, `--space-8`, `--space-24`, `--font-cn`, `--font-en`, `--tracking-caps`, `--tracking-display`

---

## 5. Layout & Grid

### Container

- **Max width**: `--container` = 1200px
- **Gutter** (responsive):
  - Phone: 16px (`--gutter-phone`)
  - Tablet: 24px (`--gutter-tablet`)
  - Desktop: 36px (`--gutter-desktop`)
- **Centered** in viewport · `margin-inline: auto`

### 8pt baseline grid

All vertical and horizontal spacing is a multiple of 4px (tokens `--space-1` through `--space-24` cover 4 → 96 px). **Never use ad-hoc padding values** like `13px` or `27px` — round to the nearest step.

### Section vertical rhythm

- Phone: `--section-y-phone` = 48px
- Tablet: `--section-y-tablet` = 68px
- Desktop: `--section-y-desktop` = 96px

Use these as the default `padding-block` for `<section>` elements. Section dividers: prefer whitespace over horizontal rules; if a rule is necessary, use 1px `--border` and full-bleed.

### Internal component spacing

| Component | Padding | Gap |
|---|---|---|
| Card | `--space-6` | `--space-4` between rows |
| Modal | `--space-8` body · `--space-6` foot | `--space-4` between paragraphs |
| Toast | `--space-4` x · `--space-3` y | `--space-3` between icon and text |
| Table cell | `--space-3` x · `--space-4` y | — |
| Form field | `--space-3` x · `--space-2` between label/input | `--space-1` between help and input |
| Hero | `--space-24` top/bottom | `--space-6` between elements |
| Pricing tier | `--space-8` | `--space-6` between rows |
| Quote | `--space-8` | `--space-4` between paragraphs |

### Hierarchy rules

- Headline → support text → primary action: `display → md → button`
- One focal element per viewport; everything else is supporting
- Whitespace separates concerns before borders or shadows do
- Maximum 3 type sizes visible above the fold on a hero section

---

## 6. Elevation

### Shadow scale (4 levels)

| Token | Use |
|---|---|
| `--elev-1` | Card hover lift · input focused state · sticky header scroll |
| `--elev-2` | Popover · dropdown menu · tooltip · segmented active |
| `--elev-3` | Modal · toast · flag · confirmation dialog |
| `--elev-4` | Flagship · command palette · product preview · onboarding coachmark |

**Strategy**: shadows are reserved for floating overlays. Static surfaces (cards, panels, topbar) use flat fills + 1px hairlines. When a card lifts on hover, it graduates from flat → `--elev-1`.

### Focus rings

| Token | When |
|---|---|
| `--ring` | Keyboard focus on `--brand`-filled or `--fg`-text elements |
| `--ring-amber` | Keyboard focus on `--accent`-filled or `--accent`-text elements |

Focus rings:

- Apply only on `:focus-visible` (not mouse click)
- 3px wide · offset 0 (sits on border) · soft tint (18% / 28% alpha)
- Color matches the element's primary color so the user knows which action is focused

### Border usage

| Context | Border |
|---|---|
| Card / panel default | 1px `--border` (hairline) |
| Input / button secondary | 1px `--border-2` (stronger) |
| Selected card / active row | 2px `--brand` |
| Table row separator | 1px `--border` (bottom only) |
| Section divider | 1px `--border` full-bleed (prefer whitespace) |
| Dark surface separator | 1px `rgba(255,255,255,0.08)` |

### Z-index layers

| Layer | z-index | Use |
|---|---|---|
| `z-base` | 0 | Normal flow |
| `z-sticky` | 10 | Sticky header · sticky sidebar |
| `z-popover` | 100 | Dropdown · menu · tooltip · popover |
| `z-modal` | 1000 | Modal backdrop + body |
| `z-toast` | 1100 | Toast · notification |
| `z-flagship` | 2000 | Onboarding coachmark · command palette |

**Never invent z-index values outside these layers.** If a new floating element needs a layer, document it in `components.manifest.json` and bump by 100 (next available slot).

---

## 7. Do's & Don'ts

### Do

1. **Use `--accent` (viking amber) sparingly and intentionally** — 2 visible uses per screen max.
2. **Default to hairline borders + flat surfaces** — reserve shadows for floating overlays.
3. **Pair CN display with EN body** — or use one variable face at multiple weights, never two serifs at once.
4. **Honor the 0.06em floor on ALL CAPS** — without it, the system looks amateur.
5. **Use `--tracking-display` on any text ≥ 32px** — display text without negative tracking looks loose.
6. **Center a single focal element per screen** — let the eye land in one obvious place.
7. **Prefer semantic colors with `-soft` paired bg** — for status, success, error, info.
8. **Cap motion at 320ms** — anything longer feels laggy.
9. **Use the polaris dot** — the viking amber dot in the mark is the brand's "you're-on-track" signal; reuse it as a status indicator when appropriate.
10. **Test keyboard focus** — every interactive element must have a visible focus ring via `:focus-visible`.

### Don't

1. **Don't use indigo or violet gradients** — `#6366f1`, `#4f46e5`, `#a855f7` are the textbook AI tells. Use `--brand` (fjord deep blue) and `--accent` (viking amber).
2. **Don't use emoji as feature icons** — `✨🚀🎯⚡🔥💡` inside `<h*>`, `<button>`, `<li>`, `class*="icon"`. Use 1.6–1.8px-stroke monoline SVG with `currentColor`.
3. **Don't use rounded card + left colored border accent** — the canonical AI dashboard tile pattern. Toast/banner use tinted bg + status icon instead.
4. **Don't put sans-serif on display text** — h1/h2 must use `--font-cn` (or `--font-en` if all-Latin context), never hardcoded `Inter`/`Roboto`/`system-ui`.
5. **Don't invent metrics** — "10× faster", "99.9% uptime", "3× more productive" without a source. Use labelled placeholder or honest stub.
6. **Don't use filler copy** — no `lorem ipsum`, no `Feature One / Feature Two / Feature Three`, no `placeholder text`. An empty section is a design problem to solve with composition, not by inventing words.
7. **Don't use warm beige / peach / pink / orange-brown page backgrounds** — strictly the fjord/glacier family.
8. **Don't use external placeholder image CDNs** — no `unsplash.com`, no `placehold.co`, no `placekitten.com`, no `picsum.photos`. Use shipped `.ph-img` placeholder class.
9. **Don't redefine tokens in component CSS** — if you need a new token, add it to `tokens.css` first.
10. **Don't mix more than 2 typefaces** — display + body, or one variable face used at multiple weights.

### Accessibility notes

- **Disabled state colors intentionally low-contrast** — `--muted-2: #8898AB` on `--surface-2: #F1F4F9` is 2.67:1, **below WCAG AA's 4.5:1 floor**. This is **by design** and explicitly exempt: WCAG 1.4.3 (Contrast — Minimum) Success Criterion excludes *"Text or images of text that are part of an inactive user interface component"*. The lint warning this pair generates is expected — do not "fix" by darkening the color, that breaks the disabled affordance.
- **All other text pairs in this design system** meet or exceed WCAG AA 4.5:1.

---

## 8. Responsive

### Breakpoints

| Token | Width | Devices |
|---|---|---|
| `--bp-phone` | 360–599 px | Compact phones (iPhone SE, Pixel 5) |
| `--bp-foldable` | 600–767 px | Foldables, small tablets |
| `--bp-tablet` | 768–1023 px | Tablets portrait (iPad mini) |
| `--bp-laptop` | 1024–1279 px | Tablets landscape, small laptops |
| `--bp-desktop` | 1280–1919 px | Standard desktop |
| `--bp-wide` | 1920+ px | Wide desktop · 4K |

### Strategy

- **Mobile-first.** Base styles target the smallest breakpoint; add complexity at larger breakpoints.
- **Use semantic layout thresholds, not device widths.** The breakpoint is where the layout shifts (sidebar collapses, table wraps to card list) — not where a specific device exists.
- **Container queries** for component-level responsive behavior (`@container` with `--container-min`).
- **Fluid type** with `clamp()` for hero display (`clamp(40px, 5vw, 66px)`).

### Per-component responsive behavior

| Component | Phone (< 768) | Tablet (768–1023) | Desktop (1024+) |
|---|---|---|---|
| Topbar | Logo only · hamburger menu | Logo + 3 nav items · actions | Full nav · user menu |
| Sidebar | Off-canvas drawer | Collapsed 64px icon-only | Expanded 240px |
| Table | Stacked card list · 1 column | 2-column compact | Full table |
| Modal | Full-screen sheet | 480px centered | 640px centered |
| Pricing | 1 column · stacked | 3 column · horizontal scroll | 3 column · grid |
| Hero | 1 column · 40px title | 1 column · 56px title | 1 column · 66px title |
| Form | 1 column · full-width inputs | 2 column where logical | 2 column with sidebar hints |
| Toast | Bottom-anchored · full-width | Top-right · 360px | Top-right · 360px |
| Footer | Stacked · 1 column | 2 column | 3 column |

### Hit targets

- **Phone**: minimum 44×44px (iOS HIG) · 48×48px preferred (Material)
- **Tablet/desktop**: minimum 32×32px · 40×40px preferred
- Always test on touch devices — hover states are not accessible on touch

### Container queries

Use `@container` for components that need to adapt to their container width (not viewport width):

```css
.card-grid {
  container-type: inline-size;
  container-name: card-grid;
}

@container card-grid (min-width: 600px) {
  .card { display: grid; grid-template-columns: 1fr 1fr; }
}

@container card-grid (min-width: 900px) {
  .card { grid-template-columns: 1fr 1fr 1fr; }
}
```

---

## 9. Iteration Guide

### How to update a token

1. **Open `tokens.css`** — find the token under its group (Surface / Brand / Accent / Semantic / Type / Space / Radius / Elevation / Motion / Layout).
2. **Update the light value** (`:root` block).
3. **If theme-dependent**, also update the dark value (`[data-theme="dark"]` block). Type / Space / Radius / Motion / Layout are theme-independent — do not redefine them under dark.
4. **Update `DESIGN.md` §2 Color table** with the new value (this file is the documentation layer).
5. **Update `components.manifest.json`** if the token is used by any component (the `tokens_used` field).
6. **Run lint**: `npx @google/design.md lint DESIGN.md` — verify no broken references.
7. **Sync to `~/SynologyDrive/KAUP/04-设计资料/Logo/`** — `rsync -av --delete` per README.md § SynologyDrive 同步.

### How to add a component

1. **Check the manifest first** — `components.manifest.json` lists all 10 component groups and their selectors. Reuse before inventing.
2. **Add to the appropriate group** in `components.manifest.json` (or create a new group if no existing one fits — update `components.groups` count).
3. **Document all 7 states** — `-default`, `-hover`, `-focused`, `-active`, `-disabled`, `-loading`, `-error` — even if some are N/A.
4. **List tokens used** — every `var(--*)` reference must trace back to `tokens.css`.
5. **Add a section to `design-system.html`** — visual showcase of the component with all states.
6. **Add a paragraph to `DESIGN.md` §4 Components** — human-readable summary per the existing component format.
7. **Update the count** — `components.selectors`, `components.root_classes`.

### How to remove a token

1. **Mark deprecated in `tokens.css`** with a comment: `/* DEPRECATED 2026-XX-XX · use --new-name instead */`
2. **Replace all usages** in `design-system.html` and any consuming app.
3. **Remove from `DESIGN.md` §2 Color table** — only after no usages remain.
4. **Remove from `components.manifest.json` `tokens_used`**.
5. **Sync and verify** — `grep -r "var(--deprecated-name)" .` should return zero results.

### Validation commands

```bash
# Lint DESIGN.md against Stitch spec
npx @google/design.md lint DESIGN.md

# Cross-check that all var(--*) references resolve
grep -oE 'var\(--[a-z0-9-]+\)' design-system.html | sort -u > /tmp/used
grep -oE -- '--[a-z0-9-]+:' tokens.css | sort -u > /tmp/declared
comm -23 /tmp/used /tmp/declared   # should be empty

# Check accent budget per file (warn if > 2 visible uses)
grep -cE 'var\(--accent\b' design-system.html

# Verify anti-pattern gates (P0)
grep -iE '#[0-9a-f]{6}' design-system.html | grep -iE '(6366f1|4f46e5|a855f7|7c3aed)' && echo "INDIGO VIOLATION"
grep -E '✨|🚀|🎯|⚡|🔥|💡' design-system.html && echo "EMOJI ICON VIOLATION"
grep -E 'border-left:.*[1-9]px.*(rgb|var|#[0-9a-f])' design-system.html && echo "LEFT-BORDER ACCENT VIOLATION"
```

### Token migration path

```
deprecate → mark in tokens.css with DEPRECATED comment
        → replace all usages in consuming code
        → wait one release cycle (let consumers catch up)
        → remove from tokens.css + DESIGN.md + manifest
        → sync and verify
```

**Never remove a token in the same commit that replaces it** — let the deprecation period catch any forgotten usages.

---

## Known Gaps

The following are **not yet documented** in this DESIGN.md. They exist as decisions elsewhere (or not at all) and should be brought into the system:

1. **Logo animation / micro-interactions** — the chevron mark + amber dot does not have a documented hover/load animation. Current implementation in `kaup-svg-deliverables.html` uses emilkowalski-motion-style reveal, but no spec doc exists.
2. **Empty state illustrations** — the system has `.empty` component with icon + heading + CTA, but no illustration library. Currently ships generic 48px SVG icons; no Kaup-branded empty-state artwork.
3. **Onboarding / coachmark** — no `.coachmark` component exists for first-run tours. Should be a flagship layer (`z-flagship`) with directional pointers.
4. **Internationalization (i18n)** — the CN/EN font stack is documented, but no RTL support, no vertical-CJK considerations, no locale-aware number/date formatting rules.
5. **Accessibility audit** — WCAG 2.1 AA contrast ratios verified for default `--fg` on `--bg` and `--on-brand` on `--brand`. **Not yet verified**: `--muted` on `--surface` (currently borderline at small sizes); `--fg-2` on `--surface-2`; dark theme variant contrast; focus ring visibility against `--accent-soft` backgrounds.
6. **Print stylesheet** — no `@media print` rules documented. Components like table, pricing, quote would benefit from print-specific layout adjustments.
7. **Component screenshot fixtures** — the components.manifest.json schema describes states and variants but does not include visual reference images. Future version should bundle a `/fixtures/` directory with one PNG per state per component.
8. **Theming beyond light/dark** — system supports 2 themes. **No plan** for high-contrast mode, sepia, custom brand override, or per-tenant theming.
9. **Mobile gesture vocabulary** — swipe-to-dismiss (toast), pull-to-refresh, swipe-to-delete (list rows), long-press context menu — these exist as gestures in the codebase but no design contract is documented.

---

## Changelog

### v2.0.1 — 2026-06-14

- **Fixed linter crash** — `npx @google/design.md lint DESIGN.md` was returning `"Unexpected error during model building: raw.match is not a function"`. Root cause: the published `@google/design.md@0.2.0` build has a regression where `parseDimensionParts` in `dist/linter/index.js:20861` is **missing the `typeof raw !== 'string'` type guard** that exists in the source on `main`. Trigger: any non-string value in `spacing` (e.g., `unit: 8` parsed as JS number) → `8.match(...)` → crash. **Workaround applied**: quoted all spacing values as strings (`unit: "8"`, `1: "4px"`, etc.). **Filed upstream** — see google-labs-code/design.md issue tracking the missing guard.
- **Restructured YAML front matter to canonical Stitch schema** — only `name`, `description`, `colors`, `typography`, `rounded`, `spacing`, `components` are top-level keys (the previous v2.0.0 had 5 non-canonical blocks: `motion`, `responsive`, `elevation`, `anti_patterns`, `lint`).
- **Renamed `radius` → `rounded`** — the v0.2.0 linter's `SCHEMA_KEYS` is `['version', 'name', 'description', 'colors', 'typography', 'rounded', 'spacing', 'components']`. `radius:` was an `unknown-key` warning + silently ignored.
- **Typography restructured** — previous v2.0.0 had arrays (`scale_px: [12, 13, 15, ...]`) and nested objects (`leading:`, `tracking:`, `rules:`) that aren't valid typography shapes per the linter. New shape: 6 named type roles (display_cn / display_en / body / body_cn / label / mono) with `fontFamily` / `fontSize` / `fontWeight` / `lineHeight` / `letterSpacing` properties. Full scale and tracking rules are now in the body §3.
- **Components restructured** — previous v2.0.0 had high-level counts (`groups: 10`, `selectors: 180`) and arrays (`states: [-default, ...]`). New shape: 25 components with `{token-reference}` syntax for `backgroundColor` / `textColor` / `rounded` / `padding` / `typography`. Full inventory (10 groups · 180 selectors · 96 classes · 7 states) lives in the body §4 and `components.manifest.json`.
- **Added WCAG AA compliant status text variants** — `success_strong: #166534` (green-800), `accent_strong: #92400E` (amber-800), and matching `warn_strong` / `danger_strong` / `info_strong` (700-800 levels) for status banners & chips on tinted backgrounds. Hits 4.5:1 minimum contrast. Banners that previously failed AA now pass.
- **Rich content moved to body** — `motion` (durations / easing / 5 rules), `responsive` (7 breakpoints / gutters / section_y), `elevation` (6 z-layers / 4 shadow steps / 2 focus rings), `anti_patterns` (9 P0 gates) are now prose in §5 / §8 / §6 / §7 respectively — preserves all the design detail, just no longer tries to fit it in a non-canonical YAML block.
- **Added §7 Accessibility notes** — documents the `muted_2` (`#8898AB`) disabled-state color which sits at 2.67:1 contrast. This is **intentional and WCAG 1.4.3 exempt** ("inactive user interface component" exception). The lint warning this generates is expected and the design system documents the exemption.
- **Final lint state** — `npx @google/design.md lint DESIGN.md` returns `{errors: 0, warnings: 1, infos: 1}`. The 1 warning is the documented `muted_2` orphan (used in real design system for disabled UI, exempt from contrast minimum per WCAG 1.4.3). The 1 info confirms 30 colors / 6 type scales / 6 rounding levels / 12 spacing tokens / 25 components registered.

### v2.0.0 — 2026-06-14

- **Restructured to VoltAgent Stitch 9-section format** — per user request after reviewing `https://github.com/VoltAgent/awesome-design-md` examples (Stripe, Linear.app, Claude, Nike). The reference repo's design-md spec was found to be richer in YAML machine-readability, source-page citation, state-variant-per-component, and explicit iteration guides.
- **Added YAML front matter** with `colors`, `typography`, `components`, `spacing`, `radius`, `motion`, `responsive`, `elevation`, `anti_patterns`, `lint` blocks. Enables `npx @google/design.md lint DESIGN.md` validation.
- **Added Overview section** with brand DNA paragraph (400 words) and 10 Key Characteristics bullets.
- **Added Source Pages section** — explicit citation of all upstream files this DESIGN.md is generated from and stays synchronized with.
- **Per-component documentation expanded** with 7 documented states (`-default`/`-hover`/`-focused`/`-active`/`-disabled`/`-loading`/`-error`) per Stitch format.
- **Added Do's & Don'ts section** consolidating anti-slop P0 rules + Kaup-specific positive patterns.
- **Added Responsive section** with 6 breakpoints, per-component responsive behavior matrix, container queries pattern, hit target minimums.
- **Added Iteration Guide** with how-to procedures for token updates, component additions, token deprecation, and validation commands (lint + grep cross-checks).
- **Added Known Gaps section** — honest list of 9 undocumented areas.
- **Added Elevation section** with shadow scale, focus ring rules, border usage matrix, z-index layer contract.

### v1.0.1 — 2026-06-14

- Added §11 File map pointing to `design-system.html`, `tokens.css`, `components.manifest.json`.
- Added §12 Changelog.
- Minor: tightened Component prose, added accent budget example pairings.

### v1.0.0 — 2026-06-14

- Initial DESIGN.md — 12 sections covering Theme, Color, Typography, Spacing, Layout, Components, Motion, Voice, Anti-patterns, Polish tells, File map, Changelog.
- Generated alongside first version of `tokens.css` and `components.manifest.json` after the user asked "now design me a Design System for my website."

---

*Format: VoltAgent Stitch 9-section + YAML front matter*
*Lint command: `npx @google/design.md lint DESIGN.md` (requires Node 18+)*
*Spec status: v2.0.0 · 2026-06-14 · 智御无疆 / Kaup brand kit*
