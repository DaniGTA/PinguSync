// 1. Define route components.

import { Route, RouterOptions } from 'vue-router';

// These can be imported from other files
const LoadingScreen = async () => import(/* webpackChunkName: "loading" */ './../components/loading-screen/LoadingScreen.vue');
const FirstSetupView = () => import(/* webpackChunkName: "setup" */ './../components/first-start/SetupView.vue');
const MainView = () => import(/* webpackChunkName: "setup" */ './../components/main/MainView.vue');
const SeriesView = () => import(/* webpackChunkName: "setup" */ './../components/main/series/detail/DetailInfo.vue');
const ListView = () => import(/* webpackChunkName: "setup" */ './../components/main/list/ListBlock.vue');

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes: any[] = [
    { path: '/main', component: MainView, children: [
        { path: 'series/:id', name: 'SeriesDetail', component: SeriesView },
        { path: 'list', name: 'List',component: ListView }
    ]
    },
    { path: '/setup', component: FirstSetupView },
    { path: '/', component: LoadingScreen },
    { path: '*', redirect: '/' },
];

export default routes;