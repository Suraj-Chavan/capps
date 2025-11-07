import {
    isFunction,
    hasOwn,
} from "@bit/credence_analytics.app-components.cred.utility/index.js";

const notificationTypeHandlers = {
    appbuilder_upload: function (item) {
        const data = item.data;        
        const Path = `/oneview/app-builder/dist/index.html#/viewer/app/${data.appid}/${data.groupid}/${data.collectionid}/batch-upload/upload-history/${data.fileid}`;
        
        data.msg = data.msg + `&nbsp;&nbsp;<a href="${Path}" target="_blank" rel="opener" onclick class="notification-a">View Details</a>`;
        return item;
    }
}

export function processNotification(item, dummyArr, vm) {
    hasOwn(notificationTypeHandlers, item.type)
        && isFunction(notificationTypeHandlers[item.type])
        && notificationTypeHandlers[item.type].call(vm, item);
    dummyArr.push(item.data);
    return item;
}




export default notificationTypeHandlers;