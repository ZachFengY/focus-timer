/**
 * CountdownSetter — shown when mode=countdown and status=idle.
 *
 * Lets the user pick a target duration via:
 *   • Quick presets row (5m / 10m / 25m / 45m / 60m / 90m)
 *   • +/- minute buttons for fine-tuning
 */
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@focusflow/ui";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useTimerStore } from "../../stores/timerStore";

const PRESETS = [
  { label: "5m", seconds: 5 * 60 },
  { label: "10m", seconds: 10 * 60 },
  { label: "25m", seconds: 25 * 60 },
  { label: "45m", seconds: 45 * 60 },
  { label: "60m", seconds: 60 * 60 },
  { label: "90m", seconds: 90 * 60 },
];

export function CountdownSetter() {
  const c = useColors();
  const { targetSeconds, setTarget, status, mode } = useTimerStore();

  if (mode !== "countdown" || status !== "idle") return null;

  const currentMinutes = targetSeconds ? Math.floor(targetSeconds / 60) : 25;

  const adjust = (delta: number) => {
    const next = Math.max(1, currentMinutes + delta);
    setTarget(next * 60);
  };

  return (
    <View style={{ width: "100%", gap: 12 }}>
      {/* Fine-tune row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <Pressable
          onPress={() => adjust(-5)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: c("bg-elevated"),
            borderWidth: 1,
            borderColor: c("border-subtle"),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="remove" size={20} color={c("text-secondary")} />
        </Pressable>

        <View style={{ alignItems: "center", minWidth: 80 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: c("text-primary"),
              letterSpacing: -0.5,
            }}
          >
            {currentMinutes} 分钟
          </Text>
        </View>

        <Pressable
          onPress={() => adjust(5)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: c("bg-elevated"),
            borderWidth: 1,
            borderColor: c("border-subtle"),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="add" size={20} color={c("text-secondary")} />
        </Pressable>
      </View>

      {/* Preset chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
      >
        {PRESETS.map((p) => {
          const isSelected = targetSeconds === p.seconds;
          return (
            <Pressable
              key={p.label}
              onPress={() => setTarget(p.seconds)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 100,
                backgroundColor: isSelected
                  ? c("accent-indigo")
                  : c("bg-elevated"),
                borderWidth: 1,
                borderColor: isSelected
                  ? c("accent-indigo")
                  : c("border-subtle"),
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: isSelected ? "#FFFFFF" : c("text-secondary"),
                }}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
