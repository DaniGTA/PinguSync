import routes from './routes'
import { createWebHashHistory, createRouter } from 'vue-router'
import { loadLocaleMessages, setI18nLanguage, SUPPORT_LOCALES } from '@/i18n'

const router = createRouter({
    routes,
    history: createWebHashHistory(),
})

export default router
