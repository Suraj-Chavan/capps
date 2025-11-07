import { events } from './event';

const StatusProgress = {
    install(Vue) {
        if (this.installed) return
        this.installed = true;

        const getPorcessId = async () => {
            const response = await Vue.$credCAPI.collection(`registry/processprogress/create/id`).read({});
            return response.pid
        };

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
        }

        showProcessStatus.close = () => {
            events.$emit('close-showProcessStatus')
        }

        showProcessStatus.getPorcessId = getPorcessId;

        Vue['$showProcessStatus'] = Vue.prototype.$showProcessStatus = showProcessStatus

        // attaching to window for testing
        window.$showProcessStatus = showProcessStatus;
    }
}
export default StatusProgress