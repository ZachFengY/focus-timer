import { useColors } from "@focusflow/ui";
import { Pressable, Text, View } from "react-native";

import { useTimerStore } from "../../stores/timerStore";

export function ModeToggle() {
  const c = useColors();
  const { mode, setMode, status } = useTimerStore();
  const disabled = status !== "idle";

  return (
    <View
      style={{
        flexDirection: "row",
        padding: 4,
        gap: 4,
        borderRadius: 100,
        backgroundColor: c("bg-elevated"),
        borderWidth: 1,
        borderColor: c("border-subtle"),
      }}
    >
      {(["countup", "countdown"] as const).map((m) => {
        const isActive = mode === m;
        return (
          <Pressable
            key={m}
            onPress={() => !disabled && setMode(m)}
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
                fontWeight: "600",
                color: isActive ? "#FFFFFF" : c("text-secondary"),
                fontFamily: "DMSans-SemiBold",
              }}
            >
              {m === "countup" ? "正计时" : "倒计时"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
