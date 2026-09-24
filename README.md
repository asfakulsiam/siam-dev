# Dev Den — Production Portfolio & CMS for Designer-Developers

> A high-craft, performance-obsessed personal portfolio and headless CMS built for hybrid product designers and full-stack engineers. Engineered with Next.js App Router, Tailwind CSS v4, GSAP, Lenis, MongoDB, and Cloudinary.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.x-88ce02?style=flat-square&logo=greensock)](https://gsap.com/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-success?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tests](https://img.shields.io/badge/Tests-12_Files_%2F_69_Passing-brightgreen?style=flat-square)](https://vitest.dev/)

---

## 🌟 Highlights & Philosophy

Dev Den is designed around the premise that **the portfolio is the ultimate proof of craft**. Every interaction, spacing choice, typographic scale, and animation reflects obsessive attention to detail, accessibility, and architectural rigor.

- **Zero-Pill, Anti-Slop Design System**: 4 contrast-audited themes (*Day Shift*, *Night Coder*, *Blueprint*, *Mono*) built with strict semantic CSS tokens, 12-column responsive grid, and fluid typography.
- **Bespoke Motion Inventory**: Bricolage Grotesque variable font axis animation on hero load, pinned card stacks on desktop, word-by-word scrubbed philosophy statement, and smooth scroll synchronization via Lenis + GSAP ticker.
- **Full-Featured Admin CMS**: Password-authenticated administrative dashboard (`/admin`) for managing case studies, profile bio, "Now" focus pillars, experience timeline, and inbound message inquiries.
- **Zero-Downtime Database Resilience**: MongoDB Atlas integration with automatic fallback to static datasets during maintenance or local testing.
- **Enterprise Media Pipeline**: Cloudinary CDN optimization with automatic format/quality (`f_auto,q_auto`), ultra-lightweight blur placeholders (`e_blur:1000`), and server-signed uploads.
- **Modern SEO & LLM Indexing**: Dynamic XML sitemaps, search engine crawl rules (`robots.txt`), Schema.org JSON-LD structured data (`Person`, `WebSite`, `Article`), dynamic Edge OpenGraph card generation (`next/og`), and `/llms.txt` context.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 15+](https://nextjs.org/) | App Router, Server Components by default, Server Actions |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict mode, zero `any`, strict null checks |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Native CSS variables, `@theme` directives, fluid clamp scales |
| **Motion** | [GSAP 3](https://gsap.com/) & [Motion](https://motion.dev/) | ScrollTrigger, SplitText, `LazyMotion` page transitions |
| **Smooth Scroll** | [@studio-freight/lenis](https://lenis.darkroom.engineering/) | Momentum scrolling synchronized with GSAP ticker |
| **Typography** | `next/font/google` | Bricolage Grotesque (Variable) & Geist Mono |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Native Node.js driver with connection pooling and static fallback |
| **Media CDN** | [Cloudinary](https://cloudinary.com/) | Server-signed direct uploads, blur placeholders, responsive srcset |
| **Validation** | [Zod](https://zod.dev/) | Unified schema layer shared between client forms & server actions |
| **Testing** | [Vitest](https://vitest.dev/) & [Playwright](https://playwright.dev/) | Unit, component, DOM integration, and E2E testing |

---

## 📁 Project Structure

```
├── app/                              # Next.js App Router
│   ├── (public)/                     # Public route group
│   │   ├── page.tsx                  # Home page (Hero, Featured Work, Craft, Now)
│   │   ├── work/                     # Work gallery & Case study pages
│   │   │   ├── page.tsx              # Filterable case study catalog
│   │   │   └── [slug]/               # Dynamic deep-dive case study template
│   │   │       ├── page.tsx
│   │   │       └── opengraph-image.tsx # Dynamic Edge OpenGraph card
│   │   ├── about/                    # Bio, timeline, and categorized toolbox
│   │   ├── contact/                  # Accessible contact form with rate limit
│   │   └── colophon/                 # Technical specs & design colophon
│   ├── admin/                        # Secure Admin CMS Dashboard
│   │   ├── login/                    # HMAC rate-limited login page
│   │   └── (dashboard)/              # Authenticated CMS shell
│   │       ├── layout.tsx            # Server-side requireAdmin() route guard
│   │       ├── page.tsx              # Analytics overview & quick actions
│   │       ├── projects/             # Case study CRUD manager & form editor
│   │       ├── profile/              # Bio, headline, availability & toolbox
│   │       ├── experience/           # Career timeline & philosophy principles
│   │       └── messages/             # Inbound inquiries inbox & status filters
│   ├── api/                          # Server-side route handlers
│   │   └── admin/cloudinary-sign/    # Signed upload signature generator
│   ├── sitemap.ts                    # Dynamic XML sitemap generator
│   ├── robots.ts                     # Crawler rules & disallow directives
│   ├── llms.txt/route.ts             # Structured AI/LLM indexing feed
│   ├── layout.tsx                    # Root layout, font loader, meta & theme script
│   └── globals.css                   # Global resets, selection & focus rings
├── src/
│   ├── components/
│   │   ├── ui/                       # Accessible UI primitives (Button, Badge, Input, etc.)
│   │   ├── layout/                   # Header, Footer, MobileSheet, ThemeSwitcher
│   │   ├── motion/                   # GSAP & Lenis motion wrappers (HeroMotion, PinnedWorkStack)
│   │   ├── sections/                 # Page section components
│   │   └── admin/                    # Admin CMS dashboard components
│   ├── config/
│   │   ├── site.ts                   # Site constants, navigation links, author details
│   │   └── motion.ts                 # Standardized animation durations and easings
│   ├── features/                     # Feature modules (Domain schemas, queries, actions)
│   │   ├── projects/                 # Projects schema, queries, mutations, seed data
│   │   ├── profile/                  # Profile schema, queries, mutations, seed data
│   │   ├── experience/               # Experience schema, queries, mutations, seed data
│   │   └── contact/                  # Contact schema, mutations, spam protection
│   ├── lib/
│   │   ├── auth.ts                   # HMAC SHA-256 session token generator/validator
│   │   ├── auth-guard.ts             # requireAdmin() server-side enforcement
│   │   ├── db.ts                     # MongoDB connection pool & static fallback
│   │   ├── cloudinary.ts             # Cloudinary URL builder & blur generator
│   │   ├── rate-limit.ts             # Salted IP hash & sliding window rate limiting
│   │   ├── jsonld.ts                 # Schema.org structured data generators
│   │   └── env.ts                    # Strict Zod environment variable parser
│   └── styles/
│       └── tokens.css                # 4-theme CSS custom properties & spacing scales
├── docs/                             # Engineering documentation
│   ├── DESIGN.md                     # Design system tokens, contrast audits & motion specs
│   ├── DECISIONS.md                  # Architectural decision records (ADRs)
│   ├── CHANGELOG.md                  # Detailed phase release history
│   └── RUNBOOK.md                    # Operational maintenance & credential rotation
├── scripts/
│   ├── seed.ts                       # Database seeding & index creation CLI
│   └── export-content.ts             # JSON snapshot backup generator
├── tests/
│   ├── unit/                         # Vitest unit & component test suites (12 files, 69 tests)
│   └── setup.ts                      # Test environment configuration
└── DEPLOYMENT.md                     # Complete step-by-step production deployment guide
```

---

## 🎨 Theme & Design Token System

The interface uses semantic CSS variables mapped to `data-theme` attributes on `<html>`. Raw hex values are strictly forbidden in UI components.

| Theme | Identifier | Background | Accent | Primary Use Case |
|---|---|---|---|---|
| **Day Shift** | `day-shift` | Light Linen (`#F6F5F2`) | International Klein Blue (`#0038FF`) | Crisp editorial daytime reading |
| **Night Coder** | `night-coder` | Deep Zinc (`#0A0A0C`) | Electric Indigo (`#6366F1`) | Low-strain dark environment |
| **Blueprint** | `blueprint` | Technical Navy (`#0B1528`) | Cyber Cyan (`#00E5FF`) | Precision architectural grid |
| **Mono** | `mono` | Pure White (`#FFFFFF`) | Pitch Black (`#000000`) | High-contrast brutalist clarity |

- **Contrast Checked**: All text combinations meet or exceed WCAG 2.2 AA (≥ 4.5:1 for body copy, ≥ 3:1 for large display titles and interactive controls).
- **Zero Flash**: Injected inline `<head>` script initializes the active theme from `localStorage` or `prefers-color-scheme` before the first paint.

---

## 🚀 Quick Start & Local Development

### Prerequisites
- Node.js 20+ (LTS) or Node.js 22+
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/your-username/dev-den.git
cd dev-den
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

### 3. Generate Local Auth Secrets
```bash
# Generate AUTH_SECRET (64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate IP_HASH_SALT
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Bcrypt Password Hash for Admin Login
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_admin_password', 12));"
```
Paste these values into `.env.local`.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Gates

The codebase enforces strict quality checks across all levels of the testing pyramid:

```bash
# Run ESLint validation
npm run lint

# Run strict TypeScript compiler checks without emitting JS
npm run typecheck

# Run Vitest unit & component test suites (69 tests)
npm run test

# Run Playwright end-to-end tests against a production build
npm run test:e2e

# Compile production Next.js build
npm run build
```

---

## 🔒 Security & Privacy Architecture

- **Defense in Depth**: Every server action and route handler explicitly verifies `requireAdmin()` on the server. No client-side protection or middleware alone is trusted.
- **Tamper-Proof Sessions**: HMAC SHA-256 token hashing with expiration timestamps, bound to `httpOnly`, `sameSite=lax`, `secure` cookies.
- **Sliding-Window Rate Limiting**: Max 5 admin login attempts per 15 minutes and max 3 public contact messages per hour per salted IP hash.
- **Privacy-First IP Hashing**: Client IP addresses are salted and hashed via HMAC SHA-256 (`IP_HASH_SALT`). Raw IP addresses are never logged or stored.
- **Honeypot Bot Protection**: Hidden trap fields catch automated spam bots without requiring intrusive CAPTCHAs.
- **Signed Cloudinary Uploads**: API secrets are server-only. Client browsers only receive short-lived cryptographically signed tokens generated by authenticated admin sessions.

---

## 🚢 Production Deployment

For complete, detailed instructions on deploying to **Vercel**, **Docker**, or **Google Cloud Run**, please consult [`DEPLOYMENT.md`](./DEPLOYMENT.md).

### Quick Deployment to Vercel
1. Push repository to GitHub.
2. Import project into Vercel.
3. Add all production environment variables from `.env.example`.
4. Run database seed once deployed:
   ```bash
   npm run seed
   ```
5. Set custom domain under **Vercel Project Settings** $\to$ **Domains**.

---

## 📖 Operational Runbook

For ongoing maintenance, credentials rotation, database backups, and disaster recovery procedures, refer to [`docs/RUNBOOK.md`](./docs/RUNBOOK.md).

---

## 📄 License

MIT © [Md Asfakul Islam](https://github.com/asfakul) — Designed and engineered with precision.
