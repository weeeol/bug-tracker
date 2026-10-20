"use client";

import { useActionState } from "react";
import { createOrganization } from "@/app/app/actions";

export function OrganizationForm() {
  const [state, formAction, pending] = useActionState(createOrganization, {});

  return (
    <form className="space-y-4" action={formAction}>
      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      <div>
        <label className="block text-sm font-medium" htmlFor="organization-name">
          Organization name
        </label>
        <input
          className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
          id="organization-name"
          name="name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="organization-slug">
          URL slug (optional)
        </label>
        <input
          className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
          id="organization-slug"
          name="slug"
          placeholder="team-name"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        />
        <p className="mt-1 text-xs text-slate-400">
          Leave blank to generate a slug from the organization name.
        </p>
      </div>
      <button
        className="rounded-md bg-sky-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Creating..." : "Create organization"}
      </button>
    </form>
  );
}
