module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    // react-native-reanimated/plugin causes web crashes — only enable on native
    plugins: process.env.EXPO_PLATFORM !== 'web'
      ? ['react-native-reanimated/plugin']
      : [],
  }
}
