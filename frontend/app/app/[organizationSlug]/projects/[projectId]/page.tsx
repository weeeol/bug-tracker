import { StatePanel } from "@/components/state-panel";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ organizationSlug: string; projectId: string }>;
}) {
  const { organizationSlug, projectId } = await params;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
        {organizationSlug} / project {projectId}
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Issue list</h1>
      <div className="mt-8">
        <StatePanel title="No issues to show">
          Issue data and filters will be connected in a later task.
        </StatePanel>
      </div>
    </div>
  );
}
