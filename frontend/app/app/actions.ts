"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type ActionState = { error?: string; message?: string };

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
