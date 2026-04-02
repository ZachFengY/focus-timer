import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@focusflow/ui";
import { useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";

import {
  MOCK_CALENDAR_DOTS,
  MOCK_CALENDAR_SESSIONS,
  formatDuration,
} from "../../../lib/mock";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function toDateKey(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export default function CalendarScreen() {
  const c = useColors();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDOW = getFirstDayOfWeek(year, month);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const monthLabel = `${year}年${month + 1}月`;
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();
  const todayDay = isCurrentMonth ? today.getDate() : -1;

  const selectedKey = toDateKey(year, month, selectedDay);
  const sessions = MOCK_CALENDAR_SESSIONS[selectedKey] ?? [];
  const totalSessionSeconds = sessions.reduce(
    (acc, s) => acc + s.durationSeconds,
    0,
  );

  const isToday = selectedDay === todayDay && isCurrentMonth;
  const dayLabel = `${month + 1}月${selectedDay}日${isToday ? " · 今天" : ""}`;

  // Build grid cells: nulls for empty slots before day 1
  const cells: Array<number | null> = [
    ...Array(firstDOW).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

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
          日历
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable onPress={prevMonth} style={{ padding: 6 }}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={c("text-secondary")}
            />
          </Pressable>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: c("text-primary"),
              minWidth: 80,
              textAlign: "center",
            }}
          >
            {monthLabel}
          </Text>
          <Pressable onPress={nextMonth} style={{ padding: 6 }}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={c("text-secondary")}
            />
          </Pressable>
        </View>
      </View>

      {/* Weekday headers */}
      <View
        style={{ flexDirection: "row", paddingHorizontal: 24, marginBottom: 8 }}
      >
        {WEEKDAYS.map((d) => (
          <Text
            key={d}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 13,
              color: c("text-tertiary"),
              fontWeight: "500",
            }}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={{ paddingHorizontal: 24 }}>
        {Array.from({ length: cells.length / 7 }, (_, row) => (
          <View key={row} style={{ flexDirection: "row", marginBottom: 4 }}>
            {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
              if (day === null) {
                return <View key={col} style={{ flex: 1, height: 44 }} />;
              }
              const isSelected = day === selectedDay;
              const isT = day === todayDay;
              const dots = MOCK_CALENDAR_DOTS[day] ?? [];
              return (
                <Pressable
                  key={col}
                  onPress={() => setSelectedDay(day)}
                  style={{
                    flex: 1,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isSelected
                        ? c("accent-indigo")
                        : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: isSelected || isT ? "700" : "400",
                        color: isSelected
                          ? "#FFFFFF"
                          : isT
                            ? c("accent-indigo")
                            : c("text-primary"),
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                  {/* Dot indicators */}
                  {dots.length > 0 && !isSelected && (
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 3,
                        position: "absolute",
                        bottom: 2,
                      }}
                    >
                      {dots.slice(0, 3).map((clr, i) => (
                        <View
                          key={i}
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: clr,
                          }}
                        />
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Day detail card */}
      <View
        style={{
          marginHorizontal: 24,
          marginTop: 20,
          backgroundColor: c("bg-card"),
          borderRadius: 20,
          borderWidth: 1,
          borderColor: c("border-subtle"),
          padding: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: c("text-primary"),
            }}
          >
            {dayLabel}
          </Text>
          {totalSessionSeconds > 0 && (
            <Text
              style={{
                fontSize: 14,
                color: c("accent-indigo"),
                fontWeight: "600",
              }}
            >
              共 {formatDuration(totalSessionSeconds)}
            </Text>
          )}
        </View>

        {sessions.length === 0 ? (
          <Text
            style={{
              fontSize: 14,
              color: c("text-tertiary"),
              textAlign: "center",
              paddingVertical: 16,
            }}
          >
            暂无记录
          </Text>
        ) : (
          <View style={{ gap: 12 }}>
            {sessions.map((s, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Color bar */}
                <View
                  style={{
                    width: 4,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: s.subjectColor,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: c("text-primary"),
                    }}
                  >
                    {s.subjectName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: c("text-secondary"),
                      marginTop: 2,
                    }}
                  >
                    {s.startLabel} — {s.endLabel}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: c("text-primary"),
                  }}
                >
                  {formatDuration(s.durationSeconds)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
