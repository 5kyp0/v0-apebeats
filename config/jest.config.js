const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: '../',
  // Tell Next.js where to find the app directory
  appDir: '../src/app',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
    '^@/components/(.*)$': '<rootDir>/../src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/../src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/../src/hooks/$1',
    '^@/stores/(.*)$': '<rootDir>/../src/stores/$1',
    '^@/styles/(.*)$': '<rootDir>/../src/styles/$1',
    '^uint8arrays$': '<rootDir>/../node_modules/uint8arrays/dist/index.cjs.js',
  },
  testPathIgnorePatterns: ['<rootDir>/../.next/', '<rootDir>/../node_modules/'],
  transformIgnorePatterns: [
    'node_modules/(?!(uint8arrays|@walletconnect|thirdweb|@use-glyph|viem|wagmi|@hey-api|@tanstack)/)',
  ],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  collectCoverageFrom: [
    '../src/components/**/*.{js,jsx,ts,tsx}',
    '../src/lib/**/*.{js,jsx,ts,tsx}',
    '../src/app/**/*.{js,jsx,ts,tsx}',
    '../src/hooks/**/*.{js,jsx,ts,tsx}',
    '../src/stores/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  testMatch: [
    '../tests/**/*.(test|spec).{js,jsx,ts,tsx}',
    '../**/*.(test|spec).{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
