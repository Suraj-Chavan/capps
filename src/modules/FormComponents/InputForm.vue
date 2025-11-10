<template>
	<div :class="[
		'm-2', 
		'capps_input_form',
		`capps_input_form--${collection}`,
		`capps_input_form--${moduleName}-${collection}`,
		`capps_input_form--${action}`
	]">
		<div class="row p-0 m-0 capps_input_form__row">
			<div :class="`col-${isSideBarOpen ? '9' : '12'} m-0 p-0`">
				<div>
					<b-card class="m-0 capps-card">

						<div v-if="isCollectionDetailsLoading">
							<div class="loading__overlay">
								<!-- <div class="spinner-grow" role="status"></div> -->
								<b-spinner style="width: 3rem; height: 3rem;" variant="primary"></b-spinner>
								<br />
								Preparing your form... Just a moment!
							</div>
						</div>
						<div v-if="!isCollectionDetailsLoading && groupedSections.length === 0"
							class="alert alert-warning">
							No fields are configured for
							{{ collectionSchemaDetails.NAME || collection }}
						</div>

						<div v-if="!isCollectionDetailsLoading && groupedSections.length > 0"
							style="position: sticky; top: 0">

							<div v-if="hideFormHeader ? false : !hideHeader"
								class="section-header d-flex justify-content-between align-items-center px-1 py-1">
								<div class="d-flex flex-column">
									<h4 class="mb-0 font-weight-bold">{{ modal_title }}</h4>
									<span v-if="audit_id || id" class="text-dark font-weight-bold" style="font-size: 0.9rem;">Record ID: {{ audit_id || id }}</span>
								</div>
								<div class="d-flex align-items-center button-container-scroll" style="gap: 0.25rem;">
									<!-- Custom buttons from buttonList (ungrouped) -->
									<button
										v-for="button in visibleButtons"
										:key="button.key"
										type="button"
										:class="[
											'capps-btn', 
											button.class || 'capps-btn-light',
											'd-flex', 
											'align-items-center', 
											'rounded', 
											'py-2', 
											'px-3'
										]"
										@click="handleCustomButtonClick(button)"
										style="font-weight:600; font-size:1.05rem; white-space: nowrap; min-width: auto; flex-shrink: 0;"
									>
										<i v-if="button.icon" :class="button.icon + ' mr-2'" style="font-size: 1.2em;"></i>
										<span class="capps-btn-text">{{ button.label }}</span>
									</button>

									<!-- Grouped buttons as dropdowns -->
									<b-dropdown
										v-for="(buttons, groupName) in buttonGroups"
										:key="`group_${groupName}`"
										:text="groupName"
										variant="light"
										style="font-weight:600; font-size:1.05rem; flex-shrink: 0;"
										size="sm"
										boundary="viewport"
										:popper-opts="{ placement: 'bottom-start', modifiers: { preventOverflow: { enabled: true }, flip: { enabled: true } } }"
									>
										<b-dropdown-item
											v-for="button in buttons"
											:key="button.key"
											@click="handleCustomButtonClick(button)"
											style="white-space: nowrap;"
										>
											<i v-if="button.icon" :class="button.icon + ' mr-2'"></i>
											{{ button.label }}
										</b-dropdown-item>
									</b-dropdown>

									<!-- Default action buttons -->
									<button
										v-if="hasVisibleAccordions"
										type="button"
										class="capps-btn capps-btn-primary d-flex align-items-center rounded py-2 px-3"
										@click="onViewDetails"
										style="font-weight:600; font-size:1.05rem;"
									>
										<b-icon icon="eye" font-scale="1.2" class="mr-2" />
										<span class="capps-btn-text">View Details</span>
									</button>
									<button
										v-if="action !== 'view'"
										type="button"
										class="capps-btn capps-btn-light d-flex align-items-center rounded py-2 px-3"
										@click.stop.prevent="structureSubmit()" 
										style="font-weight:600; font-size:1.05rem;"
									>
										<b-icon icon="save" font-scale="1.2" class="mr-2 text-success" />
										Save
									</button>
									<button
										type="button"
										class="capps-btn capps-btn-light d-flex align-items-center rounded py-2 px-3"
										@click.stop.prevent="structureCancel()" 
										style="font-weight:600; font-size:1.05rem;"
									>
										<b-icon icon="x-circle" font-scale="1.2" class="mr-2 text-secondary" />
										Close
									</button>
								</div>
							</div>

							<hr v-if="!hideHeader" class="mt-2 mb-2" />

							<collection-form 
								:class="{ 
									'zoom-out': isSideBarOpen,
									[`capps-collection-form--${collection}`]: true,
									[`capps-collection-form--${moduleName}-${collection}`]: true,
									[`capps-form-action--${action}`]: true
								}" 
								class="mh-76 scroll-y capps-collection-form"
								v-if="!isCollectionDetailsLoading && groupedSections.length > 0" ref="form"
							v-model="userFormData" :grouped-sections="groupedSections" :locale-el="localeEl"
							:child-event-listeners="childEventListeners" :action="action"
							:custom-validation="customValidation" @collection:form:mounted="registerCappsFormEvents"
							:parent-collection="collection" :id="id" :label-direction="labelDirection">
								<template #comment-section>
									<!-- Comment Section -->
									<comment-section
										v-if="!isCollectionDetailsLoading && id && ['view', 'update'].includes(action)"
										:module-name="moduleName"
										:collection="collection"
										:record-id="id"
										:is-read-only="action === 'view'"
										:is-side-bar-open="isSideBarOpen"
										class="comment-section-wrapper"
										ref="commentSection"
									/>
								</template>
							</collection-form>
						</div>
					</b-card>
				</div>
			</div>

			<div v-if="parentField == null" :class="{ hidesidebar: !isSideBarOpen }"
				class="col-3 m-0 p-0 side-collection-container">
				<b-card class="m-0 mh-90" body-class="p-2">
					<div>
						<div class="scroll-y mh-76">
							<div id="details-accordion-group" role="tablist">
								<!-- Attachments Accordion Item -->
								<div v-if="(action === 'view' || action === 'update') && !hideFeatures.restrictAttachments" class="mb-2 panel-wrapper">
									<Vue3ComponentLoader
										exposed-module="./AccordionPanel"
										:component-props="{
											header: 'Attachments',
											icon: 'fas fa-paperclip',
											iconColor: '#3b82f6',
											badge: restrictedFeatures.restrictAttachments ? '(Read Only)' : '',
											badgeClass: 'text-warning',
											toggleable: !isAccordionRestricted('accordion-attachments'),
											collapsed: !activeAccordionItemIds.includes('accordion-attachments')
										}"
										:component-events="{
											toggle: (collapsed) => handlePanelToggle('accordion-attachments', collapsed)
										}"
									/>
									<!-- Vue 2 Content - stays in Vue 2 context for full reactivity -->
									<div v-show="activeAccordionItemIds.includes('accordion-attachments')" class="panel-body-vue2">
										<div v-if="restrictedFeatures.restrictAttachments" class="alert alert-info mb-2">
											<i class="fas fa-info-circle mr-2"></i>
											<small>Attachments are in read-only mode. Upload/delete operations are disabled.</small>
										</div>
										<AttachmentsComponent
											ref="attachmentsComponent"
											:id="id"
											:collection="collection"
											:module-name="moduleName"
											:action="action"
											:auto-load="false"
											:restrict-attachments="restrictedFeatures.restrictAttachments"
										/>
									</div>
								</div>

								<!-- Connections Accordion Item -->
								<div v-if="action === 'view' && !hideFeatures.restrictConnections" class="mb-2 panel-wrapper">
									<Vue3ComponentLoader
										exposed-module="./AccordionPanel"
										:component-props="{
											header: 'Connections',
											icon: 'fas fa-link',
											iconColor: '#8b5cf6',
											toggleable: true,
											collapsed: !activeAccordionItemIds.includes('accordion-connections')
										}"
										:component-events="{
											toggle: (collapsed) => handlePanelToggle('accordion-connections', collapsed)
										}"
									/>
									<!-- Vue 2 Content - stays in Vue 2 context for full reactivity -->
									<div v-show="activeAccordionItemIds.includes('accordion-connections')" class="panel-body-vue2">
										<ConnectionsComponent
											ref="connectionsComponent"
											:id="id"
											:collection="collection"
											:module-name="moduleName"
											:action="action"
											:auto-load="false"
											:user-form-data="userFormData"
										/>
									</div>
								</div>

								<!-- Version History Accordion Item -->
								<div v-if="(action === 'view' || action === 'update') && !hideFeatures.restrictHistory" class="mb-2 panel-wrapper">
									<Vue3ComponentLoader
										exposed-module="./AccordionPanel"
										:component-props="{
											header: 'Version History',
											icon: 'fas fa-history',
											iconColor: '#10b981',
											toggleable: true,
											collapsed: !activeAccordionItemIds.includes('accordion-history')
										}"
										:component-events="{
											toggle: (collapsed) => handlePanelToggle('accordion-history', collapsed)
										}"
									/>
									<!-- Vue 2 Content - stays in Vue 2 context for full reactivity -->
									<div v-show="activeAccordionItemIds.includes('accordion-history')" class="panel-body-vue2">
										<HistoryComponent
											ref="historyComponent"
											:id="id"
											:collection="collection"
											:module-name="moduleName"
											:action="action"
											:audit_id="audit_id"
											:auto-load="false"
										/>
									</div>
								</div>

							</div>
						</div>
					</div>
				</b-card>
			</div>
		</div>
	</div>
</template>

<script>
import { globalDateFormatLong } from "config";
import moment from 'moment';
import { getFormFields } from "@/modules/CAPPS/CollectionDetails/getCollectionFields.js";
import { cappsCollectionEventHandlers } from "@/Framework/utility/LOAD_CAPPS_FILES/loadCappsJsFile.js";
import { getCollectionFilters } from "@/modules/CollectionStateUtilities/getUpdateCollectionQueryFilter.js";
import FormElementItemModifiers from "./Mixins/FormElementItemModifiers.js";
import { AttachmentsMixin } from "./Mixins/AttachmentsMixin.js";
import { ConnectionsMixin } from "./Mixins/ConnectionsMixin.js";
import { HistoryMixin } from "./Mixins/HistoryMixin.js";
import ButtonVisibilityMixin from "./Mixins/ButtonVisibilityMixin.js";
import cappsFormUtilityAPIs from "./cappsFormUtilityAPIs";
import { isPlainArray } from "@credenceanalytics/utilities";

export default {
	name: "InputForm",
	mixins: [FormElementItemModifiers, AttachmentsMixin, ConnectionsMixin, HistoryMixin, ButtonVisibilityMixin],
	props: {
		moduleName: {
			type: String,
			required: true,
		},
		collection: {
			type: String,
			required: true,
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
			required: true,
		},
		parentFormData: {
			type: Object,
		},
		parentCollection: {
			type: String,
		}
	},
	data() {
		return {
			groupedSections: [],
			userFormData: {},
			prePopulatedData: {},
			isCollectionDetailsLoading: true,
			isMultiPartFormData: false,
			isSideBarOpen: false,
			activeAccordionItemIds: [], // To track the currently open accordion items
			hideFormHeader: false,
			labelDirection: 'top-bottom', // Default value
			formJsLoadedFlag: 0 // Reactive flag to trigger buttonList computed re-evaluation
			// Note: buttonVisibilityState, dynamicButtons, buttonGroups provided by ButtonVisibilityMixin
		};
	},
	components: {
		CollectionForm: () => import("./UIControls/CollectionForm.vue"),
		CommentSection: () => import("./CommentSection/CommentSection.vue"),
		AttachmentsComponent: () => import("./ModuleComponents/AttachmentsComponent.vue"),
		ConnectionsComponent: () => import("./ModuleComponents/ConnectionsComponent.vue"),
		HistoryComponent: () => import("./ModuleComponents/HistoryComponent.vue"),
		Vue3ComponentLoader: () => import("@/components/Vue3ComponentLoader/Vue3ComponentLoader.vue"),
	},
	computed: {
		restrictedFeatures() {
			const COLLECTION_SCHEMA = this.collectionSchemaDetails;
			return {
				restrictAttachments: COLLECTION_SCHEMA?.RESTRICT_ATTACHMENTS == 1 ? true : false,
				restrictConnections: COLLECTION_SCHEMA?.RESTRICT_CONNECTIONS == 1 ? true : false,
				restrictHistory: COLLECTION_SCHEMA?.RESTRICT_HISTORY == 1 ? true : false,	
			};
		},
		hideFeatures() {
			const COLLECTION_SCHEMA = this.collectionSchemaDetails;
			return {
				restrictAttachments: COLLECTION_SCHEMA?.HIDE_ATTACHMENTS == 1 ? true : false,
				restrictConnections: COLLECTION_SCHEMA?.HIDE_CONNECTIONS == 1 ? true : false,
				restrictHistory: COLLECTION_SCHEMA?.HIDE_HISTORY == 1 ? true : false,
			};
		},
		coreFormDependencies() {
			return {
				moduleName: this.moduleName,
				collection: this.collection,
				id: this.id,
				audit_id: this.audit_id,
				action: this.action,
				modifyRecords: this.modifyRecords,
				defaults: this.defaults,
				FIELDS: this.collectionSchemaDetails.FIELDS || {},
				NAME: this.collectionSchemaDetails.NAME || "",
			};
		},
		localeName() {
			return (
				this.coreFormDependencies.moduleName +
				"." +
				this.coreFormDependencies.collection
			);
		},
		localeEl() {
			const localeData = this.$t(this.localeName);
			return typeof localeData === "string"
				? {
					actions: {},
					fields: {},
				}
				: localeData;
		},
		modal_title() {
			const modalTitles = {
				add: this.localeEl?.actions?.ADD || "Add",
				update: this.localeEl?.actions?.UPDATE || "Modify",
				view: this.localeEl?.actions?.VIEW || "View",
			};
			const ModalTitle = `${this.coreFormDependencies.NAME || ""} - ${modalTitles[this.coreFormDependencies.action] || "Add"
				}`;
			return ModalTitle;
		},
		childEventListeners() {
			const _this = this;
			return {
				"child:collection:modal:state:change"() {
					_this.updateCurrentFormGlobal(_this.userFormData);
				},
			};
		},
		differencesArray() {
			return Object.keys(this.differences) || []
		},
		dataModelName() {
			return this.collectionSchemaDetails?.DATA_MODEL || this.collection;
		},
		buttonList() {
			// Access formJsLoadedFlag to make this computed reactive to form.js loading
			const _flag = this.formJsLoadedFlag;
			const formConfig = window.capps?.ui?.[this.collection]?.form || {};
			console.log('[ButtonList Computed] formJsLoadedFlag:', _flag);
			console.log('[ButtonList Computed] collection:', this.collection);
			console.log('[ButtonList Computed] window.capps.ui:', window.capps?.ui);
			console.log('[ButtonList Computed] formConfig:', formConfig);
			const staticButtons = formConfig.buttonList || [];
			console.log('[ButtonList Computed] staticButtons:', staticButtons);
			console.log('[ButtonList Computed] dynamicButtons:', this.dynamicButtons);
			// Merge static buttons with dynamic buttons
			return [...staticButtons, ...this.dynamicButtons];
		},
		// Note: visibleButtons computed is provided by ButtonVisibilityMixin
		hasVisibleAccordions() {
			// Check if any accordion is visible
			const hasAttachments = (this.action === 'view' || this.action === 'update') && !this.hideFeatures.restrictAttachments;
			const hasConnections = this.action === 'view' && !this.hideFeatures.restrictConnections;
			const hasHistory = (this.action === 'view' || this.action === 'update') && !this.hideFeatures.restrictHistory;

			return hasAttachments || hasConnections || hasHistory;
		}
	},
	watch: {
		'$route.query.showRecordSummary'(val) {
			if (val === 'true') {
				this.toggleDetailsSidebar();
			}
		},
		'$route.query.hideFormHeader'(val) {
			if (val === 'true') {
				this.hideFormHeader = true;
			}
		},
		userFormData: {
			immediate: true,
			deep: true,
			handler(userFormData) {
				this.updateCurrentFormGlobal(userFormData);
				// Use $nextTick to ensure current_form is updated before re-evaluating button visibility
				this.$nextTick(() => {
					this.initializeButtonVisibility();
				});
			},
		},
		"coreFormDependencies.audit_id": {
			immediate: true,
			handler(id) {
				if (!id) {
					// Clear differences when viewing current version (no audit_id)
					this.differences = {};
					// Clear diff classes from fields
					this.clearDiffClassesFromFields();
					return;
				}
				this.userFormData = {};
				// Calculate field differences when audit_id changes
				this.$nextTick(() => {
					this.calculateFieldDifferences();
				});
			},
		},
		"coreFormDependencies.collection": {
			immediate: true,
			handler() {
				this.userFormData = {};
			},
		},
		"coreFormDependencies.modifyRecords": {
			immediate: true,
			handler(modifyRecords) {
				if (modifyRecords == null || this.id) return;
				if (
					typeof modifyRecords === "object" &&
					Object.keys(modifyRecords).length > 0
				) {
					this.userFormData = { ...modifyRecords, ...this.userFormData };
				}
			},
		},
		"coreFormDependencies.defaults": {
			immediate: true,
			handler(defaults) {
				if (this.id || this.modifyRecords) return;
				if (typeof defaults === "object" && Object.keys(defaults).length > 0) {
					this.userFormData = { ...defaults, ...this.userFormData };
				}
			},
		},
		"coreFormDependencies.FIELDS": {
			async handler(newFields) {
				if (
					!newFields ||
					Object.keys(newFields).length === 0 ||
					!this.moduleName ||
					!this.collection
				)
					return;
				const _this = this;

				console.log('[FIELDS Watcher] About to load form.js for:', this.collection);
				await cappsCollectionEventHandlers({
					appName: this.moduleName,
					collectionName: this.collection,
				});
				console.log('[FIELDS Watcher] Form.js loaded. window.capps.ui.collection_one.form:', window.capps.ui.collection_one?.form);
				// Increment flag to trigger buttonList computed re-evaluation
				this.formJsLoadedFlag++;

				console.log('FIELDS watcher - differencesArray.length:', this.differencesArray.length);
				console.log('FIELDS watcher - differences:', this.differences);

				if (this.differencesArray.length) {
					console.log('Applying diff classes in FIELDS watcher to fields:', this.differencesArray);
					this.differencesArray.forEach(field => {
						if (newFields[field]) {
							newFields[field].class = `diff-${_this.differences[field].type}`;
							console.log(`FIELDS watcher - Applied class to ${field}:`, newFields[field].class);
						} else {
							console.log(`FIELDS watcher - Field ${field} not in schema (system field)`);
						}
					})
				}

				_this.isMultiPartFormData = false;

				_this.isCollectionDetailsLoading = true;
				const CAPPS_EVENT_HANDLERS = _this.cappsEventHandlers() || {};

				// Load audit logs BEFORE loading existing data if viewing a historical version
				// This ensures differences are calculated before fields are rendered
				if (_this.audit_id && _this.id) {
					await _this.loadAuditsData();
				}

				_this.id && (await _this.loadExistingData());

				const userFormData = { ...this.userFormData };

				const DO_NOT_COPY_FIELDS_ON_DUPLICATE = {};

				const { sections, FIELDS_CHAIN_INDEX, labelDirection } = await getFormFields({
					fields: newFields,
					moduleName: _this.moduleName,
					collection: _this.collection,
					id: this.action != "add" ? _this.id : null,
					collectionSchema: _this.collectionSchemaDetails,
					fieldVisibilityCondition: function (field, fieldName) {
						if (field.iskey) return true;
						if (
							_this.audit_id &&
							isPlainArray(userFormData[field.key]) &&
							userFormData.SYS_OPERATION === "update"
						) {
							userFormData[field.key] = userFormData[field.key].filter(
								(item) => item.SYS_OPERATION === "create"
							);
						}
						if (
							field.hidden == 1 ||
							field.fetch_from ||
							[_this.parentField].includes(fieldName)
						) {
							delete _this.userFormData[fieldName];
							delete userFormData[fieldName];
							return true;
						}
						return false;
					},
					forEachField(field) {
						if (field.fieldtype === "file" && !_this.isMultiPartFormData) {
							_this.isMultiPartFormData = true;
							_this.getPrepopulatedAttachMent({ fieldName: field.key, fileName: userFormData.FILENAME });

						}
						if (_this.modifyRecords == null && _this.id == null && field.default) {
							userFormData[field.key] = field.default;
						}

						if (_this.action === "view") {
							field.disabled = true;
							if (field.fieldtype === "table") field.viewOnly = true;
						}

						if (
							_this.id &&
							_this.action === "add" &&
							field.dont_copy_on_duplicate == 1 &&
							!isPlainArray(_this.userFormData[field.key])
						) {
							DO_NOT_COPY_FIELDS_ON_DUPLICATE[field.key] = "";
						}
						field.handlers = field?.handlers?.call(_this, CAPPS_EVENT_HANDLERS[field.key]) || {};
					},
				});
				_this.groupedSections = sections;
				_this.fieldsIndexLocation = FIELDS_CHAIN_INDEX;
				_this.labelDirection = labelDirection;
				_this.userFormData = {
					..._this.userFormData,
					...userFormData,
					...DO_NOT_COPY_FIELDS_ON_DUPLICATE,
				};

				setTimeout(async function () {
					_this.isCollectionDetailsLoading = false;
					// Initialize button visibility AFTER form is fully loaded and current_form is populated
					await _this.initializeButtonVisibility();
				}, 1500);
			},
			immediate: true,
		},
		modal_title: {
			immediate: true,
			handler(ModalTitle) {
				this.$emit("form:modal:title", ModalTitle);
			},
		},
	},
	methods: {
		handleAccordionToggle(itemId) {
			// Check if the accordion is restricted
			if (this.isAccordionRestricted(itemId)) {
				return; // Don't allow toggle if restricted
			}

			const index = this.activeAccordionItemIds.indexOf(itemId);
			if (index > -1) {
				this.activeAccordionItemIds.splice(index, 1); // Close if already open
			} else {
				this.activeAccordionItemIds.push(itemId); // Open the new one
			}
			// If you want to maintain a single-open behavior after the initial default open,
			// you would uncomment the following lines and comment out the push line above.
			// } else {
			//  this.activeAccordionItemIds = [itemId];
			// }
		},
		handlePanelToggle(itemId, collapsed) {
			// Check if the panel is restricted
			if (this.isAccordionRestricted(itemId)) {
				return; // Don't allow toggle if restricted
			}

			const index = this.activeAccordionItemIds.indexOf(itemId);
			// If panel is now collapsed (closed), remove from active list
			if (collapsed && index > -1) {
				this.activeAccordionItemIds.splice(index, 1);
			}
			// If panel is now expanded (open), add to active list and trigger data loading
			else if (!collapsed && index === -1) {
				this.activeAccordionItemIds.push(itemId);

				// Trigger lazy loading based on panel type
				this.$nextTick(() => {
					if (itemId === 'accordion-attachments') {
						this.ensureAttachmentsLoaded();
					} else if (itemId === 'accordion-connections') {
						this.ensureConnectionsLoaded();
					} else if (itemId === 'accordion-history') {
						this.ensureAuditLogsLoaded();
					}
				});
			}
		},
		isAccordionRestricted(itemId) {
			// Only attachments have restrictions since connections and history are read-only
			if (itemId === 'accordion-attachments') {
				return this.restrictedFeatures.restrictAttachments;
			}
			return false;
		},
		updateCurrentFormGlobal(userFormData) {
			if (this.parentFormData) {
				const inheritAttrs = {
					_action: this.action,
					_parentAction:
						window.current_form._parentAction || window.current_form.action,
				};
				window.current_form = { ...userFormData };
				window.current_form[this.parentCollection] = { ...this.parentFormData };
				Object.setPrototypeOf(current_form, inheritAttrs);
				return;
			}

			window.current_form = { ...userFormData };
			Object.setPrototypeOf(current_form, { _action: this.action });
		},
		toggleDetailsSidebar() {
			this.isSideBarOpen = !this.isSideBarOpen;
			if (this.isSideBarOpen && this.action === 'view') {
				// Open available accordions by default in 'view' mode
				const defaultAccordions = [];
				if (!this.hideFeatures.restrictConnections) defaultAccordions.push('accordion-connections');
				if (!this.hideFeatures.restrictAttachments) defaultAccordions.push('accordion-attachments');
				if (!this.hideFeatures.restrictHistory) defaultAccordions.push('accordion-history');
				this.activeAccordionItemIds = defaultAccordions;
			} else if (this.isSideBarOpen && this.action === 'update') {
				// Open only available accordions by default in 'update' mode
				const defaultAccordions = [];
				if (!this.hideFeatures.restrictAttachments) defaultAccordions.push('accordion-attachments');
				if (!this.hideFeatures.restrictHistory) defaultAccordions.push('accordion-history');
				this.activeAccordionItemIds = defaultAccordions;
			} else if (!this.isSideBarOpen) {
				// Optional: Clear active items when sidebar closes to reset for next time, or if you want them to persist.
				// this.activeAccordionItemIds = []; 
			}
			// Data loading for accordion items will be triggered by @shown event on b-collapse
		},
		reloadComments() {
			this.$refs && this.$refs.commentSection && this.$refs.commentSection.loadComments();
		},
		async ensureConnectionsLoaded() {
			if (this.$refs.connectionsComponent && this.action === 'view' && this.id) {
				await this.$refs.connectionsComponent.loadConnections();
			}
		},
		async ensureAuditLogsLoaded() {
			if (this.$refs.historyComponent && (this.action === 'view' || this.action === 'update') && this.id) {
				await this.$refs.historyComponent.loadAuditsData();
			}
		},
		async ensureAttachmentsLoaded() {
			// Load attachments if an ID is present and not currently loading.
			if (this.$refs.attachmentsComponent && this.id) {
				await this.$refs.attachmentsComponent.loadAttachmentsData();
			}
		},
		async registerCappsFormEvents() {
			if (this.isCollectionDetailsLoading) return;
			const _this = this;
			await new Promise((resolve) => {
				let interval = setInterval(() => {
					if (!_this.isCollectionDetailsLoading) {
						clearInterval(interval);
						resolve(_this.isCollectionDetailsLoading);
					}
				}, 100); // Check every 100 milliseconds
			});

			const CAPPS_EVENT_HANDLERS = _this.cappsEventHandlers({
				eventNames: ["_onLoadEvent"],
			});
			CAPPS_EVENT_HANDLERS._onLoadEvent();
		},
		cappsEventHandlers({ eventNames = [] } = {}) {
			const cappsFormHandlers = window.capps.ui[this.collection]?.form || {};
			if (eventNames.length === 0) return cappsFormHandlers;
			const _this = this;
			const ASKED_EVENT_HANDLERS = eventNames.reduce((acc, eventName) => {
				acc[eventName] = function () {
					if (typeof cappsFormHandlers[eventName] !== "function") return console.log("No event handler found for ", eventName);
					return cappsFormHandlers[eventName](cappsFormUtilityAPIs.call(_this, { $el: _this.$refs.form.$el }), ...arguments);
				};
				return acc;
			}, {});
			return ASKED_EVENT_HANDLERS;
		},
		redirectToDefaultScreen(defaultScreen = "list/view") {
			if (this.redirectTo) {
				return setTimeout(
					function () {
						location.href = this.redirectTo;
					}.bind(this),
					0
				);
			}

			const DEFAULT_ROUTES = {
				...this.navigationRoutes,
				"list/view": () => {
					const COLLECTION_ROUTE = `${this.moduleName}/doc/${this.collection}`;
					const filters = getCollectionFilters(COLLECTION_ROUTE);
					return `/${COLLECTION_ROUTE}/view/list${filters}`;
				},
			};
			this.$router.push(
				typeof DEFAULT_ROUTES[defaultScreen] === "function"
					? DEFAULT_ROUTES[defaultScreen]()
					: DEFAULT_ROUTES[defaultScreen]
			);
		},
		onViewDetails() {
			this.isSideBarOpen = !this.isSideBarOpen;
			if (this.isSideBarOpen && this.action === 'view') {
				// Open available accordions by default in 'view' mode
				const defaultAccordions = [];
				if (!this.hideFeatures.restrictConnections) defaultAccordions.push('accordion-connections');
				if (!this.hideFeatures.restrictAttachments) defaultAccordions.push('accordion-attachments');
				if (!this.hideFeatures.restrictHistory) defaultAccordions.push('accordion-history');
				this.activeAccordionItemIds = defaultAccordions;
			} else if (this.isSideBarOpen && this.action === 'update') {
				// Open only available accordions by default in 'update' mode
				const defaultAccordions = [];
				if (!this.hideFeatures.restrictAttachments) defaultAccordions.push('accordion-attachments');
				if (!this.hideFeatures.restrictHistory) defaultAccordions.push('accordion-history');
				this.activeAccordionItemIds = defaultAccordions;
			} else if (!this.isSideBarOpen) {
				// Optional: Clear active items when sidebar closes to reset for next time, or if you want them to persist.
				// this.activeAccordionItemIds = []; 
			}
		},
		structureCancel() {
			// remove diff tracking classes before destroying view modal
			if (this.differencesArray.length) {
				this.differencesArray.forEach(field => {
					if (this.coreFormDependencies.FIELDS[field]) {
						this.coreFormDependencies.FIELDS[field].class = '';
					}
				});
				this.differences = {};
			}

			if (this.action === "view")
				return this.redirectToDefaultScreen(this.defaultScreen);
			this.$_confirmMessage({
				size: "md",
				msg: "Are you sure you want to close? Unsaved data will be lost.",
			}).then(async (value) => {
				if (!value) return;
				
				// Handle custom close route from form.js
				const formHandlers = window.capps?.ui?.[this.collection]?.form;
				if (formHandlers && typeof formHandlers._closeRoute === 'function') {
					try {
						const result = await formHandlers._closeRoute(cappsFormUtilityAPIs.call(this, { $el: this.$refs.form.$el }));
						if (result !== false) {
							return; // Custom handler handled the close
						}
					} catch (error) {
						console.error('Error in form.js close route handler:', error);
					}
				}

				this.redirectToDefaultScreen(this.defaultScreen); // RedirectToDefaultScreen to the view list page
			});
		},
		getFormData() {
			const configurations = { multiPart: this.isMultiPartFormData };
			if (!configurations.multiPart)
				return { vObj: { data: this.userFormData }, configurations };
			const formData = new FormData();
			Object.entries(this.userFormData).forEach(([key, value]) => {
				if(value == null) return;
				formData.append(
					key,
					(	
						["[object Object]", "[object Array]"].includes({}.toString.call(value)) 
						&& Object.keys(value).length > 0 
						&& JSON.stringify(value)
					) || value
				);
			});
			return {
				vObj: formData,
				configurations,
				headers: { "Content-Type": "multipart/form-data" },
			};
		},
		async validateForm() {
			const success = await this.$refs.form.$refs.formObserver.validate();
			if (!success) {
				this.$refs.form.$de_showErrors(this.$refs.form.$refs.formObserver);
				return false;
			}
			return true;
		},
		async structureSubmit() {
			const confirm = await this.$_confirmMessage({
				size: "md",
				msg: "Are you sure you want to save the record?",
			});
			if (!confirm) return;

			const validated = await this.validateForm();
			if (!validated) return;
			let apiEnd = this.action != "add" ? `update/${this.id}` : "create";

			const _this = this;
			const CAPPS_EVENT_HANDLERS = _this.cappsEventHandlers({
				eventNames: ["_onBeforeSave", "_afterFormSubmit"],
			});
			await CAPPS_EVENT_HANDLERS._onBeforeSave();

			let { vObj, configurations, headers } = this.getFormData();

			(function fn() {
				_this.$store.commit("loading", true);
				_this.$credCAPI
					.collection(`${_this.moduleName}/${_this.collection}/${apiEnd}`)
					.read({
						body: vObj,
						configurations,
						headers,
					})
					.then(async (response) => {
						// Use responseHandler to process the response
						_this.$store.commit("loading", false);
						let obj = await CAPPS_EVENT_HANDLERS._afterFormSubmit({
							result: response,
							resultHandler: _this.$responseHandler,
						});
						if(obj && obj.preventDefault === true) return;
						await _this.$responseHandler(
							response,
							fn,
							_this,
							"noRouteChange",
							async () => {
								if (response.status != "success") return;
								const ID = response?.data?.ID || response?.ID;
								if (!ID) return _this.redirectToDefaultScreen();
								
								// Refresh attachment and uplopds data after successful form submission
								if (_this.id || ID) {
									await _this.ensureConnectionsLoaded();
									await _this.ensureAuditLogsLoaded();
									await _this.ensureAttachmentsLoaded();
									_this.reloadComments();
								}
								
								const SUPPORTED_ACTIONS = capps.ui.collection.schema.ACTIONS;
								if (SUPPORTED_ACTIONS.includes("UPDATE")) {
									return _this.$router.push(`/${_this.moduleName}/doc/${_this.collection}/update/${ID}`);
								}
								return _this.$router.push(`/${_this.moduleName}/doc/${_this.collection}/view_record/${ID}`);
							}
						);
					})
					.catch((error) => {
						console.error(error);
						_this.$store.commit("loading", false);
					});
			}).call(_this);
		},
		async getPrepopulatedAttachMent({ fieldName, }) {
			if(this.id == null) return;
			try {
				let fileName = null;
				const response = await capps.rest[this.moduleName][this.collection].get_file[this.id]({}, { 
					processBlob(response, getFilenameFromContentDisposition) {
						fileName = getFilenameFromContentDisposition(response.headers.get("content-disposition"));
						if(fileName == "" || fileName == null || fileName === "null") return {
							status: "unsuccess",
							error: "No attachment found",
						}
						return response.blob();
					}
				});

				if (response && response.status === "unsuccess") {
					console.warn(`Failed to fetch pre-populated file for ${fieldName}: ${response.error || 'Unknown error'}`);
					return;
				}

				let fileToAssign = null;

				if (response instanceof File) {
					// Ideal case: response is already a File object
					fileToAssign = response;
				} else if (response instanceof Blob) {
					fileToAssign = new File([response], fileName, { type: response.type });
					console.warn(`Pre-populating field '${fieldName}' with a Blob. A placeholder filename "${fileName}" was used. Ensure you retrieve the actual filename.`);
				}

				if (fileToAssign) {
					this.userFormData = { ...this.userFormData, [fieldName]: fileToAssign };
					console.log(`Pre-populated field '${fieldName}' with File: ${fileToAssign.name}`);
				}
			} catch (error) {
				console.error(`Error in getPrepopulatedAttachMent for ${fieldName}:`, error);
			}
		},
		async loadExistingData() {
			this.$store.commit("loading", true);
			const IS_AUDIT = !this.audit_id ? undefined : true;
			const PARAM = IS_AUDIT ? this.audit_id : this.id;

			return capps.rest[this.moduleName][this.collection].read[PARAM]({
				is_audit: IS_AUDIT ? true : undefined,
			})
				.then((response) => {
					this.userFormData = { ...this.userFormData, ...response };
					if (this.action === "add") delete this.userFormData.ID;
					this.$store.commit("loading", false);
					return this.userFormData;
				})
				.catch((error) => {
					this.$store.commit("loading", false);
					console.error(error);
					return this.userFormData;
				});
		},
		triggerFileInput() {
			this.$refs.fileInput && this.$refs.fileInput.click();
		},
		handleFileChange(e) {
			const file = e.target.files[0];
			if (file) {
				this.selectedFile = file;
				this.uploadAttachment();
			}
			// Reset file input so same file can be selected again
			if (this.$refs.fileInput) {
				this.$refs.fileInput.value = '';
			}
		},
		handleDrop(e) {
			e.preventDefault();
			this.isDragOver = false;
			const file = e.dataTransfer.files[0];
			if (file) {
				this.selectedFile = file;
				this.uploadAttachment();
			}
			// Reset file input (optional, for consistency)
			if (this.$refs.fileInput) {
				this.$refs.fileInput.value = '';
			}
		},
		handleDragOver(e) {
			e.preventDefault();
			this.isDragOver = true;
		},
		handleDragLeave(e) {
			e.preventDefault();
			this.isDragOver = false;
		},
		formatFileSize(size) {
			if (!size) return '';
			if (typeof size === 'string') size = parseInt(size, 10);
			if (size < 1024) return size + ' B';
			if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
			return (size / (1024 * 1024)).toFixed(1) + ' MB';
		},
		async handleCustomButtonClick(button) {
			if (typeof button.handler === 'function') {
				await button.handler(cappsFormUtilityAPIs.call(this, { $el: this.$refs.form.$el }));
			} else {
				console.warn(`No handler function defined for button: ${button.label}`);
			}
		},
		// Note: Button visibility management methods (initializeButtonVisibility, addCustomButton, removeCustomButton,
		// showCustomButton, clearCustomButtons, changeCustomButtonType) are provided by ButtonVisibilityMixin

	},
	mounted() {
		// Query param से panel/sidebar open करें
		if (this.$route && this.$route.query && this.$route.query.showRecordSummary === 'true') {
			this.toggleDetailsSidebar();
		}

		if (this.$route && this.$route.query && this.$route.query.hideFormHeader === 'true') {
			this.hideFormHeader = true;
		}
	},
};
</script>


<style lang="scss" scoped>
.capps_input_form {
	&__row {
		gap: 3px;

		.col-9 {
			flex: 0 0 73%;
			max-width: 73%;
		}

		.col-3 {
			flex: 0 0 26.7%;
    		max-width: 26.7%;
		}
	}

	.hidesidebar {
		display: none !important;
		transition: left 0.5s ease-in-out;
	}

	.side-collection-container {
		word-break: break-word;
		display: flex;
		flex-direction: column;

		::v-deep .card-header {
			background-color: #f8f9fa; // Light gray background for accordion headers
			border-bottom: 1px solid #dee2e6;
			padding: 0.5rem 1rem; // Adjust padding for headers
		}

		flex-direction: column;
		.connection-link {
			&:hover {
				text-decoration: underline;
			}
		}

		// Styles for Vue 3 Panel integration with Vue 2 content
		.panel-wrapper {
			border: 1px solid #dee2e6;
			border-radius: 4px;
			overflow: hidden;
		}

		.panel-body-vue2 {
			border-top: 1px solid #dee2e6;
			padding: 0.5rem;
			background-color: #ffffff;
		}
	}

	::v-deep {
		.mh-90 {
			max-height: 90vh;
			background: #fefefe;
			// min-height: 90vh;
			height: 100%;
		}
	}

	.mh-76 {
		max-height: 76vh;
		background: #fefefe;
		// min-height: 76vh;
		height: 100%;
	}

	.zoom-out {
		transform: scale(0.95);
		transform-origin: 50% 20%;
	}

	.group-items {
		&:hover {
			background: #cfdce5;
		}
	}

	.active_group_item {
		background: #0c48ef52;
	}

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


.section-header .btn {
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(60,60,100,0.08);
  transition: box-shadow 0.18s, background 0.18s;
}
.section-header .btn:focus, .section-header .btn:hover {
  box-shadow: 0 2px 8px rgba(60,60,100,0.16);
}

.capps-btn {
  font-weight: 600;
  font-size: 1.08rem;
  padding: 0.45rem 1.3rem;
  border: none;
  outline: none;
  box-shadow: 0 1px 4px rgba(60,60,100,0.06);
  transition: box-shadow 0.18s, background 0.18s, color 0.18s;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  border-radius: 8px !important; /* हलका round */
}

.capps-btn:focus, .capps-btn:hover {
  box-shadow: 0 2px 8px rgba(60,60,100,0.12);
  text-decoration: none;
}

.capps-btn-primary {
  background: #2563eb;
  color: #fff;
}

.capps-btn-primary:focus, .capps-btn-primary:hover {
  background: #174ea6;
  color: #fff;
}

.capps-btn-light {
  background: #f8fafc;
  color: #22223b;
  border: 1.2px solid #e3e8f0;
}

.capps-btn-light:focus, .capps-btn-light:hover {
  background: #f1f5f9;
  color: #22223b;
  border-color: #b6c6e3;
}

.capps-btn-secondary {
  background: #6b7280;
  color: #fff;
  border: 1px solid #6b7280;
}

.capps-btn-secondary:focus, .capps-btn-secondary:hover {
  background: #4b5563;
  color: #fff;
  border-color: #4b5563;
}

.capps-btn,
.capps-btn .capps-btn-text {
  font-weight: 500 !important;
}

/* Button Container with Hidden Scrollbar */
.button-container-scroll {
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  /* Ensure dropdown menus are visible */
  ::v-deep .dropdown {
    z-index: 1050;
  }
  
  ::v-deep .dropdown-menu {
    z-index: 1051;
    position: absolute !important;
    will-change: transform;
  }
}

/* Ensure section header doesn't clip dropdowns */
.section-header {
  position: relative;
  overflow: visible !important;
  z-index: 1000;
}
</style>