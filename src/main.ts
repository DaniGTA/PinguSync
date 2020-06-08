import Vue from 'vue';
import App from './App.vue';

import LangLoader from './loader/lang-loader';
import QuasarLoader from './loader/quasar-loader';
import RouterLoader from './loader/router-loader';
import FontLoader from './loader/font-loader';
import './loader/vuex-loader';
import store from './store';

Vue.config.productionTip = false;

QuasarLoader.loadQuasar();
FontLoader.loadFont();
const i18n = LangLoader.getI18n();
const router = RouterLoader.loadVueRouter();

new Vue({
  i18n,
  store,
  render: (h): any => h(App),
  router,
}).$mount('#app');
