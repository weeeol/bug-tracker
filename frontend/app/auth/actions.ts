"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
};

const genericAuthError =
  "We could not complete that request. Check your details and try again.";

export async function signIn(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email address and password." };
  }

  const supabase = await getServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: genericAuthError };
  }

  redirect("/app");
}

export async function signUp(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email || password.length < 8 || !displayName) {
    return {
      error: "Enter your name, a valid email address, and a password of at least 8 characters.",
    };
  }

  const supabase = await getServerSupabaseClient();
  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const origin = host ? `${protocol}://${host}` : "http://localhost:3000";
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: genericAuthError };
  }

  return {
    message:
      "Account request received. Check your email for a confirmation link if confirmation is enabled.",
  };
}

export async function signOut() {
  const supabase = await getServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}
