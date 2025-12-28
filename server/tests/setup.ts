/**
 * Jest Setup File
 * This file runs before each test suite
 */

// Extend Jest matchers if needed
// import '@testing-library/jest-dom';

// Set up global test timeout
jest.setTimeout(50000);

// Mock console methods to reduce noise in test output (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Set up environment variables for testing
process.env.NODE_ENV = 'test';

// Add custom matchers if needed
// expect.extend({
//   toBeWithinRange(received, floor, ceiling) {
//     const pass = received >= floor && received <= ceiling;
//     if (pass) {
//       return {
//         message: () =>
//           `expected ${received} not to be within range ${floor} - ${ceiling}`,
//         pass: true,
//       };
//     } else {
//       return {
//         message: () =>
//           `expected ${received} to be within range ${floor} - ${ceiling}`,
//         pass: false,
//       };
//     }
//   },
// });

// Global test utilities
global.testHelpers = {
  createMockDate: (dateString: string) => new Date(dateString),
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

export {};
