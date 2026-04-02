import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@focusflow/ui";
import { useState } from "react";
import { ScrollView, Text, View, Pressable, Dimensions } from "react-native";

import {
  MOCK_STATS_WEEK,
  MOCK_STATS_MONTH,
  formatDuration,
} from "../../../lib/mock";

const SCREEN_W = Dimensions.get("window").width;

type Period = "week" | "month";

// ─── Donut Chart (pure RN — no external dependency needed for this shape) ────

interface DonutSegment {
  color: string;
  percent: number;
}

function DonutChart({
  segments,
  size,
}: {
  segments: DonutSegment[];
  size: number;
}) {
  const stroke = size * 0.18;

  // Build arc slices using View transforms — approximate with borders trick
  // For a real app: use react-native-svg or Skia Canvas
  // Here we stack color-coded arc borders using rotation
  let accumulated = 0;
  const slices = segments.map((seg) => {
    const start = accumulated;
    accumulated += seg.percent / 100;
    return { ...seg, start, end: accumulated };
  });

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
          borderWidth: stroke,
          borderColor: "#2A2A2E",
        }}
      />
      {/* Color arc segments via rotation — each segment is a half-circle mask */}
      {slices.map((slice, i) => {
        const startDeg = slice.start * 360 - 90;
        const arcDeg = (slice.end - slice.start) * 360;
        // For segments > 50%: draw two halves
        const pieces: Array<[number, number]> = [];
        if (arcDeg > 180) {
          pieces.push([startDeg, 180]);
          pieces.push([startDeg + 180, arcDeg - 180]);
        } else {
          pieces.push([startDeg, arcDeg]);
        }
        return pieces.map(([deg, arc], j) => (
          <View
            key={`${i}-${j}`}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: size / 2,
              overflow: "hidden",
              transform: [{ rotate: `${deg}deg` }],
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: size / 2,
                height: size,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: stroke,
                  borderColor: slice.color,
                  transform: [{ rotate: `${Math.min(arc, 180) - 180}deg` }],
                }}
              />
            </View>
          </View>
        ));
      })}
      {/* Inner fill to create donut hole */}
      <View
        style={{
          width: size - stroke * 2,
          height: size - stroke * 2,
          borderRadius: (size - stroke * 2) / 2,
          backgroundColor: "#16161A",
          position: "absolute",
        }}
      />
    </View>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────

function BarChart({
  data,
  labels,
  color,
  width,
}: {
  data: number[];
  labels: string[];
  color: string;
  width: number;
}) {
  const c = useColors();
  const maxVal = Math.max(...data);
  const barAreaH = 120;

  return (
    <View style={{ width, paddingHorizontal: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          height: barAreaH,
          gap: 6,
        }}
      >
        {data.map((val, i) => {
          const h = maxVal > 0 ? Math.max((val / maxVal) * barAreaH, 4) : 4;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: barAreaH,
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: h,
                  borderRadius: 4,
                  backgroundColor: color,
                  opacity: 0.8,
                }}
              />
            </View>
          );
        })}
      </View>
      {/* Labels */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 8,
          gap: 6,
        }}
      >
        {labels.map((label, i) => (
          <Text
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 11,
              color: c("text-tertiary"),
            }}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const c = useColors();
  const [period, setPeriod] = useState<Period>("week");
  const stats = period === "week" ? MOCK_STATS_WEEK : MOCK_STATS_MONTH;

  const weekDayLabels = ["一", "二", "三", "四", "五", "六", "日"];
  const monthDayLabels = Array.from(
    { length: stats.dailySeconds.length },
    (_, i) => ((i + 1) % 5 === 1 ? String(i + 1) : ""),
  );
  const barLabels = period === "week" ? weekDayLabels : monthDayLabels;

  const cardW = (SCREEN_W - 48 - 12) / 2;

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
          paddingBottom: 20,
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
          统计
        </Text>

        {/* Period toggle */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: c("bg-card"),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: c("border-subtle"),
            padding: 4,
          }}
        >
          {(["week", "month"] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 8,
                backgroundColor:
                  period === p ? c("accent-indigo") : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: period === p ? "#FFFFFF" : c("text-secondary"),
                }}
              >
                {p === "week" ? "本周" : "本月"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Metric cards row */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          paddingHorizontal: 24,
          marginBottom: 16,
        }}
      >
        {/* Total time */}
        <View
          style={{
            width: cardW,
            backgroundColor: c("bg-card"),
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: c("border-subtle"),
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: c("text-secondary"),
              marginBottom: 6,
            }}
          >
            总时长
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: c("text-primary"),
              letterSpacing: -0.5,
            }}
          >
            {formatDuration(stats.totalSeconds)}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 6,
              gap: 3,
            }}
          >
            <Ionicons name="arrow-up" size={11} color={c("accent-green")} />
            <Text style={{ fontSize: 12, color: c("accent-green") }}>
              {stats.percentChange}% {period === "week" ? "本周" : "本月"}
            </Text>
          </View>
        </View>

        {/* Streak */}
        <View
          style={{
            width: cardW,
            backgroundColor: c("bg-card"),
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: c("border-subtle"),
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: c("text-secondary"),
              marginBottom: 6,
            }}
          >
            连续天数
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: c("accent-amber"),
                letterSpacing: -0.5,
              }}
            >
              {stats.streakDays} 天
            </Text>
            <Text style={{ fontSize: 20 }}>🔥</Text>
          </View>
          <Text
            style={{ fontSize: 12, color: c("text-tertiary"), marginTop: 6 }}
          >
            最佳 {stats.bestStreakDays} 天
          </Text>
        </View>
      </View>

      {/* Category pie card */}
      <View
        style={{
          marginHorizontal: 24,
          marginBottom: 16,
          backgroundColor: c("bg-card"),
          borderRadius: 16,
          borderWidth: 1,
          borderColor: c("border-subtle"),
          padding: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: c("text-primary"),
            }}
          >
            分类占比
          </Text>
          <Text style={{ fontSize: 13, color: c("text-secondary") }}>
            {period === "week" ? "本周" : "本月"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <DonutChart
            size={130}
            segments={stats.subjects.map((s) => ({
              color: s.color,
              percent: s.percent,
            }))}
          />

          {/* Legend */}
          <View style={{ flex: 1, gap: 12 }}>
            {stats.subjects.slice(0, 3).map((s) => (
              <View
                key={s.id}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: s.color,
                  }}
                />
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: c("text-primary"),
                    }}
                  >
                    {s.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: c("text-secondary") }}>
                    {s.percent}% · {formatDuration(s.seconds)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Daily bar chart card */}
      <View
        style={{
          marginHorizontal: 24,
          backgroundColor: c("bg-card"),
          borderRadius: 16,
          borderWidth: 1,
          borderColor: c("border-subtle"),
          paddingTop: 20,
          paddingBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: c("text-primary"),
            }}
          >
            每日时长
          </Text>
          <Text style={{ fontSize: 13, color: c("text-secondary") }}>
            单位：小时
          </Text>
        </View>

        <BarChart
          data={stats.dailySeconds.map((s) => s / 3600)}
          labels={barLabels}
          color={c("accent-indigo")}
          width={SCREEN_W - 48}
        />
      </View>
    </ScrollView>
  );
}
