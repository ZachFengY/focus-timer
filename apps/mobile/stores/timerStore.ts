import type { TimerMode, TimerStatus } from "@focusflow/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TimerStore {
  // State
  status: TimerStatus;
  mode: TimerMode;
  startTime: number | null; // Unix ms when current run started
  accumulatedSeconds: number; // seconds before this run (from pauses)
  targetSeconds: number | null; // countdown target
  currentSubjectId: string | null;
  activeRecordId: string | null;

  // Actions (UI only — API calls happen in components via useCreateTimeRecord)
  start: (subjectId: string | null) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setMode: (mode: TimerMode) => void;
  setSubject: (id: string | null) => void;
  setTarget: (seconds: number) => void;
  setActiveRecordId: (id: string | null) => void;
  reset: () => void;

  // Computed (not stored)
  getElapsedSeconds: () => number;
}

const initialState = {
  status: "idle" as TimerStatus,
  mode: "countup" as TimerMode,
  startTime: null,
  accumulatedSeconds: 0,
  targetSeconds: null,
  currentSubjectId: null,
  activeRecordId: null,
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      getElapsedSeconds: () => {
        const { startTime, accumulatedSeconds, status } = get();
        if (status !== "running" || startTime === null)
          return accumulatedSeconds;
        return accumulatedSeconds + Math.floor((Date.now() - startTime) / 1000);
      },

      start: (subjectId) =>
        set({
          status: "running",
          startTime: Date.now(),
          accumulatedSeconds: 0,
          currentSubjectId: subjectId,
        }),

      pause: () => {
        const { startTime, accumulatedSeconds } = get();
        if (startTime === null) return;
        set({
          status: "paused",
          accumulatedSeconds:
            accumulatedSeconds + Math.floor((Date.now() - startTime) / 1000),
          startTime: null,
        });
      },

      resume: () => set({ status: "running", startTime: Date.now() }),

      stop: () => set({ ...initialState }),

      reset: () => set({ ...initialState }),

      setMode: (mode) => set({ mode }),
      setSubject: (id) => set({ currentSubjectId: id }),
      setTarget: (seconds) => set({ targetSeconds: seconds }),
      setActiveRecordId: (id) => set({ activeRecordId: id }),
    }),
    {
      name: "focusflow-timer",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist state needed for crash recovery
      partialize: (state) => ({
        status: state.status,
        mode: state.mode,
        startTime: state.startTime,
        accumulatedSeconds: state.accumulatedSeconds,
        targetSeconds: state.targetSeconds,
        currentSubjectId: state.currentSubjectId,
        activeRecordId: state.activeRecordId,
      }),
    },
  ),
);
