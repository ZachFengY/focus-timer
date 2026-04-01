import { useColors } from "@focusflow/ui";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Renders the current route's page inside the adaptive navigation layout.
 * Uses Expo Router's <Slot /> as the page placeholder.
 */
export function AppContent({ className: _className }: { className?: string }) {
  const c = useColors();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: c("bg-page") }}
      edges={["top"]}
    >
      <Slot />
    </SafeAreaView>
  );
}
