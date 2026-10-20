"use client";

import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form className="space-y-5" action={formAction}>
      <div aria-live="polite" className="text-sm">
        {state.error ? <p className="text-[var(--danger)]">{state.error}</p> : null}
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="email">
          Email address
        </label>
        <input
          className="mt-2 block w-full rounded border border-[var(--line)] bg-[var(--page)] px-3 py-2 outline-none placeholder:text-[var(--muted)]"
          id="email"
          name="email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          className="mt-2 block w-full rounded border border-[var(--line)] bg-[var(--page)] px-3 py-2 outline-none placeholder:text-[var(--muted)]"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button
        className="w-full rounded bg-[var(--accent)] px-4 py-2.5 font-semibold text-[var(--page)] hover:bg-[var(--accent-strong)]"
        type="submit"
        disabled={pending}
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
