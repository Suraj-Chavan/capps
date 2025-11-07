<template>
	<b-modal
		v-model="isOpen"
		header-bg-variant="light"
		header-text-variant="dark"
		content-class=""
		:size="collectionSchemaDetails.MODAL_SIZE"
		hide-footer
		no-close-on-backdrop
		no-close-on-esc
		header-class="p-2"
		cancel-disabled
		centered
		scrollable
	>
		<template #modal-header>
			<div
				class="w-100 ml-3 mr-2 d-flex justify-content-between align-items-center mt-1 mb-1"
			>
				<h4>{{ modalTitle }}</h4>
				<div class="d-flex justify-content-between align-items-center">
					<button
						v-if="formAction !== 'view'"
                        class="mr-2 btn btn-light-2 btn-light"
						@click.stop.prevent="structureSubmit"
						style="border-radius: 6px;"
						type="submit"
					>
						<b-icon icon="b-icon-file-earmark-check-fill" font-scale="1.2" variant="success" /> Save
					</button>

					<button
						class="btn btn-light-2 btn-light"
						@click.stop.prevent="structureCancel"
						style="border-radius: 6px;"
						type="submit"
					>
						<b-icon icon="b-icon-x-circle-fill" font-scale="1.2" variant="danger" /> Close
					</button>
				</div>
			</div>
		</template>
		<form ref="form" @submit.stop.prevent="handleSubmit">
			<input-form
				hide-header
				ref="input_form"
				:moduleName="moduleName"
				:collection="collection"
				:defaults="{}"
				:id="id"
				:collection-schema-details="collectionSchemaDetails"
				:navigation-routes="navigationRoutes"
				:default-screen="defaultScreen"
				:parent-field="parentField"
                @form:modal:title="setModalTitle"
				:modify-records="modifyRecords"
				:action="formAction"
				:parent-form-data="parentFormData"
				:parent-collection="parentCollection"	
			>
			</input-form>
		</form>
	</b-modal>
</template>

<script>
import InputForm from "@/modules/FormComponents/InputForm.vue";

export default {
	props: {
		value: {},
		OPEN_UPLOAD_SCREEN: {
			type: Boolean,
			default: false,
		},
		moduleName: {
			type: String,
			required: true,
		},
		collection: {
			type: String,
			required: true,
		},
		id: {
			type: [String, Number],
		},
		modifyRecords: {
			type: Object
		},
		defaults: {
			type: Object,
		},
		collectionSchemaDetails: {
			type: Object,
			required: true,
		},
		parentField: {
			type: String,
			required: true,
		},
		parentAppName: {
			type: String,
			required: true,
		},
		parentCollection: {
			type: String,
			required: true,
		},
		formAction: {
			type: String,
			required: true,
		},
		parentFormData: {
			type: Object
		}
	},
    data() {
        return {
            modalTitle: "",
        }
    },
	computed: {
		isOpen: {
			get() {
				return this.OPEN_UPLOAD_SCREEN;
			},
			set(value) {
				setTimeout(() => {
					this.$emit("toggle:modal:state", value);
				}, 10);
			},
		},
		navigationRoutes() {
			return {
				PARENT_COLLECTION_SCREEN: `${this.parentAppName}/doc/${this.parentCollection}/add`,
			};
		},
		defaultScreen() {
			return "PARENT_COLLECTION_SCREEN";
		},
	},
	components: {
		InputForm,
	},
	methods: {
		async structureSubmit() {
            const INPUT_FORM = this.$refs.input_form;
			const validated = await INPUT_FORM.validateForm();
			if(!validated) return;

			const CAPPS_EVENT_HANDLERS = INPUT_FORM.cappsEventHandlers({
				eventNames: ["_onBeforeSave", "_afterFormSubmit"],
			});
			
			await CAPPS_EVENT_HANDLERS._onBeforeSave();

            this.$emit("collection:record",  INPUT_FORM.userFormData);

			let obj = await CAPPS_EVENT_HANDLERS._afterFormSubmit({
				result: INPUT_FORM.userFormData,
				resultHandler: this.$responseHandler,
			});

			if(obj && obj.preventDefault === true) return;

            this.isOpen = false;
        },
        structureCancel() {
			setTimeout(() => (this.isOpen = false), 0);
        },
        setModalTitle(modalTitle) {
            this.modalTitle = modalTitle;
        }
	},
};
</script>
<style lang="scss" scoped>
.btn-container {
	display: flex;
	justify-content: flex-end;
	gap: 0.8rem;

	.btn-close,
	.btn-upload {
		font-size: 12px;
		font-weight: 600;
		border-radius: 4px;
	}
	.btn-upload {
		background-color: var(--header-color);
		border: none;
	}
}
.btn-light-2.btn-light {
	background: #e3e5e545;
}
</style>