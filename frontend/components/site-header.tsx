import React from "react";
import Link from "next/link";
import { BugTrackerLogo } from "./bug-tracker-logo";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <BugTrackerLogo />
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap items-center justify-end gap-2 text-sm">
            <li>
              <Link
                className="rounded px-3 py-2 font-semibold hover:bg-[var(--surface-muted)]"
                href="/auth/sign-in"
              >
                Sign in
              </Link>
            </li>
            <li>
              <Link
                className="rounded bg-[var(--accent)] px-3 py-2 font-semibold text-[var(--page)] hover:bg-[var(--accent-strong)]"
                href="/auth/sign-up"
              >
                Sign up
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
