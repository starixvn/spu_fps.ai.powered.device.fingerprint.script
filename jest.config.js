module.exports = {
  preset: 'ts-jest',
  projects: [
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/server/**/*.+(ts|tsx|js)'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
      },
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
      },
      globals: {
        'ts-jest': {
          tsconfig: 'tsconfig.json'
        }
      }
    },
    {
      displayName: 'client',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/client/**/*.+(ts|tsx|js)'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
      },
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
      },
      globals: {
        'ts-jest': {
          tsconfig: 'tsconfig.json'
        }
      }
    }
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts'
  ],
  testTimeout: 10000
};
