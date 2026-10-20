"use client";

import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form className="space-y-5" action={formAction}>
      <div aria-live="polite" className="text-sm">
        {state.error ? <p className="text-[var(--danger)]">{state.error}</p> : null}
        {state.message ? <p className="text-[var(--success)]">{state.message}</p> : null}
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="displayName">
          Name
        </label>
        <input
          className="mt-2 block w-full rounded border border-[var(--line)] bg-[var(--page)] px-3 py-2 outline-none"
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="sign-up-email">
          Email address
        </label>
        <input
          className="mt-2 block w-full rounded border border-[var(--line)] bg-[var(--page)] px-3 py-2 outline-none"
          id="sign-up-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="sign-up-password">
          Password
        </label>
        <input
          className="mt-2 block w-full rounded border border-[var(--line)] bg-[var(--page)] px-3 py-2 outline-none"
          id="sign-up-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <button
        className="w-full rounded bg-[var(--accent)] px-4 py-2.5 font-semibold text-[var(--page)] hover:bg-[var(--accent-strong)] disabled:cursor-wait disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
