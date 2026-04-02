import { Ionicons } from "@expo/vector-icons";
import { useColors, useColorMode } from "@focusflow/ui";
import { useState } from "react";
import { ScrollView, Text, View, Pressable, Switch } from "react-native";

import { useAuth } from "../../../hooks/useAuth";
import { MOCK_SUBJECTS } from "../../../lib/mock";
import { usePreferencesStore } from "../../../stores/preferencesStore";

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  const c = useColors();
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "600",
        color: c("text-tertiary"),
        letterSpacing: 0.8,
        textTransform: "uppercase",
        marginBottom: 8,
        marginTop: 24,
        paddingHorizontal: 24,
      }}
    >
      {label}
    </Text>
  );
}

// ─── Row item in a card ───────────────────────────────────────────────────────

function CardRow({
  children,
  last = false,
}: {
  children: React.ReactNode;
  last?: boolean;
}) {
  const c = useColors();
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
      >
        {children}
      </View>
      {!last && (
        <View
          style={{
            height: 1,
            backgroundColor: c("border-subtle"),
            marginLeft: 16,
          }}
        />
      )}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const c = useColors();
  const colorMode = useColorMode();
  const { user, signOut } = useAuth();
  const { setThemeOverride } = usePreferencesStore();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const isDark = colorMode === "dark";

  // Derive avatar letter from email or "U"
  const email = user?.email ?? "user@focusflow.app";
  const displayName = email.split("@")[0] ?? "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const cardStyle = {
    marginHorizontal: 24,
    backgroundColor: c("bg-card"),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c("border-subtle"),
    overflow: "hidden" as const,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c("bg-page") }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: c("text-primary"),
            letterSpacing: -0.8,
          }}
        >
          设置
        </Text>
      </View>

      {/* Profile card */}
      <View
        style={{
          ...cardStyle,
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          gap: 14,
        }}
      >
        {/* Avatar */}
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: c("accent-indigo"),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#FFFFFF" }}>
            {avatarLetter}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: c("text-primary"),
            }}
          >
            {displayName}
          </Text>
          <Text
            style={{ fontSize: 13, color: c("text-secondary"), marginTop: 2 }}
          >
            {email}
          </Text>
        </View>

        {/* PRO badge */}
        <View
          style={{
            backgroundColor: "#F59E0B",
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "800",
              color: "#FFFFFF",
              letterSpacing: 0.5,
            }}
          >
            PRO
          </Text>
        </View>
      </View>

      {/* Categories section */}
      <SectionLabel label="分类管理" />
      <View style={cardStyle}>
        {MOCK_SUBJECTS.map((subject, i) => (
          <CardRow
            key={subject.id}
            last={i === MOCK_SUBJECTS.length - 1 && false}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: subject.color + "33",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: subject.color,
                }}
              />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "500",
                color: c("text-primary"),
              }}
            >
              {subject.name}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={c("text-tertiary")}
            />
          </CardRow>
        ))}

        {/* Add category row */}
        <CardRow last>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: c("accent-indigo"),
              borderStyle: "dashed",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="add" size={18} color={c("accent-indigo")} />
          </View>
          <Text
            style={{
              fontSize: 15,
              color: c("accent-indigo"),
              fontWeight: "500",
            }}
          >
            添加分类
          </Text>
        </CardRow>
      </View>

      {/* Preferences section */}
      <SectionLabel label="偏好设置" />
      <View style={cardStyle}>
        {/* Notifications toggle */}
        <CardRow>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={c("text-secondary")}
            style={{ marginRight: 12 }}
          />
          <Text style={{ flex: 1, fontSize: 15, color: c("text-primary") }}>
            通知提醒
          </Text>
          <Switch
            value={notificationsOn}
            onValueChange={setNotificationsOn}
            trackColor={{ false: c("bg-elevated"), true: c("accent-indigo") }}
            thumbColor="#FFFFFF"
          />
        </CardRow>

        {/* Dark mode toggle */}
        <CardRow>
          <Ionicons
            name="moon-outline"
            size={20}
            color={c("text-secondary")}
            style={{ marginRight: 12 }}
          />
          <Text style={{ flex: 1, fontSize: 15, color: c("text-primary") }}>
            深色模式
          </Text>
          <Switch
            value={isDark}
            onValueChange={(v) => setThemeOverride(v ? "dark" : "light")}
            trackColor={{ false: c("bg-elevated"), true: c("accent-indigo") }}
            thumbColor="#FFFFFF"
          />
        </CardRow>

        {/* Data sync row */}
        <CardRow last>
          <Ionicons
            name="cloud-outline"
            size={20}
            color={c("text-secondary")}
            style={{ marginRight: 12 }}
          />
          <Text style={{ flex: 1, fontSize: 15, color: c("text-primary") }}>
            数据同步
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={c("text-tertiary")}
          />
        </CardRow>
      </View>

      {/* Sign out */}
      <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
        <Pressable
          onPress={signOut}
          style={{
            backgroundColor: "#E85A4F18",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#E85A4F44",
            padding: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#E85A4F", fontSize: 15, fontWeight: "600" }}>
            退出登录
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
