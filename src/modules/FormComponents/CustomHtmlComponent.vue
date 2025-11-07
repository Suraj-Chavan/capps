<template>
	<div class="custom_input_form" ref="custom_input_form" :id="customFormWrapperId">
		<div class="row p-0 m-0 custom_input_form__row">
			<div :class="`col-12 m-0 p-0`">
				<div>
					<component :is="wrapperElement" :class="{'m-0 capps-card': wrapperElement === 'b-card'}">
						<div style="position: sticky; top: 0">
							<component :is="customFormComponent" v-bind="$props"></component>
						</div>
					</component>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import capps from "capps";
import Vue from "@/ourVue.js";
import { interpolate } from "../../Framework/utility/utility.js";
import { FORM_ASSET_PATH, PREFIX_FORM_REFERENCE_PATH, MODULE_ASSET_PATH } from "../../Framework/constants/basePaths.js";
import cappsFormUtilityAPIs from "./cappsFormUtilityAPIs.js";

const props = {
	moduleName: {
		type: String,
		required: false,
	},
	collection: {
		type: String,
		required: false,
	},
	defaults: {
		type: Object,
	},
	id: {
		type: [String, Number],
		default: null,
	},
	audit_id: {
		type: [String, Number],
		default: null,
	},
	modifyRecords: {
		type: Object,
		default: null,
	},
	collectionSchemaDetails: {
		type: Object,
	},
	defaultScreen: {
		type: String,
		default: "list/view",
	},
	navigationRoutes: {
		type: Object,
		default() {
			return {};
		},
	},
	hideHeader: {
		type: Boolean,
		default: false,
	},
	parentField: {
		type: String,
		default: null,
	},
	redirectTo: {
		type: String,
	},
	action: {
		type: String,
		required: false,
	},
	parentFormData: {
		type: Object,
	},
	parentCollection: {
		type: String,
	},
	html: {
		type: String,
		default: null,
	},
	reference: {
		type: String,
		default: null,
	},
	isModule: {
		type: Boolean,
		default: false,
	},
	moduleType: {
		type: String,
		default: null,
	}
};
export default {
	name: "custom-input-form",
	props,
	data() {
		return {
			wrapperElement: "div",
			isCustomTemplateLoading: true,
			customTemplate: `
				<div>
					<b-alert show variant="info">
						<h4 class="alert-heading">Loading <b-spinner variant="info" style="width: 1.6rem; height: 1.6rem;" ></b-spinner></h4>
						<p>Loading your form. Please wait...</p>
						<hr>
						<p class="mb-0">Preparing your form... Just a moment!</p>
					</b-alert>
				</div>
			`,
			customComponentOptions: {}
		}
	},

	computed: {
		templateUrl() {
			capps.injectDependencies(`${this.moduleName}::${this.collection}::params`, this.$props);
			const htmlObj = {
				moduleName: this.moduleName,
				collection: this.collection,
				url: null,
				html: null,
			};

			// Handle module assets
			if(this.isModule && this.moduleType) {
				htmlObj.url = interpolate(MODULE_ASSET_PATH, { 
					moduleName: this.moduleName,
					collection: this.collection,
					moduleType: this.moduleType 
				});
				htmlObj.html = null;
				return htmlObj;
			}

			// Handle reference-based templates
			if(this.reference) {
				htmlObj.url = interpolate(PREFIX_FORM_REFERENCE_PATH + this.reference, { 
					moduleName: this.moduleName, 
					collection: this.collection 
				});
				htmlObj.html = null;
				return htmlObj;
			}

			// Handle inline HTML
			if (this.html) {
				htmlObj.url = null;
				htmlObj.html = this.html;
				return htmlObj;
			}

			// Default form asset path
			htmlObj.url = interpolate(FORM_ASSET_PATH, { 
				moduleName: this.moduleName, 
				collection: this.collection 
			});
			return htmlObj;
		},
		customFormComponent() {
			return Vue.extend({ 
				template: this.customTemplate, 
				props,
				...this.customComponentOptions,
			});
		},
		customFormWrapperId() {
			if(this.reference) return `capps_custom_screen_${this.reference}`;
			return `capps_custom_screen_${this.moduleName}_${this.collection}`;
		}
	},

	methods: {
		getInputFormInstance() {
			// Traverse up the component tree to find the InputForm instance
			let parent = this.$parent;
			while (parent) {
				if (parent.$options.name === 'input-form' || parent.updateFormData) {
					return parent;
				}
				parent = parent.$parent;
			}
			return null;
		},
		alertTemplate({ title = "Oops!", message = "While loading the form, an error occurred.", subMassage = 'See the console for further information.', variant = 'success'} = {}) {
			return `
				<div>
					<b-alert show variant="${variant}">
						<h4 class="alert-heading"><b-icon icon="exclamation-triangle" variant="info"></b-icon> ${title}</h4>
						<p>${message}</p>
						<hr>
						<p class="mb-0">${subMassage}</p>
					</b-alert>
				</div>
			`;
		},
		async loadCustomTemplateAssets() {
			this.isCustomTemplateLoading = true;			
			this.customComponentOptions = {};
			const _this = this;
			const templateUrl = this.templateUrl;
			
			// Inject InputForm instance and form utilities using capps dependency system
			const inputFormInstance = this.getInputFormInstance();
			if (inputFormInstance) {
				// Inject the InputForm instance
				capps.injectDependencies(`${this.moduleName}::${this.collection}::input_form_instance`, inputFormInstance);
				
				// Inject form utilities with InputForm context
				const formUtils = cappsFormUtilityAPIs.call(inputFormInstance);
				capps.injectDependencies(`${this.moduleName}::${this.collection}::form_utils`, formUtils);
			}
			
			try {
				if(templateUrl.url) {
					await capps.require(templateUrl.url, function(templateString) {
						setTimeout(() => {
							_this.customTemplate = `<div>${templateString}</div>`;
							_this.$emit('set:collection:form:availability', true);
						}, 0);
					}).catch(() => {
						_this.$emit('set:collection:form:availability', false);
					});

					let componentOptions = null;
					
					// Try different dependency key patterns based on context
					if(this.isModule && this.moduleType) {
						// For modules: try module-specific patterns
						try {
							componentOptions = capps.getDependency(`${_this.moduleName}::${_this.moduleType}::vue_options`);
						} catch {
							try {
								componentOptions = capps.getDependency(`${_this.collection}::${_this.moduleType}::vue_options`);
							} catch {
								try {
									componentOptions = capps.getDependency(`custom::${_this.moduleType}::vue_options`);
								} catch {
									componentOptions = null;
								}
							}
						}
					} else {
						// For forms: use collection-based pattern
						try {
							componentOptions = capps.getDependency(`${_this.moduleName}::${_this.collection}::vue_options`);
						} catch {
							componentOptions = null;
						}
					}

					if(componentOptions) {
						// Inject frm as a prop so users can access this.frm.set_value() directly
						let formUtils = null;
						try {
							formUtils = capps.getDependency(`${_this.moduleName}::${_this.collection}::form_utils`);
						} catch {
							// Form utils might not be available for modules
							formUtils = null;
						}
						
						this.customComponentOptions = { 
							...componentOptions,
							data() {
								const originalData = componentOptions.data ? componentOptions.data.call(this) : {};
								return {
									...originalData,
									frm: formUtils // Make frm available as reactive data (null for modules without form context)
								};
							}
						};
					}
				} else if (templateUrl.html) {
					_this.customTemplate = `<div>${templateUrl.html}</div>`;
				}
			} catch (error) {
				console.error(`Failed to load custom template assets from ${templateUrl}:`, error);
				this.customTemplate = this.alertTemplate({
					message: 'Error loading form',
					variant: 'danger',
				});
				this.customComponentOptions = {};
			} finally {
    			// This ensures isCustomTemplateLoading is set to false regardless of success or failure
				this.isCustomTemplateLoading = false;
			}
		}
	},
	watch: {
		"templateUrl": {
			handler: function (newVal) {
				if(newVal.html != null || this.reference) this.wrapperElement = "div";
				this.loadCustomTemplateAssets();
			},
			immediate: true,
		}
	}
}
</script>


<style lang="scss" scoped>
.custom_input_form {
	.loading__overlay {
		color: #666666;
		height: 100%;
		text-align: center;
		opacity: 0.8;
		min-height: 75vh;
		position: relative;
		min-height: 76vh;
		max-height: 76vh;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
}
</style>