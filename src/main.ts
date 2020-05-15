import Vue from 'vue';
import Router from 'vue-router';
import VueI18n from 'vue-i18n';

import App from './App.vue';

import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome';
import routes from './routes/routes';


library.add(fas);

dom.watch();

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('font-awesome-layers', FontAwesomeLayers);
Vue.component('font-awesome-layers-text', FontAwesomeLayersText);

Vue.config.productionTip = false;

// 0. If using a module system (e.g. via vue-cli), import Vue and VueRouter
// and then call `Vue.use(VueRouter)`.
Vue.use(Router);
Vue.use(VueI18n);

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new Router({
  routes, // short for `routes: routes`
});

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
});

new Vue({
  i18n,
  render: (h) => h(App),
  router,
}).$mount('#app');
