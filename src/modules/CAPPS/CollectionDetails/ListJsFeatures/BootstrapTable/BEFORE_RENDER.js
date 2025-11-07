import { LIST_JS_RESERVED_KEYS } from '@/Framework/constants/listJs.js';

const LIST_ONLOAD_EVENT = "CAPPs_LIST_ONLOAD";

export default function ({
    features,
    collection
}) {
    console.log(" CAPPs_LIST_ONLOAD event registering ...");

    const EVENT_NAME = `${LIST_ONLOAD_EVENT}_${collection}`;
    // Ensure the event listener is only added once per EVENT_NAME
    if (!document.listenersAdded || !document.listenersAdded[EVENT_NAME]) {
        document.listenersAdded = document.listenersAdded || {};
        document.listenersAdded[EVENT_NAME] = true;

        document.addEventListener(EVENT_NAME, function(event) {
        console.log(" CAPPs_LIST_ONLOAD event called ...");
            const executeBeforeListRender = features[LIST_JS_RESERVED_KEYS.BEFORE_RENDER];
            if (typeof executeBeforeListRender === 'function' && event.detail) {
                const { cappsListUtilityAPIs } = event.detail;
                executeBeforeListRender(cappsListUtilityAPIs);
            }
        });
    }
}

export const notifyListOnload = function(collection, cappsListUtilityAPIs) {
    console.log(" CAPPs_LIST_ONLOAD event dispatching ...");

    const EVENT_NAME = `${LIST_ONLOAD_EVENT}_${collection}`;
    document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cappsListUtilityAPIs } }));
}