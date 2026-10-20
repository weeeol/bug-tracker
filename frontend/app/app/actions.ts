"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateIssueInput, type IssueFieldErrors } from "@/lib/issue-validation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type ActionState = {
  error?: string;
  message?: string;
  fieldErrors?: IssueFieldErrors;
};

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getCurrentUser() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/app");
  }

  return { supabase, user };
}

export async function createOrganization(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = toSlug(String(formData.get("slug") || name));

  if (name.length < 1 || name.length > 120 || !slug) {
    return { error: "Enter an organization name and a valid slug." };
  }

  const { supabase, user } = await getCurrentUser();
  const { data, error } = await supabase
    .from("organizations")
    .insert({ name, slug, created_by: user.id })
    .select("slug")
    .single();

  if (error || !data) {
    return { error: "We could not create that organization. Try another slug." };
  }

  revalidatePath("/app");
  redirect(`/app/${data.slug}/projects`);
}

export async function createProject(
  organizationSlug: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = toSlug(String(formData.get("slug") || name));

  if (name.length < 1 || name.length > 120 || !slug) {
    return { error: "Enter a project name and a valid slug." };
  }

  const { supabase, user } = await getCurrentUser();
  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", organizationSlug)
    .maybeSingle();

  if (!organization) {
    return { error: "Organization not found or access was denied." };
  }

  const { error } = await supabase.from("projects").insert({
    organization_id: organization.id,
    name,
    slug,
    created_by: user.id,
  });

  if (error) {
    return { error: "We could not create that project. Try another slug." };
  }

  revalidatePath(`/app/${organizationSlug}/projects`);
  return { message: "Project created." };
}

export async function updateProject(
  organizationSlug: string,
  projectId: string,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = toSlug(String(formData.get("slug") || name));

  if (!name || name.length > 120 || !slug) {
    return;
  }

  const { supabase } = await getCurrentUser();
  await supabase
    .from("projects")
    .update({ name, slug })
    .eq("id", projectId);
  revalidatePath(`/app/${organizationSlug}/projects`);
}

export async function archiveProject(
  organizationSlug: string,
  projectId: string,
) {
  const { supabase } = await getCurrentUser();
  await supabase
    .from("projects")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", projectId);
  revalidatePath(`/app/${organizationSlug}/projects`);
}

export async function updateMemberRole(
  organizationSlug: string,
  profileId: string,
  formData: FormData,
) {
  const role = String(formData.get("role") ?? "");
  if (role !== "owner" && role !== "member") {
    return;
  }

  const { supabase } = await getCurrentUser();
  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", organizationSlug)
    .maybeSingle();

  if (!organization) {
    return;
  }

  await supabase
    .from("organization_members")
    .update({ role })
    .eq("organization_id", organization.id)
    .eq("profile_id", profileId);
  revalidatePath(`/app/${organizationSlug}/projects`);
}

async function getOrganizationProject(
  supabase: Awaited<ReturnType<typeof getServerSupabaseClient>>,
  organizationSlug: string,
  projectId: string,
) {
  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", organizationSlug)
    .maybeSingle();

  if (!organization) {
    return { organization: null, project: null };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, organization_id, archived_at")
    .eq("organization_id", organization.id)
    .eq("id", projectId)
    .maybeSingle();

  return { organization, project };
}

export async function createIssue(
  organizationSlug: string,
  projectId: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await getCurrentUser();
  const { organization, project } = await getOrganizationProject(
    supabase,
    organizationSlug,
    projectId,
  );

  if (!organization || !project) {
    return { error: "Project not found or access was denied." };
  }

  if (project.archived_at) {
    return { error: "The project is archived and cannot accept new issues." };
  }

  const issueInput = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "open"),
    priority: String(formData.get("priority") ?? "medium"),
    assigneeId: String(formData.get("assigneeId") ?? "").trim() || null,
  };

  const validated = validateIssueInput(issueInput);
  if (!validated.valid) {
    return { error: validated.message, fieldErrors: validated.fieldErrors };
  }

  if (validated.assigneeId) {
    const { data: member } = await supabase
      .from("organization_members")
      .select("profile_id")
      .eq("organization_id", organization.id)
      .eq("profile_id", validated.assigneeId)
      .maybeSingle();

    if (!member) {
      return {
        error: "Review the highlighted issue fields.",
        fieldErrors: {
          assigneeId: "Assignee must be a member of this organization.",
        },
      };
    }
  }

  const { error } = await supabase.from("issues").insert({
    organization_id: organization.id,
    project_id: project.id,
    reporter_id: user.id,
    assignee_id: validated.assigneeId,
    title: validated.title,
    description: validated.description,
    status: validated.status,
    priority: validated.priority,
  });

  if (error) {
    return { error: "We could not create that issue. Check the inputs and try again." };
  }

  revalidatePath(`/app/${organizationSlug}/projects/${projectId}`);
  revalidatePath(`/app/${organizationSlug}/projects`);
  return { message: "Issue created." };
}

export async function updateIssue(
  organizationSlug: string,
  projectId: string,
  issueId: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await getCurrentUser();
  const { organization, project } = await getOrganizationProject(
    supabase,
    organizationSlug,
    projectId,
  );

  if (!organization || !project) {
    return { error: "Project not found or access was denied." };
  }

  if (project.archived_at) {
    return { error: "The project is archived and cannot be edited." };
  }

  const { data: issue } = await supabase
    .from("issues")
    .select("id, project_id, organization_id")
    .eq("id", issueId)
    .eq("organization_id", organization.id)
    .eq("project_id", project.id)
    .maybeSingle();

  if (!issue) {
    return { error: "Issue not found in this project." };
  }

  const issueInput = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "open"),
    priority: String(formData.get("priority") ?? "medium"),
    assigneeId: String(formData.get("assigneeId") ?? "").trim() || null,
  };

  const validated = validateIssueInput(issueInput);
  if (!validated.valid) {
    return { error: validated.message, fieldErrors: validated.fieldErrors };
  }

  if (validated.assigneeId) {
    const { data: member } = await supabase
      .from("organization_members")
      .select("profile_id")
      .eq("organization_id", organization.id)
      .eq("profile_id", validated.assigneeId)
      .maybeSingle();

    if (!member) {
      return {
        error: "Review the highlighted issue fields.",
        fieldErrors: {
          assigneeId: "Assignee must be a member of this organization.",
        },
      };
    }
  }

  const { error } = await supabase
    .from("issues")
    .update({
      title: validated.title,
      description: validated.description,
      status: validated.status,
      priority: validated.priority,
      assignee_id: validated.assigneeId,
    })
    .eq("id", issueId)
    .eq("organization_id", organization.id)
    .eq("project_id", project.id);

  if (error) {
    return { error: "We could not update the issue details." };
  }

  revalidatePath(`/app/${organizationSlug}/issues/${issueId}`);
  revalidatePath(`/app/${organizationSlug}/projects/${projectId}`);
  return { message: "Issue updated." };
}

export async function addIssueComment(
  organizationSlug: string,
  issueId: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const body = String(formData.get("body") ?? "").trim();
  if (!body || body.length > 5000) {
    return {
      error: "Comment must contain between 1 and 5000 characters.",
    };
  }

  const { supabase, user } = await getCurrentUser();
  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", organizationSlug)
    .maybeSingle();

  if (!organization) {
    return { error: "Organization not found or access was denied." };
  }

  const { data: issue } = await supabase
    .from("issues")
    .select("id, organization_id, project_id")
    .eq("id", issueId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (!issue) {
    return { error: "Issue not found in this organization." };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("archived_at")
    .eq("organization_id", organization.id)
    .eq("id", issue.project_id)
    .maybeSingle();

  if (project?.archived_at) {
    return { error: "Archived project issues are read-only." };
  }

  const { error } = await supabase.from("issue_comments").insert({
    organization_id: organization.id,
    issue_id: issue.id,
    author_id: user.id,
    body,
  });

  if (error) {
    return { error: "We could not post that comment. Try again." };
  }

  revalidatePath(`/app/${organizationSlug}/issues/${issueId}`);
  return { message: "Comment posted." };
}
