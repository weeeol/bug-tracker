import Link from "next/link";
import { StatePanel } from "@/components/state-panel";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function OrganizationDashboard({
  params,
}: {
  params: Promise<{ organizationSlug: string }>;
}) {
  const { organizationSlug } = await params;
  const supabase = await getServerSupabaseClient();
  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", organizationSlug)
    .maybeSingle();

  if (organizationError || !organization) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <StatePanel title="Dashboard unavailable" tone="error">
          We could not load this organization dashboard.
        </StatePanel>
      </div>
    );
  }

  const [
    { count: totalIssues, error: issueCountError },
    { count: solvedIssues, error: solvedError },
    { count: inProgressIssues, error: inProgressError },
    { count: unsolvedIssues, error: unsolvedError },
    { count: activeProjects, error: projectError },
    { data: recentIssues, error: recentError },
    { data: priorityRows, error: priorityError },
    { data: projectRows, error: projectRowsError },
  ] = await Promise.all([
    supabase
      .from("issues")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id),
    supabase
      .from("issues")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .in("status", ["resolved", "closed"]),
    supabase
      .from("issues")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("status", "in_progress"),
    supabase
      .from("issues")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("status", "open"),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .is("archived_at", null),
    supabase
      .from("issues")
      .select("id, title, status, priority, project_id, updated_at")
      .eq("organization_id", organization.id)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("issues")
      .select("priority")
      .eq("organization_id", organization.id),
    supabase
      .from("projects")
      .select("id, name, issues(status)")
      .eq("organization_id", organization.id)
      .is("archived_at", null)
      .order("name"),
  ]);

  if (
    issueCountError ||
    solvedError ||
    inProgressError ||
    unsolvedError ||
    projectError ||
    recentError ||
    priorityError ||
    projectRowsError
  ) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <StatePanel title="Dashboard data unavailable" tone="error">
          We could not load the latest issue health data. Please try again.
        </StatePanel>
      </div>
    );
  }

  const solved = solvedIssues ?? 0;
  const inProgress = inProgressIssues ?? 0;
  const unsolved = unsolvedIssues ?? 0;
  const total = totalIssues ?? 0;
  const queueProjectId = recentIssues?.[0]?.project_id;
  const queueHref = queueProjectId
    ? `/app/${organizationSlug}/projects/${queueProjectId}`
    : `/app/${organizationSlug}/projects`;
  const priorityCounts = (priorityRows ?? []).reduce<Record<string, number>>(
    (counts, issue) => {
      counts[issue.priority] = (counts[issue.priority] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const projectSummaries = (projectRows ?? []).map((project) => {
    const counts = { solved: 0, inProgress: 0, unsolved: 0 };

    for (const issue of project.issues ?? []) {
      if (issue.status === "resolved" || issue.status === "closed") {
        counts.solved += 1;
      } else if (issue.status === "in_progress") {
        counts.inProgress += 1;
      } else {
        counts.unsolved += 1;
      }
    }

    return { ...project, counts };
  });

  return (
    <div className="mx-auto max-w-[90rem] px-6 py-8 lg:px-10 lg:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="retro-detail text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Organization dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {organization.name}
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--muted)]">
            A focused view of what is resolved and what still needs attention.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={queueHref}
            className="rounded border border-[var(--line)] px-3 py-2 text-sm font-semibold hover:bg-[var(--surface-muted)]"
          >
            Inspect projects
          </Link>
          <Link
            href={`/app/${organizationSlug}/projects?status=open`}
            className="rounded bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--page)] hover:bg-[var(--accent-strong)]"
          >
            Review open issues
          </Link>
        </div>
      </header>

      <section aria-labelledby="health-heading" className="mt-8">
        <h2 id="health-heading" className="sr-only">
          Issue health
        </h2>
        <div className="grid gap-3 lg:grid-cols-12">
          <MetricCard
            label="Solved"
            value={solved}
            tone="success"
            className="lg:col-span-3"
          >
            Resolved or closed issues
          </MetricCard>
          <MetricCard
            label="In progress"
            value={inProgress}
            tone="warning"
            className="lg:col-span-3"
          >
            Issues actively being worked
          </MetricCard>
          <MetricCard
            label="Unsolved"
            value={unsolved}
            tone="danger"
            className="lg:col-span-3"
          >
            Issues still open
          </MetricCard>
          <div className="grid grid-cols-2 gap-3 lg:col-span-3">
            <MetricCard label="Total issues" value={total} compact>
              All organization issues
            </MetricCard>
            <MetricCard
              label="Active projects"
              value={activeProjects ?? 0}
              compact
            >
              Projects not archived
            </MetricCard>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section
          className="border border-[var(--line)] bg-[var(--surface)] p-5"
          aria-labelledby="recent-heading"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 id="recent-heading" className="text-lg font-bold">
              Recently updated
            </h2>
            <Link
              href={queueHref}
              className="text-sm font-semibold text-[var(--accent)] underline"
            >
              View queue
            </Link>
          </div>
          {recentIssues?.length ? (
            <ul className="mt-4 divide-y divide-[var(--line)]">
              {recentIssues.map((issue) => (
                <li
                  key={issue.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <Link
                    href={`/app/${organizationSlug}/issues/${issue.id}`}
                    className="font-semibold underline decoration-[var(--line)] underline-offset-4"
                  >
                    {issue.title}
                  </Link>
                  <span className="retro-detail text-xs text-[var(--muted)]">
                    {issue.status.replace("_", " ")} · {issue.priority}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <StatePanel title="No issues yet">
                Create a project and report the first issue to start your queue.
              </StatePanel>
            </div>
          )}
        </section>
        <section
          className="border border-[var(--line)] bg-[var(--surface)] p-5"
          aria-labelledby="shortcuts-heading"
        >
          <h2 id="shortcuts-heading" className="text-lg font-bold">
            Shortcuts
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                className="font-semibold text-[var(--accent)] underline"
                href={`/app/${organizationSlug}/projects`}
              >
                Create or manage a project
              </Link>
            </li>
            <li>
              <Link
                className="font-semibold text-[var(--accent)] underline"
                href={
                  queueProjectId
                    ? `/app/${organizationSlug}/projects/${queueProjectId}?priority=high`
                    : `/app/${organizationSlug}/projects`
                }
              >
                Review high-priority issues
              </Link>
            </li>
            <li>
              <Link
                className="font-semibold text-[var(--accent)] underline"
                href={
                  queueProjectId
                    ? `/app/${organizationSlug}/projects/${queueProjectId}?status=in_progress`
                    : `/app/${organizationSlug}/projects`
                }
              >
                See work in progress
              </Link>
            </li>
          </ul>
        </section>
      </div>
      <section
        className="mt-6 border border-[var(--line)] bg-[var(--surface)] p-5"
        aria-labelledby="priority-heading"
      >
        <h2 id="priority-heading" className="text-lg font-bold">
          Priority breakdown
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["critical", "high", "medium", "low"].map((priority) => (
            <div
              key={priority}
              className="border border-[var(--line)] bg-[var(--surface-muted)] p-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {priority}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {priorityCounts[priority] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section
        className="mt-6 border border-[var(--line)] bg-[var(--surface)] p-5"
        aria-labelledby="project-health-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="project-health-heading" className="text-lg font-bold">
              Project health
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Status distribution scales with each project&apos;s issue count.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
            <span><i aria-hidden="true" className="mr-1 inline-block h-2 w-2 bg-[var(--success)]" />Solved</span>
            <span><i aria-hidden="true" className="mr-1 inline-block h-2 w-2 bg-[var(--warning)]" />In progress</span>
            <span><i aria-hidden="true" className="mr-1 inline-block h-2 w-2 bg-[var(--danger)]" />Unsolved</span>
          </div>
        </div>
        {projectSummaries.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projectSummaries.map((project) => (
              <ProjectHealthCard
                key={project.id}
                organizationSlug={organizationSlug}
                project={project}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <StatePanel title="No active projects">
              Create a project to see its issue health here.
            </StatePanel>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  children,
  tone,
  compact = false,
  className = "",
}: {
  label: string;
  value: number;
  children: string;
  tone?: "success" | "warning" | "danger";
  compact?: boolean;
  className?: string;
}) {
  const marker =
    tone === "success"
      ? "✓"
      : tone === "warning"
        ? "→"
        : tone === "danger"
          ? "!"
          : "•";
  return (
    <article
      className={`border border-[var(--line)] border-l-4 bg-[var(--surface)] p-4 ${tone === "success" ? "border-l-[var(--success)]" : tone === "warning" ? "border-l-[var(--warning)]" : tone === "danger" ? "border-l-[var(--danger)]" : "border-l-[var(--line)]"} ${className}`}
    >
      <p
        className={`text-sm font-semibold ${tone === "success" ? "text-[var(--success)]" : tone === "warning" ? "text-[var(--warning)]" : tone === "danger" ? "text-[var(--danger)]" : "text-[var(--muted)]"}`}
      >
        <span aria-hidden="true">{marker} </span>
        {label}
      </p>
      <p
        className={`${compact ? "mt-2 text-3xl" : "mt-3 text-4xl"} font-bold tracking-tight`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">{children}</p>
    </article>
  );
}

function ProjectHealthCard({
  organizationSlug,
  project,
}: {
  organizationSlug: string;
  project: {
    id: string;
    name: string;
    counts: { solved: number; inProgress: number; unsolved: number };
  };
}) {
  const { solved, inProgress, unsolved } = project.counts;
  const total = solved + inProgress + unsolved;
  const segments = [
    { label: "Solved", count: solved, color: "var(--success)" },
    { label: "In progress", count: inProgress, color: "var(--warning)" },
    { label: "Unsolved", count: unsolved, color: "var(--danger)" },
  ];

  return (
    <Link
      href={`/app/${organizationSlug}/projects/${project.id}`}
      className="border border-[var(--line)] bg-[var(--surface-muted)] p-3 hover:border-[var(--accent)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-semibold">{project.name}</span>
        <span className="retro-detail text-xs text-[var(--muted)]">
          {total} {total === 1 ? "issue" : "issues"}
        </span>
      </div>
      <div
        aria-label={`${project.name}: ${solved} solved, ${inProgress} in progress, ${unsolved} unsolved`}
        className="mt-3 flex h-3 gap-0.5 overflow-hidden bg-[var(--line)]"
        role="img"
      >
        {total ? (
          segments.map((segment) => (
            <span
              key={segment.label}
              aria-hidden="true"
              className="min-w-[0.35rem]"
              style={{
                backgroundColor: segment.color,
                flexGrow: segment.count,
              }}
            />
          ))
        ) : (
          <span className="w-full bg-[var(--line)]" aria-hidden="true" />
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
        {segments.map((segment) => (
          <span key={segment.label}>
            {segment.label}: {segment.count}
          </span>
        ))}
      </div>
    </Link>
  );
}
