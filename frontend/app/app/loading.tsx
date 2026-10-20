export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16" aria-live="polite">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-40 rounded bg-[var(--surface-muted)]" />
        <div className="h-10 w-72 rounded bg-[var(--surface-muted)]" />
        <div className="h-48 border border-[var(--line)] bg-[var(--surface)]" />
      </div>
      <p className="sr-only">Loading workspace</p>
    </div>
  );
}
