import ThreadsPlugin from 'threads-plugin';
// eslint-disable-next-line no-undef
export const modules = {
	devtool: 'source-map',
	resolve: {
		modules: [
			'src',
			'node_modules'
		],
		extensions: [
			'.js',
			'.ts',
			'.gql'
		]
	},
	rules: [
		{
			test: /\.(graphql|gql)$/,
			exclude: /node_modules/,
			use: [{ loader: 'graphql-tag/loader' }]
		},
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
		}, {
			test: /\.css$/,
			exclude: /node_modules/,
			use: [
				{
					loader: 'style-loader',
				},
				{
					loader: 'css-loader',
					options: {
						importLoaders: 1,
					}
				},
				{
					loader: 'postcss-loader'
				}
			]
		},
		{
			test: /\.s[a|c]ss$/,
			loader: 'style!css!sass'
		}
	],
	plugins: [
		new ThreadsPlugin()
	]
};


