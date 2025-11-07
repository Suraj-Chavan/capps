import {
    isPlainObject,
} from "@credenceanalytics/utilities";

export function getCollectionFilters(collectionRoute) {
    if(!collectionRoute) return "";
    let filters = "";
    try {
        filters = new Function("return " + (sessionStorage.getItem(collectionRoute) || ""))();
        if(!isPlainObject(filters) || Object.keys(filters).length === 0) throw new Error("Invalid filters");
    } catch {
        return "";
    }
    return "?filter="+encodeURIComponent(JSON.stringify(filters));
}

export function updateCollectionFilter(collectionRoute, filters) {
    sessionStorage.setItem(collectionRoute, JSON.stringify(filters));
}