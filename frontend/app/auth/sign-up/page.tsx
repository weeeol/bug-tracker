import Link from "next/link";
import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
          Get started
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Create an account</h1>
        <div className="mt-8">
          <SignUpForm />
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already registered?{" "}
          <Link className="text-sky-300 underline hover:text-sky-200" href="/auth/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
