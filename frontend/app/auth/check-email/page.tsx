import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h1 className="text-2xl font-semibold text-white">Check your email</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          If an account can be created for those details, we sent a
          confirmation link. Follow it to finish setup.
        </p>
        <Link className="mt-5 inline-block text-sky-300 underline" href="/auth/sign-in">
          Return to sign in
        </Link>
      </section>
    </div>
  );
}
