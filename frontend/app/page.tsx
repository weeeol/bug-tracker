import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <section aria-labelledby="landing-title">
        <p className="retro-detail text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          A calmer way to triage defects
        </p>
        <h1
          id="landing-title"
          className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl"
        >
          Keep every bug moving toward done.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Bug Tracker gives teams a shared place to report, assign, and resolve
          software defects without losing context.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded bg-[var(--accent)] px-4 py-2.5 font-semibold text-[var(--page)] hover:bg-[var(--accent-strong)]"
            href="/app"
          >
            Open workspace
          </Link>
          <Link
            className="rounded border border-[var(--line)] px-4 py-2.5 font-semibold hover:bg-[var(--surface-muted)]"
            href="/auth/sign-up"
          >
            Create an account
          </Link>
        </div>
      </section>
      <aside
        className="border border-[var(--line)] bg-[var(--surface)] p-6"
        aria-label="Product capabilities"
      >
        <p className="retro-detail text-sm font-semibold text-[var(--accent)]">
          Built for triage
        </p>
        <h2 className="mt-2 text-2xl font-bold">A focused issue queue</h2>
        <ul className="mt-6 space-y-4 text-sm text-[var(--muted)]">
          <li className="border-l-2 border-[var(--success)] bg-[var(--surface-muted)] p-4">
            Review what needs attention.
          </li>
          <li className="border-l-2 border-[var(--warning)] bg-[var(--surface-muted)] p-4">
            Make ownership visible.
          </li>
          <li className="border-l-2 border-[var(--accent)] bg-[var(--surface-muted)] p-4">
            Keep resolution history together.
          </li>
        </ul>
      </aside>
    </div>
  );
}
