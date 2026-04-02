import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PreferencesState {
  themeOverride: "dark" | "light" | null; // null = follow system
  setThemeOverride: (mode: "dark" | "light" | null) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      themeOverride: null,
      setThemeOverride: (mode) => {
        // Propagate to React Native's Appearance API so useColorScheme()
        // (and therefore useColorMode / useColors) re-renders everywhere.
        Appearance.setColorScheme(mode);
        set({ themeOverride: mode });
      },
    }),
    {
      name: "focusflow-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Re-apply the stored preference after AsyncStorage rehydration
        if (state?.themeOverride) {
          Appearance.setColorScheme(state.themeOverride);
        }
      },
    },
  ),
);
