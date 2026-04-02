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
import { ScrollView, View } from "react-native";

import { CategorySelector } from "../../components/timer/CategorySelector";
import { CountdownSetter } from "../../components/timer/CountdownSetter";
import { ModeToggle } from "../../components/timer/ModeToggle";
import { TimerControls } from "../../components/timer/TimerControls";
import { TimerRing } from "../../components/timer/TimerRing";
import { TodaySessions } from "../../components/timer/TodaySessions";
import { useTimerStore } from "../../stores/timerStore";

export default function TimerScreen() {
  const c = useColors();
  const { isPhone } = useBreakpoint();
  const { data: subjects = [] } = useSubjects();
  const { currentSubjectId } = useTimerStore();

  const containerPadding = useResponsiveValue({ base: 24, md: 40, xl: 60 });
  const ringSize = useResponsiveValue({ base: 272, md: 320, xl: 360 });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c("bg-page") }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: containerPadding,
        paddingTop: 12,
        paddingBottom: 24,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Mode toggle */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <ModeToggle />
      </View>

      {/* Timer ring + controls — vertically centred in remaining space */}
      <View style={{ alignItems: "center", gap: 28, marginBottom: 28 }}>
        <TimerRing size={ringSize} />
        <TimerControls />
      </View>

      {/* Countdown time setter — only visible in countdown+idle */}
      <View style={{ marginBottom: 24 }}>
        <CountdownSetter />
      </View>

      {/* Category selector */}
      <CategorySelector subjects={subjects} selectedId={currentSubjectId} />

      {/* Today's sessions — clear top gap */}
      {isPhone && (
        <View style={{ marginTop: 24 }}>
          <TodaySessions />
        </View>
      )}
    </ScrollView>
  );
}
