import Vue from "vue";
import VueRouter from "vue-router";

import routes from "./routes";

window.EventBus = new Vue();

Vue.use(VueRouter);

Vue.prototype.$API_URL = "http://maksiu2.asuscomm.com:4050/";
// Vue.prototype.$API_URL = "http://localhost:8080/";
// Vue.prototype.$API_URL = "https://wims-mj.herokuapp.com/";
// Vue.prototype.$API_URL = "https://v1-wims.herokuapp.com/"

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function( /* { store, ssrContext } */ ) {
    const Router = new VueRouter({
        scrollBehavior: () => ({ x: 0, y: 0 }),
        routes,

        // Leave these as they are and change in quasar.conf.js instead!
        // quasar.conf.js -> build -> vueRouterMode
        // quasar.conf.js -> build -> publicPath
        mode: process.env.VUE_ROUTER_MODE,
        base: process.env.VUE_ROUTER_BASE
    });

    return Router;
}