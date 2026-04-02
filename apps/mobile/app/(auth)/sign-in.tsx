import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppLogo } from "../../components/ui/AppLogo";
import { useAuth } from "../../hooks/useAuth";

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("test@focusflow.app");
  const [password, setPassword] = useState("Test123456");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("请填写邮箱和密码");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      if (isSignUp) await signUp(email, password);
      else await signIn(email, password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: "#0B0B0E",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Logo */}
      <View style={{ marginBottom: 48 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 12,
          }}
        >
          <AppLogo size={56} />
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: "#FAFAF9",
              letterSpacing: -1.2,
            }}
          >
            FocusFlow
          </Text>
        </View>
        <Text
          style={{
            fontSize: 15,
            color: "#6B6B70",
          }}
        >
          {isSignUp ? "创建账号，开始记录时间" : "欢迎回来，继续专注"}
        </Text>
      </View>

      {/* Form */}
      <View style={{ gap: 12 }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="邮箱"
          placeholderTextColor="#4A4A50"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: "#16161A",
            borderRadius: 12,
            padding: 16,
            fontSize: 15,
            color: "#FAFAF9",
            borderWidth: 1,
            borderColor: "#2A2A2E",
            fontFamily: "DMSans-Regular",
          }}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="密码（至少 8 位）"
          placeholderTextColor="#4A4A50"
          secureTextEntry
          style={{
            backgroundColor: "#16161A",
            borderRadius: 12,
            padding: 16,
            fontSize: 15,
            color: "#FAFAF9",
            borderWidth: 1,
            borderColor: "#2A2A2E",
            fontFamily: "DMSans-Regular",
          }}
        />

        {error ? (
          <Text
            style={{
              color: "#E85A4F",
              fontSize: 13,
              fontFamily: "DMSans-Regular",
            }}
          >
            {error}
          </Text>
        ) : null}

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={isLoading}
          style={{
            backgroundColor: "#6366F1",
            borderRadius: 100,
            padding: 16,
            alignItems: "center",
            marginTop: 8,
            shadowColor: "#6366F1",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 12,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: "600",
                fontFamily: "DMSans-SemiBold",
              }}
            >
              {isSignUp ? "注册" : "登录"}
            </Text>
          )}
        </Pressable>

        {/* Toggle sign-up / sign-in */}
        <Pressable
          onPress={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
          style={{ alignItems: "center", padding: 8 }}
        >
          <Text
            style={{
              color: "#6B6B70",
              fontSize: 13,
              fontFamily: "DMSans-Regular",
            }}
          >
            {isSignUp ? "已有账号？" : "没有账号？"}
            <Text style={{ color: "#6366F1", fontWeight: "600" }}>
              {isSignUp ? " 登录" : " 注册"}
            </Text>
          </Text>
        </Pressable>
      </View>

      {/* Dev hint */}
      {__DEV__ && (
        <View
          style={{
            marginTop: 48,
            padding: 12,
            borderRadius: 10,
            backgroundColor: "#16161A",
          }}
        >
          <Text
            style={{
              color: "#4A4A50",
              fontSize: 11,
              fontFamily: "DMSans-Regular",
              textAlign: "center",
            }}
          >
            测试账号：test@focusflow.app / Test123456
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
