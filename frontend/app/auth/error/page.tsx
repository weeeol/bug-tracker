import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <section className="border border-[var(--danger)] bg-[var(--danger-surface)] p-6">
        <h1 className="text-2xl font-bold">
          We could not complete sign-in
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          The link may have expired or already been used. Start again from the
          public sign-in page.
        </p>
        <Link
          className="mt-5 inline-block rounded bg-[var(--accent)] px-4 py-2 font-semibold text-[var(--page)] hover:bg-[var(--accent-strong)]"
          href="/auth/sign-in"
        >
          Return to sign in
        </Link>
      </section>
    </div>
  );
}
