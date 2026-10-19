"use client";

import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form className="space-y-5" action={formAction}>
      <div aria-live="polite" className="text-sm">
        {state.error ? <p className="text-rose-300">{state.error}</p> : null}
        {state.message ? <p className="text-emerald-300">{state.message}</p> : null}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-200" htmlFor="displayName">
          Name
        </label>
        <input
          className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-200" htmlFor="sign-up-email">
          Email address
        </label>
        <input
          className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          id="sign-up-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-200" htmlFor="sign-up-password">
          Password
        </label>
        <input
          className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
          id="sign-up-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <button
        className="w-full rounded-md bg-sky-400 px-4 py-2.5 font-semibold text-slate-950 hover:bg-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-wait disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
