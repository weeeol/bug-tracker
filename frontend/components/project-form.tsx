"use client";

import { useActionState } from "react";
import { createProject } from "@/app/app/actions";

export function ProjectForm({ organizationSlug }: { organizationSlug: string }) {
  const action = createProject.bind(null, organizationSlug);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form className="space-y-4" action={formAction}>
      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-emerald-300">{state.message}</p> : null}
      <div>
        <label className="block text-sm font-medium" htmlFor="project-name">
          Project name
        </label>
        <input
          className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
          id="project-name"
          name="name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="project-slug">
          URL slug (optional)
        </label>
        <input
          className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
          id="project-slug"
          name="slug"
          placeholder="project-name"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        />
        <p className="mt-1 text-xs text-slate-400">
          Leave blank to generate a slug from the project name.
        </p>
      </div>
      <button
        className="rounded-md bg-sky-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}
