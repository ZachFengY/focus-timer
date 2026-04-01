import "@testing-library/jest-native/extend-expect";

// Mock expo modules that use native code
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-font", () => ({ useFonts: () => [true] }));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  usePathname: () => "/",
  Redirect: () => null,
  Slot: () => null,
}));

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

// Silence specific RN warnings in tests
const originalWarn = console.warn.bind(console);
console.warn = (msg: string, ...args: unknown[]) => {
  if (
    typeof msg === "string" &&
    (msg.includes("Animated:") || msg.includes("RCTBridge"))
  )
    return;
  originalWarn(msg, ...args);
};
