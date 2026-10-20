import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/lib/issue-validation";

export type IssueFilters = {
  status?: (typeof ISSUE_STATUSES)[number];
  priority?: (typeof ISSUE_PRIORITIES)[number];
  assigneeId?: string;
  search?: string;
  page: number;
};

export function parseIssueFilters(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): IssueFilters {
  const getValue = (key: string) => {
    const value =
      searchParams instanceof URLSearchParams
        ? searchParams.get(key)
        : searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const statusValue = getValue("status");
  const priorityValue = getValue("priority");
  const assigneeId = getValue("assignee")?.trim();
  const search = getValue("q")?.trim();
  const parsedPage = Number.parseInt(getValue("page") ?? "1", 10);

  return {
    status: ISSUE_STATUSES.includes(statusValue as (typeof ISSUE_STATUSES)[number])
      ? (statusValue as (typeof ISSUE_STATUSES)[number])
      : undefined,
    priority: ISSUE_PRIORITIES.includes(
      priorityValue as (typeof ISSUE_PRIORITIES)[number],
    )
      ? (priorityValue as (typeof ISSUE_PRIORITIES)[number])
      : undefined,
    assigneeId: assigneeId || undefined,
    search: search || undefined,
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

export function buildIssueFilterQuery(filters: IssueFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.assigneeId) params.set("assignee", filters.assigneeId);
  if (filters.search) params.set("q", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}
