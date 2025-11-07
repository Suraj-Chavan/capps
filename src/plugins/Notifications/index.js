import BaseNotification from './BaseNotification';
import { events } from './event'
const Notification = {
    install(Vue) {
        if (this.installed) return
        this.installed = true;


        Vue.component('BaseNotification', BaseNotification);

        const getPorcessId = async () => {
            const response = await Vue.$credCAPI.collection(`etf-op/processprogress/create/id`).read({});
            return response.pid
        };

        const webNotification = function (message, Title = 'Title') {
            if (window.Notification && window.Notification.permission !== "denied") {
                window.Notification.requestPermission(function (status) {  // status is "granted", if accepted by user
                    var n = new window.Notification(Title, {
                        body: message,
                        icon: '/info.png' // optional
                    });
                });
            }
        }

        const showProcessStatus = async params => {
            if (typeof params != 'object' || Array.isArray(params)) {
                let caughtType = typeof params
                if (Array.isArray(params)) caughtType = 'array'

                throw new Error(
                    `Options type must be an object. Caught: ${caughtType}. Expected: object`
                )
            }

            if (typeof params === 'object') {
                if (!params.processName)
                    throw new Error(`Process name is mandatory`);

                events.$emit('showProcessStatus', params)
            }
        };

        showProcessStatus.close = () => {
            events.$emit('close-showProcessStatus')
        }
        showProcessStatus.getPorcessId = getPorcessId

        showProcessStatus.webNotification = webNotification


        Vue['$showProcessStatus'] = Vue.prototype.$showProcessStatus = showProcessStatus

        // attaching to window for testing
        window.$showProcessStatus = showProcessStatus
    }
}
export default Notification