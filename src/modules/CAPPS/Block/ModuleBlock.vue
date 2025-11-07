<template>
    <div>
        <router-view></router-view>
    </div>
</template>

<script>
import { mapActions, mapMutations } from "vuex";
export default {
    name: "ModuleComponent",
    props: {
        moduleName: {
            type: String,
            required: true
        }
    },
    watch: {
        moduleName: {
            immediate: true,
            handler(moduleName) {
                this.collectionReset();
                this.reset();
                this.setModuleName(moduleName);
                this.loadApplicationConfiguration(moduleName);
            }
        }
    },
    methods: {
        ...mapActions("ModuleBlock", ["setModuleName", "setModuleConfigurationData", "reset"]),
        ...mapActions("CollectionBlock", { collectionReset: "reset" }),
        ...mapMutations("CollectionBlock", ["SET_COLLECTION_SCHEMA_DETAILS"]),
        loadApplicationConfiguration(moduleName) {
            const vObj = {}; // Adjust the body object as needed
            this.$store.commit("loading", true);
            this.$credCAPI
                .collection(`${moduleName}/config`)
                .read({ body: vObj })
                .then((response) => {
                    if(response.status === "unsuccess" || Object.keys(response).length === 0) 
                        throw new Error("Invalid response");
					this.setModuleConfigurationData(response);
                    this.$store.commit("loading", false);
                })
                .catch((error) => {
                    console.error(error);
                    this.setModuleConfigurationData({ status: "unsuccess", msg: `Invalid module ${moduleName}` });
                    this.SET_COLLECTION_SCHEMA_DETAILS({ status: "unsuccess", msg: `Invalid module ${moduleName}`});
                    this.$store.commit("loading", false);
                });
		}
    },
}
</script>