import { useColors } from "@focusflow/ui";
import { View, Text } from "react-native";

export default function GoalsScreen() {
  const c = useColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c("bg-page"),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "Fraunces-SemiBold",
          fontSize: 28,
          color: c("text-primary"),
          letterSpacing: -0.8,
        }}
      >
        目标
      </Text>
      <Text
        style={{
          fontFamily: "DMSans-Regular",
          fontSize: 14,
          color: c("text-secondary"),
          marginTop: 8,
        }}
      >
        即将上线
      </Text>
    </View>
  );
}
