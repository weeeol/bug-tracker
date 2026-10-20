"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AppFrame({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const hasWorkspaceShell =
    pathname === "/app" || /^\/app\/[^/]+/.test(pathname);

  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--ink)]">
      {hasWorkspaceShell ? null : header}
      <main>{children}</main>
    </div>
  );
}
