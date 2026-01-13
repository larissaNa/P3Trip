module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ],
  setupFilesAfterEnv: ["./__test__/mocks/setup.ts"],
  collectCoverageFrom: [
    "src/model/services/**/*.{ts,tsx}",
    "src/model/repositories/**/*.{ts,tsx}",
    "src/viewmodel/**/*.{ts,tsx}"
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
