<template>
	<div 
		class="child_collection_table child-collection-grid" 
		:class="`child-collection-grid--${collection} child-collection-grid--${parentCollection || applicationName}-${collection}`"
	>
		<b-navbar class="pl-1 pr-1" type="warning" variant="light">
			<b-navbar-brand>{{ tableLabel }}</b-navbar-brand>
			<b-badge tag="div" class="capps-hint-badge" pill>Click on a record to view</b-badge>
			<b-navbar-nav class="ml-auto">
				<b-button
					:disabled="disabled"
					v-if="!viewOnly && supportedActions.CREATE === true"
					variant="success"
					@click="openChildCollectionForm"
					><b-icon icon="b-icon-plus-circle" font-scale="1.2" variant="secondary" style="color: #fff!important;"/> Add</b-button
				>
			</b-navbar-nav>
		</b-navbar>

		<TableGrid
			class="mt-3"
			dataref="collection_table"
			:locale="childCollectionLocaleEl.fields"
			:items="collectionTableRecords"
			:columns="collectionColumns"
			:handlers="handlers"
			v-bind="dynamicTableProps"
			v-on="dynamicTableEvents"
		>
			<template v-slot:cell(action)="{ record }">
				<b-button-toolbar>
					<b-button-group class="">
						<b-button
							v-if="!(record.item.ID && supportedActions.UPDATE === false)"
							size="md"
							v-b-tooltip.hover
							title="Edit Record"
							@click="openChildCollectionForm(record)"
							variant="none"
						>
							<b-icon-pen aria-hidden="true" />
						</b-button>
						<b-button
							size="md"
							v-b-tooltip.hover
							title="Delete Record"
							v-if="!(record.item.ID && supportedActions.DELETE === false)"
							@click="deleteRecord(record)"
							variant="none"
						>
							<b-icon-trash aria-hidden="true" />
						</b-button>
					</b-button-group>
				</b-button-toolbar>
			</template>
		</TableGrid>

		<child-collection-modal
			v-if="OPEN_UPLOAD_SCREEN"
			:OPEN_UPLOAD_SCREEN="OPEN_UPLOAD_SCREEN"
			v-model="userFormData"
			:collection-schema-details="collectionSchemaDetails"
			:module-name="applicationName"
			:parent-app-name="parentAppName"
			:collection="collection"
			:parent-collection="parentCollection"
			:parent-field="parentField"
			:id="ID"
			@toggle:modal:state="toggleModalState"
			@collection:record="collectionRecordChanged"
			:modify-records="modifyRecords"
			:form-action="modalFormAction"
			:parent-form-data="parentFormData"
		></child-collection-modal>
	</div>
</template>

<script>
import { applanguage } from "config";
import { getCollectionDetails } from "@/modules/CAPPS/CollectionDetails/getCollectionFields.js";
import TableGrid from "../UIControls/TableGrid.vue";
import ChildCollectionModal from "./ChildCollectionModal.vue";
import { loadLanguageAsync } from "@/i18n";
import { hasOwn, isPlainArray } from "@credenceanalytics/utilities";

export default {
	components: {
		TableGrid,
		ChildCollectionModal,
	},
	props: {
		value: {},
		disabled: false,
		collection: {
			type: String,
			required: true,
		},
		parentCollection: {
			type: String,
		},
		applicationName: {
			type: String,
			required: true,
		},
		tableLabel: {
			type: String,
			default: "",
		},
		parentField: {
			type: String,
			required: true,
		},
		parentAppName: {
			type: String,
			required: true,
		},
		parentFormData: {
			type: Object,
		},
		handlers: {
			type: Object,
		},
		viewOnly: {
			type: Boolean,
			default: false,
		},
		action: {
			type: String,
		},
		id: {
			type: [String, Number],
			default: null,
		},
	},
	data() {
		return {
			collectionSettings: {},
			columns: [],
			childCollectionLocaleEl: {
				fields: {},
			},
			userFormData: {},
			groupedSections: [],
			collectionSchemaDetails: {},
			ID: null,
			OPEN_UPLOAD_SCREEN: false,
			recordIndex: null,
			modifyRecords: null,
			hiddenFields: [],
			visibleFields: [],
			modalFormAction: "add",
			supportedActions: {
				DELETE: false,
				CREATE: false,
				UPDATE: false,
			},
			dynamicTableEvents: {},
		};
	},
	created() {
		const _this = this;
		this.dynamicTableEvents = Object.assign(this.dynamicTableEvents, {
			"row-clicked": (item, index) => {
				_this.openChildCollectionForm(
					{
						item,
						index,
					},
					"view"
				);
			},
			input: function (sortedArray) {
				_this.collectionTableRecords = sortedArray;
			},
		});
	},
	computed: {
		dynamicTableProps() {
			const common = { tbodyTrClass: "cursor-pointer", tbodyTrAttr: this.collectionSettings.tbodyTrAttr };
			if(this.disabled || this.viewOnly) {
				return {
					...common,
					noActionAllowed: true,
				};
			}
			return { ...common };
		},
		collectionURL() {
			return `${this.applicationName}/${this.collection}`;
		},
		collectionColumns() {
			return this.collectionSettings.columnLists || [];
		},
		collectionTableRecords: {
			get() {
				return this.value;
			},
			set(value) {
				const CURRENT_TABLE_VALUES = new Function(
					"return " + JSON.stringify([...(value || [])])
				)();
				this.$emit("input", [...CURRENT_TABLE_VALUES]);
			},
		},
	},
	watch: {
		collectionURL: {
			immediate: true,
			async handler(api) {
				this.collectionSettings = await this.fetchSchemaDetails(api);				
				const actions = this.collectionSettings.actions || [];
				this.supportedActions = actions.reduce(function (acc, actionName) {
					acc[actionName] = true;
					return acc;
				}, this.supportedActions);

				const END_POINT = `${this.applicationName}/locale/${applanguage || "en"}`;
				await loadLanguageAsync(this.applicationName + applanguage, END_POINT);
				const localeData = this.$t(this.applicationName + "." + this.collection);
				this.childCollectionLocaleEl =
					typeof localeData === "string" ? { actions: {}, fields: {} } : localeData;

				const _this = this;
				let CURRENT_TABLE_VALUES = new Function(
					"return " + JSON.stringify([...(_this.collectionTableRecords || [])])
				)();
				const DO_NOT_COPY_FIELDS_ON_DUPLICATE =
					_this.collectionSettings.DO_NOT_COPY_FIELDS_ON_DUPLICATE;
				CURRENT_TABLE_VALUES = CURRENT_TABLE_VALUES.reduce(function (acc, curr) {
					acc.push(
						_this.visibleFields.reduce(function (obj, key) {
							obj[key] = hasOwn(DO_NOT_COPY_FIELDS_ON_DUPLICATE, key)
								? DO_NOT_COPY_FIELDS_ON_DUPLICATE[key]
								: curr[key];
							return obj;
						}, {})
					);
					return acc;
				}, []);
				_this.collectionTableRecords = CURRENT_TABLE_VALUES;
			},
		},
		action: {
			immediate: true,
			handler(action) {
				const IS_DUPLICATE = action === "add" && this.id != null;
				if (!IS_DUPLICATE) return;
				if (this.value.length > 0) {
					const CURRENT_TABLE_VALUES = new Function(
						"return " + JSON.stringify([...this.value])
					)();
					CURRENT_TABLE_VALUES.map(function (item) {
						delete item.ID;
					});
					this.collectionTableRecords = CURRENT_TABLE_VALUES;
				}
			},
		},
	},
	methods: {
		collectionRecordChanged(formData) {
			const CURRENT_TABLE_VALUES = new Function(
				"return " + JSON.stringify([...(this.collectionTableRecords || [])])
			)();
			if (this.recordIndex != null) {
				CURRENT_TABLE_VALUES.splice(this.recordIndex, 1, { ...formData });
			} else {
				CURRENT_TABLE_VALUES.splice(CURRENT_TABLE_VALUES.length, 1, {
					...formData,
				});
			}

			this.collectionTableRecords = [...CURRENT_TABLE_VALUES];
		},
		fetchSchemaDetails(api) {
			this.$store.commit("loading", true);
			const _this = this;
			return this.$credCAPI
				.collection(`${api}/schema`)
				.read({ body: {} })
				.then(async (response) => {
					this.collectionSchemaDetails = response;
					this.$store.commit("loading", false);
					const hiddenFields = [];
					const visibleFields = [];
					const DO_NOT_COPY_FIELDS_ON_DUPLICATE = {};
					const { actions, columnLists, filterColumnLists, sortField, sortOrder, tbodyTrAttr } =
						await getCollectionDetails({
							componentReference: this,
							collectionSchema: response,
							sortable: true,
							locale: _this.childCollectionLocaleEl.fields,
							fieldVisibilityCondition: function (field, fieldName) {
								if (
									_this.id &&
									_this.action === "add" &&
									field.dont_copy_on_duplicate == 1 &&
									!isPlainArray(_this.value[fieldName])
								) {
									DO_NOT_COPY_FIELDS_ON_DUPLICATE[fieldName] = "";
								}

								if (field.iskey == 1) {
									// On screen it will hidden but consider this field in forms model data
									visibleFields.push(fieldName);
									return true;
								}
								if (field.hidden == 1 || [_this.parentField].includes(fieldName)) {
									hiddenFields.push(fieldName);
									delete _this.userFormData[fieldName];
									return true;
								}
								visibleFields.push(fieldName);
								return false;
							},
							childTableSchema: true,
							collection: _this.collection,
							moduleName: _this.applicationName,
						});
					this.hiddenFields = [...this.hiddenFields, ...hiddenFields];
					this.visibleFields = [...this.visibleFields, ...visibleFields];
					return {
						actions,
						columnLists,
						filterColumnLists,
						sortField,
						sortOrder,
						DO_NOT_COPY_FIELDS_ON_DUPLICATE,
						tbodyTrAttr
					};
				})
				.catch((error) => {
					console.error(error);
					this.$store.commit("loading", false);
					return {
						actions: [],
						columnLists: [],
						filterColumnLists: [],
						sortField: "",
						sortOrder: false,
					};
				});
		},
		openChildCollectionForm(data, viewOnly) {
			// this.ID = data?.item?.ID || null;
			this.modalFormAction =
				viewOnly === "view" ? "view" : data?.item?.ID ? "update" : "add";
			this.modifyRecords = data?.item || null;
			this.recordIndex = data?.index == 0 ? 0 : data?.index || null;
			this.OPEN_UPLOAD_SCREEN = true;
		},
		async deleteRecord(data) {
			const confirm = await this.$_confirmMessage({
				size: "md",
				msg: "Are you sure you want to delete the selected record?",
			});
			if (!confirm) return;

			const CURRENT_TABLE_VALUES = new Function(
				"return " + JSON.stringify([...(this.collectionTableRecords || [])])
			)();
			if (data.index != null) {
				CURRENT_TABLE_VALUES.splice(data.index, 1);
			}

			this.collectionTableRecords = [...CURRENT_TABLE_VALUES];
		},
		toggleModalState(bool) {
			this.OPEN_UPLOAD_SCREEN = bool;
			this.recordIndex = null;
			this.$emit("child:collection:modal:state:change", bool);
		},
	},
};
</script>

<style scoped>
.capps-hint-badge {
  background: #e8f1fd;         /* हलका blue (design प्रमाणे) */
  color: #2563eb;              /* blue text */
  border-radius: 999px;
  font-size: 0.97rem;
  font-weight: 400;
  padding: 0.32em 1.1em;
  margin-left: 8px;
  margin-bottom: 2px;
  display: inline-block;
  border: none;
  box-shadow: none;
  letter-spacing: 0.01em;
}
</style>