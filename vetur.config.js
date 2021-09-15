/** @type {import('vls').VeturConfig} */
module.exports = {
    settings: {
        'vetur.useWorkspaceDependencies': true,
        'vetur.experimental.templateInterpolationService': true,
    },
    projects: [
        {
            root: './src',
            tsconfig: './tsconfig.json',
            snippetFolder: './.vscode/vetur/snippets',
            globalComponents: ['./src/components/**/*.vue'],
        },
    ],
}
