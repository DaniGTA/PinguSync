// These can be imported from other files
const LoadingScreen = async (): Promise<typeof import('*.vue')> =>
    import(/* webpackChunkName: "loading" */ './../components/loading-screen/LoadingScreen.vue')
const FirstSetupView = (): Promise<typeof import('*.vue')> =>
    import(/* webpackChunkName: "setup" */ './../components/first-start/SetupView.vue')
const MainView = (): Promise<typeof import('*.vue')> =>
    import(/* webpackChunkName: "setup" */ './../components/main/MainView.vue')
const SeriesView = (): Promise<typeof import('*.vue')> =>
    import(/* webpackChunkName: "setup" */ './../components/main/series/detail/DetailInfo.vue')
const ListView = (): Promise<typeof import('*.vue')> =>
    import(/* webpackChunkName: "setup" */ './../components/main/list/ListBlock.vue')

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
    {
        path: '/main',
        component: MainView,
        children: [
            { path: 'series/:id', name: 'SeriesDetail', component: SeriesView },
            { path: 'list', name: 'List', component: ListView },
        ],
    },
    { path: '/setup', component: FirstSetupView },
    { path: '/', component: LoadingScreen },
    { path: '*', redirect: '/' },
]

export default routes
