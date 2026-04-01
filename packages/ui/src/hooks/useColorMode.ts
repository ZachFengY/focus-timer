import { useColorScheme } from "react-native";

import { colorTokens } from "../theme/tokens";
import type { ColorToken, ColorMode } from "../theme/tokens";

export function useColorMode(): ColorMode {
  const scheme = useColorScheme();
  return scheme === "light" ? "light" : "dark";
}

/**
 * Returns a resolved color value for the current theme.
 * Usage: const bg = useColor('bg-card')
 */
export function useColor(token: ColorToken): string {
  const mode = useColorMode();
  return colorTokens[token][mode];
}

/**
 * Returns a resolver function — useful when you need multiple tokens.
 * Usage:
 *   const c = useColors()
 *   <View style={{ backgroundColor: c('bg-card'), borderColor: c('border-subtle') }} />
 */
export function useColors(): (token: ColorToken) => string {
  const mode = useColorMode();
  return (token: ColorToken) => colorTokens[token][mode];
}
