// eslint-disable-next-line no-undef
module.exports = {
	configureWebpack: {
		devtool: 'source-map',
	},

	pluginOptions: {
		electronBuilder: {
			// List native deps here if they don't work
			externals: ['dom'],
		}
	},

	chainWebpack: (config) => {
		config.output.globalObject('this');
		config.module.rule('i18n')
			.resourceQuery(/blockType=i18n/)
			.type('javascript/auto')
			.use('i18n')
			.loader('@kazupon/vue-i18n-loader')
			.end();
	},

	runtimeCompiler: true
};
