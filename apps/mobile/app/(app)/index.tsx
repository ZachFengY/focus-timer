/**
 * Timer Screen — Home (Tab 1)
 *
 * THIN CLIENT: This screen only handles UI state and display.
 * All business logic lives in the API. The timer calculation
 * (duration = currentTime - startTime - pausedDuration) runs
 * locally for real-time display, but the final record is
 * computed and validated by the backend on save.
 */

import { useSubjects } from "@focusflow/api-client";
import { useColors, useBreakpoint, useResponsiveValue } from "@focusflow/ui";
import { View } from "react-native";

import { CategorySelector } from "../../components/timer/CategorySelector";
import { ModeToggle } from "../../components/timer/ModeToggle";
import { TimerControls } from "../../components/timer/TimerControls";
import { TimerRing } from "../../components/timer/TimerRing";
import { TodaySessions } from "../../components/timer/TodaySessions";
import { useTimerStore } from "../../stores/timerStore";

export default function TimerScreen() {
  const c = useColors();
  const { isPhone } = useBreakpoint();
  const { data: subjects = [] } = useSubjects();

  // Only UI state — no business logic here
  const { currentSubjectId } = useTimerStore();

  const containerPadding = useResponsiveValue({ base: 24, md: 40, xl: 60 });
  const ringSize = useResponsiveValue({ base: 280, md: 320, xl: 360 });

  return (
    <View
      className="flex-1 items-center"
      style={{
        backgroundColor: c("bg-page"),
        paddingHorizontal: containerPadding,
      }}
    >
      <ModeToggle />

      <View className="flex-1 items-center justify-center gap-6">
        <TimerRing size={ringSize} />
        <TimerControls />
      </View>

      <CategorySelector subjects={subjects} selectedId={currentSubjectId} />

      {isPhone && <TodaySessions />}
    </View>
  );
}
