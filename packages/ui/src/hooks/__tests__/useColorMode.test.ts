import { renderHook } from "@testing-library/react-hooks";
import { useColorScheme } from "react-native";

import { useColorMode, useColor, useColors } from "../useColorMode";

jest.mock("react-native", () => ({ useColorScheme: jest.fn() }));

describe("useColorMode", () => {
  it("returns dark when scheme is dark", () => {
    (useColorScheme as jest.Mock).mockReturnValue("dark");
    const { result } = renderHook(() => useColorMode());
    expect(result.current).toBe("dark");
  });

  it("returns light when scheme is light", () => {
    (useColorScheme as jest.Mock).mockReturnValue("light");
    const { result } = renderHook(() => useColorMode());
    expect(result.current).toBe("light");
  });

  it("defaults to dark when scheme is null", () => {
    (useColorScheme as jest.Mock).mockReturnValue(null);
    const { result } = renderHook(() => useColorMode());
    expect(result.current).toBe("dark");
  });
});

describe("useColor", () => {
  it("returns dark token in dark mode", () => {
    (useColorScheme as jest.Mock).mockReturnValue("dark");
    const { result } = renderHook(() => useColor("bg-page"));
    expect(result.current).toBe("#0B0B0E");
  });

  it("returns light token in light mode", () => {
    (useColorScheme as jest.Mock).mockReturnValue("light");
    const { result } = renderHook(() => useColor("bg-page"));
    expect(result.current).toBe("#F4F4F8");
  });
});

describe("useColors", () => {
  it("returns a resolver function that resolves multiple tokens", () => {
    (useColorScheme as jest.Mock).mockReturnValue("dark");
    const { result } = renderHook(() => useColors());
    const c = result.current;
    expect(c("bg-page")).toBe("#0B0B0E");
    expect(c("accent-indigo")).toBe("#6366F1");
    expect(c("text-primary")).toBe("#FAFAF9");
  });
});
