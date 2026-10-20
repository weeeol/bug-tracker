export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16" aria-live="polite">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-40 rounded bg-slate-800" />
        <div className="h-10 w-72 rounded bg-slate-800" />
        <div className="h-48 rounded-xl border border-slate-800 bg-slate-900" />
      </div>
      <p className="sr-only">Loading workspace</p>
    </div>
  );
}
