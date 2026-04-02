/**
 * Type declarations for packages that don't have types hoisted in the pnpm workspace.
 */

// React Native web: localStorage is available when Platform.OS === "web"
declare var localStorage: {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

// Expo Metro polyfills process.env for EXPO_PUBLIC_* variables
declare var process: {
  env: Record<string, string | undefined>;
};
declare module "@expo/vector-icons" {
  import type { TextStyle } from "react-native";

  export type IconProps = {
    name?: string;
    size?: number;
    color?: string;
    style?: TextStyle;
    testID?: string;
  };

  export function Ionicons(props: IconProps): JSX.Element | null;
  export function MaterialIcons(props: IconProps): JSX.Element | null;
  export function FontAwesome(props: IconProps): JSX.Element | null;
  export function AntDesign(props: IconProps): JSX.Element | null;
  export function Feather(props: IconProps): JSX.Element | null;
  export function MaterialCommunityIcons(props: IconProps): JSX.Element | null;
}
