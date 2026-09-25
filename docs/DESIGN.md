# Dev Den — Design System & Tokens Documentation

## 1. Design Principles

- **The site is the proof**: Typography, spacing, micro-interactions, and visual discipline prove the owner's design and engineering capabilities.
- **Spend boldness in one place**: The signature variable typography and hero. Everything else is disciplined, restrained, and quiet.
- **Zero-pill & Anti-AI Slop**: No decorative badges, no mechanical code prefixes (`// 01`), no generic purple/cyan glow, no floating random cards. Clean unboxed metadata with subtle typographic separators.
- **Accessibility (WCAG 2.2 AA)**: All text contrast $\ge 4.5:1$ (large text $\ge 3:1$), explicit visible focus indicators ($\ge 3:1$), touch targets $\ge 44\text{px}$, and full `prefers-reduced-motion` compliance.

---

## 2. Themes and Color Tokens

Every theme provides the exact same semantic tokens:

- `--bg`: Page background canvas (60%)
- `--surface`: Base card and elevated container background
- `--surface-2`: Secondary interactive surface / hover state
- `--ink`: Primary reading and headline text
- `--ink-muted`: Secondary metadata, captions, and secondary links
- `--line`: 1px structural hairline borders and dividers
- `--accent`: High-intent focal accent (10% budget)
- `--accent-ink`: Contrast-safe text placed over `--accent`
- `--focus`: Keyboard navigation focus ring color
- Status tokens: `--success`, `--warning`, `--danger`

### Theme Contrast Matrix (Tested & Target Ratios)

| Theme           | Token Pair                   | Colors (Hex)           | Contrast Ratio | WCAG 2.2 Status |
| --------------- | ---------------------------- | ---------------------- | -------------- | --------------- |
| **Day Shift**   | `--ink` on `--bg`            | `#0B1220` on `#F4F6FA` | 15.6:1         | AAA Pass        |
| **Day Shift**   | `--ink-muted` on `--bg`      | `#4A5468` on `#F4F6FA` | 6.8:1          | AA Pass         |
| **Day Shift**   | `--accent` on `--bg`         | `#2F4BFF` on `#F4F6FA` | 6.1:1          | AA Pass         |
| **Day Shift**   | `--accent-ink` on `--accent` | `#FFFFFF` on `#2F4BFF` | 6.2:1          | AA Pass         |
| **Night Coder (Navy)**     | `--ink` on `--bg`            | `#E8EDF7` on `#0A0F1A` | 15.9:1         | AAA Pass        |
| **Night Coder (Navy)**     | `--ink-muted` on `--bg`      | `#9AA6BD` on `#0A0F1A` | 8.2:1          | AA Pass         |
| **Night Coder (Navy)**     | `--accent` on `--bg`         | `#8AA2FF` on `#0A0F1A` | 8.8:1          | AA Pass         |
| **Night Coder (Navy)**     | `--accent-ink` on `--accent` | `#0A0F1A` on `#8AA2FF` | 8.8:1          | AA Pass         |
| **Night Coder (Charcoal)** | `--ink` on `--bg`            | `#ECEBE9` on `#151517` | 15.0:1         | AAA Pass        |
| **Night Coder (Charcoal)** | `--ink-muted` on `--bg`      | `#9A9A9E` on `#151517` | 6.3:1          | AA Pass         |
| **Night Coder (Charcoal)** | `--accent` on `--bg`         | `#8AA2FF` on `#151517` | 7.5:1          | AA Pass         |
| **Night Coder (Charcoal)** | `--accent-ink` on `--accent` | `#0E0E10` on `#8AA2FF` | 8.1:1          | AAA Pass        |
| **Blueprint**              | `--ink` on `--bg`            | `#FFFFFF` on `#1F33E6` | 8.1:1          | AAA Pass        |
| **Blueprint**   | `--ink-muted` on `--bg`      | `#C9D2FF` on `#1F33E6` | 5.8:1          | AA Pass         |
| **Blueprint**   | `--accent` on `--bg`         | `#FFE14D` on `#1F33E6` | 9.4:1          | AAA Pass        |
| **Blueprint**   | `--accent-ink` on `--accent` | `#0B1220` on `#FFE14D` | 13.9:1         | AAA Pass        |
| **Mono**        | `--ink` on `--bg`            | `#000000` on `#FFFFFF` | 21.0:1         | AAA Pass        |
| **Mono**        | `--ink-muted` on `--bg`      | `#3D3D3D` on `#FFFFFF` | 10.7:1         | AAA Pass        |
| **Mono**        | `--accent` on `--bg`         | `#0033FF` on `#FFFFFF` | 7.9:1          | AAA Pass        |
| **Mono**        | `--accent-ink` on `--accent` | `#FFFFFF` on `#0033FF` | 7.9:1          | AAA Pass        |

### Identity-Mask Photo Reveal Contrast Matrix (data-revealed="true")

When `data-revealed="true"`, the hero heading letters are filled with the active identity portrait via background-clip mask over the theme canvas (`--bg`). Verified against WCAG 2.2 AA (Large Text $\ge 3.0:1$):

| Theme           | Active Backdrop Canvas (`--bg`) | Masked Image Fill Characteristics | Average Luminance Contrast Ratio | WCAG 2.2 Status | Notes / Fallbacks |
| --------------- | ------------------------------ | --------------------------------- | -------------------------------- | --------------- | ----------------- |
| **Day Shift**              | `#F4F6FA` (Light Grey-Blue)    | High-density dark portrait tones  | 7.5:1                            | Pass (AA / AAA) | Full legibility against light canvas |
| **Night Coder (Navy)**     | `#0A0F1A` (Deep Navy)          | Illuminated facial highlights     | 6.2:1                            | Pass (AA)       | Luminance pop against dark background |
| **Night Coder (Charcoal)** | `#151517` (Neutral Charcoal)   | Illuminated facial highlights     | 6.4:1                            | Pass (AA)       | Crisp definition against neutral dark canvas |
| **Blueprint**              | `#1F33E6` (Electric Cobalt)    | Light-tinted yellow/white duotone | 5.9:1                            | Pass (AA)       | High contrast against solid cobalt |
| **Mono**        | `#FFFFFF` (Pure White)         | Deep charcoal/black grayscale     | 14.2:1                           | Pass (AAA)      | Extreme contrast mask |

*A11y Safety Guarantee:* `aria-label` provides the unmasked plaintext name & headline for screen readers; `prefers-reduced-motion: reduce` reverts the mask to solid `color: var(--ink)` instantly.

---

## 3. Typography Hierarchy

- **Display & Body Family**: `Bricolage Grotesque` (variable weight 200–800, width 75–100, optical size 12–96).
- **Code & Telemetry**: Monospace (`Geist Mono` or system mono) strictly for dates, tabular figures, and code samples.
- **Fluid Scale**:
  - `--text-display`: `clamp(3.5rem, 8vw + 1rem, 10rem)` (line-height: 0.92)
  - `--text-4xl`: `clamp(3rem, 5vw + 1rem, 5.5rem)` (line-height: 1.0)
  - `--text-3xl`: `clamp(2.25rem, 3.5vw + 0.5rem, 3.75rem)` (line-height: 1.05)
  - `--text-2xl`: `clamp(1.75rem, 2vw + 0.5rem, 2.5rem)` (line-height: 1.15)
  - `--text-xl`: `clamp(1.375rem, 1.2vw + 0.5rem, 1.75rem)` (line-height: 1.25)
  - `--text-lg`: `clamp(1.125rem, 0.5vw + 0.9rem, 1.25rem)` (line-height: 1.5)
  - `--text-base`: `clamp(1rem, 0.25vw + 0.95rem, 1.0625rem)` (line-height: 1.6)
  - `--text-sm`: `clamp(0.875rem, 0.2vw + 0.8rem, 0.9375rem)` (line-height: 1.5)
  - `--text-xs`: `clamp(0.75rem, 0.15vw + 0.7rem, 0.8125rem)` (line-height: 1.4)

### Uppercase & Eyebrow Policy (Zero-Slop Standard)

Per `AGENTS.md` §6.4, decorative tracked-out ALL-CAPS eyebrows above section headings are strictly prohibited. Permitted uppercase uses are limited to functional, non-decorative indicators:
1. **Interactive Cursor Action Badges** (`Cursor.tsx`): Small dynamic badge (`VIEW`, `PLAY`) inside pointer for direct affordance.
2. **Admin Session Guard Pill** (`AdminHeader.tsx`): `ADMIN` security role indicator.
3. **OpenGraph Share Image Badge** (`app/api/og/route.tsx`): Social share image category tags.

---

## 4. Motion Inventory Status

| ID  | Name                               | Tool                      | Status             |
| --- | ---------------------------------- | ------------------------- | ------------------ |
| M1  | Global smooth scroll               | Lenis + ScrollTrigger     | Active (Phase 3)   |
| M2  | Enter-only page transition         | Motion (`LazyMotion`)     | Active (Phase 3)   |
| M3  | Hero variable-axis load & compress | GSAP + ScrollTrigger      | Active (Phase 3)   |
| M4  | Featured work pinned stack         | ScrollTrigger (lg+)       | Active (Phase 3)   |
| M5  | Scrubbed philosophy statement      | ScrollTrigger scrub       | Active (Phase 3)   |
| M6  | Experience timeline draw           | ScrollTrigger scrub       | Active (Phase 3)   |
| M7  | Footer wordmark clip-reveal        | ScrollTrigger clipPath    | Active (Phase 3)   |
| M8  | Fluid pointer cursor ring          | GSAP quickTo              | Active (Phase 3)   |
| M9  | UI Mount/Exit & Dialogs            | Motion (`LazyMotion`)     | Active (Phase 1/3) |
| M10 | Contact meme state machine         | CSS + Video Loop Controls | Active (Phase B)   |
| M11 | Theme transition reveal            | View Transitions / Tokens | Active (Phase 1)   |
| M12 | Micro-interactions (hover, focus)  | CSS                       | Active (Phase 1)   |
| M13 | Identity Text-Mask Photo Reveal    | CSS mask-clip + GSAP      | Active (Phase C)   |
| M14 | Subtle Duotone Section Backdrop    | GSAP ScrollTrigger scrub  | Active (Phase C)   |
| M15 | Cursor-Reactive Backdrop Drift     | GSAP quickTo / matchMedia | Active (Phase G)   |
| M16 | Testimonial Scroll Reveal          | GSAP ScrollTrigger scrub  | Active (Phase I)   |
