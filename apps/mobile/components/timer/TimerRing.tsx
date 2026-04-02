/**
 * TimerRing — circular timer display with real-time tick.
 *
 * Uses a setInterval to force re-render every second when running,
 * so the displayed time always stays current without drift.
 * Progress arc is approximated with rotating half-circle masks.
 */
import { useColors } from "@focusflow/ui";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { useTimerStore } from "../../stores/timerStore";

interface TimerRingProps {
  size: number;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

/** Arc progress using two rotating half-circle masks (0–1) */
function ArcProgress({
  size,
  progress,
  stroke,
  color,
  bgColor,
}: {
  size: number;
  progress: number; // 0 to 1
  stroke: number;
  color: string;
  bgColor: string;
}) {
  const r = size / 2;
  const p = Math.min(Math.max(progress, 0), 1);

  // First half covers 0-50% (left semicircle hidden, right revealed)
  // Second half covers 50-100%
  const firstDeg = p <= 0.5 ? p * 360 - 180 : 0;
  const secondDeg = p > 0.5 ? (p - 0.5) * 360 - 180 : -180;

  return (
    <View
      style={{ position: "absolute", width: size, height: size }}
      pointerEvents="none"
    >
      {/* Background ring */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: r,
          borderWidth: stroke,
          borderColor: bgColor,
        }}
      />

      {/* First half (0→50%) — rotates right side into view */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: r,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: r,
            height: size,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: size,
              height: size,
              borderRadius: r,
              borderWidth: stroke,
              borderColor: p > 0 ? color : "transparent",
              transform: [{ rotate: `${firstDeg}deg` }],
            }}
          />
        </View>
      </View>

      {/* Second half (50→100%) — visible only when p > 0.5 */}
      {p > 0.5 && (
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: r,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: r,
              height: size,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: size,
                height: size,
                borderRadius: r,
                borderWidth: stroke,
                borderColor: color,
                transform: [{ rotate: `${secondDeg}deg` }],
              }}
            />
          </View>
        </View>
      )}

      {/* Donut hole */}
      <View
        style={{
          position: "absolute",
          top: stroke,
          left: stroke,
          width: size - stroke * 2,
          height: size - stroke * 2,
          borderRadius: (size - stroke * 2) / 2,
          backgroundColor: "transparent",
        }}
      />
    </View>
  );
}

export function TimerRing({ size }: TimerRingProps) {
  const c = useColors();
  const { getElapsedSeconds, status, mode, targetSeconds } = useTimerStore();

  // Force re-render every second while running so elapsed time stays current
  const [, setTick] = useState(0);
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const elapsed = getElapsedSeconds();

  const progress =
    mode === "countdown" && targetSeconds && targetSeconds > 0
      ? Math.min(elapsed / targetSeconds, 1)
      : 0;

  const displaySeconds =
    mode === "countdown" && targetSeconds
      ? Math.max(targetSeconds - elapsed, 0)
      : elapsed;

  const strokeWidth = size * 0.085;
  const ringColor =
    status === "paused" ? c("accent-amber") : c("accent-indigo");
  const bgRingColor = c("bg-elevated");

  const statusLabel =
    status === "idle"
      ? mode === "countdown" && targetSeconds
        ? "点击开始"
        : "准备开始"
      : status === "running"
        ? "专注中"
        : status === "paused"
          ? "已暂停"
          : "完成";

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Static background ring */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgRingColor,
        }}
      />

      {/* Arc progress — only show when running/paused or countdown has target */}
      {status !== "idle" && (
        <ArcProgress
          size={size}
          progress={
            mode === "countdown"
              ? 1 - progress
              : progress === 0
                ? 0.01
                : progress
          }
          stroke={strokeWidth}
          color={ringColor}
          bgColor="transparent"
        />
      )}

      {/* Idle countdown ring — show full ring to indicate target set */}
      {status === "idle" &&
        mode === "countdown" &&
        targetSeconds &&
        targetSeconds > 0 && (
          <View
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: c("accent-indigo"),
              opacity: 0.25,
            }}
          />
        )}

      {/* Center content */}
      <View style={{ alignItems: "center", gap: 6 }}>
        <Text
          style={{
            fontSize:
              size * (formatTime(displaySeconds).length > 5 ? 0.13 : 0.155),
            fontWeight: "700",
            color: c("text-primary"),
            letterSpacing: -2,
            fontVariant: ["tabular-nums"],
          }}
        >
          {formatTime(displaySeconds)}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color:
              status === "paused" ? c("accent-amber") : c("text-secondary"),
            fontWeight: "500",
          }}
        >
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}
