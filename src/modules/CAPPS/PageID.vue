<template>
    <div class="m-2">
        <iframe class="page-container" :src="pageViewerURL"></iframe>
        <!-- <page-display :page-id="pageId" :key="pageId"></page-display> -->
    </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { remoteApplicationDetails } from "config";
// import getRemoteModule from "@/plugins/get-remote-module.js";

const { remoteApp2: REMOTE_APP2 } = remoteApplicationDetails;

// const FEDERATED_MODULES = REMOTE_APP2.federatedModules;
// getRemoteModule({ 
// 	remoteAppName: "packages",
// 	remoteURL: REMOTE_APP2.remoteURL + "/../packages.js",
// 	callback: loadComponent => {
// 		loadComponent("./packageInit");
// 	}
// })

export default {
    name: "PageID",
    components: {
        // PageDisplay: getRemoteModule({
		// 	remoteAppName: REMOTE_APP2.appName,
		// 	remoteURL: REMOTE_APP2.remoteURL,
		// 	callback: loadComponent => () => loadComponent(FEDERATED_MODULES.PageDisplay)
		// }),
    },
    props: {
        moduleName: {
            type: String,
            required: true
        },
        pageId: {
            type: String,
            required: true
        },
        theme: {
            default: "light"
        },
        filters: {
            type: String,
        }
    },
    computed: {
        ...mapState("ModuleBlock", ["moduleConfigurations"]),
        pageViewerURL() {
            const IS_PROD = REMOTE_APP2.remoteURL.includes("/dist");
            const SELECTED_FILTERS = this.filters ? `?filters=${this.filters}` : "";
            const MODULE_NAME = this.moduleName;

            // Add moduleName to hash route query parameters
            const separator = SELECTED_FILTERS ? '&' : '?';
            const moduleParam = `${separator}moduleName=${MODULE_NAME}`;

            return REMOTE_APP2.remoteURL + `${IS_PROD ? '/../index.html' : '/../'}#/viewer-page/${this.pageId}${SELECTED_FILTERS}${moduleParam}`
        },
    },
    watch: {
        "moduleConfigurations": {
            immediate: true,
            handler(moduleC) {
                document.title = (moduleC && moduleC.NAME) || ""
            }
        },
        pageId: {
            immediate: true,
            handler(pageId) {
                this.setHomePage(`/${this.moduleName}/pages/${pageId}`);
            }
        }
    },
    methods: {
        ...mapActions("CappsPageConfigurations", ["setHomePage"]),
    }
}
</script>

<style lang="scss" scoped>
.page-container {
    height: 90vh;
    width: 100%;
    border: 0;
}
</style>