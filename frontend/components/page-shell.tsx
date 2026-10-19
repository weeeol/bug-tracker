import type { ReactNode } from "react";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import { SiteHeader } from "./site-header";

export async function PageShell({ children }: { children: ReactNode }) {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader isAuthenticated={Boolean(user)} />
      <main>{children}</main>
    </div>
  );
}
