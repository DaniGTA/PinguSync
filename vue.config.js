module.exports = {
    configureWebpack: {
        devtool: 'source-map',
    },
    pluginOptions: {
        electronBuilder: {
            // List native deps here if they don't work


        }
    },
    chainWebpack: (config) => {
        config.output.globalObject('this')
    }
};
