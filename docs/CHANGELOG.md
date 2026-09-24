# Dev Den — Changelog

All notable changes across phases will be documented in this file.
Format based on Keep a Changelog.

---

## [Unreleased] - Phase 0: Foundation & Quality Gates (2026-09-24)

### Added

- Phase 0 foundation setup with TypeScript strict mode, `noUncheckedIndexedAccess`, and path aliases (`@/*`).
- Core dependencies: `zod`, `mongodb`, `bcryptjs`, `resend`, `cloudinary`, `lucide-react`.
- Testing infrastructure: `vitest`, `@testing-library/react`, `jsdom`, `playwright`, `@axe-core/playwright`.
- Linting and formatting: Prettier configuration, strict ESLint.
- Configuration and quality gates: GitHub Actions CI workflow, Vitest config, Playwright config, `components.json`.
- Environment variable schema validator `src/lib/env.ts` and template `.env.example`.
- Comprehensive documentation: `docs/DESIGN.md`, `docs/DECISIONS.md`, `docs/CHANGELOG.md`, `docs/RUNBOOK.md`.
- App title, metadata, and OpenGraph configuration in `metadata.json` and root layout.
