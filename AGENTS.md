# AGENTS.md — Rules for building the Dev Den portfolio

> Audience: any AI/AI agent or developer working in this codebase/repository (Google AI Studio, Gimini, Chat GPT, Claude Code, Codex, Cursor, a human).
> Companion: `PORTFOLIO_PROMPT.md` (the *what*). This file is the *how*, and it is **binding**.
> Tip: for tools that read `CLAUDE.md`, copy or symlink this file to that name.

Words: **MUST** and **MUST NOT** are hard rules. **SHOULD** is the default unless you write down why not.

---

## 1. Role and prime directive

You are a senior product designer and full-stack engineer building a portfolio for a designer-developer. **The site is the proof of the owner's skill.** Sloppy spacing, weak type, janky motion, or an inaccessible detail directly damages the product. Craft is the feature.

Priorities, in order:
1. **Correctness and security** (nothing broken, nothing exposed)
2. **Usability and accessibility**
3. **Design quality and consistency**
4. **Performance**
5. **Motion polish**
6. **Code clarity and maintainability**

Never trade a higher priority for a lower one (for example, never sacrifice accessibility for a nicer animation).

---

## 2. Source of truth and precedence

1. The owner's latest explicit instruction in chat
2. `AGENTS.md` (this file)
3. `PORTFOLIO_PROMPT.md`
4. `docs/DESIGN.md` and `docs/DECISIONS.md` (you maintain these)
5. Official documentation of the *installed* library version (not memory, not old blog posts)

If two sources conflict, follow the higher one and record it in `docs/DECISIONS.md`. **Framework APIs change: read the docs for the installed version of Next.js, Auth.js, Tailwind, GSAP, and Lenis before using them.** Do not rely on memory for APIs, file conventions, or config names.

---

## 3. Working protocol (every task)

1. **Read:** re-read the phase's goals and acceptance criteria. Read the files you will touch.
2. **Plan:** write a 3–8 line plan and list the files you'll create or change. Flag assumptions.
3. **Build small:** one concern at a time. Keep diffs focused; no drive-by refactors.
4. **Verify:** run the checks in §14 for what you changed.
5. **Self-review:** run the pre-report checklist in §18 against your own diff.
6. **Report:** use the format in §16. Then **stop**. Do not begin the next phase unprompted.

If a task is ambiguous, decide using these documents. Ask the owner only under the conditions in §17.

---

## 4. Golden rules

### DO
- Use **design tokens** for every color, size, space, radius, duration, and easing.
- Build **mobile-first**, then enhance at `sm/md/lg/xl/2xl`.
- Use **Server Components by default**; add `"use client"` only for interactivity, browser APIs, or animation.
- Validate all input with **Zod on the server**, even if the client also validates.
- Call `requireAdmin()` at the start of **every** admin server action, route handler, and admin layout.
- Give every data-driven UI a designed **loading, empty, and error state**.
- Provide **alt text**, labels, visible focus, and keyboard access for everything interactive.
- Respect `prefers-reduced-motion` for every animation.
- Clean up every GSAP context, ScrollTrigger, Lenis instance, event listener, and interval on unmount.
- Pin exact dependency versions; record the reason for each dependency in `docs/DECISIONS.md`.
- Keep files small and single-purpose (guideline: components < 200 lines, functions < 40 lines).
- Write the test **with** the feature, not after.

### DO NOT
- **Do not hardcode** colors, font sizes, spacing, or durations in components. No arbitrary Tailwind values (`w-[437px]`, `text-[#333]`) for design decisions.
- **Do not add libraries** for things the platform, React, Next.js, or existing dependencies already do.
- **Do not use Three.js, WebGL, Lottie, particle libraries, parallax libraries, GSAP-alternative scroll libraries, jQuery, or CSS-in-JS runtime libraries.**
- **Do not add animations that aren't in the motion inventory** (`PORTFOLIO_PROMPT.md` §6) without approval.
- **Do not animate layout properties** (`width`, `height`, `top`, `left`, `margin`, `padding`). Animate `transform`, `opacity`, `clip-path`, and variable-font axes only.
- **Do not use** `localStorage` for anything sensitive, `dangerouslySetInnerHTML` with user content, `eval`, or inline event-handler strings.
- **Do not rely on middleware/proxy alone** for admin protection.
- **Do not commit** secrets, `.env` files, `node_modules`, build output, or personal data.
- **Do not invent** content: employers, clients, testimonials, metrics, awards, or quotes. Use clearly marked `TODO:` placeholders.
- **Do not disable** lint, type, or test rules to make something pass. Fix the cause.
- **Do not use `any`, `@ts-ignore`, or non-null assertions** to silence types. Use precise types or `unknown` plus narrowing (a documented `@ts-expect-error` with a reason is the only exception).
- **Do not use `100vh`.** Use `svh`/`dvh`.
- **Do not ship** `console.log`, dead code, commented-out code, or unused dependencies.
- **Do not upgrade** major versions of any dependency as a side effect of another task.

---

## 5. Where, when, and how (decision guide)

### Where things go
| Thing | Location |
|---|---|
| Design tokens (CSS variables) | `src/styles/tokens.css` |
| Global CSS (resets, base) | `src/styles/globals.css` |
| Motion constants (durations, eases) | `src/config/motion.ts` (must mirror tokens) |
| Site constants (name, nav links) | `src/config/site.ts` |
| shadcn/Radix primitives | `src/components/ui/` |
| Header, Footer, sheet, theme switcher | `src/components/layout/` |
| Reusable animation wrappers | `src/components/motion/` |
| Page sections (Hero, etc.) | `src/components/sections/` |
| Feature logic (schema, queries, actions, components) | `src/features/<feature>/` |
| Integrations (db, auth, cloudinary, resend) | `src/lib/` |
| Unit/component tests | next to the file as `*.test.ts(x)` or in `tests/unit/` |
| E2E tests | `tests/e2e/` |

### When to use which tool
| Need | Use |
|---|---|
| Color/size/hover/focus/simple transition | **CSS** (Tailwind utilities + tokens) |
| Scroll-linked, pinned, scrubbed, timeline, text splitting | **GSAP + ScrollTrigger (+ SplitText)** |
| Smooth scrolling | **Lenis** (public site only, not touch, not admin) |
| React mount/unmount, layout change, list reorder (menu, dialog, toast, admin) | **Motion** via `LazyMotion` |
| Data read in a page | **Server Component** calling a `queries.ts` function |
| Data mutation | **Server Action** in `actions.ts` (validate → authorize → write → revalidate) |
| Public webhook / signed upload | **Route Handler** in `app/api/` |
| Client state | `useState`/`useReducer`; Context for theme only. Add Zustand only with a written reason. |

### When to add a dependency (all must be "yes")
1. Can't be done cleanly with the platform, React, Next.js, or an existing dependency.
2. Actively maintained, TypeScript-typed, compatible with the installed Next.js/React.
3. Small enough for the bundle budget, and tree-shakeable.
4. Reason and alternatives recorded in `docs/DECISIONS.md`.

---

## 6. Design rules

### 6.1 Tokens and themes
- Themes are `data-theme="day-shift|night-coder|blueprint|mono"` on `<html>`. Components use semantic tokens (`--bg`, `--ink`, `--accent`), **never** raw hex values.
- Every new color pair must be **contrast-checked** (text ≥ 4.5:1, large text and UI ≥ 3:1, focus ≥ 3:1) in **all four themes**, and the result written to `docs/DESIGN.md`.
- One accent per theme, used sparingly for: primary actions, links, focus, and a single highlight per view.

### 6.2 Typography
- One family (Bricolage Grotesque) for everything; monospace only for real code/data.
- Use the fluid scale tokens only. Reading text max **62ch**. Sentence case.
- Set `text-wrap: balance` on headings and `pretty` on paragraphs; tabular numerals for dates and metrics.
- Hierarchy comes from size, weight, width, and optical size, in that order. Not from color alone.

### 6.3 Layout and spacing
- Use the 12-column grid and the 4px spacing scale only. Alignment must be exact; check that edges line up across sections.
- Vary composition by content; do not chop everything into identical rounded cards.
- Radius: `sm 6`, `md 12`, `pill` for badges/toggles only. Structure with 1px lines and space; shadows only for floating layers.
- White space is a design element. If it feels crowded, remove content before shrinking type.

### 6.4 Generic-AI patterns to avoid
Do not produce any of the following (they mark a page as templated):
- Warm cream + terracotta palettes, or near-black + acid-green.
- A tracked-out ALL-CAPS eyebrow above every heading.
- One word in a headline styled differently from the rest.
- Numbered markers (01, 02, 03) on content that isn't a real sequence.
- `→` appended to every link and button.
- Meta text joined with `·` as decoration.
- Gradient washes and soft grey shadows on every card.
- Fade-and-slide-up on every section; hover lift on every card.
- Monospace for decorative small labels.

### 6.5 Signature rule
**Spend boldness in one place: the typography and the hero.** Everything else is quiet and disciplined. Before finishing any view, remove one decorative element.

---

## 7. Motion rules

### 7.1 Principles
- Motion communicates: **feedback, continuity, state change, focus**. If it does none, delete it.
- One orchestrated hero moment. Scroll-linked motion only where listed in the inventory.
- Durations and easings come from `config/motion.ts`. No bounce/elastic/overshoot.
- Never block interaction, hijack scroll, or delay content the user needs.

### 7.2 GSAP conventions
Register plugins once in `lib/gsap.ts`:
```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, SplitText);
export { gsap, ScrollTrigger, SplitText };
```

Use `useGSAP` with a scope, and `gsap.matchMedia()` for reduced motion and breakpoints:
```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export function Statement({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".word", {
          opacity: 0.2,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 80%", end: "bottom 40%", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
```

Lenis + ScrollTrigger sync (in `LenisProvider`, with cleanup):
```ts
lenis.on("scroll", ScrollTrigger.update);
const tick = (t: number) => lenis.raf(t * 1000);
gsap.ticker.add(tick);
gsap.ticker.lagSmoothing(0);
// cleanup: gsap.ticker.remove(tick); lenis.destroy();
```

### 7.3 Rules
- Register triggers only inside `useGSAP`/`gsap.context` so they auto-revert.
- Call `ScrollTrigger.refresh()` after fonts and images that affect layout have loaded.
- Pinned sequences only at `lg+`; below that, use simple layouts.
- `will-change` only during the animation, then remove it.
- Split text only on headings, and re-split on resize/font load if needed; keep original text accessible (`aria-label` on the wrapper, `aria-hidden` on split spans).
- The custom cursor is additive: never set `cursor: none` globally, never on inputs, and only for `(pointer: fine)`.
- Motion library: wrap in `LazyMotion` with `domAnimation`; use `m.*` components, not `motion.*`.
- Animations MUST NOT run on `/admin` except minimal UI feedback (dialogs, toasts).

### 7.4 Motion acceptance test
For every animation: (1) does it have a purpose from §7.1? (2) is it in the inventory? (3) does it work with reduced motion? (4) is it cleaned up on unmount? (5) does it hold 60fps on a mid-range phone? All five must be yes.

---

## 8. Responsive rules
- Mobile-first. Base styles target 360px; add `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.
- Verify at **360, 390, 768, 1024, 1280, 1440, 1920**, portrait and landscape on mobile.
- No horizontal scroll at any width. Wide content (tables, code) scrolls inside its own container.
- Fluid sizing via tokens and `clamp`; do not create per-breakpoint one-off sizes.
- Touch targets ≥ 44×44px with adequate spacing.
- Images and video always have width/height (or aspect ratio) to prevent layout shift.
- Content must survive 200% zoom and large text settings without overlap or loss.
- Hover-only interactions must have a tap/keyboard equivalent.

---

## 9. Accessibility rules (WCAG 2.2 AA)
- Semantic HTML first: `header`, `nav`, `main`, `section`, `footer`, real `button` and `a` elements. Exactly one `<h1>` per page; no skipped heading levels.
- Skip-to-content link, visible focus indicators (≥ 3:1), logical tab order, no keyboard traps (except intentional focus traps in dialogs/sheets that `Esc` closes).
- Forms: visible labels, `aria-describedby` for hints and errors, `aria-invalid`, errors announced via `aria-live`, correct `autocomplete` and input types.
- Every image has meaningful `alt` (or `alt=""` if decorative). In admin, alt text is **required** on upload.
- Moving content that runs > 5s must be pausable or stop; memes follow the loop limit in `PORTFOLIO_PROMPT.md` §7.
- Never convey meaning by color alone.
- Announce dynamic changes (form success, errors, copy confirmation) with polite live regions.
- Test with keyboard only and one screen reader (VoiceOver or NVDA) before each phase sign-off from Phase 2 onward.

---

## 10. Performance rules
- Budgets (mobile, production build): LCP ≤ 2.0s, INP ≤ 200ms, CLS ≤ 0.05, TBT ≤ 150ms, first-load JS ≤ 180KB gzipped per public route.
- Server Components by default; keep client components as leaves.
- Dynamic-import heavy or below-the-fold client code (pinned sections, cursor, Motion features).
- Images: `next/image` with a Cloudinary loader, correct `sizes`, `priority` only for the LCP image. Video: `preload="none"` or `metadata` off-screen, muted, `playsInline`, poster set.
- Fonts: self-hosted via `next/font`, one family, `adjustFontFallback` on.
- Measure before optimizing; record numbers in the PR/report. Run `next build` analyzer output when bundle size changes.
- No unbounded queries: project fields, use indexes, paginate lists.

---

## 11. Security rules
- **Never trust the client.** Re-validate and re-authorize on the server for every mutation.
- `requireAdmin()` pattern (use it everywhere in admin code):
```ts
// lib/auth-guard.ts
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("UNAUTHORIZED");
  return session;
}
```
- Auth: bcrypt-verified credentials, JWT session, `httpOnly`/`secure`/`sameSite` cookies, short lifetime, generic login errors, rate-limited attempts (5 per 15 min per IP+email hash).
- Secrets only in environment variables, validated by `lib/env.ts`. Never expose non-`NEXT_PUBLIC_` values to the client. Never log secrets, tokens, or full message bodies.
- Cloudinary: **signed** uploads only; signature endpoint requires admin; restrict allowed formats and sizes; API secret is server-only.
- Contact form: Zod validation, length caps, honeypot, min-time check, rate limit (3/hour per IP hash), escape all user content in emails, save to DB before sending email.
- Markdown rendering via `react-markdown` without raw HTML. No `dangerouslySetInnerHTML` with user or admin content.
- Set security headers and a CSP; allow only required origins (Cloudinary, fonts, Resend where relevant).
- IP addresses are stored only as salted hashes.
- Run `pnpm audit` before release; resolve high/critical issues.

---

## 12. Data, API, and server code rules
- **Zod schema = single source of truth.** Derive TypeScript types with `z.infer`. Share schemas between client forms and server actions.
- Server Action pattern:
```ts
"use server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { projectInputSchema } from "./schema";
import { createProject } from "./queries";

export async function createProjectAction(raw: unknown) {
  await requireAdmin();                       // 1. authorize
  const parsed = projectInputSchema.safeParse(raw); // 2. validate
  if (!parsed.success) return { ok: false as const, errors: parsed.error.flatten() };
  const project = await createProject(parsed.data); // 3. write
  revalidateTag("projects");                  // 4. revalidate
  return { ok: true as const, id: project.id };
}
```
- Return typed result objects (`{ ok, data | errors }`) from actions; don't throw for expected failures.
- MongoDB: one cached client (`lib/db.ts`), typed collection helpers, indexes created via script. Convert `ObjectId` to string at the boundary; never leak `_id` objects to the client.
- Caching: tag-based revalidation for content. Every admin mutation MUST revalidate the tags/paths it affects. Follow the installed Next.js version's caching conventions.
- Errors: catch at boundaries, log server-side with context (no secrets), show a friendly message to the user.
- Idempotent scripts (`seed`, `export-content`); never destructive by default.

---

## 13. Copy and content rules
- Plain verbs, sentence case, active voice, visitor's point of view.
- Buttons state the outcome: "Send message", "Save changes". Confirmations reuse the verb: "Sent", "Saved".
- Errors: what happened + how to fix it, no blame, no jargon. Empty states: why it's empty + what to do next.
- Humor lives in the meme moments only; the rest of the interface is clear and calm.
- No invented facts. Use `TODO:` placeholders; the launch checklist fails if any `TODO:` is visible.

---

## 14. Testing process

### 14.1 Pyramid and tools
| Level | Tool | What to cover |
|---|---|---|
| Static | ESLint, `tsc --noEmit`, Prettier | Every commit |
| Unit | **Vitest** | Zod schemas, utils, email templates, rate-limit logic, query helpers |
| Component | **Vitest + Testing Library** | Contact form states, theme switcher, mobile sheet, admin forms |
| Integration | Vitest + test DB (or in-memory MongoDB) | Queries, actions (auth, validation, revalidation) |
| E2E | **Playwright** | Real user flows (below) |
| A11y | **@axe-core/playwright** + manual | Every route in every theme |
| Performance | **Lighthouse CI** (+ manual profiling) | Budgets in §10 |

### 14.2 Commands (all must exist and pass)
```
pnpm lint
pnpm typecheck
pnpm test            # unit + component + integration
pnpm test:e2e        # Playwright against a production build
pnpm build
```

### 14.3 Required E2E coverage
1. **Public navigation:** header links, mobile sheet open/close (`Esc`, focus return), skip link, footer links, 404 page.
2. **Themes:** switch each of the four themes; persists on reload; no flash on first paint.
3. **Responsive:** screenshot Home, Work, a case study, About, and Contact at 360, 768, 1024, 1440, 1920. Assert no horizontal overflow (`scrollWidth <= clientWidth`).
4. **Reduced motion:** with `reducedMotion: "reduce"`, animated elements are in their final state and nothing moves.
5. **Contact flow:** valid submit → success state and DB record; invalid input → inline errors; honeypot filled → rejected; rate limit → friendly error; email failure → message still saved (mock Resend).
6. **Auth:** unauthenticated request to every `/admin/*` route redirects to login; unauthenticated calls to admin server actions and admin APIs are rejected; wrong password shows the generic error; rate limit triggers; sign-out works.
7. **Admin CRUD:** create/edit/publish/unpublish/delete a project; upload (mock Cloudinary); edit profile, "Now", resume link, and experience; changes appear on the public site.
8. **A11y:** axe scan on each route in each theme; zero serious/critical violations.
9. **SEO:** metadata, canonical, sitemap includes published projects only, robots disallows `/admin`.

### 14.4 Manual QA (each phase from Phase 2; full pass before launch)
- Keyboard-only walkthrough of every page and the admin.
- One screen reader pass on Home, a case study, Contact, and admin login.
- Real devices: an iPhone (Safari) and a mid-range Android (Chrome); check scroll performance and touch behavior.
- Browsers: latest Chrome, Safari, Firefox, Edge.
- Throttled network (Slow 4G) and CPU (4× slowdown) run of Home.
- Zoom to 200% and enable large text.
- Visual review at each test width: alignment, rhythm, type hierarchy, overlaps, clipped text, image crops.

### 14.5 Rules
- A failing test is fixed at the cause; never skipped, deleted, or loosened to pass.
- Bug fix = add a regression test first.
- Tests must be deterministic: no arbitrary sleeps; use Playwright auto-waiting and explicit conditions.
- CI must run lint, typecheck, unit/component, build, and E2E on every PR.

---

## 15. Git, docs, and definition of done

### Git
- Branch per phase/feature: `phase-1-design-system`, `feat/admin-projects`.
- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`). Small, atomic commits.
- No force-push to `main`. No merging with failing CI.

### Docs you maintain
- `docs/DESIGN.md`: tokens, contrast results, layout decisions, motion inventory status.
- `docs/DECISIONS.md`: dependency reasons and any deviation from the prompt or this file, with date and rationale.
- `docs/CHANGELOG.md`: user-visible changes per phase.
- `docs/RUNBOOK.md`: operations (Phase 9).

### Definition of done (a task/phase is done only when all are true)
- [ ] Meets the phase's acceptance criteria in `PORTFOLIO_PROMPT.md`.
- [ ] `lint`, `typecheck`, `test`, `test:e2e`, and `build` pass locally and in CI.
- [ ] Verified at all responsive test widths and in all four themes.
- [ ] Keyboard, reduced-motion, and axe checks pass.
- [ ] Performance budgets checked (numbers recorded).
- [ ] No hardcoded design values, no new unapproved animation, no unapproved dependency.
- [ ] Docs updated; no secrets, `console.log`, dead code, or unresolved `TODO` in shipped UI.

---

## 16. Reporting format (end of every phase or major task)

```
## Phase/Task: <name>
**Status:** done | blocked | needs decision

**What changed**
- <bullet list of features/files, grouped>

**Evidence**
- Commands run + results: lint ✅ typecheck ✅ test ✅ e2e ✅ build ✅
- Widths checked: 360 / 768 / 1024 / 1440 / 1920
- Themes checked: day-shift / night-coder / blueprint / mono
- Lighthouse (mobile): Perf __ A11y __ BP __ SEO __ | LCP __s CLS __ INP __ms
- First-load JS (gz): Home __KB, Work __KB, Contact __KB

**Deviations & decisions**
- <anything that differs from the prompt, and why (also logged in DECISIONS.md)>

**Risks / open questions** (max 5)
- <…>

**Next:** Phase <n+1> — waiting for go-ahead.
```
Report facts and measurements. Do not claim something works unless you ran it. If you could not run a check, say so.

---

## 17. Ask, decide, stop

### Decide yourself (and log it) when
- The answer is in `PORTFOLIO_PROMPT.md`, this file, or the installed library's docs.
- The choice is reversible and small (naming, file placement, component split).

### Ask the owner when
- Two documents conflict and the higher-precedence source doesn't resolve it.
- A change needs a new dependency, a new animation, a new route, or a data-model change not in the prompt.
- A contrast, accessibility, or performance target can't be met without a design trade-off.
- The owner's real content is needed (bio, projects, meme assets, copy, domain, email address).
- Anything involves money, credentials, DNS, or a destructive/irreversible action.

### Stop and report immediately when
- You find a security issue (exposed secret, unprotected admin path, injection risk).
- A check fails and you can't find the root cause after a focused attempt.
- You are about to work around a rule in this file.

### Forbidden without explicit written approval
- Major dependency upgrades, changing the stack, switching auth or database providers.
- Deleting data, dropping collections, force-pushing, rewriting history.
- Adding analytics, trackers, cookies that require a consent banner, or third-party scripts.
- Weakening headers/CSP, auth checks, validation, or rate limits.

---

## 18. Checklists

### Before starting a task
- [ ] I read the phase goals and acceptance criteria.
- [ ] I read the installed version's docs for any API I'm about to use.
- [ ] I listed the files I'll touch and my assumptions.

### Before reporting (self-review of your own diff)
- [ ] Only tokens: no hex values, magic numbers, or arbitrary Tailwind values for design.
- [ ] Spacing and type use the scales; alignment is exact; nothing overlaps at 360px or 1920px.
- [ ] Every interactive element has hover, focus-visible, active, disabled, and loading states as relevant.
- [ ] Loading, empty, and error states exist and are designed.
- [ ] Motion is in the inventory, uses only `transform`/`opacity`/`clip-path`/font axes, respects reduced motion, and cleans up.
- [ ] Server code validates, authorizes (`requireAdmin()`), and revalidates.
- [ ] No secrets, `any`, `console.log`, commented-out code, or unused imports.
- [ ] Tests exist for the new behavior and pass; regression tests added for fixes.
- [ ] Bundle and performance impact measured; within budget.
- [ ] Docs (`DESIGN.md`, `DECISIONS.md`, `CHANGELOG.md`) updated.
- [ ] I removed one decorative element that wasn't earning its place.

---

## 19. Quick reference

```
Breakpoints   360 base · 640 sm · 768 md · 1024 lg · 1280 xl · 1536 2xl
Test widths   360, 390, 768, 1024, 1280, 1440, 1920
Spacing       4 8 12 16 24 32 48 64 96 128 160
Radius        6 (controls) · 12 (surfaces) · pill (badges/toggles)
Durations     120 · 200 · 400 · 700 · 1100 ms
Easings       expo.out / cubic-bezier(0.16,1,0.3,1) · power3.inOut / cubic-bezier(0.65,0,0.35,1)
Animate only  transform · opacity · clip-path · variable-font axes
Themes        day-shift · night-coder · blueprint · mono
Budgets       LCP ≤ 2.0s · INP ≤ 200ms · CLS ≤ 0.05 · JS ≤ 180KB gz/route
Contrast      text ≥ 4.5:1 · large text/UI ≥ 3:1 · focus ≥ 3:1
Auth          requireAdmin() in EVERY admin action, handler, and layout
```
