const path = require('path')
function resolve(dir) {
    return path.join(__dirname, dir)
}
// eslint-disable-next-line no-undef
module.exports = {
    configureWebpack: {
        target: 'web',
    },
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                asar: true,
                appId: 'pingu-sync',
                productName: 'PinguSync',
                mac: {
                    icon: './src/assets/logo/app/icon/mac/icon.icns',
                    category: 'public.app-category.utilities',
                },
                win: {
                    icon: './src/assets/logo/app/icon/windows/512x512.png',
                },
                extraFiles: [
                    {
                        from: './src/keys',
                        to: 'src/keys',
                        filter: ['**/*'],
                    },
                ],
            },
            disableMainProcessTypescript: false,
            mainProcessTypeChecking: false,
            nodeIntegration: true,
            chainWebpackRendererProcess: config => {
                config.module.rules.delete('eslint')
                config.plugins.delete('prefetch')

                config.module
                    .rule('i18n')
                    .resourceQuery(/blockType=i18n/)
                    .type('javascript/auto')
                    .use('i18n')
                    .loader('@kazupon/vue-i18n-loader')
                    .end()
                config.resolve.alias.set('@backend', resolve('src/backend'))
                config.resolve.alias.set('@', resolve('src'))
                config.resolve.alias.set('/@', resolve('src'))
            },
            chainWebpackMainProcess: config => {
                config.module
                    .rule('graphql')
                    .test(/\.(graphql|gql)$/)
                    .use('graphql-tag/loader')
                    .loader('graphql-tag/loader')
                    .end()
                config.resolve.alias.set('@backend', resolve('src/backend'))
                config.resolve.alias.set('@', resolve('src'))
                config.resolve.alias.set('/@', resolve('src'))
            },
        },
        i18n: {
            localDir: 'locales',
            locale: 'en',
            fallbackLocale: 'en',
            localeDir: 'locales',
            enableLegacy: false,
            runtimeOnly: false,
            compositionOnly: false,
            fullInstall: true,
        },
    },

    runtimeCompiler: true,

    lintOnSave: false,

    css: {
        loaderOptions: {
            sass: {
                additionalData: '@import "@/style/variables.sass";',
            },
        },
    },
}
