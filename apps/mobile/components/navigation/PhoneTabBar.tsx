import { useColors } from "@focusflow/ui";
import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

const TABS = [
  { href: "/(app)", label: "计时", icon: "timer" },
  { href: "/(app)/stats", label: "统计", icon: "activity" },
  { href: "/(app)/calendar", label: "日历", icon: "calendar" },
  { href: "/(app)/goals", label: "目标", icon: "target" },
  { href: "/(app)/settings", label: "设置", icon: "user" },
] as const;

/**
 * Pill-style tab bar — matches the Pencil design exactly.
 * Only rendered on phones (< 768px). See AppLayout for routing.
 */
export function PhoneTabBar() {
  const c = useColors();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={{
        backgroundColor: c("bg-page"),
        paddingTop: 12,
        paddingHorizontal: 21,
        paddingBottom: 21,
      }}
    >
      {/* Pill container */}
      <View
        style={{
          height: 62,
          borderRadius: 36,
          backgroundColor: c("bg-elevated"),
          borderWidth: 1,
          borderColor: c("border-subtle"),
          flexDirection: "row",
          padding: 4,
        }}
      >
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Pressable
              key={tab.href}
              onPress={() => router.push(tab.href)}
              style={{
                flex: 1,
                borderRadius: 26,
                backgroundColor: isActive ? c("accent-indigo") : "transparent",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {/* Icon placeholder — replace with actual Lucide RN icons */}
              <View style={{ width: 18, height: 18 }} />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                  color: isActive ? "#FFFFFF" : c("text-tertiary"),
                  fontFamily: "Inter",
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
