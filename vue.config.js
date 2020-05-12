// eslint-disable-next-line no-undef
module.exports = {
	configureWebpack: config => {
		if (process.env.NODE_ENV === 'production') {
			// mutate config for production...
		} else {
			config.output.globalObject('this');
		}

	},

	pluginOptions: {
		electronBuilder: {
			builderOptions: {
				appId: 'pingu-sync',
				productName: 'PinguSync',
				mac: {
					icon: './src/assets/logo/app/icon/mac/icon.icns',
					category: 'public.app-category.utilities'
				},
				win: {
					icon: './src/assets/logo/app/icon/windows/512x512.png'
				},
				extraFiles: [
					{
						'from': './src/keys',
						'to': 'src/keys',
						'filter': ['**/*']
					}
				],
			},
			// List native deps here if they don't work
			disableMainProcessTypescript: false, // Manually disable typescript plugin for main process. Enable if you want to use regular js for the main process (src/background.js by default).
			mainProcessTypeChecking: false, // Manually enable type checking during webpck bundling for background file.
			nodeIntegration: true,
			chainWebpackRendererProcess: (config) => {
				config.module.rules.delete('eslint');
			}
		}
	},

	chainWebpack: (config) => {
		config.module.rule('i18n')
			.resourceQuery(/blockType=i18n/)
			.type('javascript/auto')
			.use('i18n')
			.loader('@kazupon/vue-i18n-loader')
			.end();
	},

	runtimeCompiler: true,
	css: {
		extract: false
	},

	lintOnSave: false,

};
