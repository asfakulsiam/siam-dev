# Dev Den — Operational Runbook & Production Guide

Operational reference for deployment, database maintenance, credentials rotation, and disaster recovery. For the complete end-to-end setup and provider provisioning walkthrough, see [`DEPLOYMENT.md`](/DEPLOYMENT.md).

---

## 1. Quick Reference & Commands

- `npm run dev`: Start local development server on port 3000.
- `npm run lint`: Run ESLint checks across entire codebase.
- `npm run typecheck`: Run strict TypeScript compiler verification without emitting files.
- `npm run test`: Run unit and component test suites with Vitest (69 tests).
- `npm run test:e2e`: Run full Playwright test suite against production build.
- `npm run seed`: Idempotently initialize database indexes and upsert baseline projects, profile, and experience.
- `npm run export-content`: Generate a complete JSON snapshot of all live or static content.
- `npm run build`: Compile production Next.js build.
- `npm run format`: Check formatting with Prettier.

---

## 2. Secrets & Environment Variables Rotation

1. **Generate Secrets**:
   - `AUTH_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `IP_HASH_SALT`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. **Generate Bcrypt Admin Password**:
   - `ADMIN_PASSWORD_HASH`: `node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('NEW_PASSWORD', 12));"`
3. **Update Hosting Environment**:
   - Update secrets in Vercel / Cloud Run / hosting settings.
   - Redeploy the application. Rotating `AUTH_SECRET` immediately invalidates all prior sessions.

---

## 3. Database Operations & Backups

- **Atlas Region**: Maintain MongoDB Atlas cluster in Singapore (`sin1`) or nearest datacenter for low latency.
- **Content Export (Backup)**: Run `npm run export-content` periodically to create an offline JSON content snapshot.
- **Content Seeding / Restore**: Run `npm run seed` to idempotently restore base content without dropping collections.
- **Zero-Downtime Fallback**: If MongoDB connection is interrupted, the application automatically serves static datasets (`src/features/*/data.ts`), ensuring 100% uptime.

---

## 4. Cloudinary Signed Asset Uploads

- Cover photo and case study asset uploads are signed server-side via `app/api/admin/cloudinary-sign/route.ts`.
- The endpoint enforces `requireAdmin()` so only authenticated admin sessions can request upload signatures.
- Raw Cloudinary API Secret is strictly server-side and never exposed to the client.

---

## 5. Contact Form Spam & Security

- **Rate Limiting**: 3 submissions per hour per salted IP hash (`IP_HASH_SALT`).
- **Honeypot Protection**: Submissions with non-empty hidden `website` honeypot fields are silently discarded.
- **Database First**: Submissions are stored in MongoDB `contact_messages` collection before dispatching optional Resend notification emails.
