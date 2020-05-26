import Vue from 'vue';
import routes from '../routes/routes';
import VueRouter from 'vue-router';

export default class RouterLoader {
    public static loadVueRouter(): VueRouter {
        Vue.use(VueRouter);

        // Create the router instance and pass the `routes` option
        const router = new VueRouter({
            routes, // short for `routes: routes`
        });
        return router;
    }
}