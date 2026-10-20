import React from "react";
import Link from "next/link";

type BugTrackerLogoProps = {
  href?: string;
};

export function BugTrackerLogo({
  href = "/",
}: BugTrackerLogoProps) {
  return (
    <Link
      href={href}
      aria-label="Bug Tracker home"
      className="inline-flex rounded text-3xl font-extrabold tracking-[-0.04em]"
    >
      Bug Tracker
    </Link>
  );
}
