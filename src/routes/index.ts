import routes from './routes'
import { createWebHashHistory, createRouter } from 'vue-router'

export default createRouter({
    routes,
    history: createWebHashHistory(),
})
