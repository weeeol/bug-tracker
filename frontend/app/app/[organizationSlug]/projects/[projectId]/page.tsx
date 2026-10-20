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
  const filters = parseIssueFilters(await searchParams);
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
            <Link className="text-sky-300 underline" href={`/app/${organizationSlug}/projects`}>
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

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
        {organizationSlug} / {project.slug}
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-white">{project.name} issues</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Issue queue</h2>
          <form method="get" className="mt-4 grid gap-3 rounded-lg border border-slate-800 p-4 md:grid-cols-2">
            <label className="text-sm">
              Search title
              <input name="q" defaultValue={filters.search ?? ""} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1" />
            </label>
            <label className="text-sm">
              Status
              <select name="status" defaultValue={filters.status ?? ""} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1">
                <option value="">Any status</option>
                {ISSUE_STATUSES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
              </select>
            </label>
            <label className="text-sm">
              Priority
              <select name="priority" defaultValue={filters.priority ?? ""} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1">
                <option value="">Any priority</option>
                {ISSUE_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </label>
            <label className="text-sm">
              Assignee
              <select name="assignee" defaultValue={filters.assigneeId ?? ""} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1">
                <option value="">Anyone</option>
                {memberList.map((member) => <option key={member.profile_id} value={member.profile_id}>{member.display_name}</option>)}
              </select>
            </label>
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" className="rounded bg-sky-400 px-3 py-1 font-semibold text-slate-950">Apply filters</button>
              <Link href={`/app/${organizationSlug}/projects/${project.id}`} className="rounded border border-slate-700 px-3 py-1 text-sky-300">Clear</Link>
            </div>
          </form>
          {issues?.length ? (
            <ul className="mt-4 space-y-4">
              {issues.map((issue) => (
                <li key={issue.id} className="rounded-lg border border-slate-800 p-4">
                  <Link
                    className="text-lg font-semibold text-sky-300 underline"
                    href={`/app/${organizationSlug}/issues/${issue.id}`}
                  >
                    {issue.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-slate-700 px-2 py-1">
                      {issue.status.replace("_", " ")}
                    </span>
                    <span className="rounded-full border border-slate-700 px-2 py-1">
                      {issue.priority}
                    </span>
                    <span className="rounded-full border border-slate-700 px-2 py-1">
                      {issue.assignee_id ? "Assigned" : "Unassigned"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
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
              <Link href={`/app/${organizationSlug}/projects/${project.id}?${buildIssueFilterQuery({ ...filters, page: filters.page - 1 })}`}>Previous</Link>
            ) : <span />}
            {issues?.length === 50 ? (
              <Link href={`/app/${organizationSlug}/projects/${project.id}?${buildIssueFilterQuery({ ...filters, page: filters.page + 1 })}`}>Next</Link>
            ) : null}
          </nav>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
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
