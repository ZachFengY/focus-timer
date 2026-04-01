/**
 * TimerRing — circular progress display.
 * Web: pure React Native View (no Skia/Canvas dependency).
 * Native: upgrade to @shopify/react-native-skia for smooth 60fps.
 */
import { useColors } from "@focusflow/ui";
import { View, Text } from "react-native";

import { useTimerStore } from "../../stores/timerStore";

interface TimerRingProps {
  size: number;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function TimerRing({ size }: TimerRingProps) {
  const c = useColors();
  const { getElapsedSeconds, status, mode, targetSeconds } = useTimerStore();
  const elapsed = getElapsedSeconds();

  // Progress 0–1 for countdown, or just elapsed for countup
  const progress =
    mode === "countdown" && targetSeconds
      ? Math.min(elapsed / targetSeconds, 1)
      : 0;

  const displaySeconds =
    mode === "countdown" && targetSeconds
      ? Math.max(targetSeconds - elapsed, 0)
      : elapsed;

  const ringStroke = size * 0.09;
  const radius = (size - ringStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const _dashOffset = circumference * (1 - progress);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background ring */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ringStroke,
          borderColor: c("bg-elevated"),
        }}
      />
      {/* Active ring accent (simplified — full circle when running) */}
      {status !== "idle" && (
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: ringStroke,
            borderColor: c("accent-indigo"),
            borderTopColor:
              status === "paused" ? c("accent-amber") : c("accent-indigo"),
            opacity: 0.9,
          }}
        />
      )}
      {/* Time display */}
      <View style={{ alignItems: "center", gap: 6 }}>
        <Text
          style={{
            fontSize: size * 0.145,
            fontWeight: "700",
            color: c("text-primary"),
            letterSpacing: -1.2,
            fontVariant: ["tabular-nums"],
          }}
        >
          {formatTime(displaySeconds)}
        </Text>
        <Text style={{ fontSize: 13, color: c("text-secondary") }}>
          {status === "idle"
            ? "准备开始"
            : status === "running"
              ? "专注中"
              : status === "paused"
                ? "已暂停"
                : "完成"}
        </Text>
      </View>
    </View>
  );
}
