/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.ts',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!\\.pnpm|(jest-)?react-native|@react-native(-community)?|@react-native/.*|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|@shopify/.*|victory-native|@focusflow/.*)',
  ],
  moduleNameMapper: {
    // Map workspace packages to source
    '^@focusflow/ui(.*)$': '<rootDir>/../../packages/ui/src$1',
    '^@focusflow/types(.*)$': '<rootDir>/../../packages/types/src$1',
    '^@focusflow/api-client(.*)$': '<rootDir>/../../packages/api-client/src$1',
  },
  collectCoverageFrom: [
    'stores/**/*.ts',
    'hooks/**/*.ts',
    'providers/**/*.tsx',
    'components/**/*.tsx',
    '!**/*.test.{ts,tsx}',
    '!**/__tests__/**',
  ],
  coverageThreshold: {
    global: { lines: 75, functions: 75, branches: 70 },
  },
}
