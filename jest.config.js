'use strict'
const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

module.exports = {
    roots: ['<rootDir>'],
    testMatch: ['**/test/**/*-(test|tests).+(ts|tsx|js)'],
    transform: {
        '\\.(gql|graphql)$': '@jagi/jest-transform-graphql',
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    reporters: ['default'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    modulePaths: ['<rootDir>'],
    watchPathIgnorePatterns: ['node_modules'],
    testTimeout: 3500,
    verbose: false,
    globals: {
        'ts-jest': {
            babelConfig: true,
        },
    },
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/test/setup-test-after-env.ts', '<rootDir>/test/setup-nock.ts'],
    maxWorkers: 2,
}
