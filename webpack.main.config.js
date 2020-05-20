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
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				resourceQuery: /blockType=i18n/,
				type: 'javascript/auto',
				loader: '@kazupon/vue-i18n-loader'
			},
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
			},
			{
				test: /\.s[a|c]ss$/,
				loader: 'style!css!sass'
			}
		]
	}
};

