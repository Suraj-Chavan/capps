<script>
import { mapState } from "vuex";
import { ActionMixin } from "@/mixins/action-mixin";
import Refresh from "./IconComponents/Refresh.vue";
import Filter from "./IconComponents/Filter.vue";
import ClearFilter from "./IconComponents/ClearFilter.vue"
import Export from "./IconComponents/Export.vue";
import DensityCompact from "./IconComponents/DensityCompact.vue";
import DensityComfortable from "./IconComponents/DensityComfortable.vue";

export default {
	mixins: [ActionMixin],
	components: {
		Refresh,
		Export,
		FilterSvg : Filter,
		ClearFilter,
		DensityCompact,
		DensityComfortable
	},
	props: [
		// "dataSource",
		// "dataset",
		// "filterEl",
		// "filterSetting",
		// "localeEl",
		// "collection",
		// "isCheckbox",
		// "isAction",
		// "PageTitle",
		// "staticFilter",
		// "additionalInfo",
		// "cardViewConfig",
		// "paramFilters",
	],
	data: () => ({
		filters: {},
		filtersFormatted: [],
		selectAll: false,
		filterView: false,
		selectedFilters_copy: [],
		filtersLength: [],
		downloadView: false,
		density: '',
	}),
	computed: {
		...mapState(["selectedFilters"]),
		filterCoreDependencies() {
			return {
				availableFilters: this.filterEl,
				queriedFilters: this.paramFilters
			}
		}
	},
	watch: {
		filterCoreDependencies: {
			handler(after) {
				this.addQueryParameterFilters(after.queriedFilters);
			},
			deep: true,
			immediate: true,
		},
		filters: {
			handler(newval) {
				if (newval) {
					this.filterFormatting(newval);
				}
			},
			deep: true,
		},
	},
	created() {
		this.filtersFormatted = this.selectedFilters;
		this.selectedFilters_copy = [...this.selectedFilters];
		this.density = (localStorage.getItem('cred-screen-density') || 'comfortable')?.toLowerCase();
		this.$nextTick(()=>this.changeDensity(this.density))
	},
	methods: {
		onFilterElValueChange(val, item) {
			if(val == "" || val == null) delete this.filters[item.name];
			this.$emit('selected-filter', { 
				field: item.name, 
				value: val 
			});
		},
		applyButtonClicked() {
			let filter = JSON.stringify(this.filters);
			filter = filter === "{}" ? undefined : filter;
			this.$router.push({
				query: { filter }
			});
		},
		addQueryParameterFilters(fieldsObj) {
			const fields = Object.keys(fieldsObj);
			const _this = this;
			_this.filtersFormatted = [];
			_this.filtersFormatted.length = 0;
			_this.filters = null;
			_this.filters = {};
			let filters = {};

			fields.map((fieldName) => {
				let VALUE = fieldsObj[fieldName];
				if(_this.filterEl[fieldName]?.type === "daterange") {
					if(typeof VALUE === "string") {
						VALUE = [VALUE, VALUE];
					};
				};
				filters[fieldName] = VALUE;
			});
			_this.filters = Object.assign(_this.filters, filters);
			_this.$nextTick();
			_this.applyFilter();
		},
		sendFiltervalue() {
			const obj = {};
			this.$emit("from-value", obj);
		},
		filterFormatting(selectedFilters) {
			// if(Object.keys(this.filterEl).length === 0) return;

			this.filtersFormatted = [];
			this.filtersLength = [];


			for (var fieldName in selectedFilters) {
				if(selectedFilters[fieldName] == null || selectedFilters[fieldName] == "") continue;

				if (Array.isArray(selectedFilters[fieldName]) && selectedFilters[fieldName].length > 1) {
					this.filtersLength.push(fieldName);
				} else if (Array.isArray(selectedFilters[fieldName]) == false && selectedFilters[fieldName]) {
					this.filtersLength.push(fieldName);
				}

				const FIELD_TYPE = this.filterEl[fieldName]?.type || "textfield";

				if (["daterange", "date"].includes(FIELD_TYPE)) {
					if (selectedFilters[fieldName][0] !== null) {
						this.filtersFormatted.push(
							{
								field: fieldName,
								value: selectedFilters[fieldName][0],
								asgn: "gteq",
								type: "DATETIME",
							},
							{
								field: fieldName,
								value: selectedFilters[fieldName][1],
								asgn: "lteq",
								type: "DATETIME",
							}
						);
					} else {
						delete this.filters[fieldName];
					}
					continue;
				}

				if("select" === FIELD_TYPE) {
					this.filtersFormatted.push({
						field: fieldName,
						value: Array.isArray(selectedFilters[fieldName]) ? selectedFilters[fieldName] : (selectedFilters[fieldName] || "").split(","),
						asgn: "in",
						type: "string",
					});
					continue;
				}
				
				let { operator, value } = (this.filterEl[fieldName]?.multiple === true || "select" === FIELD_TYPE)
					? { 
						operator: "in", 
						value: Array.isArray(selectedFilters[fieldName]) ? 
							selectedFilters[fieldName] : selectedFilters[fieldName].split(",") 
					}
					: { 
						operator: Array.isArray(selectedFilters[fieldName]) ? "in" : "like", 
						value: selectedFilters[fieldName] 
					} 

				this.filtersFormatted.push({
					field: fieldName,
					value: value,
					asgn: operator,
					type: "string",
				});
			}
		},
		applyFilter() {
			this.$store.commit("ChoseRecord/RESET");
			this.filterFormatting(this.filters);
			this.$store.commit("OnSelectedFilters", this.filtersFormatted);
			this.filterViewHide();
		},
		clearFilters() {
			this.filters = {};
			this.$router.push({
				query: { filter: undefined }
			});
		},
		downloadGridData(type, options) {
			// this is mixin
			this.downloadData(type, options);
		},
		changeView(view) {
			return {
				query: {
					...this.$route.query,
					view: view,
				},
			};
		},
		selectAllCards() {
			if (this.selectAll == true) {
				this.$store.dispatch("ChoseRecord/selectRecords", this.dataSource);
			} else {
				this.$store.commit("ChoseRecord/RESET");
			}
		},
		filterViewShow() {
			this.filterView = true;
		},
		onDownloadShow() {
			this.downloadView = true;
		},
		filterViewHide() {
			this.filterView = false;
			this.$refs?.filterDropdown?.hide(true);
		},
		onDownloadHide() {
			this.downloadView = false;
			this.$refs?.downloadDropdown?.hide(true);
		},
		onDropdownHide(bvEvent) {
			if (this.filterView == true) bvEvent.preventDefault();
		},
		changeDensity(density) {
			localStorage.setItem('cred-screen-density',density)
			this.density = density.toLowerCase();
			const routerElement = document.querySelector('#index-app-router');
    
			const existingClass = Array.from(routerElement.classList).find(cls => cls.includes('-layout'));
			if (existingClass) routerElement.classList.remove(existingClass);
			routerElement.classList.add(this.density + '-layout');
		},
	},
};
</script>

<style lang="scss" scoped>

.top_bar ::v-deep{
	@media screen and (max-width: 1200px) {
		.filter-bar{
			background: var(--white);
			z-index: 4;
		}
	}
	// .dropdown-menu-right{
	// 	left: 0;
	// 	width: max-content;
	// }
}
.filterOverlay{
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: rgb(255 255 255 / 52%);
	z-index: 4;
}

#download_dropdown ::v-deep {
	.dropdown-item {
		&:active {
			background-color: #2499ef !important;
			color: #fff;
		}
		font-weight: 500;
	}
}

.icon {
  font-weight: normal !important; /* Reduce thickness if icon uses font-based weight */
  stroke-width: 1 !important; /* Adjust this if the icon supports stroke-width */
  transform: scale(0.9) !important; /* Optionally reduce size if it looks too bold */
}

.divider {
	width: 1px;
    height: 50%;
    position: absolute;
    top: 12px;
    background: #5f646347;
}
</style>
