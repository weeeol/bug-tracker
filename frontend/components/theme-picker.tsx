"use client";

import React from "react";
import { useTheme, type Theme } from "./theme-provider";

const themes: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "retro", label: "Retro dev" },
];

export function ThemePicker({ label = "Theme" }: { label?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
      {label}
      <select
        aria-label="Theme"
        value={theme}
        onChange={(event) => setTheme(event.target.value as Theme)}
        className="rounded border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[var(--ink)]"
      >
        {themes.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
