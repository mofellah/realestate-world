/**
 * Theme Context
 * Manages application theme (light/dark) and provides theme utilities
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  });

  // Apply theme to DOM and localStorage
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
