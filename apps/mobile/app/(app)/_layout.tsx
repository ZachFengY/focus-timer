import { useBreakpoint } from "@focusflow/ui";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppContent } from "../../components/navigation/AppContent";
import { DesktopSidebar } from "../../components/navigation/DesktopSidebar";
import { PhoneTabBar } from "../../components/navigation/PhoneTabBar";
import { TabletDrawer } from "../../components/navigation/TabletDrawer";
import { useAuth } from "../../hooks/useAuth";

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const { navType } = useBreakpoint();

  if (isLoading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  return (
    <SafeAreaProvider>
      {navType === "tabbar" && (
        <View style={{ flex: 1 }}>
          <AppContent />
          <PhoneTabBar />
        </View>
      )}
      {navType === "drawer" && (
        <TabletDrawer>
          <AppContent />
        </TabletDrawer>
      )}
      {navType === "sidebar" && (
        <View style={{ flexDirection: "row", flex: 1 }}>
          <DesktopSidebar />
          <AppContent />
        </View>
      )}
    </SafeAreaProvider>
  );
}
