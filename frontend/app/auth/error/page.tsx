import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <section className="rounded-xl border border-rose-400/40 bg-rose-950/30 p-6">
        <h1 className="text-2xl font-semibold text-white">
          We could not complete sign-in
        </h1>
        <p className="mt-3 text-sm leading-6 text-rose-100">
          The link may have expired or already been used. Start again from the
          public sign-in page.
        </p>
        <Link
          className="mt-5 inline-block rounded-md bg-sky-400 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-300"
          href="/auth/sign-in"
        >
          Return to sign in
        </Link>
      </section>
    </div>
  );
}
