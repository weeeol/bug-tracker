import Link from "next/link";
import { createIssue } from "@/app/app/actions";
import { IssueForm } from "@/components/issue-form";
import { StatePanel } from "@/components/state-panel";
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/lib/issue-validation";
import { parseIssueFilters, buildIssueFilterQuery } from "@/lib/issue-filters";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ organizationSlug: string; projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { organizationSlug, projectId } = await params;
  const resolvedSearchParams = await searchParams;
  const filters = parseIssueFilters(resolvedSearchParams);
  const requestedView = Array.isArray(resolvedSearchParams.view)
    ? resolvedSearchParams.view[0]
    : resolvedSearchParams.view;
  const view = requestedView === "grid" ? "grid" : "list";
  const supabase = await getServerSupabaseClient();

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", organizationSlug)
    .maybeSingle();

  if (organizationError) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Could not load organization" tone="error">
          We could not load this organization. Please try again.
        </StatePanel>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Organization not found">
          This organization is unavailable.
        </StatePanel>
      </div>
    );
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, slug, archived_at")
    .eq("organization_id", organization.id)
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Could not load project" tone="error">
          We could not load this project. Please try again.
        </StatePanel>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Project not found">
          This project is not available in the selected organization.
        </StatePanel>
      </div>
    );
  }

  if (project.archived_at) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Project archived">
          This project is archived and cannot accept new issues.
          <div className="mt-4">
            <Link className="text-[var(--accent)] underline" href={`/app/${organizationSlug}/projects`}>
              Back to projects
            </Link>
          </div>
        </StatePanel>
      </div>
    );
  }

  const issueQuery = supabase
      .from("issues")
      .select("id, title, status, priority, updated_at, assignee_id")
      .eq("organization_id", organization.id)
      .eq("project_id", project.id)
      .order("updated_at", { ascending: false })
      .range((filters.page - 1) * 50, filters.page * 50 - 1);
  if (filters.status) issueQuery.eq("status", filters.status);
  if (filters.priority) issueQuery.eq("priority", filters.priority);
  if (filters.assigneeId) issueQuery.eq("assignee_id", filters.assigneeId);
  if (filters.search) issueQuery.ilike("title", `%${filters.search}%`);

  const [{ data: issues, error: issuesError }, { data: members, error: membersError }] =
    await Promise.all([
    issueQuery,
    supabase
      .from("organization_members")
      .select("profile_id, profiles(display_name)")
      .eq("organization_id", organization.id),
    ]);

  if (issuesError || membersError) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Could not load issues" tone="error">
          We could not load this project&apos;s issue queue. Please try again.
        </StatePanel>
      </div>
    );
  }

  const memberList = (members ?? []).map((member) => {
    const profile = Array.isArray(member.profiles)
      ? member.profiles[0]
      : member.profiles;
    return {
      profile_id: member.profile_id,
      display_name: profile?.display_name ?? member.profile_id,
    };
  });
  const buildViewHref = (nextView: "list" | "grid") => {
    const query = buildIssueFilterQuery(filters);
    query.set("view", nextView);
    return `/app/${organizationSlug}/projects/${project.id}?${query.toString()}`;
  };
  const buildPageHref = (page: number) => {
    const query = buildIssueFilterQuery({ ...filters, page });
    query.set("view", view);
    return `/app/${organizationSlug}/projects/${project.id}?${query.toString()}`;
  };
  const issueStatusClass = (status: string) => {
    if (status === "resolved" || status === "closed") {
      return "border-[var(--success)] bg-[var(--success-surface)]";
    }
    if (status === "in_progress") {
      return "border-[var(--warning)] bg-[var(--warning-surface)]";
    }
    return "border-[var(--danger)] bg-[var(--danger-surface)]";
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="retro-detail text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        {organizationSlug} / {project.slug}
      </p>
      <h1 className="mt-3 text-4xl font-bold">{project.name} issues</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-[var(--line)] bg-[var(--surface)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Issue queue</h2>
            <div className="flex items-center gap-1 rounded border border-[var(--line)] p-1 text-sm">
              <Link
                href={buildViewHref("list")}
                aria-current={view === "list" ? "page" : undefined}
                className={`rounded px-3 py-1 ${view === "list" ? "bg-[var(--surface-muted)] font-semibold" : "text-[var(--muted)]"}`}
              >
                List view
              </Link>
              <Link
                href={buildViewHref("grid")}
                aria-current={view === "grid" ? "page" : undefined}
                className={`rounded px-3 py-1 ${view === "grid" ? "bg-[var(--surface-muted)] font-semibold" : "text-[var(--muted)]"}`}
              >
                Grid view
              </Link>
            </div>
          </div>
          <form method="get" className="mt-4 grid gap-3 border border-[var(--line)] bg-[var(--surface-muted)] p-4 md:grid-cols-2">
            <label className="text-sm">
              Search title
              <input name="q" defaultValue={filters.search ?? ""} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--page)] px-2 py-1" />
            </label>
            <label className="text-sm">
              Status
              <select name="status" defaultValue={filters.status ?? ""} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--page)] px-2 py-1">
                <option value="">Any status</option>
                {ISSUE_STATUSES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
              </select>
            </label>
            <label className="text-sm">
              Priority
              <select name="priority" defaultValue={filters.priority ?? ""} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--page)] px-2 py-1">
                <option value="">Any priority</option>
                {ISSUE_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </label>
            <label className="text-sm">
              Assignee
              <select name="assignee" defaultValue={filters.assigneeId ?? ""} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--page)] px-2 py-1">
                <option value="">Anyone</option>
                {memberList.map((member) => <option key={member.profile_id} value={member.profile_id}>{member.display_name}</option>)}
              </select>
            </label>
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" className="rounded bg-[var(--accent)] px-3 py-1 font-semibold text-[var(--page)]">Apply filters</button>
              <Link href={`/app/${organizationSlug}/projects/${project.id}`} className="rounded border border-[var(--line)] px-3 py-1 text-[var(--accent)]">Clear</Link>
            </div>
          </form>
          {issues?.length ? (
            <ul className={view === "grid" ? "mt-4 grid gap-4 sm:grid-cols-2" : "mt-4 space-y-4"}>
              {issues.map((issue) => (
                <li
                  key={issue.id}
                  className={`border p-4 ${view === "grid" ? issueStatusClass(issue.status) : "border-[var(--line)]"}`}
                >
                  <Link
                    className="text-lg font-semibold text-[var(--accent)] underline"
                    href={`/app/${organizationSlug}/issues/${issue.id}`}
                  >
                    {issue.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                    <span className="rounded-full border border-[var(--line)] px-2 py-1">
                      {issue.status.replace("_", " ")}
                    </span>
                    <span className="rounded-full border border-[var(--line)] px-2 py-1">
                      {issue.priority}
                    </span>
                    <span className="rounded-full border border-[var(--line)] px-2 py-1">
                      {issue.assignee_id ? "Assigned" : "Unassigned"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Updated {new Date(issue.updated_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <StatePanel title="No issues to show">
                Create the first issue for this project.
              </StatePanel>
            </div>
          )}
          <nav aria-label="Issue pages" className="mt-6 flex justify-between text-sm">
            {filters.page > 1 ? (
              <Link href={buildPageHref(filters.page - 1)}>Previous</Link>
            ) : <span />}
            {issues?.length === 50 ? (
              <Link href={buildPageHref(filters.page + 1)}>Next</Link>
            ) : null}
          </nav>
        </section>

        <section className="border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Create issue</h2>
          <div className="mt-4">
            <IssueForm
              action={createIssue.bind(null, organizationSlug, project.id)}
              members={memberList}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
