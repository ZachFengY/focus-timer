import { useTimeRecords } from "@focusflow/api-client";
import { useColors } from "@focusflow/ui";
import { View, Text } from "react-native";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function TodaySessions() {
  const c = useColors();
  const { data: records = [], isLoading } = useTimeRecords({ limit: 5 });

  if (isLoading || records.length === 0) return null;

  return (
    <View style={{ width: "100%", gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Fraunces-SemiBold",
            fontSize: 18,
            color: c("text-primary"),
            letterSpacing: -0.2,
          }}
        >
          今日记录
        </Text>
        <Text
          style={{
            fontFamily: "DMSans-Medium",
            fontSize: 13,
            color: c("accent-indigo"),
          }}
        >
          查看全部
        </Text>
      </View>
      {records.slice(0, 3).map((r) => (
        <View
          key={r.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 14,
            borderRadius: 16,
            backgroundColor: c("bg-card"),
          }}
        >
          <Text
            style={{
              fontFamily: "DMSans-SemiBold",
              fontSize: 14,
              color: c("text-primary"),
            }}
          >
            {r.subjectId ?? "未分类"}
          </Text>
          <Text
            style={{
              fontFamily: "DMSans-Bold",
              fontSize: 15,
              color: c("text-primary"),
            }}
          >
            {formatDuration(r.duration)}
          </Text>
        </View>
      ))}
    </View>
  );
}
