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

// Mock @expo/vector-icons (uses native font loading)
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const Icon = ({
    name,
    size,
    color,
  }: {
    name?: string;
    size?: number;
    color?: string;
  }) =>
    React.createElement(
      Text,
      { style: { fontSize: size, color } },
      name ? String(name) : "",
    );
  return {
    Ionicons: Icon,
    MaterialIcons: Icon,
    FontAwesome: Icon,
    AntDesign: Icon,
    Feather: Icon,
  };
});

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
