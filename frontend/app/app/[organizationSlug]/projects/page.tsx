import { StatePanel } from "@/components/state-panel";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ organizationSlug: string }>;
}) {
  const { organizationSlug } = await params;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
        Organization / {organizationSlug}
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Projects</h1>
      <div className="mt-8">
        <StatePanel title="Projects are not connected yet">
          Project records will appear here after the data task is complete.
        </StatePanel>
      </div>
    </div>
  );
}
