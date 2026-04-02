/**
 * TimerControls — Play / Pause / Stop buttons.
 *
 * THIN CLIENT CONTRACT:
 * - Reads status from Zustand store (UI state only)
 * - On Stop: calls useCreateTimeRecord() to persist to backend
 * - No duration calculation here — that's the store's job
 */

import { Ionicons } from "@expo/vector-icons";
import { useCreateTimeRecord } from "@focusflow/api-client";
import { useColors } from "@focusflow/ui";
import { ActivityIndicator, Pressable, View } from "react-native";

import { useTimerStore } from "../../stores/timerStore";

export function TimerControls() {
  const c = useColors();
  const {
    status,
    start,
    pause,
    resume,
    stop,
    currentSubjectId,
    getElapsedSeconds,
    mode,
  } = useTimerStore();
  const { mutate: saveRecord, isPending } = useCreateTimeRecord();

  const handleStop = () => {
    const duration = getElapsedSeconds();
    if (duration < 3) {
      stop();
      return;
    } // ignore < 3s records

    saveRecord(
      {
        subjectId: currentSubjectId,
        mode,
        duration,
        startTime: Date.now() - duration * 1000,
        endTime: Date.now(),
        pauses: [],
      },
      { onSuccess: () => stop() },
    );
  };

  const accentGlow = {
    shadowColor: c("accent-indigo"),
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  };
  const cardShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  };

  const playIcon =
    status === "running" ? "pause" : status === "paused" ? "play" : "play";

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 20,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Stop */}
      <Pressable
        onPress={handleStop}
        disabled={status === "idle"}
        style={[
          {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: c("bg-elevated"),
            borderWidth: 1,
            borderColor: c("border-subtle"),
            alignItems: "center",
            justifyContent: "center",
            opacity: status === "idle" ? 0.4 : 1,
          },
          cardShadow,
        ]}
      >
        {isPending ? (
          <ActivityIndicator size="small" color={c("accent-indigo")} />
        ) : (
          <Ionicons name="stop" size={20} color={c("text-secondary")} />
        )}
      </Pressable>

      {/* Play / Pause (primary) */}
      <Pressable
        onPress={() => {
          if (status === "idle") start(currentSubjectId);
          else if (status === "running") pause();
          else if (status === "paused") resume();
        }}
        style={[
          {
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: c("accent-indigo"),
            alignItems: "center",
            justifyContent: "center",
          },
          accentGlow,
        ]}
      >
        <Ionicons name={playIcon} size={28} color="#FFFFFF" />
      </Pressable>

      {/* Bookmark (save note — future feature) */}
      <Pressable
        style={[
          {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: c("bg-elevated"),
            borderWidth: 1,
            borderColor: c("border-subtle"),
            alignItems: "center",
            justifyContent: "center",
          },
          cardShadow,
        ]}
      >
        <Ionicons
          name="bookmark-outline"
          size={20}
          color={c("text-secondary")}
        />
      </Pressable>
    </View>
  );
}
