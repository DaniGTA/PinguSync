// eslint-disable-next-line no-undef
module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // mutate config for production...
    } else {
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
            from: './src/keys',
            to: 'src/keys',
            filter: [
              '**/*'
            ]
          }
        ]
      },
      disableMainProcessTypescript: false,
      mainProcessTypeChecking: false,
      nodeIntegration: true,
      chainWebpackRendererProcess: (config) => {
        config.module.rules.delete('eslint');
      }
    },
    i18n: {
      localDir: 'locales'
    },
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: true
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

  lintOnSave: false,

  transpileDependencies: [
    'quasar',
    /[\\/]node_modules[\\/]quasar[\\/]/,
  ]
};