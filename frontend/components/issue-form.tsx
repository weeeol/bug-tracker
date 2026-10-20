"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/app/actions";
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/lib/issue-validation";

type IssueFormMember = {
  profile_id: string;
  display_name: string;
};

type IssueFormProps = {
  action: (
    previousState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  members: IssueFormMember[];
  defaultIssue?: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee_id?: string | null;
  };
  submitLabel?: string;
};

export function IssueForm({
  action,
  members,
  defaultIssue,
  submitLabel = "Create issue",
}: IssueFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form className="space-y-4" action={formAction}>
      {state.error ? <p className="text-sm text-[var(--danger)]">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-[var(--success)]">{state.message}</p> : null}

      <div>
        <label className="block text-sm font-medium" htmlFor="issue-title">
          Title
        </label>
        <input
          id="issue-title"
          name="title"
          defaultValue={defaultIssue?.title ?? ""}
          className="mt-2 w-full rounded border border-[var(--line)] bg-[var(--page)] px-3 py-2"
          required
          maxLength={200}
          aria-invalid={Boolean(state.fieldErrors?.title)}
          aria-describedby={state.fieldErrors?.title ? "issue-title-error" : undefined}
        />
        {state.fieldErrors?.title ? <p id="issue-title-error" className="mt-1 text-sm text-[var(--danger)]">{state.fieldErrors.title}</p> : null}
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="issue-description">
          Description
        </label>
        <textarea
          id="issue-description"
          name="description"
          defaultValue={defaultIssue?.description ?? ""}
          className="mt-2 min-h-28 w-full rounded border border-[var(--line)] bg-[var(--page)] px-3 py-2"
          maxLength={5000}
          aria-invalid={Boolean(state.fieldErrors?.description)}
          aria-describedby={state.fieldErrors?.description ? "issue-description-error" : undefined}
        />
        {state.fieldErrors?.description ? <p id="issue-description-error" className="mt-1 text-sm text-[var(--danger)]">{state.fieldErrors.description}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium" htmlFor="issue-status">
            Status
          </label>
          <select
            id="issue-status"
            name="status"
            defaultValue={defaultIssue?.status ?? "open"}
            className="mt-2 w-full rounded border border-[var(--line)] bg-[var(--page)] px-3 py-2"
            aria-invalid={Boolean(state.fieldErrors?.status)}
            aria-describedby={state.fieldErrors?.status ? "issue-status-error" : undefined}
          >
            {ISSUE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
          {state.fieldErrors?.status ? <p id="issue-status-error" className="mt-1 text-sm text-[var(--danger)]">{state.fieldErrors.status}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="issue-priority">
            Priority
          </label>
          <select
            id="issue-priority"
            name="priority"
            defaultValue={defaultIssue?.priority ?? "medium"}
            className="mt-2 w-full rounded border border-[var(--line)] bg-[var(--page)] px-3 py-2"
            aria-invalid={Boolean(state.fieldErrors?.priority)}
            aria-describedby={state.fieldErrors?.priority ? "issue-priority-error" : undefined}
          >
            {ISSUE_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          {state.fieldErrors?.priority ? <p id="issue-priority-error" className="mt-1 text-sm text-[var(--danger)]">{state.fieldErrors.priority}</p> : null}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="issue-assignee">
          Assignee
        </label>
        <select
          id="issue-assignee"
          name="assigneeId"
          defaultValue={defaultIssue?.assignee_id ?? ""}
          className="mt-2 w-full rounded border border-[var(--line)] bg-[var(--page)] px-3 py-2"
          aria-invalid={Boolean(state.fieldErrors?.assigneeId)}
          aria-describedby={state.fieldErrors?.assigneeId ? "issue-assignee-error" : undefined}
        >
          <option value="">Unassigned</option>
          {members.map((member) => (
            <option key={member.profile_id} value={member.profile_id}>
              {member.display_name}
            </option>
          ))}
        </select>
        {state.fieldErrors?.assigneeId ? <p id="issue-assignee-error" className="mt-1 text-sm text-[var(--danger)]">{state.fieldErrors.assigneeId}</p> : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--accent)] px-4 py-2 font-semibold text-[var(--page)] disabled:opacity-60"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
