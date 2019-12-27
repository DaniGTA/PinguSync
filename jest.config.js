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
	'testTimeout': 10000,
}