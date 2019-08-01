module.exports = {
    diff: true,
    extension: ['ts'],
    opts: './test/mocha.opts',
    package: './package.json',
    reporter: 'spec',
    ui: 'bdd',
    require: ["ts-node/register"]
};
