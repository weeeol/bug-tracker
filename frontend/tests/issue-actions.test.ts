import { beforeEach, describe, expect, it, vi } from "vitest";
import { addIssueComment, createIssue, updateIssue } from "@/app/app/actions";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type SupabaseClientForTest = Awaited<ReturnType<typeof getServerSupabaseClient>>;

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseClient: vi.fn(),
}));

type Scenario = {
  organization: { id: string } | null;
  project: { id: string; organization_id: string; archived_at: string | null } | null;
  issue: { id: string; project_id: string; organization_id: string } | null;
  member: { profile_id: string } | null;
  inserted?: Record<string, unknown>;
  updated?: Record<string, unknown>;
};

type QueryResult = { data: unknown; error: null };
type Query = PromiseLike<QueryResult> & {
  select: () => Query;
  eq: () => Query;
  maybeSingle: () => Promise<QueryResult>;
  insert: (values: Record<string, unknown>) => Promise<QueryResult>;
  update: (values: Record<string, unknown>) => Query;
};

function createSupabaseMock(scenario: Scenario): SupabaseClientForTest {
  const resultForTable = (table: string): QueryResult => {
    if (table === "organizations") return { data: scenario.organization, error: null };
    if (table === "projects") return { data: scenario.project, error: null };
    if (table === "issues") return { data: scenario.issue, error: null };
    if (table === "organization_members") return { data: scenario.member, error: null };
    return { data: null, error: null };
  };

  const from = (table: string): Query => {
    const query = {
      select: () => query,
      eq: () => query,
      maybeSingle: () => Promise.resolve(resultForTable(table)),
      insert: (values: Record<string, unknown>) => {
        scenario.inserted = values;
        return Promise.resolve({ data: null, error: null });
      },
      update: (values: Record<string, unknown>) => {
        scenario.updated = values;
        return query;
      },
      then: <TResult1 = QueryResult, TResult2 = never>(
        onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
      ) => Promise.resolve(resultForTable(table)).then(onfulfilled, onrejected),
    };
    return query;
  };

  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "reporter-1" } } }),
    },
    from,
  } as unknown as SupabaseClientForTest;
}

function issueFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("title", overrides.title ?? "Broken report");
  formData.set("description", overrides.description ?? "Something is wrong.");
  formData.set("status", overrides.status ?? "open");
  formData.set("priority", overrides.priority ?? "medium");
  formData.set("assigneeId", overrides.assigneeId ?? "");
  return formData;
}

describe("issue server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an issue with the route project and organization", async () => {
    const scenario: Scenario = {
      organization: { id: "org-1" },
      project: { id: "project-1", organization_id: "org-1", archived_at: null },
      issue: null,
      member: { profile_id: "assignee-1" },
    };
    vi.mocked(getServerSupabaseClient).mockResolvedValue(
      createSupabaseMock(scenario),
    );

    const result = await createIssue(
      "org-one",
      "project-1",
      {},
      issueFormData({ assigneeId: "assignee-1" }),
    );

    expect(result).toEqual({ message: "Issue created." });
    expect(scenario.inserted).toMatchObject({
      organization_id: "org-1",
      project_id: "project-1",
      reporter_id: "reporter-1",
      assignee_id: "assignee-1",
    });
  });

  it("rejects invalid mutation values with field errors", async () => {
    const scenario: Scenario = {
      organization: { id: "org-1" },
      project: { id: "project-1", organization_id: "org-1", archived_at: null },
      issue: null,
      member: null,
    };
    vi.mocked(getServerSupabaseClient).mockResolvedValue(
      createSupabaseMock(scenario),
    );

    const result = await createIssue(
      "org-one",
      "project-1",
      {},
      issueFormData({ status: "not-a-status" }),
    );

    expect(result).toMatchObject({
      error: "Review the highlighted issue fields.",
      fieldErrors: { status: "Invalid status value." },
    });
    expect(scenario.inserted).toBeUndefined();
  });

  it("rejects updates for archived projects and cross-tenant projects", async () => {
    const archivedScenario: Scenario = {
      organization: { id: "org-1" },
      project: { id: "project-1", organization_id: "org-1", archived_at: "2026-01-01" },
      issue: { id: "issue-1", project_id: "project-1", organization_id: "org-1" },
      member: null,
    };
    vi.mocked(getServerSupabaseClient).mockResolvedValue(
      createSupabaseMock(archivedScenario),
    );

    const archivedResult = await updateIssue(
      "org-one",
      "project-1",
      "issue-1",
      {},
      issueFormData(),
    );

    expect(archivedResult).toEqual({
      error: "The project is archived and cannot be edited.",
    });
    expect(archivedScenario.updated).toBeUndefined();

    const isolatedScenario: Scenario = {
      organization: { id: "org-1" },
      project: null,
      issue: null,
      member: null,
    };
    vi.mocked(getServerSupabaseClient).mockResolvedValue(
      createSupabaseMock(isolatedScenario),
    );

    const isolatedResult = await createIssue(
      "org-one",
      "project-from-another-org",
      {},
      issueFormData(),
    );

    expect(isolatedResult).toEqual({
      error: "Project not found or access was denied.",
    });
    expect(isolatedScenario.inserted).toBeUndefined();

    const issueIsolationScenario: Scenario = {
      organization: { id: "org-1" },
      project: { id: "project-1", organization_id: "org-1", archived_at: null },
      issue: null,
      member: null,
    };
    vi.mocked(getServerSupabaseClient).mockResolvedValue(
      createSupabaseMock(issueIsolationScenario),
    );

    const issueIsolationResult = await updateIssue(
      "org-one",
      "project-1",
      "issue-from-another-org",
      {},
      issueFormData(),
    );

    expect(issueIsolationResult).toEqual({
      error: "Issue not found in this project.",
    });
    expect(issueIsolationScenario.updated).toBeUndefined();
  });

  it("creates comments only for an issue in the requested organization", async () => {
    const scenario: Scenario = {
      organization: { id: "org-1" },
      project: { id: "project-1", organization_id: "org-1", archived_at: null },
      issue: { id: "issue-1", project_id: "project-1", organization_id: "org-1" },
      member: null,
    };
    vi.mocked(getServerSupabaseClient).mockResolvedValue(
      createSupabaseMock(scenario),
    );

    const formData = new FormData();
    formData.set("body", "This is safe plain text.");
    const result = await addIssueComment("org-one", "issue-1", {}, formData);

    expect(result).toEqual({ message: "Comment posted." });
    expect(scenario.inserted).toMatchObject({
      organization_id: "org-1",
      issue_id: "issue-1",
      author_id: "reporter-1",
      body: "This is safe plain text.",
    });

    const isolatedScenario: Scenario = {
      organization: { id: "org-1" },
      project: null,
      issue: null,
      member: null,
    };
    vi.mocked(getServerSupabaseClient).mockResolvedValue(
      createSupabaseMock(isolatedScenario),
    );

    const isolatedFormData = new FormData();
    isolatedFormData.set("body", "Should not be visible across tenants.");
    const isolatedResult = await addIssueComment(
      "org-one",
      "issue-from-another-org",
      {},
      isolatedFormData,
    );

    expect(isolatedResult).toEqual({
      error: "Issue not found in this organization.",
    });
    expect(isolatedScenario.inserted).toBeUndefined();
  });
});
