# Brand Spec — 智御无疆 / Kaup

> Source: `mqd6pcom-智御无疆_品牌诠释.md` + `mqd6pcon-kaup品牌故事指南.md`
> Locked: 2026-06-14
> Overrides: active design system `agentic` (Agentic) — brand tokens win for color/mood; spacing/typography rules still apply.

## 1. Brand architecture

- **智御无疆 (Zhi Yu Wu Jiang)** — parent / corporate brand.
  - 智 = AI-driven industry intelligence
  - 御 = orchestration & command across the full chain
  - 无 = open architecture, no model/industry lock-in
  - 疆 = dissolving enterprise capability boundaries
- **Kaup** — product / go-to-market brand (AI Agent foreign-trade platform, domain `kaup.ai`).
  - Etymology: Old Norse "kaup" = trade, contract, reward
  - Heritage: Viking *Kaupang* trade port (Vestfold, ~780 AD)
  - Differentiator: Local-First, data sovereignty, BYOM agents
- **Tagline (CN):** 智以为御，无疆为境
- **Tagline (EN):** Kaup Your Trade

## 2. Color tokens

| Token | Value (OKLch) | Hex (reference) | Role |
|---|---|---|---|
| `--bg` | `oklch(98% 0.005 240)` | `#F7F9FC` | Surface — ice / glacier white |
| `--surface` | `oklch(100% 0 0)` | `#FFFFFF` | Card / panel surface |
| `--fg` | `oklch(18% 0.02 250)` | `#0A1A2F` | Foreground — deep ink |
| `--muted` | `oklch(50% 0.02 245)` | `#5B6B7E` | Muted body text |
| `--border` | `oklch(90% 0.008 240)` | `#DEE3EB` | Hairline border |
| `--accent` | `oklch(72% 0.14 55)` | `#E89B3C` | Viking amber — secondary signal |
| `--brand` | `oklch(28% 0.06 245)` | `#0E2A47` | Fjord deep blue — corporate primary |

Note: `--brand` (deep navy) carries the corporate mark; `--accent` (amber) is the single dot/star — used at most twice per screen.

## 3. Typography

- **Display CN (wordmark / headlines):** `'PingFang SC', 'HarmonyOS Sans SC', 'Source Han Sans SC', 'Noto Sans SC', sans-serif`
- **Display EN (wordmark / UI):** `Inter, -apple-system, 'SF Pro Display', system-ui, sans-serif`
- **Mono (code / meta):** `'JetBrains Mono', 'IBM Plex Mono', ui-monospace, Menlo, monospace`
- **Scale:** 12 / 13 / 15 / 17 / 22 / 32 / 48 / 66
- **Tracking:**
  - All caps: `0.06em`–`0.10em`
  - Display ≥32px: `-0.02em` to `-0.03em`
  - Body 15–17px: `0` (default)

## 4. Logo posture

- **Style:** 极简单一图形 (minimal_icon, like Apple / Nike / Twitter)
- **Mark concept — "The Kaup Chevron" v5.1 (2026-06-14):** 方向彻底重置，抛弃 v1-v4 的"叙事/印章/插画"思路，回到最克制的 logo 母题——**一个粗体几何形状 + 15° 向上旋转**。Mark 只有 2 个元素：
  1. **Chevron ">" (粗体箭头, 峡湾深蓝)** — 6 点 polygon 形成的厚箭头，**整体绕 (50,50) 旋转 -15°**（SVG 负值 = 逆时针 = 向上）。语义：上升前进 / 增长 / AI 进步
  2. **中心琥珀点 (amber dot, r=5)** — 嵌在 chevron 偏左下 (cx=76, cy=50 旋转后约位于 (75.1, 43.3))，**与 V 字顶点 (旋转后约 (83.8, 40.9)) 保持 ~9 单位距离**——dot 不覆盖尖端，保留"披荆斩棘"的锐利之气。AI 信号在方向心脏。**为什么 r=5**：r=3.5 在 40-72px app header / brand card 不可见（直径 0.5-1px），r=5 在 40px header ≈ 4px 直径 / 72px card ≈ 7px 直径，识别度刚好。**为什么 (76, 50) 不是 (80, 50) 也不是 (73, 52)**：(80, 50) 是 chevron 外顶点，dot 中心压在 chevron body 上 + dot 缘 tangent 接触 V 字 cusp = "压在 V 字顶点内侧边缘" 字面成立但 apex strip 局部被 dot 中心吃 ~5 单位 = 锐气部分回退；(73, 52) 离 V 字 cusp 还有 10 单位 gap, chevron 锐气 100% 保留但"压"字面不成立。(76, 50) 是 (73, 52) 向右 +3 单位 = dot 距 chevron spine (80, 50) 4 单位 = dot 进入 chevron body 1 单位，cradle 在 V 字切口的内壁，**几何上 "压在 V 字切口里" + "chevron apex 锐气保留" 两个约束同时满足**。**Brand promise**：琥珀点永远是琥珀 (#E89B3C)，**不**加 halo / 描边 / 动画 / 任何 overlay 元素（生产资产于 2026-06-14 v5.2 撤销了之前的 halo 方案——它改变了视觉身份，"每个琥珀点外面有环" 不属于原 logo 契约）。**Cross-file sync**：10 个 SVG 源 + design-system.html inline symbol + index.html + kaup-svg-deliverables.html + 4 个 comparison HTML + logo-v6-mjolnir-concepts.html Concept C 全部用 cx=76 cy=50 r=5。
- **Why minimal_icon:** 用户方向重置后选了"像 Apple/Nike/Twitter 的极简单一图形"。v4 (5 元素圆章) 失败后认识到——元素越多越像"大披萨"，少元素 + 高识别度才是 logo 正道
- **Dropped from v4:** 外圈 + 内圈 + 8 印记点 + 8 角罗盘 + 中心星。v5 是 2 元素 vs v4 的 5 元素，断崖式简化
- **Wordmark pairing:** 智御无疆 (primary, 80px) + Kaup (secondary, 24px) — vertical lockup by default.
- **Tone:** confident, restrained, modern-tech. No gradients in the mark itself. Hairline borders only on supporting elements. No decorative shadows. Mark is symmetric on the vertical axis.
- **Legal risk note:** mark is a generic "chevron / arrow / forward" geometric shape, used by many brands. Specific proportions (chevron from x=15 to x=85, inner V at x=40) + central amber dot are distinctive. Trademark search in CN class 42 still recommended. NOT a letterform (avoiding Kimi risk) and NOT Viking narrative (avoiding v2-v4 clutter).

### 4.1 Asset delivery naming

Production SVG assets ship in pairs — default + reverse-color variant. Naming uses the `-dark` suffix for the reverse across all asset classes:

| Default | Reverse | Note |
|---|---|---|
| `favicon.svg` | `favicon-dark.svg` | mark only |
| `logo-primary.svg` | `logo-primary-dark.svg` | vertical lockup, center-aligned |
| `app-icon.svg` | `app-icon-dark.svg` | square master, dark bg default |
| `logo-horizontal.svg` | `logo-horizontal-dark.svg` | **horizontal lockup, left-aligned** (app header default) |
| `logo-horizontal-centered.svg` | `logo-horizontal-centered-dark.svg` | **horizontal lockup, center-aligned** (hero / signature / card) |

> **Footnote — `app-icon-dark.svg` is visually a *light-background* asset.** Default `app-icon.svg` ships on a dark canvas (fjord blue `#0E2A47` bg) because iOS / Android home screens lean dark, so the "reverse" output is the light-background sibling (glacier white `#F7F9FC` bg + fjord chevron + amber dot). The `-dark` suffix here means *"reverse of the dark default"*, not *"a dark-background asset"* — which is what `-dark` means on the other two files. Pick the variant by reading its background, not its filename suffix.

### 4.2 Horizontal lockup variants (locked 2026-06-14)

Two horizontal lockup variants ship side-by-side, distinguished **only** by text-anchor and x — viewBox, fonts, colors, mark geometry are identical. The user picked this split after the alignment A/B review (`logo-horizontal-alignment.html`):

| Variant | `text-anchor` | `x` | When to use |
|---|---|---|---|
| `logo-horizontal*.svg` (left) | `start` | `100` | **App header / nav bar / footer anchor** — the default. Mark hugs the left edge, wordmark starts ~21px right of the chevron tip. Follows Apple / Nike / Stripe / Vercel / Linear convention. |
| `logo-horizontal-centered*.svg` (center) | `middle` | `300` | **Hero / email signature / marketing card** — anywhere the lockup is the focal element on a centered composition. Block (mark + gap + wordmark) is centered on viewBox 480. |

**Hard rules (do not violate):**

1. **No container rect on horizontal lockups.** Earlier iterations wrapped the chevron in a 100×100 冰川白 rounded square — this looked like "a badge glued onto the header" in real layouts and has been removed. The 冰川白 square remains only on `app-icon*.svg` (where it is the iOS / Android tile).
2. **Mark↔wordmark gap = ~21px** (left variant: mark right edge ≈ x=79, wordmark starts at x=100). Earlier draft had 28px which read as two separate elements.
3. **Mark hugs the left edge** in the left variant (`translate(0, 30)`, not `translate(20, 30)`). The viewBox is the safe area — do not add fake right-side padding to "balance" the layout. The right side stays naturally open.
4. **No 3rd lockup variant.** If a use case doesn't fit left or centered, the answer is the vertical lockup (`logo-primary.svg`), not a new horizontal flavor.
5. **Do not add the centered variant as a third PNG subfolder with a different naming scheme.** It is its own asset class with its own `png/logo-horizontal-centered/` directory and its own manifest. Do not nest it under `png/logo-horizontal/`.

## 5. Known limits (signed 2026-06-14)

Two PNG outputs are at the **physical sub-pixel limit** of the dot and stay that way by design. Do not "fix" them by enlarging `r` further or shrinking `viewBox` — both moves break the 1:1 square iOS / Android home-screen ratio that all other 34 app-icon PNGs depend on.

| File | Pixel size | Dot diameter | Why it stays |
|---|---|---|---|
| `png/app-icon/app-icon-16.png` | 16×16 | 1.33 px theoretical (sub-pixel) | viewBox-120, r=5 → radius 0.67 px. iOS @1x icon is the only consumer (legacy macOS dock, smallest favicon slot). Chevron stroke remains the recognizer; the dot is decorative at this size. |
| `png/app-icon/app-icon-dark-16.png` | 16×16 | 1.33 px theoretical (sub-pixel) | Same geometry, dark variant. |

**Do not:**
- Bump `r` past 5 to chase these — 1.33 px is the physical floor at 16×16, and `r=6` would visually crowd the chevron tip at the larger sizes where the dot *is* recognizable.
- Re-derive the 16×16 viewBox — the master is `app-icon.svg` 1024×1024; all 18 sizes are proportional, including the 16×16 boundary.
- Add a "sub-pixel-friendly" variant — the chevron is the brand identity; the dot is the cherry on top. Cherry stays the same size everywhere.

If a future consumer (e.g. an Apple Watch icon at 48×48 @3x = 144 px, or a system-tray glyph at 22 px) needs the dot to be guaranteed-visible, export from the *master* viewBox and add the new size to `scripts/export-png.sh` — do not modify the existing 16×16 outputs.

## 6. Layout posture

- Grid: 8pt baseline; container max 1200px; gutter 24–48px
- Section vertical rhythm: 96px desktop / 68px tablet / 48px mobile
- Radii: `8px` (chips) / `12px` (panels) / `20px` (cards)
- Accent budget: at most 2 visible uses of `--accent` per screen; never on hover/focus rings of a `--brand` element
- Background: NEVER warm beige/peach/pink — strictly the cool ice/fjord family
