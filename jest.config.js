module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/types/**/*.ts",
  ],
  globals: {
    "ts-jest": {
      diagnostics: false,
      isolatedModules: true,
    },
  },
};
