import Link from "next/link";
import { redirect } from "next/navigation";
import { StatePanel } from "@/components/state-panel";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function WorkspacePage() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/app");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
        Workspace
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Choose an organization</h1>
      <div className="mt-8">
        <StatePanel title="No organization selected">
          <p>
            Organization data will be loaded after authentication and database
            setup. This protected-route placeholder has no auth bypass.
          </p>
          <Link className="mt-4 inline-block text-sky-300 underline hover:text-sky-200" href="/">
            Return to the public landing page
          </Link>
        </StatePanel>
      </div>
    </div>
  );
}
