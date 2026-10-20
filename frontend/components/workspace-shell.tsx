"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { BugTrackerLogo } from "./bug-tracker-logo";
import { SignOutButton } from "./sign-out-button";
import { ThemePicker } from "./theme-picker";

type WorkspaceShellProps = {
  organizationSlug: string;
  organizationName: string;
  projects: { id: string; name: string }[];
  children: React.ReactNode;
};

export function WorkspaceShell({
  organizationSlug,
  organizationName,
  projects,
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navItems = [
    { href: `/app/${organizationSlug}`, label: "Overview" },
    { href: `/app/${organizationSlug}/projects`, label: "Projects" },
  ];

  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--ink)]">
      <div className="sticky top-0 z-50 flex min-h-[65px] items-center justify-between gap-4 border-b border-[var(--line)] bg-[var(--surface)] px-4 py-3 lg:px-6">
        <BugTrackerLogo href={`/app/${organizationSlug}`} />
        <div className="flex items-center gap-3">
          <ThemePicker label="Settings" />
          <SignOutButton action={signOut} />
          <button
            type="button"
            aria-label="Open workspace navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="rounded border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--ink)] lg:hidden"
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <button
          type="button"
          aria-label="Close workspace navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      ) : null}
      <aside
        ref={menuRef}
        aria-label="Workspace navigation"
        className={`fixed bottom-0 left-0 top-[65px] z-40 border-r border-[var(--line)] bg-[var(--surface)] transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-20" : "w-72"} lg:block`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
            <div className={collapsed ? "sr-only" : ""}>
              <p className="retro-detail text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Organization
              </p>
              <p className="mt-1 truncate font-semibold">{organizationName}</p>
            </div>
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((value) => !value)}
              className="hidden rounded border border-[var(--line)] px-2 py-1 text-xs lg:block"
            >
              {collapsed ? ">" : "<"}
            </button>
          </div>
          <nav className="mt-6" aria-label="Workspace sections">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href.endsWith("/projects") &&
                    pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={`block rounded px-3 py-2 text-sm font-semibold ${
                        active
                          ? "border-l-4 border-[var(--accent)] bg-[var(--surface-muted)]"
                          : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span className={collapsed ? "sr-only" : ""}>
                        {item.label}
                      </span>
                      {collapsed ? item.label.slice(0, 1) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {!collapsed ? (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">
                Projects
              </p>
              <ul className="mt-2 space-y-1">
                {projects.map((project) => (
                  <li key={project.id}>
                    {(() => {
                      const projectHref = `/app/${organizationSlug}/projects/${project.id}`;
                      const active = pathname === projectHref || pathname.startsWith(`${projectHref}/`);

                      return (
                        <Link
                          href={projectHref}
                          aria-current={active ? "page" : undefined}
                          className={`block rounded px-3 py-2 text-sm font-semibold ${
                            active
                              ? "border-l-4 border-[var(--accent)] bg-[var(--surface-muted)] text-[var(--ink)]"
                              : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {project.name}
                        </Link>
                      );
                    })()}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
      <main className={`min-w-0 ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        {children}
      </main>
    </div>
  );
}
