
<script>
import { ActionMixin } from "@/mixins/action-mixin";
import AddButton from "@/components/IconComponents/AddButton.vue";
import Upload from "@/assets/svg_components/upload.vue";
import { hasOwn, isPlainObject } from "@credenceanalytics/utilities";
import { LIST_JS_RESERVED_KEYS } from "@/Framework/constants/listJs";
import FilterView from "@/components/FilterView.vue";


export default {
	mixins: [ActionMixin, FilterView],
	props: [
		// "dataSource",
		// "dataset",
		// "filterEl",
		// "filterSetting",
		// "localeEl",
		// "collection",
		// "isCheckbox",
		// "isAction",
		// "referenceKey",
		// "staticFilter",
		// "additionalInfo",
		// "cardViewConfig",
		// "PageTitle",
		// "paramFilters",
		// "moduleName",
	],
	components: {
		AddButton,
		Upload,
	},
	data() {
		return {
			listJsActions: {},
			isInstanceMounted: false,
		};
	},
	watch: {
		collection: {
			immediate: true,
			async handler(newVal, oldVal) {
				// Here its not mounted cause watch immediate true which is similar to created hook
				this.$emit("filter:rendered", false);
				this.filterComponentHandler(false);
				await this.waitWhileFilterMounted();

				if (newVal && newVal != oldVal) {
					this.$emit("filter:rendered", true);
					this.filterComponentHandler(true);
					await this.loadListJsActions();
				}
			},
		},
	},
	methods: {
		waitWhileFilterMounted() {
			const _this = this;
			return new Promise((resolve) => {
                let interval = setInterval(() => {
                    if (_this.isInstanceMounted) {
                        clearInterval(interval);
                        resolve("Filter instance mounted");
                    }
                }, 1); // Check every 100 millisecondss
			});
		},
		async loadListJsActions() {
			// Assuming listJs API is already called in the getCollectionFields.js
			// So we are waiting here for list key is loaded in capps.ui[_this.collection]
			// and then we are assigning the list key to listJsActions
			const _this = this;
			const LOADED_ACTIONS = await new Promise((resolve) => {
				let interval = setInterval(() => {
					try {
						if (hasOwn(capps.ui[_this.collection], "list")) {
							clearInterval(interval);
							resolve(capps.ui[_this.collection].list);
						}
					} catch (error) {
                        console.error("Error in loadListJsActions", error);
						clearInterval(interval);
					}
				}, 100); // Check every 100 milliseconds
			});
			if (!isPlainObject(LOADED_ACTIONS)) {
				this.listJsActions = {};
				return;
			}

			// Get all reserved keys
			const reservedKeys = Object.values(LIST_JS_RESERVED_KEYS);

			// Filter only function type properties that are not in reserved keys
			const actions = Object.entries(LOADED_ACTIONS || {}).reduce(
				(acc, [key, value]) => {
					if (
						!reservedKeys.includes(key) &&
						typeof value === "function"
					) {
						acc[key] = {
							handler: value,
							label: key,
							show: () => true,
							icon: null,
						};
					}
					return acc;
				},
				{}
			);

			// Extract actions from buttonList if it exists
			const buttonListKey = LIST_JS_RESERVED_KEYS.BUTTON_LIST || "buttonList";
			if (
				hasOwn(LOADED_ACTIONS, buttonListKey) &&
				Array.isArray(LOADED_ACTIONS[buttonListKey])
			) {
				LOADED_ACTIONS[buttonListKey].forEach((button) => {
					if (
						isPlainObject(button) &&
						hasOwn(button, "key") &&
						hasOwn(button, "handler") &&
						typeof button.handler === "function"
					) {
						actions[button.key] = {
							handler: button.handler,
							label: button.label || button.key,
							show: button.show || (() => true),
							icon: button.icon || null,
							class: button.class || null,
						};
					}
				});
			}
			this.listJsActions = actions;
		},
	},
	mounted() {
		this.isInstanceMounted = true;
	},
};
</script>
