"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type AppTheme = "dark" | "light";

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = "balekerta_theme";
const MAP_STORAGE_KEY = "balekerta_map_theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>("dark");

  const applyHtmlTheme = useCallback((nextTheme: AppTheme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(nextTheme);
    root.style.colorScheme = nextTheme;
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
        applyHtmlTheme(saved);
      } else {
        applyHtmlTheme("dark");
      }
    } catch {
      applyHtmlTheme("dark");
    }
  }, [applyHtmlTheme]);

  const setTheme = useCallback(
    (nextTheme: AppTheme) => {
      setThemeState(nextTheme);
      applyHtmlTheme(nextTheme);
      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
        localStorage.setItem(MAP_STORAGE_KEY, nextTheme);
      } catch {
        // Ignore storage errors in restricted environments
      }
    },
    [applyHtmlTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
