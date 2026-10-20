import { StatePanel } from "@/components/state-panel";
import { WorkspaceShell } from "@/components/workspace-shell";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}) {
  const { organizationSlug } = await params;
  const supabase = await getServerSupabaseClient();
  const { data: organization, error } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", organizationSlug)
    .maybeSingle();

  if (error || !organization) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Organization unavailable" tone="error">
          This organization could not be loaded or you do not have access.
        </StatePanel>
      </div>
    );
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name")
    .eq("organization_id", organization.id)
    .is("archived_at", null)
    .order("name");

  if (projectsError) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <StatePanel title="Workspace unavailable" tone="error">
          We could not load the projects for this organization. Please try again.
        </StatePanel>
      </div>
    );
  }

  return (
    <WorkspaceShell
      organizationSlug={organizationSlug}
      organizationName={organization.name}
      projects={projects ?? []}
    >
      {children}
    </WorkspaceShell>
  );
}
