import { Ionicons } from "@expo/vector-icons";
import { useColors, useColorMode } from "@focusflow/ui";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  {
    href: "/(app)",
    label: "计时",
    activeIcon: "timer" as const,
    inactiveIcon: "timer-outline" as const,
  },
  {
    href: "/(app)/stats",
    label: "统计",
    activeIcon: "analytics" as const,
    inactiveIcon: "analytics-outline" as const,
  },
  {
    href: "/(app)/calendar",
    label: "日历",
    activeIcon: "calendar" as const,
    inactiveIcon: "calendar-outline" as const,
  },
  {
    href: "/(app)/goals",
    label: "目标",
    activeIcon: "radio-button-on" as const,
    inactiveIcon: "radio-button-off" as const,
  },
  {
    href: "/(app)/settings",
    label: "设置",
    activeIcon: "person" as const,
    inactiveIcon: "person-outline" as const,
  },
] as const;

function TabItem({
  tab,
  isActive,
  onPress,
}: {
  tab: (typeof TABS)[number];
  isActive: boolean;
  onPress: () => void;
}) {
  const c = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.08 : 1,
      useNativeDriver: true,
      tension: 160,
      friction: 10,
    }).start();
  }, [isActive, scale]);

  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          borderRadius: 26,
          backgroundColor: isActive ? c("accent-indigo") : "transparent",
          ...(isActive
            ? {
                shadowColor: c("accent-indigo"),
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 8,
                elevation: 8,
              }
            : {}),
          gap: 4,
        }}
      >
        <Ionicons
          name={isActive ? tab.activeIcon : tab.inactiveIcon}
          size={isActive ? 20 : 18}
          color={isActive ? "#FFFFFF" : c("text-tertiary")}
        />
        <Text
          style={{
            fontSize: 10,
            fontWeight: isActive ? "700" : "500",
            letterSpacing: 0.5,
            color: isActive ? "#FFFFFF" : c("text-tertiary"),
          }}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Liquid-glass pill tab bar — adapts to dark / light color scheme.
 *
 * Dark mode:  charcoal frosted glass, white top-edge highlight
 * Light mode: white-grey frosted glass, black subtle top-edge
 */
export function PhoneTabBar() {
  const c = useColors();
  const mode = useColorMode();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Theme-aware glass values
  const isDark = mode === "dark";
  const glassBg = isDark
    ? "rgba(22, 22, 28, 0.96)"
    : "rgba(255, 255, 255, 0.97)";
  const shineLine = isDark
    ? "rgba(255, 255, 255, 0.14)"
    : "rgba(0, 0, 0, 0.07)";
  const borderColor = isDark
    ? "rgba(255, 255, 255, 0.09)"
    : "rgba(0, 0, 0, 0.08)";
  const shadowColor = isDark ? "#000000" : "#00000033";

  return (
    <View
      style={{
        backgroundColor: c("bg-page"),
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
      }}
    >
      <View
        style={{
          height: 64,
          borderRadius: 36,
          backgroundColor: glassBg,
          borderWidth: 1,
          borderColor,
          shadowColor,
          shadowOffset: { width: 0, height: isDark ? -2 : -1 },
          shadowOpacity: isDark ? 0.45 : 0.12,
          shadowRadius: isDark ? 16 : 10,
          elevation: isDark ? 20 : 8,
          flexDirection: "row",
          padding: 4,
          overflow: "hidden",
        }}
      >
        {/* Top-edge shine */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 48,
            right: 48,
            height: 1,
            borderRadius: 1,
            backgroundColor: shineLine,
          }}
          pointerEvents="none"
        />

        {TABS.map((tab) => {
          // Expo Router strips route groups from usePathname() output,
          // so "/(app)" becomes "/" and "/(app)/stats" becomes "/stats".
          const strip = (p: string) => p.replace(/^\/\([^)]+\)/, "") || "/";
          const normPath = strip(pathname);
          const normHref = strip(tab.href);
          const isActive =
            normPath === normHref ||
            (normHref !== "/" && normPath.startsWith(normHref));
          return (
            <TabItem
              key={tab.href}
              tab={tab}
              isActive={isActive}
              onPress={() => router.push(tab.href)}
            />
          );
        })}
      </View>
    </View>
  );
}
