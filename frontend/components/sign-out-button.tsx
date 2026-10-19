"use client";

import { useFormStatus } from "react-dom";

function SignOutSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      type="submit"
      disabled={pending}
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}

export function SignOutButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <SignOutSubmit />
    </form>
  );
}
