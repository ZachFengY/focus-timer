import { useColors } from "@focusflow/ui";
import { ScrollView, Text, View, Pressable } from "react-native";

import {
  MOCK_GOALS,
  MOCK_GOALS_OVERVIEW,
  formatDuration,
} from "../../../lib/mock";

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({
  progress,
  color,
  height = 6,
}: {
  progress: number;
  color: string;
  height?: number;
}) {
  const c = useColors();
  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: c("bg-elevated"),
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: color,
          width: `${Math.min(progress * 100, 100)}%`,
        }}
      />
    </View>
  );
}

// ─── Overview Card (indigo gradient via layered Views) ────────────────────────

function OverviewCard() {
  const { completedThisWeek, totalThisWeek, overallProgress, streakDays } =
    MOCK_GOALS_OVERVIEW;

  return (
    <View
      style={{
        marginHorizontal: 24,
        marginBottom: 20,
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      {/* Gradient simulation: two overlapping views */}
      <View
        style={{
          backgroundColor: "#4F46E5",
          borderRadius: 20,
          padding: 24,
        }}
      >
        {/* Overlay for gradient effect */}
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "60%",
            borderRadius: 20,
            backgroundColor: "#7C3AED",
            opacity: 0.5,
          }}
        />

        <Text
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 8,
          }}
        >
          本周完成度
        </Text>

        <Text
          style={{
            fontSize: 36,
            fontWeight: "700",
            color: "#FFFFFF",
            letterSpacing: -1,
            marginBottom: 12,
          }}
        >
          {completedThisWeek} / {totalThisWeek} 目标
        </Text>

        {/* Progress bar */}
        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.25)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: "#FFFFFF",
              width: `${overallProgress * 100}%`,
            }}
          />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 16 }}>🔥</Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.9)",
              fontWeight: "500",
            }}
          >
            连续 {streakDays} 天达成
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

function GoalCard({ goal }: { goal: (typeof MOCK_GOALS)[0] }) {
  const c = useColors();
  return (
    <View
      style={{
        marginHorizontal: 24,
        marginBottom: 12,
        backgroundColor: c("bg-card"),
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c("border-subtle"),
        padding: 18,
      }}
    >
      {/* Top row: badge + status */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <View
          style={{
            backgroundColor: goal.labelBg,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{ fontSize: 12, fontWeight: "600", color: goal.labelColor }}
          >
            {goal.label}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {goal.status === "completed" && (
            <Text style={{ fontSize: 12, color: goal.statusColor }}>✓</Text>
          )}
          <Text
            style={{ fontSize: 13, fontWeight: "600", color: goal.statusColor }}
          >
            {goal.statusLabel}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: c("text-primary"),
          marginBottom: 12,
        }}
      >
        {goal.title}
      </Text>

      {/* Progress bar */}
      <ProgressBar
        progress={goal.progress}
        color={goal.progressBarColor}
        height={5}
      />

      {/* Bottom row: current / target */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <Text style={{ fontSize: 13, color: c("text-secondary") }}>
          {goal.type === "daily"
            ? "今日"
            : goal.type === "weekly"
              ? "本周"
              : "本月"}
          : {formatDuration(goal.currentSeconds)}
        </Text>
        <Text style={{ fontSize: 13, color: c("text-tertiary") }}>
          目标: {formatDuration(goal.targetSeconds)}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function GoalsScreen() {
  const c = useColors();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c("bg-page") }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: c("text-primary"),
            letterSpacing: -0.8,
          }}
        >
          目标
        </Text>

        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: c("accent-indigo"),
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 16, color: "#FFFFFF", fontWeight: "600" }}>
            +
          </Text>
          <Text style={{ fontSize: 14, color: "#FFFFFF", fontWeight: "600" }}>
            新建
          </Text>
        </Pressable>
      </View>

      <OverviewCard />

      {MOCK_GOALS.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </ScrollView>
  );
}
