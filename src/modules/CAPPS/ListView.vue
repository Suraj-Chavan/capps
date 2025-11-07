<template>
  <div>
	<collection-screen v-if="collectionSchemaLoaded" v-bind="$props"></collection-screen>
	<collection-schema-not-available 
		:msg="collectionSchemaDetails.msg" 
		:go-back-to-home-page="goToHomePage"
		v-else
	>
	</collection-schema-not-available>
  </div>
</template>

<script>
import CollectionScreen from './CollectionScreen.vue';
import CollectionSchemaNotAvailable from "./CollectionSchemaNotAvailable.vue";
import { mapState } from "vuex";

export default {
	name: "list-view",
	components: {
		CollectionScreen,
		CollectionSchemaNotAvailable,
	},
	props: {
		moduleName: {
			type: String,
			required: true,
		},
		collection: {
			type: String,
			required: true,
		},
		filter: {
			type: Object,
			default: () => ({}),
		},
	},
	data() {
		return {
			isSchemaLoaded: true,
		}
	},
	computed: {
		...mapState("CollectionBlock", ["collectionSchemaDetails"]),
		...mapState("ModuleBlock", ["moduleConfigurations"]),
		collectionSchemaLoaded() {
			if(this.collectionSchemaDetails.status === "unsuccess") return false;
			return true;
		},
		currentApplicationDetails() {
			const APPLICATION_DETAILS = this.moduleConfigurations || {};
			return APPLICATION_DETAILS;
		}
	},
	methods: {
		goToHomePage() {
			this.$router.go(-1);
		}
	}
}
</script>

<style>

</style>