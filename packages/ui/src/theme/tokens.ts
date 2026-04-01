/**
 * Design Tokens — FocusFlow Design System v1.0
 * Matches the Pencil design file (pencil-new.pen)
 * Use via CSS variables: var(--color-bg-page)
 */

export const colorTokens = {
  // ── Backgrounds ─────────────────────────────────────────────────────────────
  "bg-page": {
    dark: "#0B0B0E",
    light: "#F4F4F8",
  },
  "bg-card": {
    dark: "#16161A",
    light: "#FFFFFF",
  },
  "bg-elevated": {
    dark: "#1A1A1E",
    light: "#EEEEF3",
  },

  // ── Text ─────────────────────────────────────────────────────────────────────
  "text-primary": {
    dark: "#FAFAF9",
    light: "#1A1A1E",
  },
  "text-secondary": {
    dark: "#6B6B70",
    light: "#6B6B70",
  },
  "text-tertiary": {
    dark: "#4A4A50",
    light: "#9E9EA5",
  },
  "text-muted": {
    dark: "#8E8E93",
    light: "#AEAEB2",
  },

  // ── Borders ──────────────────────────────────────────────────────────────────
  "border-subtle": {
    dark: "#2A2A2E",
    light: "#E5E5EA",
  },
  "border-strong": {
    dark: "#3A3A40",
    light: "#D1D1D6",
  },

  // ── Accent (same in both themes) ─────────────────────────────────────────────
  "accent-indigo": {
    dark: "#6366F1",
    light: "#6366F1",
  },
  "accent-indigo-muted": {
    dark: "#6366F133",
    light: "#6366F115",
  },
  "accent-green": {
    dark: "#32D583",
    light: "#22BB6E",
  },
  "accent-coral": {
    dark: "#E85A4F",
    light: "#E85A4F",
  },
  "accent-amber": {
    dark: "#FFB547",
    light: "#F59E0B",
  },
} as const;

export type ColorToken = keyof typeof colorTokens;
export type ColorMode = "dark" | "light";

// Spacing scale (px)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

// Border radius scale
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 36,
  full: 9999,
} as const;

// Typography
export const typography = {
  fonts: {
    display: "Fraunces", // headers
    body: "DM Sans", // content
    mono: "Inter", // tab labels, badges
  },
  sizes: {
    xs: 10,
    sm: 11,
    base: 13,
    md: 15,
    lg: 18,
    xl: 22,
    "2xl": 28,
    "3xl": 36,
    "4xl": 40,
  },
  weights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

// Shadow presets
export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  accent: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  }),
} as const;
