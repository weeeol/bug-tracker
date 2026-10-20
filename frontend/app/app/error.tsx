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
        className="rounded-xl border border-rose-400/40 bg-rose-950/30 p-6"
      >
        <h1 className="text-xl font-semibold text-white">
          We could not load this workspace
        </h1>
        <p className="mt-2 text-sm text-rose-100">
          Something went wrong while loading the requested data. Please try
          again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md bg-sky-400 px-4 py-2 font-semibold text-slate-950"
        >
          Try again
        </button>
      </section>
    </div>
  );
}
