import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
