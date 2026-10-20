import Link from "next/link";
import { addIssueComment, updateIssue } from "@/app/app/actions";
import { CommentForm } from "@/components/comment-form";
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

  const { data: issue, error: issueError } = await supabase
    .from("issues")
    .select(
      "id, title, description, status, priority, assignee_id, reporter_id, project_id, organization_id, created_at, updated_at",
    )
    .eq("organization_id", organization.id)
    .eq("id", issueId)
    .maybeSingle();

  if (issueError) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Could not load issue" tone="error">
          We could not load this issue. Please try again.
        </StatePanel>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Issue not found">
          The issue could not be located in this organization.
        </StatePanel>
      </div>
    );
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, slug, archived_at")
    .eq("organization_id", organization.id)
    .eq("id", issue.project_id)
    .maybeSingle();

  if (projectError) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Could not load project" tone="error">
          We could not load this issue&apos;s project. Please try again.
        </StatePanel>
      </div>
    );
  }

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
            <Link className="text-[var(--accent)] underline" href={`/app/${organizationSlug}/projects/${project.id}`}>
              Back to project
            </Link>
          </div>
        </StatePanel>
      </div>
    );
  }

  const { data: memberships, error: membershipsError } = await supabase
    .from("organization_members")
    .select("profile_id, profiles(display_name)")
    .eq("organization_id", organization.id);

  const { data: comments, error: commentsError } = await supabase
    .from("issue_comments")
    .select("id, body, author_id, created_at")
    .eq("organization_id", organization.id)
    .eq("issue_id", issue.id)
    .order("created_at", { ascending: true })
    .limit(50);

  if (membershipsError) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Could not load issue members" tone="error">
          We could not load the issue participants. Please try again.
        </StatePanel>
      </div>
    );
  }

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
      <p className="retro-detail text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        {organizationSlug} / {project.slug} / issue
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-white">{issue.title}</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Issue overview</h2>
          <dl className="mt-4 space-y-4 text-sm text-[var(--muted)]">
            <div>
              <dt className="text-[var(--muted)]">Status</dt>
              <dd className="mt-1 font-medium text-white">{issue.status.replace("_", " ")}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Priority</dt>
              <dd className="mt-1 font-medium text-white">{issue.priority}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Reporter</dt>
              <dd className="mt-1 font-medium text-white">{reporterName}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Assignee</dt>
              <dd className="mt-1 font-medium text-white">{assigneeName}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Created</dt>
              <dd className="mt-1 font-medium text-white">
                {new Date(issue.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Updated</dt>
              <dd className="mt-1 font-medium text-white">
                {new Date(issue.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </section>

        <section className="border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Description</h2>
          <div className="mt-4 whitespace-pre-wrap text-[var(--muted)]">
            {issue.description || "No description provided."}
          </div>

          <div className="mt-8 border-t border-[var(--line)] pt-6">
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

          <div className="mt-8 border-t border-[var(--line)] pt-6">
            <h3 className="text-lg font-semibold">Discussion</h3>
            {commentsError ? (
              <StatePanel title="Could not load comments" tone="error">
                We could not load the discussion. Please try again.
              </StatePanel>
            ) : comments?.length ? (
              <ol className="mt-4 space-y-4">
                {comments.map((comment) => (
                  <li key={comment.id} className="border border-[var(--line)] p-4">
                    <p className="whitespace-pre-wrap text-sm text-[var(--muted)]">{comment.body}</p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {memberMap.get(comment.author_id) ?? comment.author_id} ·{" "}
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">No comments yet.</p>
            )}
            <div className="mt-6">
              <CommentForm action={addIssueComment.bind(null, organizationSlug, issue.id)} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
