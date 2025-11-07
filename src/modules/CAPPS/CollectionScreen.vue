<script>
import MainScreenLayout from "@/mixins/Main-Screen-Layout";
import Filters from "./components/Filters";
import { updateCollectionFilter } from "@/modules/CollectionStateUtilities/getUpdateCollectionQueryFilter.js";

export default {
	mixins: [MainScreenLayout, Filters],
	// components: {
	// 	Filters,
	// },
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
			referenceKey: [],
			// fields: [],
			isCheckbox: true,
			isAction: false,
			defaultFilter: [],
			staticFilter: [],
			defaultFilter: [],
			moduleBasedActionCompPath: "/CAPPS/components",
		};
	},
	computed: {
		readAPI() {
			return `${this.moduleName}/${this.collection}/read`;
		},
		localeName() {
			return `${this.moduleName}.${this.collection}`;
		},
	},
	watch: {
		filter: {
			handler(appliedFilters) {
				updateCollectionFilter(`${this.moduleName}/doc/${this.collection}`, appliedFilters);
			},
			immediate: true,
			deep: true,
		},
	},
};
</script>

<style>
.parent-cell {
	width: 13em;
}
</style>