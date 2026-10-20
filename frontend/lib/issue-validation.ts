export const ISSUE_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export const ISSUE_PRIORITIES = ["low", "medium", "high", "critical"] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

export type IssueInput = {
  title?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  assigneeId?: string | null;
};

export type IssueField = "title" | "description" | "status" | "priority" | "assigneeId";
export type IssueFieldErrors = Partial<Record<IssueField, string>>;

export function normalizeIssueText(value: string | null | undefined) {
  return (value ?? "").trim();
}

export function validateIssueInput(input: IssueInput) {
  const title = normalizeIssueText(input.title);
  if (!title) {
    return {
      valid: false,
      message: "Review the highlighted issue fields.",
      fieldErrors: { title: "Issue title is required." },
    };
  }
  if (title.length > 200) {
    return {
      valid: false,
      message: "Review the highlighted issue fields.",
      fieldErrors: { title: "Issue title must be 200 characters or fewer." },
    };
  }

  const status = input.status ?? "open";
  if (!ISSUE_STATUSES.includes(status as IssueStatus)) {
    return {
      valid: false,
      message: "Review the highlighted issue fields.",
      fieldErrors: { status: "Invalid status value." },
    };
  }

  const priority = input.priority ?? "medium";
  if (!ISSUE_PRIORITIES.includes(priority as IssuePriority)) {
    return {
      valid: false,
      message: "Review the highlighted issue fields.",
      fieldErrors: { priority: "Invalid priority value." },
    };
  }

  const description = normalizeIssueText(input.description);
  if (description.length > 5000) {
    return {
      valid: false,
      message: "Review the highlighted issue fields.",
      fieldErrors: {
        description: "Issue description must be 5000 characters or fewer.",
      },
    };
  }

  const assigneeId = input.assigneeId ?? null;
  if (assigneeId && assigneeId.trim().length === 0) {
    return {
      valid: false,
      message: "Review the highlighted issue fields.",
      fieldErrors: {
        assigneeId: "Assignee must be a valid member ID or left blank.",
      },
    };
  }

  return {
    valid: true,
    title,
    description,
    status,
    priority,
    assigneeId: assigneeId || null,
  };
}

export function issueBelongsToOrganization(issueOrganizationId: string | null | undefined, organizationId: string | null | undefined) {
  return Boolean(issueOrganizationId && organizationId && issueOrganizationId === organizationId);
}

export function issueBelongsToProject(issueProjectId: string | null | undefined, projectId: string | null | undefined) {
  return Boolean(issueProjectId && projectId && issueProjectId === projectId);
}
