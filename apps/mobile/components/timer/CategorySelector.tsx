import type { Subject } from "@focusflow/types";
import { useColors } from "@focusflow/ui";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useTimerStore } from "../../stores/timerStore";

interface CategorySelectorProps {
  subjects: Subject[];
  selectedId: string | null;
}

export function CategorySelector({
  subjects,
  selectedId,
}: CategorySelectorProps) {
  const c = useColors();
  const { setSubject, status } = useTimerStore();
  const disabled = status !== "idle";

  return (
    <View style={{ width: "100%", gap: 8 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: c("text-primary"),
          fontFamily: "DMSans-SemiBold",
        }}
      >
        分类
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ gap: 8 }}
      >
        {subjects.map((s) => {
          const isSelected = s.id === selectedId;
          return (
            <Pressable
              key={s.id}
              onPress={() => !disabled && setSubject(isSelected ? null : s.id)}
              style={{
                flexDirection: "row",
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 100,
                marginRight: 8,
                backgroundColor: isSelected
                  ? c("accent-indigo")
                  : c("bg-elevated"),
                borderWidth: isSelected ? 0 : 1,
                borderColor: c("border-subtle"),
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isSelected
                    ? "#FFFFFF"
                    : (s.color ?? c("text-secondary")),
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: isSelected ? "600" : "500",
                  color: isSelected ? "#FFFFFF" : c("text-secondary"),
                  fontFamily: "DMSans-Medium",
                }}
              >
                {s.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
