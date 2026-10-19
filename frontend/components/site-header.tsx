import React from "react";
import Link from "next/link";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/app", label: "Workspace preview" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          className="rounded text-lg font-semibold tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          href="/"
        >
          Bug Tracker
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap items-center justify-end gap-2 text-sm">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="rounded-md px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                className="rounded-md bg-sky-400 px-3 py-2 font-medium text-slate-950 hover:bg-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                href="/auth/sign-in"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
