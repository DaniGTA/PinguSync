import Vue from 'vue';
import Router from 'vue-router';

import App from './App.vue';

import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome';


library.add(faUserSecret);
library.add(fab)

dom.watch();

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('font-awesome-layers', FontAwesomeLayers);
Vue.component('font-awesome-layers-text', FontAwesomeLayersText);

Vue.config.productionTip = false;

// 0. If using a module system (e.g. via vue-cli), import Vue and VueRouter
// and then call `Vue.use(VueRouter)`.
Vue.use(Router);

// 1. Define route components.
// These can be imported from other files
const LoadingScreen = () => import(/* webpackChunkName: "loading" */ './components/loading-screen/LoadingScreen.vue');
const FirstSetupView = () => import(/* webpackChunkName: "setup" */ './components/first-start/SetupView.vue');

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  { path: '/setup', component: FirstSetupView },
  { path: '/', component: LoadingScreen },
  { path: '*', redirect: '/' },
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new Router({
  routes, // short for `routes: routes`
});

new Vue({
  render: (h) => h(App),
  router,
}).$mount('#app');
