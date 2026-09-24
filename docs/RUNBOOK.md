# Dev Den — Operational Runbook

Operational reference for deployment, database maintenance, credentials rotation, and disaster recovery.

---

## 1. Quick Reference & Commands

- `npm run dev`: Start local development server on port 3000.
- `npm run lint`: Run ESLint checks across entire codebase.
- `npm run typecheck`: Run strict TypeScript compiler verification without emitting files.
- `npm run test`: Run unit and component test suites with Vitest.
- `npm run test:e2e`: Run full Playwright test suite against production build.
- `npm run seed`: Idempotently initialize indexes and upsert baseline projects, profile, and experience.
- `npm run export-content`: Generate a complete JSON snapshot of all live or static content.
- `npm run build`: Compile production Next.js build.
- `npm run format`: Check formatting with Prettier.

---

## 2. Secrets & Environment Variables Rotation

1. Generate high-entropy 32-character keys for `AUTH_SECRET` and `IP_HASH_SALT`.
2. Generate bcrypt hash for admin credentials using `bcrypt.hashSync(password, 12)`.
3. Update hosting provider secrets (e.g. Vercel environment settings).
4. Redeploy application to activate rotated credentials.

---

## 3. Database Operations & Backups

- **Atlas Region**: Maintain MongoDB Atlas cluster in Singapore (`sin1`) or Mumbai (`bom1`) matching hosting region for low latency.
- **Content Export**: Run `npm run export-content` (available in Phase 4) periodically to create a full JSON content snapshot.
- **Content Seeding / Restore**: Run `npm run seed` to idempotently restore base content without dropping collections.
