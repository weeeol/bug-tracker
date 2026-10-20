import type { ReactNode } from "react";

type StatePanelProps = {
  title: string;
  children: ReactNode;
  tone?: "neutral" | "error";
};

export function StatePanel({
  title,
  children,
  tone = "neutral",
}: StatePanelProps) {
  const borderClass =
    tone === "error"
      ? "border-[var(--danger)] bg-[var(--danger-surface)] text-[var(--ink)]"
      : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]";

  return (
    <section
      aria-labelledby="state-panel-title"
      className={`rounded-xl border p-6 ${borderClass}`}
    >
      <h2 id="state-panel-title" className="text-lg font-semibold text-[var(--ink)]">
        {title}
      </h2>
      <div className="mt-2 text-sm leading-6">{children}</div>
    </section>
  );
}
