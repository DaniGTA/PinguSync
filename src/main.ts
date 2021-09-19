import { createApp } from 'vue'
import App from './App.vue'
import { setupI18n } from './i18n'
import router from './routes/index'
import { store } from './store'
import VueLazyLoad from 'vue3-lazyload'

const app = createApp(App)

app.use(setupI18n())
    .use(router)
    .use(store)
    .use(VueLazyLoad)
    .mount('#app')
