module.exports = {
    configureWebpack: {
        devtool: 'source-map',
    },
    chainWebpack: (config) => {
        config.module.rule('worker')
            .test(/\.worker\.ts$/i)
            .use('worker-loader')
            .loader('worker-loader');
    }
};