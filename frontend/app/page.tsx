import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <section aria-labelledby="landing-title">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
          A calmer way to triage defects
        </p>
        <h1 id="landing-title" className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Keep every bug moving toward done.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Bug Tracker gives teams a shared place to report, assign, and resolve
          software defects without losing context.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-sky-400 px-4 py-2.5 font-semibold text-slate-950 hover:bg-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            href="/auth/sign-in"
          >
            Sign in to continue
          </Link>
          <Link
            className="rounded-md border border-slate-700 px-4 py-2.5 font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            href="/app"
          >
            View workspace preview
          </Link>
        </div>
      </section>
      <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6" aria-label="Product preview">
        <p className="text-sm font-medium text-sky-300">Preview</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">A focused issue queue</h2>
        <ul className="mt-6 space-y-4 text-sm text-slate-300">
          <li className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">Review what needs attention.</li>
          <li className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">Make ownership visible.</li>
          <li className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">Keep resolution history together.</li>
        </ul>
      </aside>
    </div>
  );
}
