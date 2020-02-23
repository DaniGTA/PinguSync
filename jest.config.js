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
	'testTimeout': 1500,
	'verbose': false,

}