import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ThemeProvider } from "@/components/theme-provider";
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
        <ThemeProvider>
          <PageShell>{children}</PageShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
