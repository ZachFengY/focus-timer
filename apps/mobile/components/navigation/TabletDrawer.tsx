import { useColors } from "@focusflow/ui";
import { type ReactNode } from "react";
import { View } from "react-native";

/**
 * Side drawer navigation for tablet form factor (768–1279px).
 * TODO: implement collapsible drawer with gesture support.
 */
export function TabletDrawer({ children }: { children: ReactNode }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <View
        style={{
          width: 240,
          backgroundColor: c("bg-card"),
          borderRightWidth: 1,
          borderRightColor: c("border-subtle"),
        }}
      >
        {/* Sidebar nav items — same as PhoneTabBar but vertical */}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
