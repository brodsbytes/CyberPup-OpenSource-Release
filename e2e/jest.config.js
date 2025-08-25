/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  setupFilesAfterEnv: ["./init.js"],
  testEnvironment: "node",
  testRunner: "jest-circus/runner",
  testTimeout: 120000,
  reporters: ["detox/runners/jest/streamlineReporter"],
  verbose: true,
  testMatch: ["**/*.test.js"],
  testPathIgnorePatterns: ["node_modules"],
};
