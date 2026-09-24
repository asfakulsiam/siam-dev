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
