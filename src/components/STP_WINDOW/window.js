import Vue from "vue";
import stp from "./stp";

export default function ({
    open,
    stpUrl
}) {

    async function onCloseModal() {
        const _user_id = sessionStorage.getItem("_user_id");
        const params = new URLSearchParams();
        params.append("event", "getStopEQSTP");
        params.append("sessionid", sessionStorage.getItem("_ticket"));
        params.append("onDate", "");
        params.append("byUser", _user_id);
        await fetch("/Framewrk/stp_etf.jsp", {
            body: params,
            method: "post",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res;
            })
            .then((res) => res.json())
            .then((res) => console.error(`getStopEQSTP response`, res))
            .catch((err) => {
                console.error(`getStopEQSTP`, err);
            });

        const params2 = new URLSearchParams();
        params2.append("event", "getWatcherStop");
        params2.append("sessionid", sessionStorage.getItem("_ticket"));
        params2.append("onDate", "");
        params2.append("byUser", _user_id);

        await fetch("/Framewrk/stp_etf.jsp", {
            body: params2,
            method: "post",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res;
            })
            .then((res) => res.json())
            .then((res) => console.error(`getWatcherStop response`, res))
            .catch((err) => {
                console.error(`getWatcherStop`, err);
            });
    }

    let vueTranslator = null;
    const vueContainer = document.createElement("div");
    document.body.appendChild(vueContainer);

    function unMountVueInstance() {
        vueTranslator && vueTranslator.$destroy();
        vueTranslator && vueTranslator.$el.remove();
    }

    const $Modal = Vue.extend({ 
        render: function(h) {
            const _this = this;
            return h(stp, {
                props: {
                    onCloseModal,
                    stpUrl,
                    open: _this.open
                },
                on: {
                    "modal:open": function(bool) {
                        _this.open = bool
                    }
                },
            });
        },
        data: function() {
            return {
                open
            }
        },
        watch: {
            open(newVal, oldVal) {
                if(!newVal && newVal != oldVal) unMountVueInstance();
            }
        },
    });
    vueTranslator = new $Modal().$mount(vueContainer);
}