# Release readiness

This document records the reproducible checks and operational boundaries for
the Bug Tracker MVP. It does not deploy the application or create a hosted
Supabase project.

## Quality checks

Run these commands from `frontend/` after installing dependencies with
`npm ci`:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The Vitest suite covers issue validation, issue mutations, tenant-scoped
actions, filter parsing, navigation, and accessible comment forms. A
Playwright test is provided for the sign-in, organization, project, issue
update, comment, and filter happy path. Before running it, start the local
Supabase stack, reset it with seed data, and install the Chromium browser with
`npx playwright install chromium`. The test uses the local seeded Ada account
by default; override `E2E_EMAIL`, `E2E_PASSWORD`, and `E2E_BASE_URL` when
running against another environment. CI should run this command only when a
Supabase environment, test credentials, and browser binaries are available.

## Local database and migrations

Start Docker Desktop, then run the local Supabase workflow from `database/`:

```powershell
supabase start
supabase db reset
```

Migrations are append-only files under
`database/supabase/migrations/`. Create a new timestamped corrective migration
for a schema change; do not rewrite a migration that has been applied to a
shared environment. `supabase db reset` applies all migrations and then loads
the deterministic fake-data seed.

Run the tenant policy regression harness while the local stack is running:

```powershell
Get-Content -Raw supabase/tests/rls.sql | docker exec -i supabase_db_bug-tracker-local psql -U postgres -d postgres -v ON_ERROR_STOP=1
```

The policy harness runs inside a transaction and rolls it back.

## Environment variables

Copy `frontend/.env.example` to `frontend/.env.local` for local work. Set:

- `NEXT_PUBLIC_SUPABASE_URL`: the local or environment-specific Supabase URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the publishable/anon key
- `SUPABASE_SERVICE_ROLE_KEY`: server-only, only where a deployment owner
  explicitly requires privileged operations

Never commit `.env.local`, real credentials, or service-role values. The
publishable key is safe for browser configuration only because PostgreSQL RLS
limits its access.

## Backups and rollback

Before applying migrations to a shared Supabase environment, the deployment
owner must verify a current database backup and record the migration version.
Rollback is handled with a new forward migration that restores the intended
schema or data behavior; applied migration files must not be edited or deleted.
For destructive changes, take a verified backup and document the restore
procedure before deployment.

The local `supabase db reset` command is disposable development data reset, not
a backup or production rollback mechanism.

## Deployment prerequisites

Deployment is intentionally out of scope for this repository task. Before a
deployment owner proceeds, they must provide:

- A hosted Supabase project per environment, with database backups enabled
- A reviewed migration plan and a verified RLS policy test run
- Environment-specific URL and publishable key configuration
- Server-only secret storage for any service-role key
- A Next.js hosting target using Node.js 20 or newer
- CI evidence for lint, type-check, unit/integration tests, and build
- A browser-level smoke-test environment if Playwright coverage is required

Deferred product capabilities are tracked in
[`docs/product-brief.md`](product-brief.md); deployment, invitations,
attachments, notifications, integrations, billing, analytics, and real-time
collaboration are not silently treated as release-ready.
