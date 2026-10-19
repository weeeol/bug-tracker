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
      ? "border-rose-400/40 bg-rose-950/30 text-rose-100"
      : "border-slate-700 bg-slate-900/70 text-slate-300";

  return (
    <section
      aria-labelledby="state-panel-title"
      className={`rounded-xl border p-6 ${borderClass}`}
    >
      <h2 id="state-panel-title" className="text-lg font-semibold text-white">
        {title}
      </h2>
      <div className="mt-2 text-sm leading-6">{children}</div>
    </section>
  );
}
