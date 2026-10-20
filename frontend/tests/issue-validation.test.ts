import { describe, expect, it } from "vitest";
import { validateIssueInput } from "@/lib/issue-validation";

describe("validateIssueInput", () => {
  it("accepts valid status, priority, and assignee data", () => {
    expect(
      validateIssueInput({
        title: "Investigate login regression",
        description: "The sign-in flow fails after a redirect.",
        status: "in_progress",
        priority: "high",
        assigneeId: "user-123",
      }),
    ).toMatchObject({
      valid: true,
      title: "Investigate login regression",
      description: "The sign-in flow fails after a redirect.",
      status: "in_progress",
      priority: "high",
      assigneeId: "user-123",
    });
  });

  it("rejects missing titles and invalid enum values", () => {
    expect(validateIssueInput({ title: "" })).toMatchObject({
      valid: false,
      fieldErrors: { title: "Issue title is required." },
    });

    expect(
      validateIssueInput({
        title: "Bad status",
        status: "stuck",
      }),
    ).toMatchObject({
      valid: false,
      fieldErrors: { status: "Invalid status value." },
    });

    expect(
      validateIssueInput({
        title: "Bad priority",
        priority: "urgent",
      }),
    ).toMatchObject({
      valid: false,
      fieldErrors: { priority: "Invalid priority value." },
    });
  });
});
