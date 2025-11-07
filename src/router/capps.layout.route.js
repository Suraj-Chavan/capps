import { loadLanguageAsync } from '@/i18n';
import getRemoteModule from "@/plugins/get-remote-module.js";
import { applanguage, remoteApplicationDetails, productName } from "config";
import { interpolate } from "../Framework/utility/utility.js";
import { APPLICATION_STYLE_PATH, APPLICATION_ENTRY_FILE } from "../Framework/constants/basePaths.js";
import { loadManifestAssets, loadAppIncludeFiles } from "../Framework/Asset Loader/AssetLoader.js";
import { showSpinner, updateSpinnerMessage, hideSpinner } from "../Framework/JS API/UI/UI Utilities/spinner.js";
import { moduleContext } from "../Framework/Router/moduleContext.js";


const REMOTE_APP1 = remoteApplicationDetails.remoteApp1;
const FEDERATED_MODULES = REMOTE_APP1.federatedModules;

function registerOnetimeRouterEvent(callback) {
    if (registerOnetimeRouterEvent?.MODULE_NAME?.initialized) return;
    registerOnetimeRouterEvent.MODULE_NAME = { initialized: true };
    callback();
}

const getApplicationStyleLoader = function () {
    const CACHE = {};
    return function (MODULE_NAME) {
        if(CACHE[MODULE_NAME] || !MODULE_NAME) return;
        try {
            window.capps.require(interpolate(APPLICATION_STYLE_PATH, { moduleName: MODULE_NAME }), function () {
                CACHE[MODULE_NAME] = true;
            });
        } catch {
            delete CACHE[MODULE_NAME];
        }
    }
};

const getApplicationEntryFileLoader = function () {
    const CACHE = {};
    return function (MODULE_NAME) {
        if(CACHE[MODULE_NAME] || !MODULE_NAME) return;
        try {
            window.capps.require(interpolate(APPLICATION_ENTRY_FILE, { moduleName: MODULE_NAME }), function () {
                CACHE[MODULE_NAME] = true;
            });
        } catch {
            delete CACHE[MODULE_NAME];
        }
    }
};

const loadApplicationsAssets = async function (MODULE_NAME) {
    // Asset loading is now handled by beforeEnter route guard
    // with proper spinner feedback and error handling
    console.debug(`[Router] Asset loading for ${MODULE_NAME} handled by beforeEnter guard`);
}

export const LAUNCHER_ROUTE = "/launcher";

export default function ({
    appLayoutIndexComponent,
    appLayoutLauncherComponent,
    appLayoutIndexPath = "/:moduleName",
}) {
    return [
        {
            path: LAUNCHER_ROUTE,
            component: appLayoutLauncherComponent,
            props() {
                return {
                    moduleName: productName
                }
            },
            children: [
                {
                    path: "",
                    component: () => import("@/modules/LauncherDashboard/LauncherDashboard.vue"),
                    children: [
                        {
                            path: ":dashboardId",
                            props: function (params) {
                                return {
                                    ...params.query,
                                    ...params.params
                                }
                            },
                            component: () => import("@/modules/LauncherDashboard/DashboardPreview.vue"),
                        }
                    ]
                }
            ]
        },
        {
            path: appLayoutIndexPath,
            component: appLayoutIndexComponent,
            beforeEnter: async (to, from, next) => {
                // Wait for all application assets to load before proceeding
                const MODULE_NAME = to.params.moduleName;

                // Set current module context (accessible to page-builder iframe)
                moduleContext.setCurrentModule(MODULE_NAME);

                try {
                    showSpinner(`Loading application...`);

                    // Phase 9: Load manifest bundles
                    await updateSpinnerMessage(`Preparing resources...`);
                    const manifestLoaded = await loadManifestAssets(MODULE_NAME);

                    // Fallback to legacy loading if manifest not available
                    if (!manifestLoaded) {
                        await updateSpinnerMessage(`Initializing system...`);
                        const loadApplicationStyles = getApplicationStyleLoader();
                        const loadApplicationMainFile = getApplicationEntryFileLoader();
                        loadApplicationStyles(MODULE_NAME);
                        loadApplicationMainFile(MODULE_NAME);
                    }

                    // Phase 10: Load app includes
                    await updateSpinnerMessage(`Configuring interface...`);
                    try {
                        await loadAppIncludeFiles(MODULE_NAME);
                    } catch (error) {
                        console.debug(`[Router] Error loading app include files:`, error);
                    }

                    // Language files
                    await updateSpinnerMessage(`Almost ready...`);
                    registerOnetimeRouterEvent(function () {
                        const END_POINT = `${MODULE_NAME}/locale/${applanguage || "en"}`;
                        loadLanguageAsync(MODULE_NAME + applanguage, END_POINT);
                    });

                    console.info(`[Router] All assets loaded for module: ${MODULE_NAME}`);
                    console.log('[Router] Hiding spinner and proceeding to route...');
                    hideSpinner();
                    next();
                } catch (error) {
                    console.error(`[Router] Error loading assets for module: ${MODULE_NAME}`, error);
                    hideSpinner();
                    // Continue anyway to prevent breaking the app
                    next();
                }
            },
            props: function (route) {
                return {
                    ...route.query,
                    ...route.params
                }
            },
            children: [
                {
                    path: "dashboard-hub",
                    component: getRemoteModule({
                        remoteAppName: REMOTE_APP1.appName,
                        remoteURL: REMOTE_APP1.remoteURL,
                        callback: (loadComponent) => () => loadComponent(FEDERATED_MODULES.DashboardRouterWrapper),
                    }),
                },
                {
                    path: "pages/:pageId",
                    // -- /NREST/{module}/pages/{pageid}
                    props: function (params) {
                        return {
                            ...params.query,
                            ...params.params
                        }
                    },
                    component: () => import("@/modules/CAPPS/PageID.vue"),
                },


                {
                    path: "doc/:collection",
                    props: function (params) {
                        return {
                            ...params.params,
                            ...params.query,
                        }
                    },
                    component: () => import("@/modules/CAPPS/Block/CollectionBlock.vue"),
                    children: [
                        {
                            path: "view",
                            props: true,
                            component: () => import("@/modules/CAPPS/View/collection-view.vue"),
                            children: [
                                {
                                    path: ":view_type",
                                    props: function (params) {
                                        return {
                                            ...params.query,
                                            ...params.params,
                                            ...{ filter: new Function("return " + (params.query.filter || "{}"))() }
                                        }
                                    },
                                    component: () => import("@/modules/CAPPS/ListView.vue"),
                                    children: [
                                        {
                                            path: "upload",
                                            props: function (params) {
                                                return {
                                                    ...params.query,
                                                    ...params.params,
                                                }
                                            },
                                            component: () => import("@/modules/CAPPS/components/UploadScreen.vue"),
                                        },
                                        {
                                            path: "module/:moduleType/:id/:displayMode?",
                                            component: () => import("@/modules/CAPPS/ModuleDisplay.vue"),
                                            props: function (params) {
                                                return {
                                                    action: "module",
                                                    moduleType: params.params.moduleType,
                                                    displayMode: params.params.displayMode || "modal",
                                                    ...params.query,
                                                    ...params.params
                                                }
                                            },
                                        },
                                        {
                                            path: "module/:moduleType/:displayMode?",
                                            component: () => import("@/modules/CAPPS/ModuleDisplay.vue"),
                                            props: function (params) {
                                                return {
                                                    action: "module",
                                                    moduleType: params.params.moduleType,
                                                    displayMode: params.params.displayMode || "modal",
                                                    id: null, // No record ID for this route
                                                    ...params.query,
                                                    ...params.params
                                                }
                                            },
                                        },
                                    ],
                                },
                            ]
                        },
                        {
                            path: "view_record/:id/:audit_id?",
                            component: () => import("@/modules/CAPPS/FormScreen.vue"),
                            props: function (params) {
                                return {
                                    action: "view",
                                    ...params.query,
                                    ...params.params,
                                    ...{
                                        defaults: new Function("return " + (params.query.defaults || "{}"))(),
                                        redirectTo: params.query.redirectTo
                                    }
                                }
                            },
                        },
                        {
                            path: "add/:id?",
                            component: () => import("@/modules/CAPPS/FormScreen.vue"),
                            props: function (params) {
                                return {
                                    action: "add",
                                    ...params.query,
                                    ...params.params,
                                    ...{ defaults: new Function("return " + (params.query.defaults || "{}"))() }
                                }
                            },
                        },
                        {
                            path: "update/:id",
                            component: () => import("@/modules/CAPPS/FormScreen.vue"),
                            props: function (params) {
                                return {
                                    action: "update",
                                    ...params.query,
                                    ...params.params,
                                    ...{
                                        defaults: new Function("return " + (params.query.defaults || "{}"))(),
                                        redirectTo: params.query.redirectTo
                                    }
                                }
                            },
                        },
                        {
                            path: "upload",
                            component: () => import("@/modules/CAPPS/FormScreen.vue"),
                            props: function (params) {
                                return {
                                    ...params.query,
                                    ...params.params
                                }
                            },
                        },
                    ],
                },
            ]
        }
    ]
}