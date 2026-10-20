"use client";

import React from "react";
import { useFormStatus } from "react-dom";

function SignOutSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)]"
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
