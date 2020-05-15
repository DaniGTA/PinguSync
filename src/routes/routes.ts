// 1. Define route components.
// These can be imported from other files
const LoadingScreen = () => import(/* webpackChunkName: "loading" */ './../components/loading-screen/LoadingScreen.vue');
const FirstSetupView = () => import(/* webpackChunkName: "setup" */ './../components/first-start/SetupView.vue');
const MainView = () => import(/* webpackChunkName: "setup" */ './../components/main/MainView.vue');

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
    { path: '/main', component: MainView },
    { path: '/setup', component: FirstSetupView },
    { path: '/', component: LoadingScreen },
    { path: '*', redirect: '/' },
];

export default routes;