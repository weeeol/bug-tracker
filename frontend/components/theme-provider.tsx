"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "retro";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: "light", setTheme: () => undefined });

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("bug-tracker-theme") as Theme | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const initialTheme =
      stored === "light" || stored === "dark" || stored === "retro"
        ? stored
        : systemTheme;
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);
    localStorage.setItem("bug-tracker-theme", nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
