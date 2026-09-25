# Dev Den — Architecture Decision Records (ADR)

This log documents all architectural and technical decisions made for the Dev Den portfolio, capturing context, rationale, and consequences.

---

### ADR-001: Technology Stack Selection (Phase 1)
- **Date**: 2026-09-24
- **Decision**: Select Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS v4, GSAP 3 + ScrollTrigger, Lenis, Motion (`motion/react`), MongoDB, and Zod.
- **Rationale**:
  - `Next.js 15+` & `React 19`: Full-stack React architecture with Server Components, optimal performance, and robust SEO.
  - `Tailwind CSS v4`: Fast token-based styling without runtime CSS-in-JS overhead.
  - `GSAP 3` + `ScrollTrigger`: Industry standard for complex, scrubbed, pinned, and timeline-driven animations.
  - `Lenis`: Butter-smooth momentum scrolling on desktop with GSAP ticker sync.
  - `Motion`: Declarative animations for React mount/unmount lifecycles (dialogs, sheets, and route enter transitions).
  - `MongoDB` + `Zod`: Flexible, typed document storage with strict runtime validation.
  - `lucide-react`: Clean, accessible, tree-shakeable icons for UI controls.
  - `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`: Fast unit and component testing suite.
  - `playwright`, `@axe-core/playwright`: End-to-end user journey and automated WCAG 2.2 accessibility scanning.
  - `prettier`: Enforce consistent code formatting.
- **Alternatives Considered**: Mongoose (rejected: adds overhead; raw driver + Zod provides cleaner typing and lower latency).

### ADR-002: Next.js App Router Architecture with `src/` Layout
- **Date**: 2026-09-24
- **Decision**: Organize the codebase under `src/` with feature-sliced folders (`src/features/*`), shared layout (`src/components/layout/*`), motion primitives (`src/components/motion/*`), and centralized configurations (`src/config/*`).
- **Rationale**: Keeps project roots clean, prevents accidental clutter, and ensures seamless scaling across the 9 phases.

### ADR-003: Strict Environment Variable Validation via Zod (`src/lib/env.ts`)
- **Date**: 2026-09-24
- **Decision**: All environment variables are validated at build/boot time. Missing required variables in production immediately fail fast with clear diagnostic messages.
- **Rationale**: Prevents runtime surprises and security leaks.

### ADR-004: Motion Architecture (Phase 1)
- **Date**: 2026-09-24
- **Decision**: Strict division of animation responsibilities:
  - GSAP + ScrollTrigger handles scroll-driven timeline transitions, scrubbed typography, and the additive cursor ring via `gsap.quickTo`.
  - Lenis provides momentum smooth scrolling on desktop, synced via GSAP ticker and disabled on touch, reduced motion, and admin routes.
  - Motion (`motion/react`) handles React component lifecycle transitions (dialogs, sheets, enter transitions).
  - CSS handles micro-interactions (hover, focus, subtle button states).
- **Rationale**: Optimal performance (60fps), zero scroll hijacking on mobile, and clean separation of concerns.

### ADR-005: Theme Synchronization via Blocking Head Script and useSyncExternalStore (Phase 1)
- **Date**: 2026-09-24
- **Decision**: Zero-flash theme initialization via a lightweight inline script in `<head>`, combined with `useSyncExternalStore` and a `MutationObserver` on `document.documentElement` for the client `ThemeSwitcher`.
- **Rationale**: Prevents flash of unstyled theme (FOUT/FOIC) on first paint while complying with React 19 rules (zero synchronous setState inside useEffect).

### ADR-006: Static Case Study Data Layer and Pre-rendered Routes (Phase 2)
- **Date**: 2026-09-24
- **Decision**: Implemented static dataset in `src/features/projects/data.ts` and `src/features/profile/data.ts` with strict TypeScript typing. Pre-rendered all case study slugs via `generateStaticParams()` in `app/work/[slug]/page.tsx`.
- **Rationale**: Guarantees zero latency and instantaneous static page delivery on edge CDN while laying the schema foundation for Phase 4 (MongoDB integration and Admin mutations) without changing component interfaces.

### ADR-007: Motion Engine & Micro-Interactions Architecture (Phase 3)
- **Date**: 2026-09-24
- **Decision**: Implemented Phase 3 Motion Engine adhering strictly to WCAG 2.2 AA and `AGENTS.md` §7:
  - **M1 (Global Smooth Scroll)**: Lenis smooth scroll ticker synced with GSAP `ScrollTrigger.update`, disabled on touch, reduced-motion, and `/admin` routes. Auto-refreshes `ScrollTrigger.refresh()` on route transition.
  - **M2 & M9 (Enter-only Page Transition & UI Mount)**: Wrapped transitions in `LazyMotion` with `domAnimation` and `m.div` using token-based duration (`MOTION.duration.base`) and `MOTION.ease.outExpo`. Bypassed on `/admin` and when `useReducedMotion()` is active.
  - **M3 (Hero Variable-Axis Load & Compress)**: GSAP timeline transitioning Bricolage Grotesque variable axes (`wght` 300 → 800, `wdth` 80 → 100), combined with a subtle scroll-triggered compression on exit.
  - **M4 (Featured Work Pinned Stack)**: ScrollTrigger pinning and stacking sequence active exclusively on `lg+` (≥ 1024px) with standard responsive grid fallback on smaller viewports.
  - **M5 (Scrubbed Philosophy Statement)**: ScrollTrigger word-by-word opacity scrub (0.2 → 1.0), with full accessible text via `aria-label` on container and `aria-hidden="true"` on split word spans.
  - **M6 (Experience Timeline Draw)**: ScrollTrigger scrub drawing the vertical accent timeline track and lighting milestone indicator dots.
  - **M7 (Footer Wordmark Clip-Reveal)**: ScrollTrigger clip-path reveal of the oversized signature wordmark.
  - **M8 (Fluid Pointer Cursor Ring)**: Additive `gsap.quickTo` pointer ring enabled only on `(pointer: fine)` without reduced motion, never hiding native OS cursor.
- **Rationale**: Elevates perceived quality and craft while guaranteeing 60fps performance and zero accessibility or usability regressions.

### ADR-008: Data Layer, Resilient MongoDB Integration, Server Actions & Caching Architecture (Phase 4)
- **Date**: 2026-09-24
- **Decision**: Implemented unified data layer adhering strictly to `AGENTS.md` §11 and §12:
  - **Single Source of Truth**: Zod schemas (`projectSchema`, `profileSchema`, `experienceItemSchema`, `contactMessageSchema`) define valid domain models and infer all TypeScript types via `z.infer`.
  - **Resilient MongoDB Connection (`src/lib/db.ts`)**: Reusable connection promise with pooling and automatic fallback to curated static data in offline/disconnected environments, ensuring public site zero-downtime.
  - **Server-Only Boundary Security (`src/lib/auth-guard.ts`)**: `requireAdmin()` check mandatory at the top of every mutation Server Action, rejecting unauthorized callers with standardized `{ ok: false, error: "Unauthorized" }` response objects.
  - **Salted IP Hash & Sliding Window Rate Limiting (`src/lib/rate-limit.ts`)**: Never stores or logs raw IP addresses. Hashes client IP with `IP_HASH_SALT` via HMAC SHA-256 and throttles contact submissions (3 per hour) using MongoDB TTL / in-memory window.
  - **Strict Server Action Pattern (`src/features/*/actions.ts`)**: Authorize → Validate → Mutate → Next.js `revalidateTag()`, returning typed `{ ok: true, data } | { ok: false, error, errors }`.
  - **Operational CLI Tooling (`scripts/seed.ts`, `scripts/export-content.ts`)**: Idempotent upsert seeding and point-in-time JSON snapshot export scripts executed via `tsx`.
- **Rationale**: Ensures enterprise-grade security, deterministic schema validation, zero data leaks, and seamless transition to the upcoming Phase 5 Admin Dashboard.

### ADR-009: Authentication Engine, Route Protection & Admin CMS Dashboard (Phase 5)
- **Date**: 2026-09-24
- **Decision**: Implemented Phase 5 Admin CMS and Authentication engine adhering strictly to `AGENTS.md` §4, §11, and §12:
  - **HMAC SHA-256 Session Engine (`src/lib/auth.ts`, `src/lib/auth-actions.ts`)**: Built lightweight, zero-overhead session validation using HMAC SHA-256 with `AUTH_SECRET`, storing signed session cookies (`admin_session`) with `httpOnly`, `sameSite=lax`, and `secure` attributes.
  - **Rate-Limited Login Action**: Enforces 5 failed attempts per 15-minute sliding window with IP hash throttling and bcrypt password hash verification (`ADMIN_PASSWORD_HASH`).
  - **Dynamic Route Architecture & `requireAdmin()` Guarding**: Configured `export const dynamic = "force-dynamic"` on admin layouts and pages (`/admin`, `/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]`, `/admin/profile`, `/admin/experience`, `/admin/messages`). Server-side `requireAdmin()` redirects unauthorized visitors to `/admin/login`.
  - **Signed Cloudinary Uploads (`app/api/admin/cloudinary-sign/route.ts`)**: Server-side signing endpoint requiring `requireAdmin()`, generating signed upload parameters using server-only `CLOUDINARY_API_SECRET`.
  - **Interactive Management Interfaces**: Built modular CMS components (`ProjectsManager`, `ProjectForm`, `ProfileManager`, `ExperienceManager`, `MessagesManager`) featuring real-time client search, category filters, publish toggles, delete confirmation dialogs, and optimistic feedback.
- **Rationale**: Delivers a secure, fast, and accessible administrative interface without adding heavyweight runtime auth frameworks or external dependencies.

### ADR-010: Media Optimization, Asset Pipeline & Programmatic SEO Architecture (Phase 6)
- **Date**: 2026-09-24
- **Decision**: Implemented media optimization, structured data, dynamic OpenGraph image generation, and programmatic syndication:
  - **Cloudinary Transformation Utility (`src/lib/cloudinary.ts`)**: Generates optimized format/quality negotiation (`f_auto,q_auto`), crop/gravity modes, and ultra-lightweight base64 LQIP blur strings for zero-CLS loading.
  - **Accessible Image Primitive (`src/components/ui/PortfolioImage.tsx`)**: Enforces non-empty `alt` strings (WCAG 2.2 AA), automatic blur placeholder transitions, pulse skeleton loaders, error fallback handling, and semantic `<figure>`/`<figcaption>` structures.
  - **Dynamic Social Cards (`app/api/og/route.tsx`)**: Edge/Next `ImageResponse` generating 1200×630px branded SVG cards with typography, category badges, and dynamic project metadata.
  - **Programmatic Discovery Engine (`app/sitemap.ts`, `app/robots.ts`, `app/feed.xml/route.ts`)**: Dynamic XML sitemap indexing published projects, crawler robots with admin disallow rules, and valid RSS 2.0 feed for news aggregators.
  - **Schema.org Structured Data (`src/lib/json-ld.tsx`)**: Comprehensive `Person`, `WebSite`, `ProfilePage`, and `CreativeWork` schemas enabling rich snippets.
- **Rationale**: Maximizes SEO discoverability, page speed, social share aesthetics, and accessibility while guaranteeing zero layout shift.

### ADR-011: Authentication Architecture — Hardened Custom HMAC-SHA256 Session (Phase A Stabilization)
- **Date**: 2026-09-25
- **Decision**: Adopt Option 2 (Keep, harden, and own the custom HMAC-SHA256 session engine in `src/lib/auth.ts`) rather than pulling in external auth frameworks like Auth.js/NextAuth:
  - **Single-Admin Context**: The application is a single-administrator portfolio with credentials validated against `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (bcrypt). There is no multi-tenancy, OAuth, or public user registration.
  - **Zero Dependency & Edge Compatibility**: Implemented with standard Node `crypto` using HMAC-SHA256 signatures, avoiding version churn, breaking changes across Next.js canary/major updates, or peer dependency conflicts.
  - **Strict Cryptographic Guarantees**:
    - `AUTH_SECRET` length strictly enforced to ≥ 32 characters via Zod in `src/lib/env.ts`.
    - Tamper detection: any payload or signature modification immediately fails validation and destroys the cookie.
    - Expiration enforcement: sessions expire after a strict 7-day lifetime.
    - HttpOnly, SameSite=Lax, Secure cookie attributes prevent XSS and CSRF token interception.
    - Defense-in-depth: every admin server action, route handler, and layout calls `requireAdmin()`.
  - **Verification**: Unit tests in `tests/unit/admin-auth.test.ts` and `tests/unit/admin.test.tsx` thoroughly prove token tampering, expiration, and unauthorized access rejection.
- **Rationale**: Eliminates bloated dependencies while providing higher security guarantees and predictable, transparent code maintenance.

### ADR-012: Meme Reaction Engine & Appearance System (Phase B)
- **Date**: 2026-09-25
- **Decision**: Implemented an appearance management system supporting 4 contrast-verified themes and 6 reactive meme states (`waiting`, `sending`, `success`, `error`, `notFound`, `loading`):
  - Zero-broken-link architecture: Default SVG vector data URIs embedded in `src/features/appearance/data.ts` ensure rich visual presentation prior to custom media upload.
  - Motion control: Built `MemeState.tsx` component with a 3-loop ceiling (`maxLoops = 3`) that gracefully rests on poster/still and respects `prefers-reduced-motion: reduce`.
  - Admin controls: Built full Appearance & Theme CMS in `/admin/appearance` for administrators to select first-paint default themes and upload reactive memes with mandatory accessibility `alt` text.
- **Rationale**: Replaces dry loading/error states with memorable brand reactions while preserving 100% WCAG 2.2 AA accessibility and loop limits.

### ADR-013: Identity Text-Mask Photo Reveal & Duotone Ambient Backdrop (Phase C)
- **Date**: 2026-09-25
- **Decision**: Implemented a disciplined identity presentation system:
  - Signature Hero Effect: Interactive text-mask photo reveal (`.identity-mask`) using `-webkit-background-clip: text` on the headline with hover and touch-entrance scroll triggers.
  - Subtle Duotone Backdrop (`DuotoneBackdrop.tsx`): Cloudinary `e_grayscale,e_tint:60:<accent>` transformation applied at request time behind the About page with subtle GSAP `ScrollTrigger.scrub` transform scaling (1.0 → 1.06) and solid `--surface` content containers to guarantee $\ge 4.5:1$ text contrast.
  - Admin Photo Manager: Integrated photo management tab into `/admin/profile` with mandatory accessibility alt text verification.
- **Rationale**: Delivers human identity and craft in exactly one bold hero moment and one quiet background layer, strictly avoiding scattered avatars across the public shell.

### ADR-014: Automated Testing Architecture & Playwright E2E Verification (Phase D)
- **Date**: 2026-09-25
- **Decision**: Built comprehensive 2-tier testing pyramid:
  - Unit & Integration Testing (Vitest): 17 test suites covering Zod schemas, server queries with offline fallbacks, rate limiting, HMAC session security, server actions, and motion components.
  - End-to-End Testing (Playwright + `@axe-core/playwright`): Automated test specs verifying public navigation, 4-theme switching & persistence, viewport responsiveness (360px–1920px), `prefers-reduced-motion: reduce` compliance, contact validation & honeypot spam containment, admin route protection, and WCAG 2.2 AA audits.
- **Rationale**: Guarantees zero regressions, strict compliance with `AGENTS.md`, and deterministic deployment confidence.

### ADR-015: Test Suite Integrity, CI MongoDB Service & Loud Database Failure (Phase J)
- **Date**: 2026-09-25
- **Decision**: Harden test and continuous integration infrastructure to guarantee test integrity (addressing Findings J1–J5):
  - **Live CI MongoDB Service (J1 / `.github/workflows/ci.yml`)**: Added `mongo:7` service container with container health probes in CI workflow; execute `pnpm run seed` before E2E testing to populate baseline data; added `/api/health` health-check route verifying real Mongo connectivity.
  - **Comprehensive Admin CRUD E2E Roundtrips (J2, J4 / `tests/e2e/admin-crud.spec.ts`)**: Replaced 15-line placeholder with real round-trip tests covering Project creation/publishing/deletion, Profile bio/resume updates reflected publicly, Experience additions and removals, Testimonial creation/publishing/homepage appearance/unpublishing, Meme reaction customization/reset, and Identity Photo management. All tests enforce teardown cleanup.
  - **Decoupled Test Credentials (J2 / `src/lib/env.ts`)**: Introduced `TEST_ADMIN_PASSWORD` in CI environment and schema defaults matching standard bcrypt cost-10 hash `ADMIN_PASSWORD_HASH`, eliminating hardcoded secrets while enabling isolated test automation.
  - **Direct Server Action & API Route Protection (J3, J4 / `tests/unit/actions.test.ts`, `tests/e2e/auth.spec.ts`)**: Added integration tests directly calling Server Actions without session context across all feature domains (Projects, Profile, Photos, Experience, Testimonials, Appearance/Settings, Contact) asserting unauthorized rejection; added Playwright direct API check rejecting unauthenticated `/api/admin/cloudinary-sign`. Added `/admin/testimonials` to `protectedAdminRoutes`.
  - **Loud Database Failure for Testimonials (J5 / `src/features/testimonials/queries.ts`)**: Removed silent try/catch fallback to empty array from `getTestimonials`. If MongoDB is offline, `getTestimonials` throws an error, failing loudly and preventing false-green CI runs.
- **Rationale**: Eliminates false positives, ensures every mutation is verified against real document storage, and fulfills the core directive of `AGENTS.md` §14.3.

### ADR-016: Charcoal as Default Dark Theme & Comprehensive Deployment Guide
- **Date**: 2026-09-25
- **Decision**: 
  - Standardized **Night Coder (Charcoal)** (`#151517` canvas, `#1c1c1f` surface, `#232326` secondary surface, `#ecebe9` ink, `#8aa2ff` accent) as the primary dark theme specification in `tokens.css`, `ThemeSwitcher.tsx`, `AppearanceManager.tsx`, and `app/colophon/page.tsx`.
  - Maintained complete backward compatibility for `night-coder-charcoal` aliases.
  - Published comprehensive production deployment documentation (`docs/DEPLOYMENT.md`) and enriched `.env.example` detailing configuration parameters, key generation scripts, and verification checklists across Vercel, Docker, and Cloud platforms.
- **Rationale**: Elevates visual warmth and contrast fidelity across OLED displays while providing crystal-clear DevOps workflows.





