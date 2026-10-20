import Link from "next/link";
import { createIssue } from "@/app/app/actions";
import { IssueForm } from "@/components/issue-form";
import { StatePanel } from "@/components/state-panel";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ organizationSlug: string; projectId: string }>;
}) {
  const { organizationSlug, projectId } = await params;
  const supabase = await getServerSupabaseClient();

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", organizationSlug)
    .maybeSingle();

  if (!organization) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Organization not found">
          This organization is unavailable.
        </StatePanel>
      </div>
    );
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, slug, archived_at")
    .eq("organization_id", organization.id)
    .eq("id", projectId)
    .maybeSingle();

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

  const [{ data: issues }, { data: members }] = await Promise.all([
    supabase
      .from("issues")
      .select("id, title, status, priority, updated_at, assignee_id")
      .eq("organization_id", organization.id)
      .eq("project_id", project.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("organization_members")
      .select("profile_id, profiles(display_name)")
      .eq("organization_id", organization.id),
  ]);

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
