import Link from "next/link";
import { redirect } from "next/navigation";
import { OrganizationForm } from "@/components/organization-form";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function WorkspacePage() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/app");
  }

  const { data: organizations } = await supabase
    .from("organizations")
    .select("name, slug")
    .order("name");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
        Workspace
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Your organizations</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Organizations</h2>
          {organizations?.length ? (
            <ul className="mt-4 space-y-3">
              {organizations.map((organization) => (
                <li key={organization.slug}>
                  <Link className="text-sky-300 underline" href={`/app/${organization.slug}/projects`}>
                    {organization.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-400">You do not belong to an organization yet.</p>
          )}
        </section>
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Create one</h2>
          <div className="mt-4"><OrganizationForm /></div>
        </section>
      </div>
    </div>
  );
}
