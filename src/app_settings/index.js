import { APP_NAME } from "../constant";

export const readAppSettings = async function () {
    const sSting = `{ ${APP_NAME}: { fav: {}, recent: {} } }`;
    let SETTINGS = "";
    try {
        SETTINGS = await capps.rest.app_settings.read[APP_NAME]()
        SETTINGS = new Function("return " + (atob(SETTINGS) || sSting))();
    } catch (e) {
        SETTINGS = new Function("return "+ sSting)();
    }
    return SETTINGS;
}

export const createAppSettings = async function (ALL_APP_SETTINGS) {
    ALL_APP_SETTINGS = btoa(JSON.stringify(ALL_APP_SETTINGS))
    return await capps.rest.app_settings.create({
        data: {
            APPID: APP_NAME,
            SETTINGS: ALL_APP_SETTINGS,
        },
    }, {
        loader: false
    });
}
