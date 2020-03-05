module.exports = {
	'roots': [
		'<rootDir>'
	],
	'testMatch': [
		'**/test/**/*-(test|tests).+(ts|tsx|js)',
	],
	'transform': {
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	'reporters': [
		'default',
		['jest-html-reporters', {
			'publicPath': './html-report',
			'filename': 'report.html',
			'expand': true
		}]
	],
	'testTimeout': 3500,
	'verbose': false,
	'globals': {
		'ts-jest': {
			babelConfig: true,
		}
	},
	'testEnvironment': './test/test-environment.ts'
}
