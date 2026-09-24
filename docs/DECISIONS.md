# Dev Den — Architecture & Technical Decisions Log

This document records key design and engineering decisions, package justifications, and architectural deviations in accordance with `AGENTS.md` §2 and §5.

---

## Decision Log

### ADR-001: Dependency Justification (Phase 0)

- **Date**: 2026-09-24
- **Decision**: Install pinned production and dev dependencies:
  - `zod`: Single source of truth for runtime validation on client, server, and DB boundary.
  - `mongodb`: Official MongoDB driver for serverless database connection with cached client.
  - `bcryptjs`: Secure hashing and comparison for admin password authentication.
  - `resend`: Official client for contact form email notifications and auto-replies.
  - `cloudinary`: Signed media uploads and optimized asset delivery for project cases and memes.
  - `lucide-react`: Lightweight, accessible, and tree-shakeable icons for UI controls.
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
