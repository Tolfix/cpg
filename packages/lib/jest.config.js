module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    testMatch: [
      "**/test/**/*.[t]s?(x)",
      "**/__tests__/**/*.[t]s?(x)",
      "**/?(*.)+(spec|test).[t]s?(x)"
    ],
    testTimeout: 2000,
};