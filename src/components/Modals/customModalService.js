import modalContext from "./template";
import Vue from "@/ourVue.js";

/*
  @param [{
	label: String,
	variant: String,
	handler: Function,
	size: String
  }] handlers
*/
export async function showCustomModal({
	title,
	body,
	footer,
	size = "md",
	handlers = [],
	fields = null,
	fieldConfigurations = {},
	hideCloseButton = false,
	closeButtonLabel = "Close",
	backdrop,
	onClose = null
}) {
	return new Promise((resolve) => {
		let formComponent = null;
		let userFormData = {};
		let uniqueId = Math.random().toString(36).substring(7);
		// Generate a custom body with container for CollectionForm if fields are provided
		if (fields) body += `<div id="child-form-container-${uniqueId}"></div>`;
		const CustomModal = Vue.extend(modalContext({ body, footer, hideCloseButton, closeButtonLabel, backdrop }));
		const instance = new CustomModal({
			propsData: {
				title,
				size,
				visible: true,
				handlers,
				backdrop,
			},
			data() {
				return {
					userFormData,
					thisContext: {},
				};
			},
			methods: {
				closeModal() {
					if (onClose && typeof onClose === 'function') {
						const result = onClose();
						if (result === false) {
							return;
						}
					}
					this.visible = false;
					setTimeout(() => {
						this.$destroy();
						document.body.removeChild(this.$el);
					}, 300);
				},
			},
			async mounted() {
				this.thisContext = {
					$el: this.$el,
					closeModal: this.closeModal,
					formData: this.userFormData,
				};
				this.$emit("custom:modal:mounted");
				if (!fields) return resolve({
					context: this.thisContext,
					instance,
				});

				const [formModule, fieldsModule] = await Promise.all([
					import("@/modules/FormComponents/UIControls/CollectionForm.vue"),
					import("@/modules/CAPPS/CollectionDetails/getCollectionFields.js"),
				]);
				const CollectionForm = formModule.default;
				const { getFormFields } = fieldsModule;
				fieldConfigurations = fieldConfigurations || {};
				const { sections } = await getFormFields({ fields, ...fieldConfigurations });
				const container = this.$el.querySelector(`#child-form-container-${uniqueId}`);

				if (!container) return resolve({
					context: this.thisContext,
					instance,
				});

				const _this = this;
				formComponent = new Vue({
					render(h) {
						return h(CollectionForm, {
							props: {
								groupedSections: sections,
								value: userFormData,
								localeEl: {
									fields: {},
									action: {},
								},
								childEventListeners: {},
							},
							on: {
								input: (val) => {
									Object.assign(userFormData, val);
								},
							},
						});
					},
					mounted() {
						resolve({
							context: _this.thisContext,
							instance,
						});
					},
				}).$mount();
				container.appendChild(formComponent.$el);
			},
		});
		instance.$mount();
		document.body.appendChild(instance.$el);
	});
}
