// eslint-disable-next-line no-undef
module.exports = {
	modules: {
		resolve: {
			modules: [
				'src',
				'node_modules'
			],
			extensions: [
				'.js',
				'.ts'
			]
		},
		rules: [
			{
				test: /\.node$/,
				use: 'node-loader',
			},
			{
				enforce: 'pre',
				test: /\.js$/,
				use: 'source-map-loader'
			},
			{
				enforce: 'pre',
				test: /\.ts?$/,
				use: 'source-map-loader'
			},
			{
				// For our normal typescript
				test: /\.ts?$/,
				use: [
					{
						loader: 'awesome-typescript-loader',
						options: {
							configFileName: 'tsconfig.json'
						}
					}
				],
				exclude: /(?:node_modules)/,
			}
		]
	}
}


