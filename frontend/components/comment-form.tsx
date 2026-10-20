"use client";

import React from "react";
import { useActionState } from "react";
import type { ActionState } from "@/app/app/actions";

export function CommentForm({
  action,
}: {
  action: (
    previousState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state.message ? (
        <p className="text-sm text-emerald-300">{state.message}</p>
      ) : null}
      <div>
        <label className="block text-sm font-medium" htmlFor="comment-body">
          Add a comment
        </label>
        <textarea
          id="comment-body"
          name="body"
          className="mt-2 min-h-24 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
          maxLength={5000}
          required
          aria-describedby="comment-body-help"
        />
        <p id="comment-body-help" className="mt-1 text-xs text-slate-400">
          Plain text only, up to 5000 characters.
        </p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-sky-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
      >
        {pending ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}
