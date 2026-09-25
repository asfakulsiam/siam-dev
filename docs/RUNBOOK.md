# Dev Den — Operational Runbook & Production Guide

Operational reference for deployment, database maintenance, credentials rotation, and disaster recovery. For the complete architecture records, see [`DECISIONS.md`](./DECISIONS.md) and [`DESIGN.md`](./DESIGN.md).

---

## 1. Quick Reference & Commands

- `pnpm dev`: Start local development server on port 3000.
- `pnpm lint`: Run ESLint checks across entire codebase.
- `pnpm typecheck`: Run strict TypeScript compiler verification without emitting files.
- `pnpm test`: Run unit and component test suites with Vitest (17 test suites, 99 tests).
- `pnpm test:e2e`: Run full Playwright test suite against production build.
- `pnpm seed`: Idempotently initialize database indexes and upsert baseline projects, profile, experience, and appearance settings.
- `pnpm export-content`: Generate a complete point-in-time JSON snapshot of all live or static content.
- `pnpm build`: Compile production Next.js build.
- `pnpm format`: Check formatting with Prettier.

---

## 2. Secrets & Environment Variables Rotation

### Generating Cryptographic Secrets
1. **`AUTH_SECRET`** (Minimum 32 random characters):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. **`IP_HASH_SALT`** (Salt for client IP privacy hashing):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **`ADMIN_PASSWORD_HASH`** (Bcrypt hash with cost factor 12):
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YOUR_NEW_SECURE_PASSWORD', 12));"
   ```

### Rotating In Production
1. Update environment variables in your hosting dashboard (Cloud Run, Vercel, or VPS).
2. Redeploy the application. Rotating `AUTH_SECRET` immediately invalidates all existing active admin sessions without data loss.

---

## 3. Database Operations, Seeding & Zero-Downtime Resilience

- **Cluster Recommendations**: MongoDB Atlas M0 (Free Tier) or M10+ located in Singapore (`sin1`) or the closest region to your primary traffic.
- **Collections & Indexes**:
  - `projects`: Index on `{ slug: 1 }` (unique), `{ published: 1, featured: 1 }`, `{ order: 1 }`
  - `profile`: Single document collection
  - `experience`: Index on `{ order: 1 }`
  - `messages`: Index on `{ createdAt: -1 }`
  - `settings`: Single document collection for default theme and meme reactions
  - `rate_limits`: TTL index on `{ createdAt: 1 }` with `expireAfterSeconds: 3600`
- **Backups**: Run `pnpm export-content` prior to any major schema change to produce a localized JSON backup.
- **Seeding / Restore**: Run `pnpm seed` to idempotently restore base content and rebuild missing indexes without dropping collections.
- **Resilient Fallback**: If the MongoDB Atlas connection is interrupted, the application automatically serves static datasets (`src/features/*/data.ts`), ensuring 100% public uptime.

---

## 4. Cloudinary Asset Pipeline & Signed Uploads

- **Signed Uploads**: Media uploads in `/admin/projects` are signed server-side via `app/api/admin/cloudinary-sign/route.ts`.
- **Authorization**: The signature endpoint calls `requireAdmin()`, preventing unauthorized uploads.
- **Security**: The raw `CLOUDINARY_API_SECRET` is server-side only and never exposed to the client bundle.
- **Duotone Transforms**: Identity portraits and background shades automatically receive `e_grayscale,e_tint:60:<accent>` at request time via `getDuotonePhotoUrl` in `src/lib/cloudinary.ts`.

---

## 5. Contact Form Spam Protection & Email Notifications

- **Rate Limiting**: Sliding window of 3 submissions per hour per salted IP hash (`IP_HASH_SALT`).
- **Honeypot Trap**: Submissions with a filled hidden `honeypot` field are silently intercepted and accepted without sending spam emails.
- **Persistence First**: Contact submissions are always persisted into MongoDB `messages` before calling the Resend email API. If the email provider encounters an outage, messages remain safely stored in the database.

---

## 6. Pre-Launch Production Checklist

1. [ ] **Environment Variables**: Verify all production variables in `.env` match `.env.example`.
2. [ ] **Admin Credentials**: Generate a custom `ADMIN_PASSWORD_HASH` and record the plain password securely in a password manager.
3. [ ] **Database Seeding**: Run `pnpm seed` against the production MongoDB Atlas instance.
4. [ ] **Custom Domain & DNS**: Configure A/CNAME records with SSL certificate verification.
5. [ ] **SEO & Metadata**: Verify `siteConfig.url` in `src/config/site.ts` points to the final canonical domain.
6. [ ] **Testing**: Ensure `pnpm test` (99 unit tests) and `pnpm test:e2e` pass with zero errors.
7. [ ] **Accessibility**: Audit with `@axe-core/playwright` to confirm zero serious or critical WCAG 2.2 AA violations in all 4 themes.
