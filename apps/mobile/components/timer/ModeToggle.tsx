import { useColors, useColorMode } from "@focusflow/ui";
import { Pressable, Text, View } from "react-native";

import { useTimerStore } from "../../stores/timerStore";

export function ModeToggle() {
  const c = useColors();
  const colorMode = useColorMode();
  const { mode, setMode, status, stop } = useTimerStore();
  // dark: bg-card (#16161A) · light: bg-elevated (#EEEEF3) — per Pencil design
  const containerBg = colorMode === "dark" ? c("bg-card") : c("bg-elevated");

  const handlePress = (m: "countup" | "countdown") => {
    if (m === mode) return;
    // If a session is running/paused, stop it before switching modes
    if (status !== "idle") stop();
    setMode(m);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        padding: 4,
        gap: 4,
        borderRadius: 100,
        backgroundColor: containerBg,
        borderWidth: 1,
        borderColor: c("border-subtle"),
      }}
    >
      {(["countup", "countdown"] as const).map((m) => {
        const isActive = mode === m;
        return (
          <Pressable
            key={m}
            onPress={() => handlePress(m)}
            style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
          >
            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: isActive ? c("accent-indigo") : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? "600" : "500",
                  color: isActive ? "#FFFFFF" : c("text-secondary"),
                }}
              >
                {m === "countup" ? "正计时" : "倒计时"}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
