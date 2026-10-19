import Link from "next/link";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Sign in</h1>
        <div className="mt-8">
          <SignInForm />
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">
          New here?{" "}
          <Link className="text-sky-300 underline hover:text-sky-200" href="/auth/sign-up">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
