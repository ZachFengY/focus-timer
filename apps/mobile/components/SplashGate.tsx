import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useAuth } from "../hooks/useAuth";

/**
 * Keeps the native splash visible until auth/session restore finishes,
 * so users see one branded screen instead of a flash of loading UI.
 */
export function SplashGate() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}
