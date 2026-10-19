import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bug Tracker",
  description: "A production-minded bug tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
