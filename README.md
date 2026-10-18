# Bug Tracker

A production-minded web application for reporting, triaging, assigning, and resolving software defects.

## Status

This repository is intentionally **documentation-first**. The initial commit contains the project contract, architecture plan, and commit-sized implementation tasks; application code has not been added yet.

## Technology direction

- Web application: Next.js, TypeScript, and Tailwind CSS
- Backend/data platform: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Row Level Security, Storage, and Edge Functions only where needed)
- Validation: Zod
- Testing: Vitest, React Testing Library, and Playwright

The stack is a planned baseline, not installed dependencies. See [the architecture brief](docs/architecture.md) and [task index](docs/tasks/README.md).

## Planned repository layout

Only project entry points stay at the root. Implementation code and operational material will live in focused directories:

```text
app/                 # Next.js routes and route-specific UI
components/          # Shared UI components
lib/                 # Framework-agnostic client/server utilities
supabase/            # Migrations, seed data, and Supabase configuration
tests/               # End-to-end and integration tests
docs/                # Architecture, decisions, and task briefs
```

## Implementation order

Start with [TASK-000 — repository foundation](docs/tasks/TASK-000-repository-foundation.md), then execute the tasks in [the master plan](docs/tasks/MASTER-TASK.md). Each task is designed to be reviewed and committed independently.

## License

MIT — see [LICENSE](LICENSE).
