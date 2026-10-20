import Link from "next/link";
import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="retro-detail text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Get started
        </p>
        <h1 className="mt-3 text-3xl font-bold">Create an account</h1>
        <div className="mt-8">
          <SignUpForm />
        </div>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Already registered?{" "}
          <Link className="text-[var(--accent)] underline" href="/auth/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
