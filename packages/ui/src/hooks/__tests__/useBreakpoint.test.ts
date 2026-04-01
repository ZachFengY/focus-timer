/**
 * useBreakpoint hook tests.
 * These drive the adaptive navigation decisions (tabbar vs sidebar).
 */
import { renderHook } from "@testing-library/react-hooks";
import { useWindowDimensions } from "react-native";

import { useBreakpoint, useResponsiveValue } from "../useBreakpoint";

jest.mock("react-native", () => ({
  useWindowDimensions: jest.fn(),
}));

const mockDimensions = (width: number, height = 844) => {
  (useWindowDimensions as jest.Mock).mockReturnValue({ width, height });
};

describe("useBreakpoint — device classification", () => {
  it("xs: phone portrait (375px)", () => {
    mockDimensions(375);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.breakpoint).toBe("xs");
    expect(result.current.isPhone).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.navType).toBe("tabbar");
    expect(result.current.columns).toBe(1);
  });

  it("md: iPad portrait (768px)", () => {
    mockDimensions(768);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.breakpoint).toBe("md");
    expect(result.current.isTablet).toBe(true);
    expect(result.current.navType).toBe("drawer");
    expect(result.current.columns).toBe(2);
  });

  it("xl: desktop (1280px)", () => {
    mockDimensions(1280);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.navType).toBe("sidebar");
    expect(result.current.columns).toBe(3);
  });

  it("detects landscape correctly", () => {
    mockDimensions(844, 390); // landscape phone
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });
});

describe("useResponsiveValue", () => {
  it("returns base value when no breakpoint match", () => {
    mockDimensions(375);
    const { result } = renderHook(() =>
      useResponsiveValue({ base: 16, md: 24, xl: 32 }),
    );
    expect(result.current).toBe(16);
  });

  it("returns md value for tablet", () => {
    mockDimensions(768);
    const { result } = renderHook(() =>
      useResponsiveValue({ base: 16, md: 24, xl: 32 }),
    );
    expect(result.current).toBe(24);
  });

  it("returns xl value for desktop", () => {
    mockDimensions(1280);
    const { result } = renderHook(() =>
      useResponsiveValue({ base: 16, md: 24, xl: 32 }),
    );
    expect(result.current).toBe(32);
  });

  it("falls back to lower breakpoint if exact match missing", () => {
    mockDimensions(1024); // lg — no lg key in values
    const { result } = renderHook(() =>
      useResponsiveValue({ base: 16, md: 24, xl: 32 }),
    );
    // Should fall back to md (closest lower)
    expect(result.current).toBe(24);
  });
});
