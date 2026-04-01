/**
 * Timer Store Tests
 *
 * Critical: these tests verify the core timer state machine.
 * Any regression here would break the main user flow.
 */
import { act } from "@testing-library/react-native";

import { useTimerStore } from "../timerStore";

// Reset Zustand store between tests
beforeEach(() => {
  useTimerStore.getState().reset();
});

describe("Initial State", () => {
  it("starts in idle state", () => {
    const state = useTimerStore.getState();
    expect(state.status).toBe("idle");
    expect(state.startTime).toBeNull();
    expect(state.accumulatedSeconds).toBe(0);
  });
});

describe("start()", () => {
  it("transitions to running state", () => {
    act(() => useTimerStore.getState().start(null));

    const state = useTimerStore.getState();
    expect(state.status).toBe("running");
    expect(state.startTime).toBeCloseTo(Date.now(), -2); // within 100ms
    expect(state.accumulatedSeconds).toBe(0);
  });

  it("sets the current subject", () => {
    act(() => useTimerStore.getState().start("sub-coding"));
    expect(useTimerStore.getState().currentSubjectId).toBe("sub-coding");
  });
});

describe("pause()", () => {
  it("accumulates elapsed seconds on pause", () => {
    const store = useTimerStore.getState();

    // Manually set startTime 60s in the past to simulate 60s elapsed
    act(() => store.start(null));
    useTimerStore.setState({ startTime: Date.now() - 60_000 });
    act(() => useTimerStore.getState().pause());

    const paused = useTimerStore.getState();
    expect(paused.status).toBe("paused");
    expect(paused.accumulatedSeconds).toBeGreaterThanOrEqual(59); // allow 1s tolerance
    expect(paused.startTime).toBeNull();
  });
});

describe("resume()", () => {
  it("restarts the timer from paused state", () => {
    act(() => useTimerStore.getState().start(null));
    useTimerStore.setState({ startTime: Date.now() - 30_000 });
    act(() => useTimerStore.getState().pause());
    act(() => useTimerStore.getState().resume());

    const state = useTimerStore.getState();
    expect(state.status).toBe("running");
    expect(state.startTime).toBeCloseTo(Date.now(), -2);
  });
});

describe("stop()", () => {
  it("resets to idle state", () => {
    act(() => useTimerStore.getState().start("sub-coding"));
    act(() => useTimerStore.getState().stop());

    const state = useTimerStore.getState();
    expect(state.status).toBe("idle");
    expect(state.startTime).toBeNull();
    expect(state.accumulatedSeconds).toBe(0);
    expect(state.currentSubjectId).toBeNull();
  });
});

describe("getElapsedSeconds()", () => {
  it("returns 0 when idle", () => {
    expect(useTimerStore.getState().getElapsedSeconds()).toBe(0);
  });

  it("returns accumulated seconds when paused", () => {
    useTimerStore.setState({
      status: "paused",
      accumulatedSeconds: 300,
      startTime: null,
    });
    expect(useTimerStore.getState().getElapsedSeconds()).toBe(300);
  });

  it("includes live time when running", () => {
    useTimerStore.setState({
      status: "running",
      accumulatedSeconds: 100,
      startTime: Date.now() - 50_000,
    });
    const elapsed = useTimerStore.getState().getElapsedSeconds();
    expect(elapsed).toBeGreaterThanOrEqual(149);
    expect(elapsed).toBeLessThan(155); // tolerance for test execution time
  });

  it("CRITICAL: does not drift when app is backgrounded (time-based calculation)", () => {
    // Simulate 5 minutes of background time
    const fiveMinutesAgo = Date.now() - 300_000;
    useTimerStore.setState({
      status: "running",
      accumulatedSeconds: 0,
      startTime: fiveMinutesAgo,
    });

    const elapsed = useTimerStore.getState().getElapsedSeconds();
    expect(elapsed).toBeGreaterThanOrEqual(299);
    expect(elapsed).toBeLessThan(305);
  });
});

describe("setMode()", () => {
  it("changes mode only when idle", () => {
    useTimerStore.getState().setMode("countdown");
    expect(useTimerStore.getState().mode).toBe("countdown");
  });
});
