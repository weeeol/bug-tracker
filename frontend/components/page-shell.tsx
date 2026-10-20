import type { ReactNode } from "react";
import { AppFrame } from "./app-frame";
import { SiteHeader } from "./site-header";

export async function PageShell({ children }: { children: ReactNode }) {
  return <AppFrame header={<SiteHeader />}>{children}</AppFrame>;
}
