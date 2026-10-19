import { StatePanel } from "@/components/state-panel";

export default async function IssuePage({
  params,
}: {
  params: Promise<{ organizationSlug: string; issueId: string }>;
}) {
  const { organizationSlug, issueId } = await params;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
        {organizationSlug} / issue {issueId}
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Issue details</h1>
      <div className="mt-8">
        <StatePanel title="Issue details are not connected yet">
          Issue details, assignment, and comments will be implemented in later
          tasks.
        </StatePanel>
      </div>
    </div>
  );
}
