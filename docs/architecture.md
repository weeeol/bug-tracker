# Architecture Brief

## Chosen baseline

Use a single Next.js application with TypeScript. Supabase provides managed PostgreSQL, Auth, database migrations, Row Level Security (RLS), and optional Storage/Edge Functions. This avoids a separate custom API for the first release while preserving a PostgreSQL-first data model.

## Boundaries

```text
Browser UI
  ├─ Supabase browser client: authenticated reads/writes permitted by RLS
  └─ Next.js server actions/routes: privileged or server-only operations only
       └─ Supabase server client
            └─ PostgreSQL + RLS + migrations
```

Use the Supabase publishable/anon key only in the browser. Keep the service-role key server-only and use it sparingly; it bypasses RLS.

## Data model (initial)

| Table | Purpose | Key relationships |
| --- | --- | --- |
| `profiles` | Application profile for `auth.users` | `id` references `auth.users` |
| `organizations` | Tenant boundary | created by a user |
| `organization_members` | Membership and role | organization + profile, unique pair |
| `projects` | Issue container | belongs to organization |
| `issues` | Reported defect | belongs to project; optional assignee profile |
| `issue_comments` | Issue discussion | belongs to issue and author profile |

All business tables receive UUID primary keys, `created_at`, and `updated_at`. Issue status and priority use constrained PostgreSQL enums or check constraints selected in TASK-002. The migration must add indexes for foreign keys and common list filters.

## Authorization rules

- Only authenticated users can access application tables.
- A user may read organization-scoped records only when an `organization_members` row links them to that organization.
- Members may create projects/issues/comments only within their organizations.
- Owners alone may change memberships and roles.
- An issue assignee must belong to the issue's organization; enforce this with a database trigger or equivalent transaction-safe constraint.

RLS policies must be migration-managed and accompanied by policy tests. Never rely solely on client filtering.

## Routing proposal

- `/` — public landing/sign-in entry
- `/auth/*` — authentication callbacks and error states
- `/app` — organization selection or dashboard
- `/app/[organizationSlug]/projects` — project list
- `/app/[organizationSlug]/projects/[projectId]` — issue list
- `/app/[organizationSlug]/issues/[issueId]` — issue detail

## Environment contract

Commit `.env.example` with names only:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Use separate Supabase projects for local/development, staging, and production. Do not put real values in documentation, commits, screenshots, or test fixtures.

## Operational standards

- Migrations are append-only after shared use; create a corrective migration instead of rewriting applied history.
- Use UTC timestamps and database defaults.
- Log unexpected server failures with request context excluding secrets and personal data.
- Create a seed path using fake data only.
