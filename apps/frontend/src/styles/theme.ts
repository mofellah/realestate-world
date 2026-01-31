/**
 * Theme Color Palette
 * Defines colors for light and dark themes
 */

export const colorSchemes = {
  light: {
    primary: "#3b82f6",
    primaryDark: "#1e40af",
    primaryLight: "#dbeafe",
    error: "#ef4444",
    errorDark: "#dc2626",
    success: "#10b981",
    successDark: "#059669",
    warning: "#f59e0b",
    warningDark: "#d97706",
    text: "#1f2937",
    textLight: "#6b7280",
    textLighter: "#9ca3af",
    bg: "#ffffff",
    bgLight: "#f9fafb",
    bgLighter: "#f3f4f6",
    border: "#e5e7eb",
    borderLight: "#f3f4f6",
    shadow: "rgba(0, 0, 0, 0.1)",
    shadowDark: "rgba(0, 0, 0, 0.2)",
  },
  dark: {
    primary: "#60a5fa",
    primaryDark: "#3b82f6",
    primaryLight: "#1e3a8a",
    error: "#f87171",
    errorDark: "#ef4444",
    success: "#34d399",
    successDark: "#10b981",
    warning: "#fbbf24",
    warningDark: "#f59e0b",
    text: "#f3f4f6",
    textLight: "#d1d5db",
    textLighter: "#9ca3af",
    bg: "#111827",
    bgLight: "#1f2937",
    bgLighter: "#374151",
    border: "#4b5563",
    borderLight: "#374151",
    shadow: "rgba(0, 0, 0, 0.3)",
    shadowDark: "rgba(0, 0, 0, 0.5)",
  },
};

export type ColorScheme = keyof typeof colorSchemes;

/**
 * Get color from current theme
 */
export function getThemeColor(
  theme: "light" | "dark",
  colorName: keyof typeof colorSchemes.light,
): string {
  return colorSchemes[theme][colorName as any];
}

/**
 * Theme configuration object
 */
export const themeConfig = {
  breakpoints: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  spacing: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    32: "8rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    base: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },
  transitions: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
  },
};
