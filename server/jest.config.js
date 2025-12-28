const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  
  // Test pattern matching
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/**/*.d.ts",
    "!src/generated/**",
    "!src/**/*.interface.ts",
    "!src/**/index.ts",
    "!src/types/**",
  ],

  coverageDirectory: "coverage",
  
  coverageReporters: [
    "text",
    "text-summary",
    "html",
    "lcov"
  ],

  // Coverage thresholds (optional - uncomment to enforce)
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70
  //   }
  // },

  // Module paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  // Test timeout
  testTimeout: 50000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
