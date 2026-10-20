import Link from "next/link";
import { updateIssue } from "@/app/app/actions";
import { IssueForm } from "@/components/issue-form";
import { StatePanel } from "@/components/state-panel";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function IssuePage({
  params,
}: {
  params: Promise<{ organizationSlug: string; issueId: string }>;
}) {
  const { organizationSlug, issueId } = await params;
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

  const { data: issue } = await supabase
    .from("issues")
    .select(
      "id, title, description, status, priority, assignee_id, reporter_id, project_id, organization_id, created_at, updated_at",
    )
    .eq("organization_id", organization.id)
    .eq("id", issueId)
    .maybeSingle();

  if (!issue) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Issue not found">
          The issue could not be located in this organization.
        </StatePanel>
      </div>
    );
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, slug, archived_at")
    .eq("organization_id", organization.id)
    .eq("id", issue.project_id)
    .maybeSingle();

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Project unavailable">
          This issue belongs to a project that is no longer available.
        </StatePanel>
      </div>
    );
  }

  if (project.archived_at) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Project archived">
          This issue is in an archived project and is read-only.
          <div className="mt-4">
            <Link className="text-sky-300 underline" href={`/app/${organizationSlug}/projects/${project.id}`}>
              Back to project
            </Link>
          </div>
        </StatePanel>
      </div>
    );
  }

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("profile_id, profiles(display_name)")
    .eq("organization_id", organization.id);

  const memberMap = new Map(
    (memberships ?? []).map((member) => {
      const profile = Array.isArray(member.profiles)
        ? member.profiles[0]
        : member.profiles;
      return [member.profile_id, profile?.display_name ?? member.profile_id];
    }),
  );

  const reporterName = memberMap.get(issue.reporter_id) ?? issue.reporter_id;
  const assigneeName = issue.assignee_id
    ? memberMap.get(issue.assignee_id) ?? issue.assignee_id
    : "Unassigned";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
        {organizationSlug} / {project.slug} / issue
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-white">{issue.title}</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Issue overview</h2>
          <dl className="mt-4 space-y-4 text-sm text-slate-300">
            <div>
              <dt className="text-slate-400">Status</dt>
              <dd className="mt-1 font-medium text-white">{issue.status.replace("_", " ")}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Priority</dt>
              <dd className="mt-1 font-medium text-white">{issue.priority}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Reporter</dt>
              <dd className="mt-1 font-medium text-white">{reporterName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Assignee</dt>
              <dd className="mt-1 font-medium text-white">{assigneeName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Created</dt>
              <dd className="mt-1 font-medium text-white">
                {new Date(issue.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Updated</dt>
              <dd className="mt-1 font-medium text-white">
                {new Date(issue.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Description</h2>
          <div className="mt-4 whitespace-pre-wrap text-slate-300">
            {issue.description || "No description provided."}
          </div>

          <div className="mt-8 border-t border-slate-800 pt-6">
            <h3 className="text-lg font-semibold">Edit issue</h3>
            <div className="mt-4">
              <IssueForm
                action={updateIssue.bind(null, organizationSlug, project.id, issue.id)}
                defaultIssue={issue}
                members={(memberships ?? []).map((member) => {
                  const profile = Array.isArray(member.profiles)
                    ? member.profiles[0]
                    : member.profiles;
                  return {
                    profile_id: member.profile_id,
                    display_name: profile?.display_name ?? member.profile_id,
                  };
                })}
                submitLabel="Save issue"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
