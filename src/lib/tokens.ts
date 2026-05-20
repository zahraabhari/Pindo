/**
 * Design tokens — single source for spacing, color, radius, z-index.
 * Prefer these over magic numbers in feature components.
 */
export const tokens = {
  color: {
    background: "#000000",
    foreground: "#ffffff",
    surface: {
      DEFAULT: "#18181b",
      elevated: "#27272a",
      muted: "rgba(255, 255, 255, 0.08)",
    },
    border: {
      subtle: "rgba(255, 255, 255, 0.06)",
      DEFAULT: "rgba(255, 255, 255, 0.1)",
    },
    accent: {
      primary: "#10b981",
      primaryMuted: "rgba(16, 185, 129, 0.3)",
      secondary: "#14b8a6",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
      muted: "rgba(255, 255, 255, 0.4)",
      inverse: "#000000",
    },
    semantic: {
      like: "#f43f5e",
      link: "rgba(125, 211, 252, 0.9)",
      success: "#10b981",
    },
    overlay: {
      scrim: "rgba(0, 0, 0, 0.6)",
      glass: "rgba(18, 18, 18, 0.72)",
    },
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
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.25rem",
    full: "9999px",
  },
  zIndex: {
    base: 0,
    sticky: 30,
    nav: 60,
    overlay: 50,
    modal: 50,
  },
  icon: {
    sm: 16,
    md: 20,
    lg: 24,
  },
  typography: {
    fontFamily: "var(--font-inter)",
  },
} as const;

export type TokenColor = keyof typeof tokens.color;
