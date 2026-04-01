import { useColors } from "@focusflow/ui";
import { View, Text } from "react-native";

/**
 * Persistent sidebar for desktop / large screen (≥ 1280px).
 * Shows label + icon in a full-height column.
 */
export function DesktopSidebar() {
  const c = useColors();
  return (
    <View
      style={{
        width: 280,
        backgroundColor: c("bg-card"),
        borderRightWidth: 1,
        borderRightColor: c("border-subtle"),
        paddingTop: 48,
        paddingHorizontal: 16,
      }}
    >
      <Text
        style={{
          fontFamily: "Fraunces-SemiBold",
          fontSize: 22,
          color: c("text-primary"),
          marginBottom: 32,
          paddingLeft: 12,
        }}
      >
        FocusFlow
      </Text>
      {/* Nav items */}
    </View>
  );
}
