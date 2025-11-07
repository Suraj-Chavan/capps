import Vue from "vue";
import ConfigNotFound from "./ConfigNotFound";

export default function (errorStack) {
    return new Vue({
        render: h => h(ConfigNotFound, {
            props: {
                errorStack
            }
        }),
    }).$mount('#app');
}