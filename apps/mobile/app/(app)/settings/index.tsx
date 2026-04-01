import { useColors } from "@focusflow/ui";
import { View, Text, Pressable } from "react-native";

import { useAuth } from "../../../hooks/useAuth";

export default function SettingsScreen() {
  const c = useColors();
  const { user, signOut } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c("bg-page"),
        padding: 24,
        paddingTop: 60,
      }}
    >
      <Text
        style={{
          fontFamily: "Fraunces-SemiBold",
          fontSize: 28,
          color: c("text-primary"),
          letterSpacing: -0.8,
          marginBottom: 32,
        }}
      >
        设置
      </Text>

      {/* Profile card */}
      <View
        style={{
          backgroundColor: c("bg-card"),
          borderRadius: 16,
          padding: 16,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: c("border-subtle"),
        }}
      >
        <Text
          style={{
            fontFamily: "DMSans-SemiBold",
            fontSize: 14,
            color: c("text-secondary"),
            marginBottom: 4,
          }}
        >
          当前账号
        </Text>
        <Text
          style={{
            fontFamily: "DMSans-SemiBold",
            fontSize: 16,
            color: c("text-primary"),
          }}
        >
          {user?.email}
        </Text>
      </View>

      {/* Sign out */}
      <Pressable
        onPress={signOut}
        style={{
          backgroundColor: "#E85A4F22",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#E85A4F",
            fontFamily: "DMSans-SemiBold",
            fontSize: 15,
          }}
        >
          退出登录
        </Text>
      </Pressable>
    </View>
  );
}
