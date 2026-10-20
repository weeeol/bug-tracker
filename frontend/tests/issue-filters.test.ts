import { describe, expect, it } from "vitest";
import { buildIssueFilterQuery, parseIssueFilters } from "@/lib/issue-filters";

describe("issue filters", () => {
  it("parses supported filters and defaults invalid pages", () => {
    expect(
      parseIssueFilters(
        new URLSearchParams(
          "status=in_progress&priority=high&assignee=user-1&q=login&page=0",
        ),
      ),
    ).toEqual({
      status: "in_progress",
      priority: "high",
      assigneeId: "user-1",
      search: "login",
      page: 1,
    });
  });

  it("ignores unsupported enum values and preserves shareable query state", () => {
    const filters = parseIssueFilters({
      status: "invalid",
      priority: "critical",
      q: "  crash ",
      page: "2",
    });

    expect(filters.status).toBeUndefined();
    expect(buildIssueFilterQuery(filters).toString()).toBe(
      "priority=critical&q=crash&page=2",
    );
  });
});
