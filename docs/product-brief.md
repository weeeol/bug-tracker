# Product Brief

## Problem

Teams need a simple shared system to capture defects, clarify ownership, and reliably see what remains unresolved without relying on chat messages or spreadsheets.

## Initial product

The first release is a multi-tenant bug tracker. A signed-in user belongs to one or more organizations. Within an organization, they can work with projects and issues.

### Roles

| Role | Capabilities |
| --- | --- |
| Owner | Full organization administration, including member role changes. |
| Member | Create, view, update, comment on, and manage issues in organizations they belong to. |

### Core workflows

1. A visitor signs up or signs in.
2. A new user creates an organization and becomes its owner.
3. A member creates a project and reports an issue with title, description, priority, and status.
4. A member filters the project issue list, opens an issue, changes status/assignee, and adds comments.
5. A member sees only data belonging to organizations of which they are a member.

## Initial boundaries

Included: email/password authentication, organizations, memberships, projects, issues, comments, filtering, audit-ready timestamps, and responsive accessible UI.

Deferred: file attachments, email notifications, public issue intake, external integrations, granular custom permissions, billing, analytics, and real-time collaboration. The schema should leave room for these without implementing them now.

## Decisions requiring user input before implementation

- The preferred product name and visual identity.
- Whether self-service organization invitations are needed in the first release.
- Exact deployment target and Supabase project/environment naming.
