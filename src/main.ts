import { createApp } from 'vue'
import App from './App.vue'
import { setupI18n } from './i18n'
import router from './routes/index'

const app = createApp(App)

app.use(setupI18n())
    .use(router)
    .mount('#app')
