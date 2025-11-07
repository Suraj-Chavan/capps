<template>
    <div>
        <InputForm 
            v-if="!isVirtual && moduleName && !schemaIsLoading" 
            v-bind="$props"
            :collection-schema-details="collectionSchemaDetails"
        />
        <custom-input-form 
            v-else-if="isVirtual && moduleName && !schemaIsLoading"
            v-bind="$props"
            @set:collection:form:availability="(flag)=>{ifVirtualIsFormAvailable = flag}"
        >
        </custom-input-form>
    </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
    name: "FormScreen",
    components: {
        InputForm: () => import('../FormComponents/InputForm.vue'),
        CustomInputForm: () => import('../FormComponents/CustomHtmlComponent.vue'),
    },
    props: {
        moduleName: {
            type: String,
            required: true
        },
        collection: {
            type: String,
            required: true
        },
        id: {
            type: String,
        },
        audit_id: {
            type: String,
        },
        defaults: {
            type: Object
        },
        redirectTo: {
            type: String
        },
        action: {
            type: String,
            default: "add"
        }
    },

    data() {
        return {
            schemaIsLoading: true,
            ifVirtualIsFormAvailable: true,
        }
    },

    computed: {
        ...mapState("ModuleBlock", ["moduleConfigurations"]),
        ...mapState("CollectionBlock", ["collectionSchemaDetails", "collectionName"]),
        isVirtual() {
            return this.ifVirtualIsFormAvailable === true && this?.collectionSchemaDetails?.VIRTUAL_COLLECTION == 1;
        },
        watchModuleCollectionChange() {
            return this.moduleName +"/"+ this.collection
        },
    },

    watch: {
        watchModuleCollectionChange: {
            immediate: true,
            async handler() {
                this.schemaIsLoading = true;
                // If schema is loaded already then do nothing
                const collectionName = this.collection;
                if(this.collectionName === collectionName) {
                    this.schemaIsLoading = false;
                    return
                };

                this.reset();
                this.setCollectionName(collectionName);
                await this.getCollectionSchemaDetails({ moduleName: this.moduleName, collectionName });
                this.schemaIsLoading = false;
                this.setDocumentTitle();
            }
        },
    },

    methods: {
        ...mapActions("CollectionBlock", ["setCollectionName", "getCollectionSchemaDetails", "reset"]),
        setDocumentTitle() {
			const APPLICATION_DETAILS = { ...(this.moduleConfigurations || {}) };
            const COLLECTION_DETAILS = { ...(this.collectionSchemaDetails || {}) };
            APPLICATION_DETAILS.NAME = APPLICATION_DETAILS.NAME || "";
            COLLECTION_DETAILS.NAME =  COLLECTION_DETAILS.NAME || "";
			document.title = `${(APPLICATION_DETAILS.NAME)}${APPLICATION_DETAILS.NAME && COLLECTION_DETAILS.NAME && " :: "}${(COLLECTION_DETAILS.NAME)} :: ${this.action}` || "CAPPS";
			return document.title;
		},
    }
}
</script>