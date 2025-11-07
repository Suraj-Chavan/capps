<template>
    <router-view v-if="!schemaIsLoading"></router-view>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
    name: "collection-view",
    props: {
        moduleName: {
            type: String,
            required: true,
        },
        collection: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            schemaIsLoading: true,
        }
    },
    watch: {
        watchModuleCollectionChange: {
            immediate: true,
            async handler() {
                const collectionName = this.collection;
                this.reset();
                this.setCollectionName(collectionName);
                this.setHomePage(`/${this.moduleName}/doc/${collectionName}/view/list`);
                this.schemaIsLoading = true;
                await this.getCollectionSchemaDetails({ moduleName: this.moduleName, collectionName });
                this.schemaIsLoading = false;
                this.setDocumentTitle();
            }
        },
    },
    computed: {
        ...mapState("ModuleBlock", ["moduleConfigurations"]),
        ...mapState("CollectionBlock", ["collectionSchemaDetails"]),
        watchModuleCollectionChange() {
            return this.moduleName +"/"+ this.collection
        }
    },
    methods: {
        ...mapActions("CollectionBlock", ["setCollectionName", "getCollectionSchemaDetails", "reset"]),
        ...mapActions("CappsPageConfigurations", ["setHomePage"]),
        setDocumentTitle() {
			const APPLICATION_DETAILS = { ...(this.moduleConfigurations || {}) };
            const COLLECTION_DETAILS = { ...(this.collectionSchemaDetails || {}) };
            APPLICATION_DETAILS.NAME = APPLICATION_DETAILS.NAME || "";
            COLLECTION_DETAILS.NAME =  COLLECTION_DETAILS.NAME || "";
			document.title = `${(APPLICATION_DETAILS.NAME)}${APPLICATION_DETAILS.NAME && COLLECTION_DETAILS.NAME && " :: "}${(COLLECTION_DETAILS.NAME)}` || "CAPPS";
			return document.title;
		},
    },

}
</script>