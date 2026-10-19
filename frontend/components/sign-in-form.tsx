"use client";

import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form className="space-y-5" action={formAction}>
      <div aria-live="polite" className="text-sm">
        {state.error ? <p className="text-rose-300">{state.error}</p> : null}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-200" htmlFor="email">
          Email address
        </label>
        <input
          className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          id="email"
          name="email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-200" htmlFor="password">
          Password
        </label>
        <input
          className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button
        className="w-full rounded-md bg-sky-400 px-4 py-2.5 font-semibold text-slate-950 hover:bg-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        type="submit"
        disabled={pending}
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
