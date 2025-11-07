import { loadCappsCardJsFile } from "@/Framework/utility/LOAD_CAPPS_FILES/loadCappsJsFile.js";
import { processListJsConfig } from "@/Framework/JS API/LIST";
import Card from "./CardContent.js";
import Vue from "@/ourVue.js";

export async function processCardJsFile({ appName, collectionName }) {
    const listJs = await processListJsConfig({ moduleName: appName, collectionName });
    const cardJs = await loadCappsCardJsFile({ appName, collectionName });

    const template = cardJs.template;
    const style = cardJs.style;
    const CardComponent = Vue.extend(Card({ template, style, listJs }));
    return {
        isCardComponentLoaded: !!template,
        cardComponent: CardComponent
    };
}
