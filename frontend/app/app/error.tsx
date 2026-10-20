"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <section
        role="alert"
        className="border border-[var(--danger)] bg-[var(--danger-surface)] p-6"
      >
        <h1 className="text-xl font-bold">
          We could not load this workspace
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Something went wrong while loading the requested data. Please try
          again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded bg-[var(--accent)] px-4 py-2 font-semibold text-[var(--page)]"
        >
          Try again
        </button>
      </section>
    </div>
  );
}
