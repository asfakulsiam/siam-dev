# Dev Den — Master Build Prompt (built 2026, designed to stay current through 2028)

---

## 1. Project brief

Build the personal portfolio of **Asfakul**, a full-stack web developer and web designer based in Bangladesh. It is a **full-stack, self-managed site**: everything the visitor sees is editable from a protected admin panel at `/admin`, with no redeploys.

The site has one job: **prove design and engineering skill in the first ten seconds, and make it effortless to get in touch.**

### Must-have features
- Public site: Home, Work (list + case studies), About + Experience, Contact, Colophon, custom 404.
- Admin panel at `/admin`, protected by **Auth.js (NextAuth)**.
- **Project upload system:** create, edit, delete, reorder, publish/draft, with image and video upload to **Cloudinary**.
- Editable **About, Experience, "Currently working on", contact details, and resume link** (add/update).
- **Mailing system:** contact form saves to **MongoDB**, sends a notification to Asfakul and an **auto-reply to the visitor** via **Resend**.
- **Theming:** four hand-tuned themes, switchable by visitors, default configurable from admin.
- **Meme layer (the "funky" part):** a Mr Bean "waiting for your message" moment on the contact page and other meme states (sending, sent, error, 404, loading). Memes are uploaded and swapped from admin.
- Messages inbox in admin.

### Non-negotiables
- **Design quality:** modern, minimal, clean, unique. Cool, high-contrast, professional. No compromise on layout, structure, responsiveness, motion, or scroll-based animation.
- **No heavy or legacy animation:** no Three.js, WebGL, Lottie, particle systems, parallax libraries, or jQuery-era plugins.
- **Longevity:** must still feel current and be maintainable in 2028 (see §12).

---

## 2. What makes it different (the concept)

1. **The site is the portfolio.** The typography, spacing, motion, and details *are* the proof of design skill. A `/colophon` page shows the tokens, type specimen, stack, and performance numbers.
2. **Typography as the signature.** A variable font whose weight, width, and optical size respond to scroll. This is the one memorable motion idea; everything else stays quiet.
3. **Humor with restraint.** Mr Bean and friends appear only in *waiting/feedback moments* (contact, sending, 404, loader), never in the core layout.
4. **Live and self-managed.** "Currently working on" badge, availability toggle, and local time (Asia/Dhaka) make it feel alive.
5. **Themes with personality** (Day Shift, Night Coder, Blueprint, Mono), all cool-toned and contrast-tested.

---

## 3. Locked tech stack

| Area | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router), React, TypeScript (strict)** | Latest *stable* compatible version at build time. Pin exact versions. |
| Runtime / PM | Node.js LTS, **pnpm** | Commit `pnpm-lock.yaml`. Use `pnpm add -E`. |
| Styling | **Tailwind CSS** (v4, CSS-first `@theme`) + **CSS variables** | All design tokens live in CSS variables. |
| UI primitives | **shadcn/ui + Radix UI + Lucide** | Used mainly in admin and for accessible primitives (dialog, sheet, dropdown). Restyle to tokens. |
| Database | **MongoDB Atlas** via the **official MongoDB Node driver** | Zod schemas are the source of truth. Mongoose only if a real need appears. |
| Validation / forms | **Zod + React Hook Form** | Same schema on client and server. |
| Auth | **Auth.js (next-auth v5)**, Credentials provider, JWT session | Single admin. Isolated behind `lib/auth.ts` so it can be swapped by 2028 (see note below). |
| Email | **Resend** | Notification + auto-reply. Typed plain-HTML templates. |
| Media | **Cloudinary** | Signed direct uploads, `f_auto,q_auto` delivery, custom `next/image` loader. |
| Animation | **GSAP + ScrollTrigger + SplitText** (scroll, hero, text) · **Lenis** (smooth scroll) · **Motion (Framer Motion)** only for React enter/exit/layout in UI (menu, dialogs, toasts, admin) | See decision below. |
| Testing | **Vitest, Testing Library, Playwright, @axe-core/playwright, Lighthouse CI** | See §11 and `AGENTS.md`. |
| Hosting | **Vercel** (function region `sin1` or `bom1`), Atlas in Singapore or Mumbai | Keep DB and functions in the same region. |

### Animation decision: GSAP (primary) + Motion (secondary)
- **GSAP + ScrollTrigger** is the best tool for scroll-linked storytelling: precise scrubbing, pinning, and timelines with excellent performance. GSAP and its plugins (including SplitText and ScrollTrigger) are free to use; **confirm the current license on gsap.com** before launch.
- **Lenis** adds smooth scroll and integrates cleanly with ScrollTrigger.
- **Motion** is used *only* where React state drives mount/unmount or layout changes (mobile menu, dialogs, toasts, admin lists). Load it via `LazyMotion` with `domAnimation` to keep it small.
- **CSS transitions** for simple hover/focus/color changes. No JS needed.
- Do **not** add a fourth animation library.

### Auth.js note
Verify Auth.js's maintenance status and the recommended version before installing. Keep all auth code behind `lib/auth.ts` plus a `requireAdmin()` helper, so the provider can be replaced without touching the rest of the app.

---

## 4. Design system

### 4.1 Design intent
Quiet, precise, confident. Large type, generous space, hairline structure, one accent per theme. **Spend boldness in one place: the typography.** Everything else stays disciplined.

### 4.2 Typography (unique, project-specific)
- **One primary family: Bricolage Grotesque (variable)**, used for display, headings, UI, and body. It has weight, width, and optical-size axes, so hierarchy comes from *axes*, not from a second typeface. Large sizes use high optical size and tighter tracking; body uses low optical size for legibility.
- **Monospace only for real code/technical data** (Geist Mono or JetBrains Mono). Not for decorative labels.
- Load with `next/font` (self-hosted, `display: swap`, subset `latin`). Include the `opsz` and `wdth` axes. If the build rejects the axes, self-host the variable WOFF2 with `next/font/local`.
- Enable `font-optical-sizing: auto`, `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs, `font-variant-numeric: tabular-nums` on dates and metrics.

**Fluid type scale** (define as CSS variables, use `clamp`):

| Token | Range | Line height | Use |
|---|---|---|---|
| `--text-display` | 3.5rem → 10rem | 0.92 | Hero only |
| `--text-4xl` | 3rem → 5.5rem | 1.0 | Page titles |
| `--text-3xl` | 2.25rem → 3.75rem | 1.05 | Section titles |
| `--text-2xl` | 1.75rem → 2.5rem | 1.15 | Subsections |
| `--text-xl` | 1.375rem → 1.75rem | 1.25 | Lead paragraphs |
| `--text-lg` | 1.125rem → 1.25rem | 1.5 | Large body |
| `--text-base` | 1rem → 1.0625rem | 1.6 | Body |
| `--text-sm` | 0.875rem → 0.9375rem | 1.5 | Secondary |
| `--text-xs` | 0.75rem → 0.8125rem | 1.4 | Captions |

Rules: max measure **62ch** for reading text; sentence case everywhere; weights limited to 400, 500, 600, and one display weight; **no tracked-out ALL-CAPS eyebrow labels above every heading**; no accenting one word of a headline in a different color or italic.

### 4.3 Color themes (all cool-toned; verify every pair)
Every theme defines the same tokens: `--bg`, `--surface`, `--surface-2`, `--ink`, `--ink-muted`, `--line`, `--accent`, `--accent-ink` (text on accent), `--focus`, plus `--success`, `--warning`, `--danger` with readable text variants.

| Token | **Day Shift** | **Night Coder** | **Blueprint** | **Mono** |
|---|---|---|---|---|
| `--bg` | `#F4F6FA` | `#0A0F1A` | `#1F33E6` | `#FFFFFF` |
| `--surface` | `#FFFFFF` | `#121A2A` | `#1829C4` | `#FFFFFF` |
| `--surface-2` | `#EAEEF5` | `#1A2438` | `#2B40F2` | `#F0F0F0` |
| `--ink` | `#0B1220` | `#E8EDF7` | `#FFFFFF` | `#000000` |
| `--ink-muted` | `#4A5468` | `#9AA6BD` | `#C9D2FF` | `#3D3D3D` |
| `--line` | `#D5DBE6` | `#24304A` | `#4A5BF0` | `#000000` |
| `--accent` | `#2F4BFF` | `#8AA2FF` | `#FFE14D` | `#0033FF` |

- Day Shift: crisp cool paper and cobalt. Night Coder: deep ink-navy with a soft periwinkle accent. Blueprint: full-bleed cobalt with white type and a yellow accent, the boldest theme. Mono: maximum-contrast accessibility theme with thick focus rings.
- **Contrast targets:** body text ≥ 7:1 where possible and never below 4.5:1; large text and UI components ≥ 3:1; focus indicators ≥ 3:1 against adjacent colors. **Compute and record every pair** in `docs/DESIGN.md` using a contrast tool. Adjust hexes that fail. The values above are a starting point, not a guarantee.
- Default theme resolves in this order: visitor's saved choice → admin default → `prefers-color-scheme` (light → Day Shift, dark → Night Coder).
- Themes switch via `data-theme` on `<html>`. A tiny blocking inline script sets it before paint (no flash). Progressive-enhance the switch with the View Transitions API where supported (fallback: instant).
- **Do not use** warm cream + terracotta, acid-green-on-black, or purple gradient washes. Those are the generic defaults.

### 4.4 Spacing, radius, elevation
- **4px base scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160. Only these values in layout.
- Section vertical padding: `clamp(72px, 12vw, 160px)`.
- **Radius scale with hierarchy** (not one radius everywhere): `--r-sm: 6px` (inputs, buttons), `--r-md: 12px` (surfaces, media), `--r-pill: 999px` (badges, toggles only).
- Structure comes from **1px lines and space**, not shadows. One soft shadow token is allowed for floating layers (menus, dialogs) only.
- No identical-card grids for everything. Vary composition by content type.

### 4.5 Grid and breakpoints
- **12-column grid**, gutter `clamp(16px, 2vw, 32px)`, page margin `clamp(20px, 5vw, 64px)`, container max **1440px** (text-heavy pages 1200px).
- Breakpoints (mobile-first): **360** (base), **640** `sm`, **768** `md`, **1024** `lg`, **1280** `xl`, **1536** `2xl`.
- Test widths: 360, 390, 768, 1024, 1280, 1440, 1920.
- Use `svh`/`dvh`, never bare `100vh`. Touch targets ≥ 44×44px. No horizontal scroll at any width.

### 4.6 Motion tokens
- Durations: `instant 120ms`, `fast 200ms`, `base 400ms`, `slow 700ms`, `epic 1100ms`.
- Easings: `out-expo cubic-bezier(0.16, 1, 0.3, 1)` (GSAP: `expo.out`), `in-out cubic-bezier(0.65, 0, 0.35, 1)` (GSAP: `power3.inOut`). **No bounce, no elastic, no overshoot.**
- Animate only `transform`, `opacity`, `clip-path`, and variable-font axes. Never animate layout properties (`width`, `height`, `top`, `left`, `margin`).
- Every animation has a `prefers-reduced-motion` fallback (instant state change or static).

### 4.7 Proof-of-design details (must be visible in the finished site)
- Visible 4/8px rhythm and consistent alignment on the grid.
- Optical alignment of large type; hanging punctuation on quotes where supported.
- Custom `::selection`, styled focus rings, styled scrollbar (subtle), tabular numerals for dates and metrics.
- Case studies show **problem, role, process, decisions, outcome**, with before/after or real metrics when available.
- `/colophon`: live token swatches per theme, type specimen with the variable axes, stack list, and a Lighthouse snapshot updated at release.
- Skeletons, empty states, error states, and loading states designed for every data-driven surface.

---

## 5. Structure, routes, header, footer

### 5.1 Sitemap
```
/                      Home
/work                  All projects (filterable by tag)
/work/[slug]           Case study
/about                 About + Experience + Toolbox + Resume
/contact               Form + Mr Bean + direct contact details
/colophon              Design + tech details
/not-found             Meme 404
/admin/login
/admin                 Dashboard
/admin/projects        List, create, edit, reorder
/admin/experience      CRUD
/admin/profile         About, contact details, resume link, availability, "Now"
/admin/messages        Inbox (read, archive, delete)
/admin/appearance      Default theme, meme uploads
/api/...               Cloudinary sign, health
```

### 5.2 Header (fixed, all public pages)
```
Desktop  ┌──────────────────────────────────────────────────────────────┐
         │ Asfakul       Work   About   Contact        ◐ Theme  [Resume] │
         └──────────────────────────────────────────────────────────────┘
Mobile   ┌────────────────────────────────┐
         │ Asfakul              ◐    ☰     │  → full-screen sheet: large links,
         └────────────────────────────────┘    email, socials, theme switcher
```
- Height 64px desktop, 56px mobile. Transparent at top; after 24px scroll: `--bg` at 80% with backdrop blur and a 1px `--line` bottom border.
- **Hides on scroll down (after 120px), reappears on scroll up.**
- On Home, the wordmark is hidden while the hero is in view and crossfades in after the hero passes (the hero already shows the name).
- Active link uses a sliding underline (`transform`, not width). Keyboard: skip-to-content link first, logical tab order, `aria-current="page"`.
- Mobile sheet: focus trap, `Esc` closes, Lenis paused while open, body scroll locked, links animate in with a short stagger.
- The "Resume" button links to the admin-managed resume URL and opens in a new tab.

### 5.3 Footer (all public pages)
```
┌──────────────────────────────────────────────────────────────────┐
│  Have a project in mind?            hello@domain   [Copy email]  │
│──────────────────────────────────────────────────────────────────│
│  Pages          Elsewhere            Status                      │
│  Work           GitHub               ● Open for work             │
│  About          LinkedIn             Dhaka · 14:32 (local time)  │
│  Contact        (from admin)         Built in 2026               │
│──────────────────────────────────────────────────────────────────│
│  A S F A K U L  (giant wordmark, clip-reveal on scroll)          │
│  © 2026 Asfakul   Colophon   Theme ◐              [Back to top]  │
└──────────────────────────────────────────────────────────────────┘
```
Local time is computed client-side for `Asia/Dhaka` and updates each minute. "Copy email" shows an inline confirmation (not a blocking toast). All footer data comes from the profile document.

### 5.4 Home page composition
```
1. Hero            100svh. Huge headline bottom-left, availability + local time row, scroll cue.
2. Featured work   3–5 projects, pinned stacked panels (desktop) / simple vertical list (mobile).
3. How I work      4 short principles, each with a tiny live specimen (spacing, contrast, type, motion).
4. Now             "Currently working on" panel from admin, with last-updated date.
5. About teaser    Short bio, toolbox, link to /about.
6. Contact CTA     Large invitation, small Mr Bean waiting loop, link to /contact.
```
Placeholder hero copy (editable in admin): *"I design and build websites that feel considered."* Sub: *"Web designer and full-stack developer in Bangladesh."*

---

## 6. Motion and scroll plan (the complete inventory)

Motion is a budget. **Anything not listed here needs explicit approval.**

| # | Where | What | Tool |
|---|---|---|---|
| M1 | Global | Smooth scroll (`lerp ≈ 0.1`), anchor scrolling, paused when menus are open. Not on `/admin`, not on touch. | Lenis + ScrollTrigger sync |
| M2 | Global | Enter-only page transition (opacity + 8px translate, ≤ 400ms) via `template.tsx`. No exit animation. | CSS/GSAP |
| M3 | Hero (**signature**) | Headline loads with variable-axis animation (condensed/light → final width/weight) and per-line mask reveal. On scroll, headline compresses and fades while the header wordmark fades in. | GSAP + SplitText + ScrollTrigger |
| M4 | Featured work | Pinned panels: each project slides over the previous, which scales to ~0.95 and dims. Desktop `lg+` only. Mobile: static list with a single reveal per item. | ScrollTrigger pin/scrub |
| M5 | How I work | Words of the statement change from muted to full ink as you scroll (scrubbed). One section only. | ScrollTrigger scrub |
| M6 | About / Experience | Timeline line draws as you scroll. (This content *is* a sequence, so numbering and a timeline are valid here.) | ScrollTrigger scrub |
| M7 | Footer | Giant wordmark clip-reveal on entering the viewport. | ScrollTrigger |
| M8 | Cursor | Small ring follows the pointer; scales on interactive elements; label states such as "View" and "Play". Only for `(pointer: fine)`. **The native cursor stays visible.** | GSAP quickTo |
| M9 | UI | Mobile sheet, dialogs, toasts, admin list reorder. | Motion (`LazyMotion`) |
| M10 | Contact | Meme state transitions (see §7); button loading state; success confirmation. | CSS + Motion |
| M11 | Theme switch | Circular reveal via View Transitions where supported. | View Transitions API |
| M12 | Micro | Hover/focus/press on links and buttons: color, underline, subtle translate (≤ 2px). | CSS |

**Not allowed:** fade-and-slide-up on every section, hover lifts on every card, marquees, floating shapes, cursor trails, parallax on images, scroll hijacking, auto-playing sound, animations that block interaction.

**Mobile/touch behavior:** no custom cursor, no Lenis smoothing (`syncTouch: false`), pinned sequences replaced with simple layouts. Scroll animations stay cheap.

---

## 7. Meme system

| State | Where | Behavior |
|---|---|---|
| `waiting` | Contact page (idle) | Mr Bean waiting loop beside the form. Caption: "Waiting for your message." |
| `sending` | Form submit | Swap to sending meme; button shows a spinner and "Sending". |
| `success` | After 2xx | Celebration meme; confirmation: "Sent. I'll reply within 2 days." |
| `error` | Failure | Confused meme; message states what failed and how to retry, without blame. |
| `notFound` | 404 | Confused meme; link back home. |
| `loading` | Route/loader | Small meme loop, only for waits longer than ~600ms. |

- Format: short, **muted** looping video (WebM/MP4 via Cloudinary `f_auto`) or optimized image, ≤ 1.5MB, with a poster frame. Lazy-load anything below the fold.
- **Accessibility:** looping moving content must not run indefinitely. Play up to **3 loops, then rest on the poster frame**; tap/click replays. Under `prefers-reduced-motion`, show the poster only. Every meme has alt text; decorative use is marked `aria-hidden`.
- Memes are **uploaded in `/admin/appearance`**, never hard-coded. Ship with neutral placeholders.
- Note for the owner: third-party meme clips are copyrighted material. Prefer clips you have the right to use, or original/licensed alternatives, and keep them swappable from admin.

---

## 8. Data model (Zod is the source of truth; collections in MongoDB)

- **`profile`** (singleton): `name`, `headline`, `subheadline`, `bio` (markdown), `location`, `timezone` (`Asia/Dhaka`), `availability {open: boolean, text}`, `email`, `phone?`, `socials[] {label, url}`, `resume {url, updatedAt}`, `avatar?`, `now {title, body, links[], updatedAt}`, `toolbox[] {group, items[]}`.
- **`projects`**: `slug` (unique), `title`, `summary`, `year`, `role`, `status` (`draft|published`), `featured`, `order`, `tags[]`, `stack[]`, `links {live?, repo?}`, `cover {publicId, width, height, alt}`, `media[] {type: image|video, publicId, alt, width, height}`, `sections[] {heading, body(markdown), mediaIndex?}`, `metrics[] {label, value}`, `createdAt`, `updatedAt`.
- **`experience`**: `company`, `role`, `start`, `end|null`, `location`, `summary`, `highlights[]`, `stack[]`, `order`.
- **`messages`**: `name`, `email`, `subject?`, `body`, `status` (`new|read|archived`), `ipHash`, `emailStatus {notify, autoReply}`, `createdAt`.
- **`settings`** (singleton): `defaultTheme`, `memes {waiting, sending, success, error, notFound, loading}` (each `{type, publicId, alt}`), `seo {titleTemplate, description, ogImage?}`.
- **`rate_limits`**: `key`, `count`, `expiresAt` (**TTL index**).

Indexes: `projects.slug` unique; `projects {status, order}`; `messages {status, createdAt}`; `rate_limits.expiresAt` TTL.

No user collection: the single admin comes from environment variables.

---

## 9. Environment variables (validated with Zod at boot in `lib/env.ts`)

```
MONGODB_URI=
MONGODB_DB=
AUTH_SECRET=
AUTH_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=          # bcrypt hash, never the plain password
RESEND_API_KEY=
RESEND_FROM=                  # e.g. hello@yourdomain (verified domain)
CONTACT_TO_EMAIL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_SITE_URL=
IP_HASH_SALT=
```
Commit `.env.example` only. Never commit real values.

---

## 10. Folder structure (feature-based)

```
src/
  app/
    (public)/            layout with header/footer; page routes
    admin/               protected area (own layout, native scroll)
    api/
    layout.tsx  template.tsx  not-found.tsx  sitemap.ts  robots.ts
  components/
    ui/                  shadcn primitives (token-styled)
    layout/              Header, Footer, MobileSheet, ThemeSwitcher
    motion/              LenisProvider, Cursor, Reveal, SplitHeading
    sections/            Hero, FeaturedWork, HowIWork, Now, AboutTeaser, ContactCta
  features/
    projects/ experience/ profile/ messages/ appearance/ auth/
      schema.ts  queries.ts  actions.ts  components/
  lib/
    db.ts env.ts auth.ts cloudinary.ts resend.ts rate-limit.ts gsap.ts seo.ts utils.ts
  config/
    site.ts  motion.ts
  styles/
    tokens.css  globals.css
docs/
  DESIGN.md  DECISIONS.md  CHANGELOG.md  RUNBOOK.md
tests/
  unit/  e2e/
scripts/
  seed.ts  export-content.ts
```

---

## 11. Build phases

For every phase: **read `AGENTS.md`, restate the plan, build, run the phase's checks, then stop and report** (what changed, evidence, what's next).

### Phase 0: Foundation and quality gates
**Goal:** a clean, strict, tested skeleton before any design.
- Create the Next.js app (App Router, TypeScript strict, `src/` dir, Tailwind, ESLint) with **pnpm**. Pin exact versions.
- Add: `zod react-hook-form @hookform/resolvers mongodb bcryptjs resend cloudinary lucide-react` and dev tools `vitest @testing-library/react @testing-library/user-event jsdom playwright @axe-core/playwright prettier`.
- Init shadcn/ui. Configure path aliases, `noUncheckedIndexedAccess`, strict ESLint, Prettier.
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `format`.
- Create `lib/env.ts` (Zod-validated), `.env.example`, `docs/DESIGN.md`, `docs/DECISIONS.md`, `docs/CHANGELOG.md`.
- CI (GitHub Actions): install, `lint`, `typecheck`, `test`, `build`.
- Security headers in `next.config` (CSP appropriate for Cloudinary/Resend/fonts, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- **Accept when:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all pass; CI is green.

### Phase 1: Design system and app shell
**Goal:** tokens, themes, type, header, footer, motion foundation.
- Implement `tokens.css` with all four themes (§4.3), type scale (§4.2), spacing/radius/motion tokens, mapped into Tailwind with `@theme`.
- Load Bricolage Grotesque with `next/font`. Add the theme bootstrap script and `ThemeSwitcher` (persist to `localStorage`; View Transitions enhancement).
- Build `Header` (§5.2), `MobileSheet`, `Footer` (§5.3), skip link, focus styles, `::selection`, scrollbar styling.
- Add `lib/gsap.ts` (register plugins once), `LenisProvider` synced to ScrollTrigger, `Cursor` (fine pointers only), `template.tsx` enter transition.
- Build core primitives: `Button`, `Link`, `Badge`, `Container`, `Section`, `Heading`, `Text`, `Input`, `Textarea`, `Skeleton`.
- Create `/colophon` skeleton and a temporary `/design-test` page (excluded from production) showing every token, theme, and component state.
- Record every contrast ratio in `docs/DESIGN.md`.
- **Accept when:** all four themes pass contrast targets; header/footer work from 360px to 1920px; no layout shift on theme change; keyboard navigation and reduced motion verified; Lighthouse ≥ 95 on the test page.

### Phase 2: Public pages (static content first)
**Goal:** every page fully designed and responsive using seed data in code.
- Build Home sections (§5.4), `/work`, `/work/[slug]`, `/about` (bio, experience timeline, toolbox, resume button), `/contact` (layout only), `/colophon`, `not-found`.
- Case study template: hero media, meta row (role, year, stack, links), problem, approach, decisions, outcome, next project.
- Use realistic **clearly marked placeholder** content. Never invent employers, clients, or metrics.
- Semantic landmarks, one `<h1>` per page, correct heading order, image `sizes`, width/height set.
- **Accept when:** every page is complete at all test widths; no horizontal scroll; CLS < 0.05 in Lighthouse; heading structure and landmarks pass axe.

### Phase 3: Signature motion and scroll storytelling
**Goal:** implement M3–M8 exactly as in §6, nothing more.
- Hero variable-axis load animation + scroll compress with header wordmark crossfade (M3).
- Pinned featured-work stack (`lg+`), simple list below `lg` (M4).
- Scrubbed statement, timeline draw, footer wordmark reveal, cursor (M5–M8).
- `gsap.matchMedia()` for breakpoint and reduced-motion variants; all animations created in `useGSAP` with a scope and cleaned up on unmount; `ScrollTrigger.refresh()` after fonts load.
- **Accept when:** consistent 60fps on a mid-range phone (Chrome performance profile shows no long tasks from animation); no layout thrash; reduced motion shows final states with no movement; navigating between routes leaves no orphaned triggers.

### Phase 4: Database and data layer
**Goal:** replace seed data with MongoDB.
- `lib/db.ts` with a cached client (serverless-safe). Collections, Zod schemas, and typed query functions per feature (`queries.ts`).
- `scripts/seed.ts` (idempotent) and `scripts/export-content.ts` (JSON backup of content collections).
- Public pages read from the DB using Next.js caching with **tag-based revalidation** (`revalidateTag`) so admin edits go live without a redeploy. Follow the installed Next.js version's caching docs.
- Create indexes on startup script or seed.
- **Accept when:** public pages render from DB; seed runs twice with no duplicates; missing or empty data shows designed empty states; unit tests cover schemas and queries (test DB or in-memory MongoDB).

### Phase 5: Auth and admin shell
**Goal:** secure admin foundation.
- Auth.js Credentials provider comparing against `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (bcrypt); JWT session; secure, httpOnly, sameSite cookies; short session lifetime.
- `requireAdmin()` helper used at the top of **every** admin server action, route handler, and admin layout. Route protection in middleware/proxy is a convenience, **never the only check**.
- Login rate limiting (Mongo TTL): 5 attempts per 15 minutes per IP+email hash; identical error message for any failure.
- Admin shell: sidebar (desktop) and drawer (mobile), native scroll, no cursor/Lenis/scroll animation. Dashboard with counts and recent messages.
- **Accept when:** unauthenticated access to any `/admin/*` page or admin action fails (E2E tests prove it, including direct server-action and API calls); login rate limit works; sign-out clears the session.

### Phase 6: Admin CRUD and Cloudinary uploads
**Goal:** manage everything from the admin panel.
- Projects: create/edit/delete, draft/publish, featured flag, reorder (order field + move buttons), tags, stack, links, case-study sections (markdown), metrics.
- Uploads: `/api/admin/cloudinary/sign` (auth-checked) returns a signature; the browser uploads **directly to Cloudinary** (avoids Vercel body limits). Folders: `devden/projects/{slug}`, `devden/memes`. Validate type and size (images ≤ 10MB, videos ≤ 100MB). **Alt text required** for every image.
- Deleting a project or asset also deletes it in Cloudinary (server-side).
- Experience CRUD, Profile editor (bio, headline, availability toggle, contact details, socials, resume link add/update, "Currently working on"), Appearance (default theme, meme uploads).
- Render markdown safely (`react-markdown`, no raw HTML).
- Forms use React Hook Form + the shared Zod schema; server actions re-validate. Inline errors, loading states, success feedback. Destructive actions require confirmation.
- On every mutation call `revalidateTag`/`revalidatePath` for affected pages.
- **Accept when:** all content shown on the public site is editable; an edit appears publicly without a redeploy; uploads work for image and video; failed uploads and validation errors are handled gracefully.

### Phase 7: Contact flow, Resend, and memes
**Goal:** a reliable, delightful contact experience.
- Contact form (name, email, message; optional subject). Zod validation, length limits, honeypot field, minimum time-to-submit, per-IP-hash rate limit (3 per hour).
- Server action: validate → rate-limit → **save to MongoDB first** → send notification (Reply-To = visitor) → send auto-reply → record `emailStatus`. If email fails, the message is still saved and admin shows a "not delivered" flag.
- Typed HTML email templates with escaped user input, plain-text alternative, readable in light and dark clients. Verify the sending domain (SPF/DKIM) in Resend.
- Meme state machine (§7): `idle → sending → success | error`, with the loop-limit and reduced-motion behavior.
- Admin inbox: list, read, mark read/archive/delete, reply via `mailto:`.
- **Accept when:** end-to-end flow works in production mode; both emails arrive; spam attempts (honeypot, rapid resubmit, oversize input) are rejected; form is fully keyboard and screen-reader operable; state changes are announced with `aria-live`.

### Phase 8: SEO, accessibility, performance, polish
**Goal:** production quality.
- Metadata API on every route, `metadataBase`, canonical URLs, `sitemap.ts`, `robots.ts` (disallow `/admin`), JSON-LD (`Person`, `CreativeWork`), dynamic OG images via `opengraph-image` per project.
- Accessibility audit to **WCAG 2.2 AA** (axe + manual keyboard and screen reader pass).
- Performance to budgets (§13). Audit bundle; lazy-load below-fold motion and Motion's features.
- Design polish pass: alignment, rhythm, copy, empty/loading/error states, 404, print styles for `/about`.
- **Accept when:** all budgets in §13 are met on the production build; zero critical axe violations; Lighthouse ≥ 95 (Performance) and 100 (Accessibility, Best Practices, SEO) on Home, Work, a case study, and Contact.

### Phase 9: Testing hardening, deploy, handoff
**Goal:** safe launch and a maintainable future.
- Full Playwright suite (see `AGENTS.md` §14), visual checks at all test widths, cross-browser (Chromium, WebKit, Firefox), real-device pass (an iPhone, a mid-range Android).
- Deploy to Vercel (region `sin1` or `bom1`), custom domain, env vars, Atlas IP/network config, Resend DNS verified, Cloudinary upload presets locked.
- `docs/RUNBOOK.md`: how to deploy, rotate secrets, restore content from the JSON export, update dependencies, and swap the auth provider.
- Enable Dependabot or Renovate (weekly, grouped). Enable error monitoring (Vercel logs at minimum).
- **Accept when:** production smoke tests pass; launch checklist (§13) is fully ticked; the runbook has been followed once from scratch by reading it only.

---

## 12. Longevity rules (2026 → 2028)

- **Stable over new.** Latest *stable, compatible* versions only. No RCs, canaries, or experimental APIs in production paths. Pin exact versions; upgrade deliberately.
- **Few dependencies, all justified.** Every package needs a written reason in `docs/DECISIONS.md`. Prefer platform features (CSS, native APIs) over packages.
- **Tokens, not hardcodes.** A redesign in 2028 should mean editing `tokens.css`, not hunting through components.
- **Content lives in the database**, never in code, so the site can grow without redeploys.
- **Timeless over trendy:** type-led layout, real grid, restrained color. Avoid trend-of-the-moment effects (glassmorphism everywhere, aurora gradients, bento-for-everything).
- **Swappable boundaries:** auth, email, and media each sit behind a small module in `lib/`.
- **Portable data:** `scripts/export-content.ts` produces a full JSON backup; run it monthly and before upgrades.
- **Quarterly maintenance checklist** in the runbook: dependency updates, Lighthouse and axe re-run, broken-link check, content freshness ("Currently working on" updated), secret rotation review.
- **Year rendering:** copyright year computed at render time, never hard-coded.

---

## 13. Global budgets and launch checklist

### Performance budgets (production build, mobile profile)
- LCP ≤ 2.0s · INP ≤ 200ms · CLS ≤ 0.05 · TBT ≤ 150ms.
- First-load JS per public route ≤ **180KB gzipped**. Animation code (GSAP core + ScrollTrigger + SplitText + Lenis + Motion features) counts toward this; load below-the-fold pieces lazily.
- Images: `next/image` with a Cloudinary loader, correct `sizes`, AVIF/WebP via `f_auto`; hero media `priority`, everything else lazy.
- Fonts: one variable family, preloaded, `display: swap`, no layout shift from fallbacks (`adjustFontFallback`).

### Launch checklist
- [ ] All phases accepted, all tests green in CI.
- [ ] Every theme passes contrast checks (documented).
- [ ] No horizontal scroll at 360–1920px; touch targets ≥ 44px.
- [ ] Reduced-motion and keyboard-only passes done.
- [ ] Admin fully protected (unauthenticated requests fail on pages, actions, and APIs).
- [ ] Contact flow works in production; emails not landing in spam (SPF/DKIM/DMARC set).
- [ ] Placeholder content replaced with real content; no `TODO` left in the UI.
- [ ] Meme assets uploaded and confirmed usable; alt text present.
- [ ] `.env` values set in Vercel; no secrets in the repository.
- [ ] Sitemap, robots, OG images, and metadata verified.
- [ ] Runbook and content export tested.

---

## 14. Content and copy rules
- Write from the visitor's point of view. Plain verbs, sentence case, active voice.
- Buttons say what happens: "Send message", "View project", "Save changes". Feedback reuses the same verb ("Saved", "Sent").
- Errors say what went wrong and how to fix it, and never blame the user. Empty states explain why they're empty and what to do.
- Don't append arrows to every link. Don't join meta with middle dots as decoration. Don't use numbered markers unless the content is truly a sequence.
- Placeholder content is obviously marked (`TODO:`) and must never look like real claims, clients, or numbers.

---

## 15. First message to the agent

> Read `PORTFOLIO_PROMPT.md` and `AGENTS.md` fully. Confirm the plan for **Phase 0** in a short checklist, list any assumptions or questions (max 5), then begin Phase 0. Stop when Phase 0's acceptance criteria are met and report using the format in `AGENTS.md` §16. Do not start Phase 1 until told.
