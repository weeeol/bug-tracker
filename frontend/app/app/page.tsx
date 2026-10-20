import Link from "next/link";
import { redirect } from "next/navigation";
import { OrganizationForm } from "@/components/organization-form";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemePicker } from "@/components/theme-picker";
import { BugTrackerLogo } from "@/components/bug-tracker-logo";
import { signOut } from "@/app/auth/actions";
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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-8">
            <BugTrackerLogo />
          </div>
          <p className="retro-detail text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Workspace
          </p>
          <h1 className="mt-3 text-4xl font-bold">Your organizations</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ThemePicker />
          <SignOutButton action={signOut} />
        </div>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Organizations</h2>
          {organizations?.length ? (
            <ul className="mt-4 space-y-3">
              {organizations.map((organization) => (
                <li key={organization.slug}>
                  <Link
                    className="text-[var(--accent)] underline"
                    href={`/app/${organization.slug}/projects`}
                  >
                    {organization.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">
              You do not belong to an organization yet.
            </p>
          )}
        </section>
        <section className="border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Create one</h2>
          <div className="mt-4">
            <OrganizationForm />
          </div>
        </section>
      </div>
    </div>
  );
}
