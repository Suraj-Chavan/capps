import { remoteApplicationDetails } from "config";
import getRemoteModule from "@/plugins/get-remote-module.js";

const REMOTE_APP2 = remoteApplicationDetails.remoteApp2;
const FEDERATED_MODULES = REMOTE_APP2.federatedModules;


export const { default: PageBuilderModules } = await getRemoteModule({
    remoteAppName: REMOTE_APP2.appName,
    remoteURL: REMOTE_APP2.remoteURL,
    callback: loadComponent => loadComponent(FEDERATED_MODULES.PageBuilderStore)
}).then(res => (res))