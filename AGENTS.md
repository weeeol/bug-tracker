# Agent Instructions

## Scope and workflow

- Read the product and architecture documentation before changing application code.
- Keep changes within the user's requested scope and avoid drive-by refactors.
- Stop after completing a task and report: changed files, verification results, assumptions, and recommended commit message.
- Do not create a remote repository, deploy, modify Supabase cloud resources, or expose secrets unless the user explicitly asks.

## Source of truth

- Product scope: `docs/product-brief.md`
- Architecture and security decisions: `docs/architecture.md`
- Current implementation and public usage: `README.md`

If a task conflicts with these documents, pause and ask for a decision rather than silently changing the design.

## Engineering constraints

- Use TypeScript with strict type checking; do not introduce `any` to bypass types.
- Treat Supabase as the backend platform. Use PostgreSQL migrations in `database/supabase/migrations/`; never make schema-only changes through the dashboard.
- Enforce authorization in PostgreSQL Row Level Security. Client-side checks are for user experience, never the security boundary.
- Keep server-only Supabase credentials out of browser bundles. Commit `frontend/.env.example`, never `.env*` containing real secrets.
- Validate external input at boundaries and return safe, actionable errors.
- Keep the root limited to repository-level entry points and controls. Put explanatory material in `docs/`, the Next.js application in `frontend/`, and Supabase assets in `database/`.

## Verification

- Run the checks named by the active task before declaring it complete.
- Add or update tests when behavior changes.
- Do not claim a command passed unless it was run successfully; state blockers plainly.
