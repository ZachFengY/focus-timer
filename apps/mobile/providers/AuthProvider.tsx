/**
 * AuthProvider — uses the self-hosted FocusFlow API for auth.
 * No Supabase dependency needed for local dev.
 *
 * Token is stored in expo-secure-store (encrypted on-device).
 * On app launch, the token is restored and validated via GET /auth/me.
 */
import { setAuthToken } from "@focusflow/api-client";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const API_BASE =
  process.env["EXPO_PUBLIC_API_BASE_URL"] ?? "http://localhost:3000";
const TOKEN_KEY = "focusflow_auth_token";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<{ data: { token?: string; user?: AuthUser } }>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyToken = useCallback(async (token: string) => {
    setAuthToken(token);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }, []);

  const clearToken = useCallback(async () => {
    setAuthToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }, []);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!stored) return;

        // Validate token is still valid
        setAuthToken(stored);
        const { data } = await apiFetch("/auth/me", {
          headers: { Authorization: `Bearer ${stored}` },
        });
        if (data.user) {
          setUser(data.user as AuthUser);
          await applyToken(stored);
        }
      } catch {
        // Token expired or invalid — clear it silently
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [applyToken, clearToken]);

  const signIn = async (email: string, password: string) => {
    const { data } = await apiFetch("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!data.token || !data.user)
      throw new Error("Invalid response from server");
    await applyToken(data.token);
    setUser(data.user as AuthUser);
  };

  const signUp = async (email: string, password: string) => {
    const { data } = await apiFetch("/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!data.token || !data.user)
      throw new Error("Invalid response from server");
    await applyToken(data.token);
    setUser(data.user as AuthUser);
  };

  const signOut = async () => {
    await clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
