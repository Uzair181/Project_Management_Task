"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  toggle: () => void;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeCtx = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => undefined,
  setTheme: () => undefined,
});

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("theme");
    const initial = isThemeMode(stored)
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    setThemeState(initial);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = (nextTheme: ThemeMode) => setThemeState(nextTheme);
  const toggle = () => setThemeState((current) => (current === "light" ? "dark" : "light"));

  return <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
