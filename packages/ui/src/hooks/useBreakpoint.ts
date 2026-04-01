import { useWindowDimensions } from "react-native";

/**
 * Responsive breakpoints — mirrors Tailwind's default scale.
 * Design targets:
 *   phone    (xs/sm) : 0–767px   → tab bar nav, single column
 *   tablet   (md/lg) : 768–1279px → sidebar nav, two columns
 *   desktop  (xl+)   : 1280px+   → full sidebar, three columns
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

export interface BreakpointInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;

  // Semantic helpers
  isPhone: boolean; // < 768
  isTablet: boolean; // 768–1279
  isDesktop: boolean; // >= 1280

  // Orientation
  isLandscape: boolean;
  isPortrait: boolean;

  // Navigation strategy
  navType: "tabbar" | "drawer" | "sidebar";

  // Layout columns
  columns: 1 | 2 | 3;
}

export function useBreakpoint(): BreakpointInfo {
  const { width, height } = useWindowDimensions();
  const bp = getBreakpoint(width);

  const isPhone = width < BREAKPOINTS.md;
  const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.xl;
  const isDesktop = width >= BREAKPOINTS.xl;

  return {
    width,
    height,
    breakpoint: bp,
    isPhone,
    isTablet,
    isDesktop,
    isLandscape: width > height,
    isPortrait: height >= width,
    navType: isPhone ? "tabbar" : isTablet ? "drawer" : "sidebar",
    columns: isPhone ? 1 : isTablet ? 2 : 3,
  };
}

/**
 * Returns a value based on the current breakpoint.
 * Usage: const padding = useResponsiveValue({ base: 16, md: 24, xl: 32 })
 */
export function useResponsiveValue<T>(
  values: Partial<Record<Breakpoint | "base", T>>,
): T {
  const { breakpoint } = useBreakpoint();
  const order: (Breakpoint | "base")[] = [
    "2xl",
    "xl",
    "lg",
    "md",
    "sm",
    "xs",
    "base",
  ];

  const currentIndex = order.indexOf(breakpoint);
  for (let i = currentIndex; i < order.length; i++) {
    const key = order[i];
    if (key && key in values) return values[key] as T;
  }

  return values.base as T;
}
