import Link from "next/link";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="retro-detail text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-bold">Sign in</h1>
        <div className="mt-8">
          <SignInForm />
        </div>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          New here?{" "}
          <Link className="text-[var(--accent)] underline" href="/auth/sign-up">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
