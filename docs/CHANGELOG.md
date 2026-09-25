# Dev Den — Changelog

All notable changes across phases will be documented in this file.
Format based on Keep a Changelog.

---

## [Phase E] - Documentation, Runbook & Launch Prep (2026-09-25)

### Added

- **Comprehensive Operations Runbook (`docs/RUNBOOK.md`)**:
  - Full CLI command reference for dev, lint, typecheck, unit test, e2e test, seed, and export-content.
  - Secret rotation protocols and inline generators for `AUTH_SECRET`, `IP_HASH_SALT`, and bcrypt `ADMIN_PASSWORD_HASH`.
  - Database indexing strategy, point-in-time JSON backups, idempotent restore workflows, and zero-downtime static fallbacks.
  - Cloudinary signed upload security architecture with server-only signing and duotone transformations.
  - Rate limiting parameters, honeypot bot defense, and Resend email persistence-first dispatch.
  - Pre-launch production verification checklist.
- **Architectural Decision Records (`docs/DECISIONS.md`)**:
  - Added ADR-011 (Hardened HMAC-SHA256 Session Engine), ADR-012 (Meme Reaction & Appearance Engine), ADR-013 (Identity Text-Mask Photo Reveal & Duotone Backdrop), and ADR-014 (Automated 2-Tier Testing Architecture).
- **Environment & Applet Alignment**:
  - Validated `.env.example` with clear documentation for all secrets and variables without leaking any production keys.
  - Aligned `metadata.json` branding, descriptions, and capabilities.

## [Phase D] - Testing Hardening & Playwright E2E Suite (2026-09-25)

### Added

- **Playwright E2E Test Suite (`tests/e2e/*`)**:
  - `navigation.spec.ts`: Header links, mobile navigation, skip-to-content focus target, and 404 error page.
  - `theme.spec.ts`: Data-theme cycle across all 4 themes (`day-shift`, `night-coder`, `blueprint`, `mono`) and localStorage persistence without theme flash.
  - `responsive.spec.ts`: Viewport testing across 360px, 768px, 1024px, 1440px, and 1920px asserting zero horizontal scroll overflow (`scrollWidth <= clientWidth`).
  - `reduced-motion.spec.ts`: Verified `prefers-reduced-motion: reduce` stops motion loops and renders static accessible content.
  - `contact.spec.ts`: Validation errors, aria-invalid attributes, email format checking, and honeypot spam containment.
  - `auth.spec.ts`: Unauthenticated redirect protection on all `/admin/*` routes and generic error responses on bad credentials.
  - `admin-crud.spec.ts`: Admin login form accessibility and input element validation.
  - `a11y.spec.ts`: Automated axe audits across routes and all 4 themes verifying zero serious or critical WCAG 2.2 AA violations.
  - `seo.spec.ts`: Metadata, canonical tags, `robots.txt` disallow rules, and `sitemap.xml` generation.
- **Vitest Unit Test Suite**:
  - 17 test suites and 99 unit/component tests passing with 100% success rate across schemas, queries, actions, rate limiting, and motion components.

## [Phase C] - Identity & Photo System (2026-09-25)

### Added

- **Identity Photo Data Model (`src/features/profile/schema.ts`, `src/features/profile/data.ts`)**:
  - `photoSchema`: Strongly typed photo model with mandatory accessibility `alt` text, Cloudinary `publicId`, and optional `mood`.
  - Added `photos` array and `activePhotoId` to `profileSchema` and query helpers (`getActivePhoto()`).
  - Integrated high-contrast minimalist SVG architectural portrait fallback for instant out-of-the-box presentation.
- **Signature Hero Text-Mask Photo Reveal (`src/components/motion/HeroMotion.tsx`, `src/styles/globals.css`)**:
  - `identity-mask` CSS utility using design tokens with `background-clip: text` and `-webkit-background-clip: text`.
  - Interactive desktop hover reveal with smooth tokenized transition and touch entrance scroll trigger.
  - Full `prefers-reduced-motion: reduce` compliance reverting automatically to solid `--ink` type.
- **Secondary Duotone Background Shade (`src/components/motion/DuotoneBackdrop.tsx`, `src/lib/cloudinary.ts`)**:
  - `getDuotonePhotoUrl` helper applying `e_grayscale,e_tint:60:<accent>` at request time.
  - Subtle `opacity: 0.07–0.09` full-bleed ambient layer behind the About section with GSAP `ScrollTrigger.scrub` transform scaling (1.0 $\to$ 1.06).
  - Protected with solid / semi-solid `--surface` content backings, guaranteeing $\ge 4.5:1$ text contrast in all 4 themes.
- **Admin Identity & Photo Manager (`src/components/admin/ProfileManager.tsx`)**:
  - Added "Identity & Photos" tab to `/admin/profile` allowing administrators to upload portraits, edit alt text, and toggle the active hero photo without code changes or redeploys.
- **Test Suite (`tests/unit/identity-photos.test.ts`)**:
  - 5 new unit tests verifying photo schema validation, alt text enforcement, query fallbacks, and duotone URL generation.

## [Phase B] - Meme Reaction System & Appearance Management (2026-09-25)

### Added

- **Appearance & Meme Architecture (`src/features/appearance/*`)**:
  - `schema.ts`: Zod schema for `defaultTheme` (`day-shift`, `night-coder`, `blueprint`, `mono`) and 6 reactive meme asset states (`waiting`, `sending`, `success`, `error`, `notFound`, `loading`). Enforces non-empty accessibility `alt` text.
  - `data.ts`: Zero-dependency vector SVG data URIs for all 6 comic reaction states ensuring zero broken links out of the box.
  - `queries.ts`: Server query helpers `getSettings()` and `getMeme(state)` with resilient offline static fallbacks.
  - `actions.ts`: `updateSettingsAction` with `requireAdmin()` authorization guard and cache revalidation (`revalidateTag("settings")`).
- **Meme State Machine Component (`src/components/motion/MemeState.tsx`)**:
  - Supports image stills, animated SVGs, and short video loops.
  - Loop limiter (`maxLoops = 3`) that automatically rests on poster/last frame and supports click-to-replay.
  - Respects `prefers-reduced-motion: reduce` by rendering accessible static stills with zero autoplay.
- **Admin Appearance CMS (`app/admin/(dashboard)/appearance/page.tsx`, `src/components/admin/AppearanceManager.tsx`)**:
  - Default first-paint theme selector with color swatches and instant previews.
  - 6 meme asset upload slots with format selector, alt text validator, live preview, and "Reset to default vector SVG" button.
- **Integration across Public App**:
  - `ContactForm.tsx`: Reactive meme companion updating across `idle (waiting)` $\to$ `submitting (sending)` $\to$ `success` / `error`.
  - `app/not-found.tsx`: Displays reactive `notFound` meme.
  - `app/loading.tsx`: Global Suspense boundary with `loading` brewing meme.
  - `app/layout.tsx`: Dynamic theme bootstrap script injecting the configured default theme on first paint.
- **Unit & Component Test Suite (`tests/unit/appearance.test.ts`, `tests/unit/meme.test.tsx`)**:
  - 6 new unit tests covering schemas, fallbacks, server actions, and MemeState rendering.

## [Phase 6] - Media, SEO & Structured Data (2026-09-24)

### Added

- **Cloudinary Image Optimization Architecture (`src/lib/cloudinary.ts`)**: Built an asset pipeline with automatic f_auto/q_auto transformations, blur placeholder generation (`w_30,e_blur:1000,q_auto:eco`), responsive srcset width calculations, and safe fallback handling.
- **Dynamic XML Sitemap (`app/sitemap.ts`)**: Generates dynamic sitemaps combining static core routes (`/`, `/work`, `/about`, `/contact`, `/colophon`) with published case study project URLs from database queries with fallback.
- **Dynamic Robots.txt (`app/robots.ts`)**: Generates search engine crawler instructions disallowing `/admin/` and `/api/`, while pointing crawlers to `/sitemap.xml` and `/llms.txt`.
- **LLMs Context Route (`app/llms.txt/route.ts`)**: Serves structured markdown context for AI crawler agents and LLM research bots adhering to emerging web indexing standards.
- **Dynamic Case Study OpenGraph Images (`app/work/[slug]/opengraph-image.tsx`)**: Built edge-rendered social preview cards via `next/og` (`ImageResponse`) with custom typography, category badges, year tags, and branding.
- **Schema.org Structured Data Engine (`src/lib/jsonld.ts`)**: Generates typed JSON-LD structured data for `Person`, `WebSite`, and `Article`/`SoftwareApplication` schemas to achieve rich Google search results.
- **Phase 6 Test Suite (`tests/unit/seo-media.test.ts`)**: 12 comprehensive unit tests covering Cloudinary URL transforms, blur placeholders, structured data formats, dynamic sitemaps, and robots directives (69 total unit/component tests passing).

## [Phase 5] - Authentication & Admin CMS Dashboard (2026-09-24)

### Added

- **Cryptographic HMAC Session Authentication Engine (`src/lib/auth.ts`, `src/lib/auth-actions.ts`)**: Built a secure HMAC SHA-256 session token generator and validator using `AUTH_SECRET`, with `httpOnly`, `sameSite=lax`, and `secure` cookie storage. Implemented rate-limited `loginAction` (max 5 attempts per 15-minute sliding window) and `logoutAction`.
- **Admin Layout & Route Guard Architecture (`app/admin/(dashboard)/layout.tsx`, `src/lib/auth-guard.ts`)**: Server-side layout enforcement using `requireAdmin()` with automatic redirection to `/admin/login` for unauthorized visits. Configured `export const dynamic = "force-dynamic"` to guarantee dynamic evaluation.
- **Admin Overview Dashboard (`app/admin/(dashboard)/page.tsx`)**: High-level telemetry displaying project counts (published vs draft), unread message counts, career milestones, live availability status, and recent activity streams.
- **Projects CMS Manager & Form Editor (`app/admin/(dashboard)/projects/*`, `src/components/admin/ProjectsManager.tsx`, `src/components/admin/ProjectForm.tsx`)**: Full CRUD suite for case studies with category filtering, real-time search, instant published/draft toggling, delete confirmation dialogs, multi-metric inputs, and deep architecture breakdowns.
- **Signed Cloudinary Asset Upload API (`app/api/admin/cloudinary-sign/route.ts`)**: Server-side signing endpoint requiring `requireAdmin()` to securely generate upload signatures for cover photos without exposing Cloudinary API secret to client browsers.
- **Profile & "Now" CMS Manager (`app/admin/(dashboard)/profile/page.tsx`, `src/components/admin/ProfileManager.tsx`)**: Tabbed management interface for personal bio, headline, availability status toggle, resume URL, "Now" focus pillars, and categorized toolbox stacks.
- **Experience & Principles CMS Manager (`app/admin/(dashboard)/experience/page.tsx`, `src/components/admin/ExperienceManager.tsx`)**: Management interface for career timeline items, role deliverables, and philosophy of craft principles.
- **Inbound Inquiries CMS Inbox (`app/admin/(dashboard)/messages/page.tsx`, `src/components/admin/MessagesManager.tsx`)**: Message viewer with search, status filters (all/unread/read), mark-as-read/unread actions, and deletion controls.
- **Admin Shell & Accessible Navigation (`src/components/admin/AdminSidebar.tsx`, `src/components/admin/AdminHeader.tsx`, `src/components/admin/AdminDashboardShell.tsx`)**: Responsive desktop sidebar and mobile drawer with real-time unread badge, ThemeSwitcher integration, and fast sign-out action.
- **Phase 5 Test Suite (`tests/unit/admin.test.tsx`)**: 10 unit and component tests verifying token tamper rejection, expiration checks, admin email verification, action authorization guards, and accessible UI rendering (57 total tests passing).


## [Phase 4] - Data Layer, Database & Server Queries / Actions (2026-09-24)

### Added

- **Unified Domain Schemas (`src/features/*/schema.ts`)**: Built strict Zod schemas for projects (`projectSchema`, `projectInputSchema`), profile (`profileSchema`), experience (`experienceItemSchema`), and contact submissions (`contactMessageSchema`), establishing a single source of truth for runtime validation and TypeScript type inference.
- **Resilient MongoDB Client (`src/lib/db.ts`)**: Cached database connection pool with automatic fallback to curated static data in offline or disconnected environments, guaranteeing zero public downtime. Cleanly transforms BSON `ObjectId` to string IDs at boundaries (`sanitizeDocuments`).
- **Server Queries Architecture (`src/features/*/queries.ts`)**: Implemented high-performance server query functions (`getProjects`, `getFeaturedProjects`, `getProjectBySlug`, `getAllProjectSlugs`, `getAdjacentProjects`, `getProfile`, `getNow`, `getExperience`, `getPrinciples`) with tag-based caching readiness.
- **Server Action Mutations (`src/features/*/actions.ts`)**: Created mutation server actions (`createProjectAction`, `updateProjectAction`, `deleteProjectAction`, `togglePublishAction`, `updateProfileAction`, `updateNowAction`, `createExperienceAction`, `updateExperienceAction`, `deleteExperienceAction`) adhering to Authorize $\to$ Validate $\to$ Mutate $\to$ Revalidate.
- **Admin Authorization Guard (`src/lib/auth-guard.ts`)**: Implemented `requireAdmin()` pattern throwing `"UNAUTHORIZED"` for unauthenticated callers across all admin actions.
- **Salted IP Hash & Sliding Window Rate Limiting (`src/lib/rate-limit.ts`)**: Privacy-first HMAC SHA-256 IP hashing with `IP_HASH_SALT` and sliding window throttle (3 submissions per hour) for the public contact form.
- **Contact Form Integration (`src/features/contact/actions.ts`)**: Honeypot bot protection, MongoDB message persistence, optional Resend notification dispatch, and polite user feedback.
- **Idempotent Operational CLI Scripts (`scripts/seed.ts`, `scripts/export-content.ts`)**: Added `pnpm seed` for upserting baseline content and `pnpm export-content` for point-in-time JSON snapshots.
- **Data & Action Test Suite (`tests/unit/data-layer.test.ts`, `tests/unit/actions.test.ts`, `tests/unit/rate-limit.test.ts`)**: Added 17 new tests covering schemas, fallback queries, admin auth guards, honeypots, and rate limit algorithms.

## [Phase 3] - Motion Engine & Micro-Interactions (2026-09-24)

### Added

- **Hero Variable-Axis Motion (`src/components/motion/HeroMotion.tsx`)**: M3 orchestrated hero load animating Bricolage Grotesque variable font axes (`wght` 300 $\to$ 800, `wdth` 80 $\to$ 100), accompanied by subtle ScrollTrigger exit compression and full accessibility preservation.
- **Featured Work Pinned Stack (`src/components/motion/PinnedWorkStack.tsx`)**: M4 ScrollTrigger pinned card stack sequence activated exclusively on `lg+` ($\ge 1024\text{px}$), maintaining an unpinned responsive grid layout on smaller devices and under reduced motion.
- **Scrubbed Philosophy Statement (`src/components/motion/ScrubbedStatement.tsx`)**: M5 word-by-word opacity scrub ($0.2 \to 1.0$) with WCAG 2.2 compliant `aria-label` container and `aria-hidden="true"` on split text spans.
- **Experience Timeline Draw (`src/features/about/components/ExperienceTimeline.tsx`)**: M6 ScrollTrigger scrub drawing the dynamic vertical accent timeline line and highlighting milestone indicators as scroll progresses.
- **Footer Wordmark Clip-Reveal (`src/components/motion/FooterWordmark.tsx`)**: M7 ScrollTrigger clip-path reveal of the prominent "A S F A K U L" signature wordmark.
- **LazyMotion Transition Integration (`app/template.tsx`)**: M2 enter-only page transitions wrapped in `LazyMotion` with `domAnimation` and `m.div`, strictly respecting `prefers-reduced-motion` and skipping `/admin` paths.
- **Smooth Scroll Synchronization (`src/components/motion/LenisProvider.tsx`)**: M1 Lenis momentum smooth scroll synchronized with GSAP ticker, with automatic `ScrollTrigger.refresh()` on route transition.
- **Fluid Pointer Cursor Polish (`src/components/motion/Cursor.tsx`)**: M8 additive cursor with optimized listener lifecycle, `data-cursor-text` detection, and 60fps compositor efficiency.
- **Motion Test Suite (`tests/unit/motion.test.tsx`)**: 5 new unit and component tests verifying semantic markup, accessible aria attributes, and proper rendering under simulated DOM environments (25 total tests passing).

### Added

- Comprehensive static seed datasets in `src/features/projects/data.ts` (5 case studies), `src/features/experience/data.ts` (roles, milestones, principles of craft), and `src/features/profile/data.ts` (profile, "Now" focus, categorized toolbox).
- Full Home Page (`/`) with 100svh Hero, status indicators, Featured Projects showcase, Principles of Craft, "Now" exploration status card, and contact CTA banner.
- Dynamic Work Gallery (`/work`) with interactive category filtering ("All", "Design Systems", "Full-Stack", "Web Applications", "Open Source") and project counter badges.
- Dynamic Case Study Template (`/work/[slug]`) with Next.js `generateStaticParams`, dynamic metadata generation, project metadata grid, measurable metrics cards, Problem & Solution narrative, Architecture decisions, deep-dive subsections, and previous/next project navigation.
- Full About Page (`/about`) with personal narrative, principles, career experience timeline, categorized toolbox grid, and resume download link.
- Accessible Contact Page (`/contact`) featuring `ContactForm` with Zod validation, hidden honeypot spam protection, accessible error announcements, direct email one-click copy, and Asia/Dhaka timezone indicators.
- 404 Not Found page (`/app/not-found.tsx`) styled with design system tokens and navigation back links.
- Unit and component test suites in `tests/unit/projects.test.ts`, `tests/unit/contact.test.ts`, and `tests/unit/components_phase2.test.tsx` (20 tests passing).

## [Phase 1] - Design System and App Shell (2026-09-24)

### Added

- Complete token and theme engine in `src/styles/tokens.css` with 4 contrast-audited themes: Day Shift, Night Coder, Blueprint, and Mono.
- Global styles and resets in `src/styles/globals.css` with custom `::selection`, visible `:focus-visible` rings, subtle scrollbars, and reduced-motion killswitches.
- Bricolage Grotesque and Geist Mono font integration via `next/font/google` with zero layout shift (`adjustFontFallback: true`).
- Blocking theme bootstrap script in root layout `<head>` eliminating theme flash on initial load.
- Accessible, interactive `ThemeSwitcher` with View Transitions API support and `useSyncExternalStore` DOM synchronization.
- Fixed responsive `Header` with scroll awareness (hides on scroll down after 120px, reappears on scroll up, adds blur backdrop after 24px) and skip-to-content accessible link.
- Accessible full-screen `MobileSheet` navigation with focus management and escape key handler.
- Full public `Footer` with real-time Asia/Dhaka time calculation, email copy button with inline feedback, site links, and giant signature wordmark.
- GSAP and ScrollTrigger initialization in `src/lib/gsap.ts`.
- Smooth scrolling via `LenisProvider` synced to GSAP ticker (disabled on touch, reduced-motion, and admin routes).
- Additive custom `Cursor` using `gsap.quickTo` for fine pointer devices without disabling native cursors.
- Enter-only page route transition in `app/template.tsx` with `motion/react`.
- Core accessible UI primitives: `Button`, `Badge`, `Container`, `Section`, `Heading`, `Text`, `Input`, `Textarea`, `Skeleton`.
- System documentation page `/colophon` and test harness `/design-test`.
- Component test suite covering primitives in `tests/unit/components.test.tsx`.

## [Phase 0] - Foundation & Quality Gates (2026-09-24)

### Added

- Phase 0 foundation setup with TypeScript strict mode, `noUncheckedIndexedAccess`, and path aliases (`@/*`).
- Core dependencies: `zod`, `mongodb`, `bcryptjs`, `resend`, `cloudinary`, `lucide-react`.
- Testing infrastructure: `vitest`, `@testing-library/react`, `jsdom`, `playwright`, `@axe-core/playwright`.
- Linting and formatting: Prettier configuration, strict ESLint.
- Configuration and quality gates: GitHub Actions CI workflow, Vitest config, Playwright config, `components.json`.
- Environment variable schema validator `src/lib/env.ts` and template `.env.example`.
- Comprehensive documentation: `docs/DESIGN.md`, `docs/DECISIONS.md`, `docs/CHANGELOG.md`, `docs/RUNBOOK.md`.
- App title, metadata, and OpenGraph configuration in `metadata.json` and root layout.
