# UI design

## Route and component inventory

The shared `ThemeProvider` and tokenized `globals.css` apply to every
user-facing surface:

- `/` uses the concise product introduction in `app/page.tsx` and the
  public-only `SiteHeader`.
- `/auth/sign-in`, `/auth/sign-up`, `/auth/check-email`, and `/auth/error`
  use the same form controls, feedback colors, borders, and theme variables.
- `/app` provides organization selection and creation. It has the only
  authenticated surface outside an organization shell and therefore includes
  one sign-out control.
- `/app/[organizationSlug]` is the organization dashboard and status grid.
- `/app/[organizationSlug]/projects` is the project/member management view.
- `/app/[organizationSlug]/projects/[projectId]` is the filtered issue queue
  and issue creation view.
- `/app/[organizationSlug]/issues/[issueId]` is the issue detail, update, and
  comment view.
- `WorkspaceShell` owns authenticated organization navigation, mobile drawer
  behavior, project links, theme selection, and the single organization-level
  sign-out action.
- `StatePanel`, the route loading boundary, and the route error boundary
  provide shared neutral/error feedback patterns.
- Organization, project, issue, comment, sign-in, and sign-up forms use
  shared tokenized labels, controls, validation feedback, and focus rules.

## Layout

Organization routes use a persistent left workspace sidebar on wide screens.
The sidebar contains the organization context, dashboard and project links,
theme selection, and sign-out. On narrow screens it becomes an off-canvas
drawer opened by a labelled menu button; Escape and route changes close it.
The main content uses a compact, readable layout rather than decorative
dashboard panels.

The primary responsive breakpoint is Tailwind's `lg` breakpoint. Content
grids collapse to a single column below that breakpoint, while issue lists and
forms remain keyboard reachable and horizontally safe on narrow screens.
Authenticated routes use a shared top bar for the product name, theme
settings, and the single sign-out action. Organization routes add the
workspace sidebar beneath it for organization and project navigation. The
`/app` organization selector remains a compact standalone page with the same
top-bar account actions.

The dashboard uses a status-first grid: solved, in progress, and unsolved
cells precede neutral total-issue and active-project cells. Each status cell
has a text label, count, and non-color marker; filter shortcuts resolve to a
project issue queue when an active project is available.
It also includes a compact project-health grid. Each active project gets a
small linked status box whose solved, in-progress, and unsolved segments scale
proportionally to that project's real issue counts, with text counts provided
alongside the color bar.

## Theme tokens

The interface uses CSS custom properties for page, surface, border, text,
muted text, accent, success, warning, danger, and danger-surface colors.
Light is the default alternative,
dark is optimized for low-light development, and retro dev adds restrained
monospace details and a scanline texture on non-text surfaces. The retro
theme does not change content hierarchy or interaction patterns.

Theme selection is presentation-only and stored in `localStorage` under
`bug-tracker-theme`; it is never used for authorization or data access.
System light/dark preference is used when no local choice exists.

## Accessibility rules

Navigation has labelled landmarks, active-route semantics, visible keyboard
focus, and text labels for controls. Mobile navigation has an explicit open
and close control, Escape handling, and no focus trap that can strand a
keyboard user. Status and priority labels accompany color accents. Motion is
reduced through the `prefers-reduced-motion` media query.
