import type { ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { SiteHeader } from "./site-header";

export async function PageShell({ children }: { children: ReactNode }) {
  const user = isSupabaseConfigured()
    ? (await getServerSupabaseClient()).auth.getUser().then(({ data }) => data.user)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader isAuthenticated={Boolean(user)} />
      <main>{children}</main>
    </div>
  );
}
