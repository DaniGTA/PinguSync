'use strict';


module.exports = {
	'roots': [
		'<rootDir>'
	],
	'testMatch': [
		'**/test/**/*-(test|tests).+(ts|tsx|js)',
	],
	'transform': {
		'\\.(gql|graphql)$': '@jagi/jest-transform-graphql',
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	'reporters': [
		'default'
	],
	'watchPathIgnorePatterns': ['node_modules'],
	'testTimeout': 3500,
	'verbose': false,
	'globals': {
		'ts-jest': {
			babelConfig: true,
		}
	},
	'testEnvironment': 'node',
	'setupFilesAfterEnv': ['<rootDir>/test/test-helper.ts'],
	'maxWorkers': 2
};


