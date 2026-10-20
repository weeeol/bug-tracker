import { StatePanel } from "@/components/state-panel";
import { ProjectForm } from "@/components/project-form";
import { archiveProject, updateMemberRole, updateProject } from "@/app/app/actions";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ organizationSlug: string }>;
}) {
  const { organizationSlug } = await params;
  const supabase = await getServerSupabaseClient();
  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", organizationSlug)
    .maybeSingle();

  if (!organization) {
    return <div className="mx-auto max-w-4xl px-6 py-16"><StatePanel title="Organization not found">This organization is unavailable.</StatePanel></div>;
  }

  const [{ data: projects }, { data: members }] = await Promise.all([
    supabase.from("projects").select("id, name, slug, archived_at").eq("organization_id", organization.id).is("archived_at", null).order("name"),
    supabase.from("organization_members").select("profile_id, role, profiles(display_name)").eq("organization_id", organization.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="retro-detail text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        Organization / {organizationSlug}
      </p>
      <h1 className="mt-3 text-4xl font-bold">{organization.name} projects</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Active projects</h2>
          {projects?.length ? (
            <ul className="mt-4 space-y-4">
              {projects.map((project) => (
                <li key={project.id} className="border border-[var(--line)] p-4">
                  <a className="font-semibold text-[var(--accent)] underline" href={`/app/${organizationSlug}/projects/${project.id}`}>{project.name}</a>
                  <p className="mt-1 text-sm text-[var(--muted)]">{project.slug}</p>
                  <form action={archiveProject.bind(null, organizationSlug, project.id)} className="mt-3">
                    <button className="text-sm text-[var(--danger)] underline" type="submit">Archive project</button>
                  </form>
                  <form action={updateProject.bind(null, organizationSlug, project.id)} className="mt-3 flex gap-2">
                    <label className="sr-only" htmlFor={`project-name-${project.id}`}>Project name</label>
                    <input className="min-w-0 flex-1 rounded border border-[var(--line)] bg-[var(--page)] px-2 py-1 text-sm" id={`project-name-${project.id}`} name="name" defaultValue={project.name} />
                    <input name="slug" defaultValue={project.slug} aria-label="Project slug" className="min-w-0 flex-1 rounded border border-[var(--line)] bg-[var(--page)] px-2 py-1 text-sm" />
                    <button className="text-sm text-[var(--accent)] underline" type="submit">Save</button>
                  </form>
                </li>
              ))}
            </ul>
          ) : <StatePanel title="No active projects">Create the first project for this organization.</StatePanel>}
        </section>
        <div className="space-y-6">
          <section className="border border-[var(--line)] bg-[var(--surface)] p-6">
            <h2 className="text-xl font-semibold">Create project</h2>
            <div className="mt-4"><ProjectForm organizationSlug={organizationSlug} /></div>
          </section>
          <section className="border border-[var(--line)] bg-[var(--surface)] p-6">
            <h2 className="text-xl font-semibold">Members</h2>
            <ul className="mt-4 space-y-3">
              {members?.map((member) => {
                const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
                return <li key={member.profile_id} className="flex items-center justify-between gap-3 text-sm">
                  <span>{profile?.display_name ?? member.profile_id}</span>
                  <form action={updateMemberRole.bind(null, organizationSlug, member.profile_id)}>
                    <label className="sr-only" htmlFor={`role-${member.profile_id}`}>Role</label>
                    <select className="rounded border border-[var(--line)] bg-[var(--page)] px-2 py-1" id={`role-${member.profile_id}`} name="role" defaultValue={member.role}>
                      <option value="member">Member</option><option value="owner">Owner</option>
                    </select>
                    <button className="ml-2 text-[var(--accent)] underline" type="submit">Save</button>
                  </form>
                </li>;
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
