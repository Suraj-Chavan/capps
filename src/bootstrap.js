Vue.config.productionTip = false;
import Vue from "vue";
import store from "@/store";
import App from "@/App.vue";
import router from "@/router";
import '@fontsource-variable/noto-sans';
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "@fortawesome/fontawesome-free/js/regular";
import "@fortawesome/fontawesome-free/js/brands";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "@/assets/css/common.scss";
import "@/assets/css/style.scss";
import "@/Framework";

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

/*CONFIG */
// Vue.prototype.$config = Vue['$config'] = window.config;



/*REST SETTING*/
const servertype = config.jsonserver ? 'jsonserver' : 'apiserver'
const baseurl = config.jsonserver ? config.JREST : config.NREST
import credCAPI from "@/utils/credCAPI";
window.credCAPI = Vue.$credCAPI = Vue.prototype.$credCAPI = credCAPI({ baseurl: baseurl, servertype: servertype });
window.app_process = process.env.NODE_ENV === 'development' ? "development" : "production";
/* Plugins */
import Plugin from '@/plugins';
Vue.use(Plugin, store);


/* layout */
import dashboard from "@/components/layout"
Vue.use(dashboard);

import { i18n } from './i18n';

Vue.prototype.$eventBus = new Vue();

store.dispatch('AppSettingsLoad/getSettingsFromServer');

new Vue({
  i18n,
  router: router,
  store: store,
  render: (h) => h(App),
}).$mount("#app");
