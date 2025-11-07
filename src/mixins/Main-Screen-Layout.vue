<template>
	<section class="capps_collection-view-container top_bar" :id="'capps__view_container_' + moduleName + '__' + collection">
		<!-- Row 1: Sub Nav Bar -->
		<div class="capps__sub_nav_bar_container">
			<b-navbar>
				<b-navbar-brand >{{ collectionSchemaDetails.NAME }} </b-navbar-brand>
			</b-navbar>
		</div>

		<!-- Pagination Row (Moved from TableView) -->
		<div class="capps__table_pagination_controls" v-if="filterRendered && (['list', 'card'].includes(viewType) || false === viewType)">
			<div class="d-flex align-items-center pagination-wrapper">
				<b-pagination
					ref="tablePagination"
					size="sm"
					align="right"
					v-model="tableCurrentPage"
					@change="handleTablePageChange"
					:per-page="limit" 
					:total-rows="tableTotalRows"
					class="mb-0 pagination-large-numbers"
				></b-pagination>
				
				<!-- Go to page input -->
				<div class="goto_page_wrapper ml-1" v-if="tableTotalPages > 1">
					<b-form-input
						v-model="gotoPageInput"
						@keyup.enter="goToSpecificPage"
						@blur="goToSpecificPage"
						type="number"
						:min="1"
						:max="tableTotalPages"
						class="goto-input"
						size="sm"
						placeholder="#"
						title="Enter page number and press Enter"
					/>
				</div>
			</div>
		</div>

		<div class="capps__table_pagination_info justify-content-end" v-if="filterRendered && (['list', 'card'].includes(viewType) || false === viewType)">
			<span style="color: #738499; font-weight: 600;">{{ tablePaginationLabel }}</span>
		</div>

		<div 
			class="capps__quick_filter_option" 
			v-if="Object.keys(quickFilterEl).length > 0"
		>
			<div 
				v-for="(item, index) in quickFilterEl" 
				:key="'capps__quick_filter_option_' + index" 
			>
				<FormElementWithValidation
					style="width: 100%;"
					class="tt"
					:item="item"
					v-model="filters[item.name]"
					@input="(val) => { onFilterElValueChange(val, item); quickFilterSearch(val) }"
					:dataset="dataset[item.ds]"
					:locale="localeEl.fields"
					:filterView="true"
					show-title
				>
				</FormElementWithValidation>
			</div>
		</div>

		<div 
			class="capps__custom_html" 
			id="CAPPS_CUSTOM_HTML_CONTAINER"
		></div>

		<!-- Table View / Card View -->
		 <!--
		 <TableView
		 	class="capps__table_view_item"
			v-if="filterRendered && ('list' === viewType || false === viewType)"
			:fetchData="fetchData"
			:perPage="limit"
			:current-page-prop="tableCurrentPage"
			@data-metrics-updated="updateTablePaginationData"
			:fields="columns"
			:collection="collection"
			:referenceKey="referenceKey"
			:localeEl="localeEl"
			:isCheckbox="isCheckbox"
			:isAction="isAction"
			ref="gridview"
			@update:data:source="updateDatasource"
			@clear:selected:filter="clearSelectedFilter"
			:read-api="customReadAPI"
			:module-based-action-comp-path="moduleBasedActionCompPath"
			:filterSetting="filterSetting"
			:showDots="showDots"
			:module-name="moduleName"
			@grid:sort:by="field => SORT_FIELD = field"
			@grid:sort:order="order => SORT_ORDER = order"
			@refresh:clicked="refreshData"
			:sort-by-field="SORT_FIELD"
			:sort-by-order="SORT_ORDER"
			:initial-fetch="initialFetch"
			:tbody-tr-attr="tbodyTrAttr"
		>
			<template 
				v-for="(item, idx) in customFieldSlots"
				v-slot:[item.key]="data" 
			>
				<component :is="item.component" :item="data" :obj-key="item.key" :key="idx" ></component>
			</template>
		</TableView>
		 -->

		<div class="capps__table_view_item">
			<vue3-component-loader
				v-if="('list' === viewType || false === viewType)"
				exposed-module="./DataTable"
				:component-props="tableComponentProps"
				:component-events="tableComponentEventHandlers"
				:should-show-loader="!(filterRendered && IS_SCHEMA_LOADED && (viewType === 'list' || viewType === false))"
			>
				<template #loading>
					<b-skeleton-table :rows="10" :columns="columns.length || 5" :table-props="{ bordered: true, striped: true }"></b-skeleton-table>
				</template>
			</vue3-component-loader>
		</div>

		<section 
			class="capps__card_view_item" 
			v-if="filterRendered && viewType === 'card'"
		>
			<transition name="fade">
				<card-view
					:fetch-data="fetchData"
					:per-page="limit"
					:page-title="localeEl.PageTitle"
					ref="card_view"
					:current-page="tableCurrentPage"
					:refresh-key="refreshKey"
					@update:data:source="updateDatasource"
					@clear:selected:filter="clearSelectedFilter"
					@data-metrics-updated="updateTablePaginationData"
				>
					<template slot-scope="{ item }">
						<card-component
							:doc="item"
							:collection="collection"
							:module-name="moduleName"
							:collection-card-template="() => collectionCardTemplate"
							:supported-actions="supportedActions"
							:referenceKey="referenceKey"
							:localeEl="localeEl"
							:isCheckbox="isCheckbox"
							:isAction="isAction"
							@update:data:source="updateDatasource"
							@clear:selected:filter="clearSelectedFilter"
							:read-api="customReadAPI"
							:module-based-action-comp-path="moduleBasedActionCompPath"
							:filterSetting="filterSetting"
							:showDots="showDots"
							@refresh:clicked="refreshData"
						></card-component>
					</template>
				</card-view>
			</transition>
		</section>

		<div class="capps__navbar_actions_container scroll-y">
			<b-navbar toggleable="xl" class="p-0"> 
				<ul class="d-flex btn_gap ml-auto mt-2 mb-2 ml-auto" style="width: 100%;">
					<b-nav-text v-if="filterSetting.add" data-action="add">
						<button
							class="btn btn-default active action-credBtn"
							@click="onStandardCreate"
						>
							<add-button />
							<span class="action-text">{{ localeEl.actions.CREATE || "Add" }}</span>
						</button>
					</b-nav-text>
					
					<!-- Ungrouped buttonList actions (object-based individual buttons) -->
					<b-nav-text
						v-for="button in visibleButtonList.ungrouped"
						:key="'button_list_' + button.key"
						:data-action="button.key"
					>
						<button
							:class="[
								button.class || 'btn btn-default active action-credBtn'
							]"
							@click="button.handler(cappsListUtilityAPIs)"
						>
							<i v-if="button.icon" :class="button.icon"></i>
							<span :class="{'ml-2': button.icon}" class="action-text">{{
								localeEl.actions[button.key] || button.label || button.key
							}}</span>
						</button>
					</b-nav-text>

					<!-- Grouped buttonList actions (dropdown menus) -->
					<b-nav-text
						v-for="(groupButtons, groupName) in visibleButtonList.grouped"
						:key="'button_group_' + groupName"
						:data-action-group="groupName"
						class="dropdown"
					>
						<b-dropdown
							:text="groupName"
							variant="outline-secondary"
							class="action-credBtn"
							size="sm"
						>
							<b-dropdown-item
								v-for="button in groupButtons"
								:key="'grouped_button_' + button.key"
								@click="button.handler(cappsListUtilityAPIs)"
							>
								<i v-if="button.icon" :class="button.icon + ' mr-2'"></i>
								{{ localeEl.actions[button.key] || button.label || button.key }}
							</b-dropdown-item>
						</b-dropdown>
					</b-nav-text>

					<!-- Legacy support for visibleListJsActions (function-based actions) -->
				<!-- Only renders if action is NOT already in buttonList to prevent duplication -->
				<!-- <b-nav-text
					v-for="action in visibleListJsActions"
					:key="'list_js_action_' + action.key"
					:data-action="action.key"
				>
					<button
						:class="[
							action.class || 'btn btn-default active action-credBtn'
						]"
						@click="action.handler(cappsListUtilityAPIs)"
					>
						<i v-if="action.icon" :class="action.icon"></i>
						<span :class="{'ml-2': action.icon}" class="action-text">{{
							localeEl.actions[action.key] || action.label || action.key
						}}</span>
					</button>
				</b-nav-text> -->
				</ul>				
			</b-navbar>
		</div>

		<div class="capps__navbar_core_actions_container ml-auto">
			<b-navbar toggleable="xl" class="p-0">
				<ul class="navbar-nav">
					<b-nav-text class="pl-4 pr-3 core_action__divider" v-if="filterSetting.add || buttonList.length > 0">
						<div class="divider"></div>
					</b-nav-text>
					<!-- Refresh -->
					<b-nav-text class="core_action__refresh">
						<button
							class="btn btn-default active"
							v-b-tooltip.hover
							title="Refresh"
							@click="refreshData"
						>
							<span class="refresh-svg">
								<Refresh />
							</span>
						</button>
					</b-nav-text>
					<!-- Download -->
					<b-nav-text v-if="filterSetting.download" class="core_action__export">
						<b-dropdown
							ref="downloadDropdown"
							right
							no-caret
							variant="link"
							@show="onDownloadShow"
							@hide="onDownloadHide"
							id="download_dropdown"
							v-b-tooltip.hover
							title="Download"
						>
							<template #button-content>
								<span class="export-svg">
									<Export />
								</span>
							</template>
							<b-dropdown-item @click="_downloadGridData({ type: 'csv' })">Download CSV</b-dropdown-item>
							<b-dropdown-item @click="_downloadGridData({ type: 'xlsx' })">Download Excel</b-dropdown-item>
							<b-dropdown-item @click="copyToClipboardTable(dataSource||[], 'Page copied to clipboard.')">Copy Page</b-dropdown-item>
						</b-dropdown>
					</b-nav-text>
	
					<!-- Upload -->
					<b-nav-text v-if="filterSetting.upload" class="core_action__upload">
						<router-link
							:to="`/${moduleName}/doc/${collection}/view/list/upload`"
							class="btn btn-default active"
						>
							<Upload v-b-tooltip.hover title="Upload file" class="upload-svg"/>
							<span class="d-inline-block d-xl-none">{{ localeEl.actions.upload }}</span>
						</router-link>
					</b-nav-text>
	
					<!-- Fliters -->
					<b-nav-text v-if="Object.keys(filterEl).length" class="core_action__filter">
						<b-dropdown
							ref="filterDropdown"
							id="dropdown-form"
							right
							no-caret
							variant="link"
							@show="filterViewShow"
							@hide="onDropdownHide"
							class="filter-modal"
						>
							<template #button-content>
								<span v-b-tooltip.hover title="Filters" class="filter-svg">
									<FilterSvg />
								</span>
								<b-badge style="top: -8px; background-color: #2499ef">{{
									combinedFiltersLength.length
								}}</b-badge>
							</template>
							<div class="fitler-form-label">
								<label >Apply Filters</label>
								<b-button size="sm mx-3" style="background: transparent;" @click="clearFilters()"> Clear All</b-button>
							</div>
							<b-dropdown-divider></b-dropdown-divider>
							<b-dropdown-form class="filter-list scroll-y filter-form">
								<FormElementWithValidation
									class="navbar-text tt"
									v-for="(item, index) in filterEl"
									:key="index"
									:item="item"
									v-model="filters[item.name]"
									@input="(val) => onFilterElValueChange(val, item)"
									:dataset="dataset[item.ds]"
									:locale="localeEl.fields"
									:filterView="true"
								>
								</FormElementWithValidation>
							</b-dropdown-form>
	
							<div class="px-3 filter-button">
								<b-button
									variant="secondary"
									class="filter-primary"
									size="sm"
									@click="filterViewHide()"
								>
									Close</b-button
								>
	
								<b-button
									variant="primary"
									class="filter-secondary"
									size="sm"
									@click="applyButtonClicked"
								>
									Apply
								</b-button>
							</div>
						</b-dropdown>
					</b-nav-text>
	
					<!-- Clear Filter -->
					<b-nav-text v-if="Object.keys(filterEl).length" class="core_action__clear_filter">
						<button
							:class="{ active: Object.keys(combinedFiltersLength).length }"
							:disabled="!Object.keys(combinedFiltersLength).length"
							class="btn btn-default"
							@click="clearFilters()"
						>
							<span v-b-tooltip.hover title="Clear filter" class="clear-filter-svg">
								<ClearFilter />
							</span>
						</button>
					</b-nav-text>
	
					<b-nav-text class="core_action__compact">
						<div
							class="btn btn-default active"
							v-b-tooltip.hover
							title="Compact"
							@click="changeDensity('compact')"
							v-if="density != 'compact'"
						>
							<span class="density-svg">
								<DensityCompact />
							</span>
						</div>
						<div
							class="btn btn-default active"
							v-b-tooltip.hover
							title="Comfortable"
							@click="changeDensity('comfortable')"
							v-if="density != 'comfortable'"
						>
							<span class="density-svg">
								<DensityComfortable />
							</span>
						</div>
					</b-nav-text>
	
					<b-nav-text>
						<div
							class="btn btn-default active"
							v-b-tooltip.hover
							title="Switch to list view"
							@click="switchToView('list')"
							v-if="viewType === 'card'"
						>
							<span>
								<b-icon icon="table" scale="1.01" ></b-icon>
							</span>
						</div>
						<div
							class="btn btn-default active"
							v-b-tooltip.hover
							title="Switch to card view"
							@click="switchToView('card')"
							v-if="viewType === 'list'"
						>
							<span>
								<b-icon icon="credit-card2-front" scale="1.3"></b-icon>
							</span>
						</div>
					</b-nav-text>
				</ul>
			</b-navbar>
		</div>

		<router-view class="capps__router_view_item"></router-view>
	</section>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { getCollectionDetails } from "@/modules/CAPPS/CollectionDetails/getCollectionFields.js";
import { processCardJsFile } from "@/Framework/JS API/CARD/index.js";
import { debounce } from "@/Framework/utility/debounce.js";
import cappsListUtilityAPIs from "@/Framework/JS API/LIST/listHandlerArgumentAPIs.js";

const FilterMatchMode = {
    CONTAINS: 'contains',
    EQUALS: 'equals',
    // Add other modes as needed
};
const FilterOperator = {
    AND: 'and',
    OR: 'or'
};
import { REFRESH_EVENT_NAME } from "@/Framework/constants/ui.js";
import { loadLanguageAsync } from "@/i18n";
import { applanguage } from "config";

export default {
	props: {
		filter: {
			type: Object,
			default: () => ({}),
		},
	},
	components: {
		TableView: () => import("@/components/DataVisualisation/TableView/TableView.vue"),
		CardView: () => import("../components/DataVisualisation/CardView/CardView.vue"),
		CardComponent: () => import("@/Framework/JS API/CARD/CardComponent.vue"),
		Vue3ComponentLoader: () => import("../components/Vue3ComponentLoader/Vue3ComponentLoader.vue")
	},
	data() {
		const dataSource = Object.freeze([]);
		return {
			screen_loading: true,
			dataSource: dataSource,
			ds: {},
			showModal: false,
			isLoading: false,
			limit: 50,
			additionalInfo: {},
			cardViewConfig: true,
			isFirstTimeSelectedFiltersWatcher: true,
			columns: [],
			filterEl: {},
			quickFilterEl: {},
			supportedActions: {},
			filterSetting: { upload: false, download: true, card: false, grid: false },
			initialFetch: true,
			showDots: false,
			SORT_FIELD: "",
			SORT_ORDER: false,
			IS_SCHEMA_LOADED: false,
			tbodyTrAttr: () => ({}),
			columnRowColorize: {},
			formatters: {},
			rowHeaderTemplateRenderer: null,
			rowFooterTemplateRenderer: null,
			filterRendered: false,
			isCardComponentAvailable: true,
			tableCurrentPage: 1,
			tableTotalRows: 0,
			tableFirstRecord: 0,
			tableLastRecord: 0,
			tableFilters: {}, // <-- ADD THIS LINE
			gotoPageInput: '',
			notifyListOnload: null,
			cappsListUtilityAPIs: null,
			refreshKey: Date.now(),
			visibleListJsActions: [],
			dataTableScrollHeight: "calc(100vh - 190px)",
			includeChildRecords: false, // Schema-driven flag for child record expansion
			allowUserToggleChildRecords: false, // Whether user can override schema default
			childCollections: {}, // Child collection configurations loaded from schemas
			listJsActions: {},
			buttonList: [],
			buttonColumns: []
		};
	},
	computed: {
		hoveredActions() {
			const ACTIONS = [
				{
					if: true,
					icon: 'pi pi-eye',
					label: this.localeEl.actions.VIEW || 'View',
					onClick: this.openViewScreen,
				},
				{
					if: this.filterSetting.modify,
					icon: 'pi pi-pencil',
					label: this.localeEl.actions.UPDATE || 'Modify',
					onClick: this.openUpdateScreen,
				},
				{
					if: this.filterSetting.delete,
					icon: 'pi pi-trash',
					label: this.localeEl.actions.DELETE || 'Delete',
					severity: 'danger',
					onClick: this.deleteAction,
				},
				{
					if: this.filterSetting.add || this.filterSetting.duplicate,
					icon: 'pi pi-copy',
					label: this.localeEl.actions.DUPLICATE || 'Duplicate',
					onClick: this.openAddScreen,
				},
				{
					if: true,
					icon: 'pi pi-clone',
					label: this.localeEl.actions.COPY || 'Copy Record',
					onClick: (hoveredRow) => this.copyToClipboardTable([hoveredRow], 'Record copied to clipboard.'),
				}
			]
			return ACTIONS.filter(action => action.if).map(action => ({
				icon: action.icon,
				label: action.label,
				outlined: true,
				rounded: true,
				disabled: action.disabled,
				onClick: action.onClick,
			}));
		},
		visibleButtonList() {
			// Start with empty result
			const result = { ungrouped: [], grouped: {} };

			// Process buttonList (new format)
			if (this.buttonList && this.buttonList.length > 0) {
				const allButtons = this.buttonList.filter(button => {
					if (typeof button.show === 'function') {
						try {
							return button.show(this.cappsListUtilityAPIs);
						} catch (error) {
							console.error(`Error evaluating 'show' condition for button '${button.key}':`, error);
							return false;
						}
					}
					return button.show !== false;
				});

				// Separate ungrouped and grouped buttons
				allButtons.forEach(button => {
					if (button.group) {
						if (!result.grouped[button.group]) {
							result.grouped[button.group] = [];
						}
						result.grouped[button.group].push(button);
					} else {
						result.ungrouped.push(button);
					}
				});
			}

			// Add legacy actions that are NOT already in buttonList to ungrouped
			const buttonListKeys = (this.buttonList || []).map(btn => btn.key);
			const legacyActionsToAdd = this.visibleListJsActions.filter(action =>
				!buttonListKeys.includes(action.key)
			);
			result.ungrouped.push(...legacyActionsToAdd);

			return result;
		},
		tableComponentProps() {
			return {
				compactMode: this.density === "compact",
				fetchData: this.fetchData,
				perPage: this.limit,
				currentPage: this.tableCurrentPage,
				// fields: this.columns,
				totalRows: 50,
				columns: this.columns,
				filters: this.tableFilters, // <-- PASS THE FILTERS PROP
				collection: this.collection,
				referenceKey: this.referenceKey,
				localeEl: this.localeEl,
				isCheckbox: this.isCheckbox,
				isAction: this.isAction,
				ef: this.gridview,
				readApi: this.customReadAPI,
				moduleBasedActionCompPath: this.moduleBasedActionCompPath,
				filterSetting: this.filterSetting,
				showDots: this.showDots,
				moduleName: this.moduleName,
				sortByField: this.sortByField,
				sortByOrder: this.sortByOrder,
				initialFetch: this.initialFetch,
				rowRenderer: this.tbodyTrAttr,
				columnRowColorize: this.columnRowColorize,
				formatters: this.formatters,
				rowHeaderTemplateRenderer: this.rowHeaderTemplateRenderer,
				rowFooterTemplateRenderer: this.rowFooterTemplateRenderer,
				actions: this.hoveredActions,
				refreshKey: this.refreshKey,
				enableDoubleClickShowData: this.moduleConfigurations?.APPLICATION_FEATURES?.["list.enableDoubleClickShowData"],
				enableHoverActions: this.moduleConfigurations?.APPLICATION_FEATURES?.["list.enableFloatingRowActions"],
				dataTableScrollHeight: this.dataTableScrollHeight || "calc(100vh - 190px)",
				
				// Child collection expansion properties
				includeChildRecords: this.includeChildRecords,
				childCollections: this.childCollections,
				expandDataKey: 'ID',
				
				// Button columns for individual row actions
				buttonColumns: this.buttonColumns,
			}
		},
		tableComponentEventHandlers() {
			return {
				"data-metrics-updated": this.updateTablePaginationData,
				"update:data:source": this.updateDatasource,
				"clear:selected:filter": this.clearSelectedFilter,				
				"update:sortByField": field => { 
					this.SORT_FIELD = field;
				}, 
				"update:sortByOrder": order => { 
					this.SORT_ORDER = order != -1;
				},
				"update:filters": (newFilters) => { this.tableFilters = newFilters }, // <-- HANDLE THE UPDATE EVENT
				"update:currentPage": this.handleTablePageChange,
				"row-select": this.handleRowSelect,
				"row-unselect": this.handleRowUnselect,
				"reset-selections": this.resetSelections,
			}
		},
		dataset() { 
			return this.ds
		},
		/**
		 * Combined filter count for both standard filters and column filters
		 */
		combinedFiltersLength() {
			const standardFiltersCount = this.selectedFilters ? this.selectedFilters.length : 0;
			const columnFiltersCount = this.tableFilters ? Object.keys(this.tableFilters).filter(key => {
				if (key === 'global' || !this.tableFilters[key]) {
					return false;
				}
				
				// Check for menu-based filtering structure (constraints)
				if (this.tableFilters[key].constraints && this.tableFilters[key].constraints.length > 0) {
					const constraint = this.tableFilters[key].constraints[0];
					return constraint.value !== null && constraint.value !== '';
				}
				
				// Check for simple filtering structure
				return this.tableFilters[key].value !== null && this.tableFilters[key].value !== '';
			}).length : 0;
			return { 
				length: standardFiltersCount + columnFiltersCount,
				standard: standardFiltersCount,
				column: columnFiltersCount
			};
		},
		readApi() { 
			return this.customReadAPI
		},
		PageTitle() { 
			return this.collectionSchemaDetails.NAME;
		},
		paramFilters() { 
			return this.filter
		},
		perPage(){ 
			return this.limit
		},
		fields(){ 
			return this.columns 
		},
		readApi(){ 
			return this.customReadAPI 
		},
		sortByField() { 
			return this.SORT_FIELD 
		},
		sortByOrder() { 
			return  this.SORT_ORDER === false ? -1 : 1;
		},
		...mapState(["isActionPerformed", "selectedFilters"]),
		...mapState("ChoseRecord", ["checkedItemList"]),
		...mapState("CollectionBlock", ["collectionSchemaDetails"]),
		...mapState("ModuleBlock", ["moduleConfigurations"]),
		collectionCardTemplate() {
			const CARD_TEMPLATE_LOAD_PAYLOAD = { appName: this.moduleName, collectionName: this.collection };
			console.log("CARD_TEMPLATE_LOAD_PAYLOAD ", CARD_TEMPLATE_LOAD_PAYLOAD);
			const _this = this;
			return {
				// The component to load (should be a Promise)
				component: new Promise(async function (resolve) {
					const slotComponent = await processCardJsFile(CARD_TEMPLATE_LOAD_PAYLOAD);
					_this.isCardComponentAvailable = slotComponent.isCardComponentLoaded;
					resolve(slotComponent.cardComponent);
				}),
				// Delay before showing the loading component. Default: 200ms.
				delay: 200,
				// The error component will be displayed if a timeout is
				// provided and exceeded. Default: Infinity.
				// timeout: 3000,
			}
		},
		customFieldSlots() {
			return this.customColumnSlots || [];
		},
		customReadAPI() {
			return this.readAPI || undefined;
		},
		localeEl() {
			let localeData = this.$t(this.localeName);
			localeData = typeof localeData === "string" ? {
				actions: {},
				fields: {},
			} : localeData;
			localeData.actions = localeData.actions || {};
			localeData.fields = localeData.fields || {};
			return localeData
		},
		localStorageFilter() {
			if (localStorage.getItem(`filters_${this.collection}`) === null) return null;
			return JSON.parse(
				localStorage.getItem(`filters_${this.collection}`) || "[]"
			);
		},
		viewType() {
			if(!this.isCardComponentAvailable) return false;
			if(this.$route.path.includes('view/card')) return "card";
			return "list";
		},
		tablePaginationLabel() {
			if (this.tableTotalRows === 0 || this.tableFirstRecord === 0) return "No records";
			return `Showing ${this.tableFirstRecord} - ${this.tableLastRecord} of ${this.tableTotalRows} records`;
		},
		
		tableTotalPages() {
			return Math.ceil(this.tableTotalRows / this.limit) || 1;
		},
		
		isValidPageInput() {
			const pageNum = parseInt(this.gotoPageInput);
			return pageNum && pageNum >= 1 && pageNum <= this.tableTotalPages;
		}
	},
	watch: {
		listJsActions: {
			// This watcher triggers when the entire set of actions is replaced.
			handler: "updateVisibleListJsActions",
			immediate: true,
		},
		checkedItemList: {
			// This watcher is an example for when actions depend on selections.
			// Add other watchers for any other reactive data that `show` functions might depend on.
			handler: function() {
				this.updateVisibleListJsActions();
			},
			deep: true,
		},
		customReadAPI: {
			immediate: true,
			async handler() {
				const collectionSchemaDetails = await this.getCollectionSchemaDetails({
					collectionName: this.collection,
        			moduleName: this.moduleName,
				});
				await this.setCollectionSettings(collectionSchemaDetails);
				console.log("[customReadAPI]::Collection Schema Details: ", collectionSchemaDetails);
				this.fetchNewData();
			}
		},
		async isActionPerformed(newVal) {
			if (newVal == true) {
				const collectionSchemaDetails = await this.getCollectionSchemaDetails({
					collectionName: this.collection,
        			moduleName: this.moduleName,
				});
				console.log("[isActionPerformed]::Collection Schema Details: ", collectionSchemaDetails);

				this.dataSource = Object.freeze([]);
				this.$store.commit("OnActionPerformed", false);
				this.fetchNewData();
			}
		},
		async selectedFilters() {
			if (!this.fetchData.isLoading) {
				const collectionSchemaDetails = await this.getCollectionSchemaDetails({
					collectionName: this.collection,
        			moduleName: this.moduleName,
				});
				console.log("[selectedFilters]::Collection Schema Details: ", collectionSchemaDetails);
				this.fetchNewData();
			}
		},
		supportedActions: {
			immediate: true,
			handler(currentValue) {
				const filterSetting = {
					upload: currentValue.UPLOAD === true,
					download: currentValue.EXPORT === true,
					add: currentValue.CREATE === true,
					modify: currentValue.UPDATE === true,
					delete: currentValue.DELETE === true,
					duplicate: currentValue.DUPLICATE === true,
				};
				this.isAction = this.showDots = [filterSetting.modify, filterSetting.delete].includes(true);
				this.filterSetting = {...this.filterSetting, ...filterSetting};
			}
		}
	},
	methods: {
		...mapActions("CollectionBlock", ["getCollectionSchemaDetails"]),
		async setCollectionSettings(collectionSchemaDetails) {
			const {
				actions,
				columnLists,
				filterColumnLists,
				quickFilterColumnLists,
				sortField,
				sortOrder,
				tbodyTrAttr,
				notifyListOnload,
				columnRowColorize,
				formatters,
				dataTableScrollHeight,
				rowHeaderTemplateRenderer,
				rowFooterTemplateRenderer,
				listJsActions,
				buttonList,
				buttonColumns,
			} = await getCollectionDetails({
				componentReference: this,
				collectionSchema: collectionSchemaDetails,
				locale: this.localeEl.fields,
				moduleName: this.moduleName,
				collection: this.collection
			});
			this.notifyListOnload = notifyListOnload;
			this.columns = [...columnLists];
			this.filterEl = filterColumnLists;
			this.quickFilterEl = quickFilterColumnLists;
			this.supportedActions = actions.reduce(function (acc, actionName) {
				acc[actionName] = true;
				return acc;
			}, {});
			this.SORT_FIELD = sortField;
			this.SORT_ORDER = sortOrder;
			this.tbodyTrAttr = tbodyTrAttr || (() => ({}));
			this.dataTableScrollHeight = dataTableScrollHeight || "calc(100vh - 190px)";
			this.columnRowColorize = columnRowColorize;
			this.formatters = formatters;
			this.rowHeaderTemplateRenderer = rowHeaderTemplateRenderer;
			this.rowFooterTemplateRenderer = rowFooterTemplateRenderer;
			this.listJsActions = listJsActions || {};
			this.buttonList = buttonList || [];
			this.buttonColumns = buttonColumns || [];
			
			(function(context) {
				// calling collectionCardTemplate computed property
				return context.collectionCardTemplate;
			})(this)
			// ADD THIS CALL after this.columns is set
			this.generateTableFilters();
			
			// Read schema-driven child records configuration
			this.includeChildRecords = collectionSchemaDetails.INCLUDE_CHILD_RECORDS === 1;
			this.allowUserToggleChildRecords = collectionSchemaDetails.ALLOW_USER_TOGGLE_CHILD_RECORDS === true;
			
			console.log('🔍 Schema child records config:', {
				INCLUDE_CHILD_RECORDS: collectionSchemaDetails.INCLUDE_CHILD_RECORDS,
				includeChildRecords: this.includeChildRecords,
				allowUserToggleChildRecords: this.allowUserToggleChildRecords
			});
			
			// Load child collection configurations if enabled
			if (this.includeChildRecords) {
				this.childCollections = await this.loadChildCollectionSchemas(collectionSchemaDetails);
				console.log('🔍 Loaded child collections:', this.childCollections);
			}
			
			this.IS_SCHEMA_LOADED = true;
		},
		
		async loadChildCollectionSchemas(collectionSchemaDetails) {
			const childCollections = {};
			const _this = this;
			// Detect fieldtype: "table" fields in the collection schema
			const fields = collectionSchemaDetails.FIELDS || {};
			console.log('🔍 All fields in schema:', fields);
			
			const childCollectionFields = Object.entries(fields).filter(([fieldName, field]) => 
				field.fieldtype === "table" && field.ref
			);
			
			console.log('🔍 Found table fields:', childCollectionFields);
			
			if (childCollectionFields.length === 0) {
				console.log('🔍 No table fields found, returning empty childCollections');
				return childCollections;
			}
			
			// Load each child collection schema and configuration (following ChildCollection.vue pattern)
			for (const [fieldName, parentField] of childCollectionFields) {
				try {
					const childCollection = parentField.ref; // Use ref as collection name
					// Load child collection schema using capps.rest API
					const childSchemaResponse = await capps.rest[this.moduleName][childCollection].schema();
					// Load locale following ChildCollection.vue pattern (lines 217-221)
					const END_POINT = `${this.moduleName}/locale/${applanguage || "en"}`;
					await loadLanguageAsync(this.moduleName + applanguage, END_POINT);
					const localeData = this.$t(this.moduleName + "." + childCollection);
					const childCollectionLocaleEl = typeof localeData === "string" ? { actions: {}, fields: {} } : localeData;

					// Generate columns using getCollectionDetails
					const { columnLists } = await getCollectionDetails({
						componentReference: _this,
						collectionSchema: childSchemaResponse,
						sortable: true,
						locale: childCollectionLocaleEl.fields,
						fieldVisibilityCondition: function (field, fieldName) {
							// Hide system fields and parent references (similar to ChildCollection.vue)
							if (field.iskey == 1) {
								return true; // Hidden but included in data
							}
							if(parentField["parent.field"] === fieldName) return true; // Hide parent reference field
							if (field.hidden == 1) {
								return true; // Hidden field
							}
							return false; // Visible field
						},
						childTableSchema: true,
						collection: childCollection,
						moduleName: _this.moduleName,
					});
					
					// Build simplified child collection configuration (collectionName and columnList only)
					childCollections[fieldName] = {
						collectionName: childCollection,
						columnList: columnLists || []
					};					
				} catch (error) {
					console.error(`Failed to load child collection schema for ${fieldName}:`, error);
					// Continue loading other child collections even if one fails
				}
			}
			
			return childCollections;
		},
		updateVisibleListJsActions: debounce(async function() {
			if (!this.listJsActions || !this.cappsListUtilityAPIs) {
				this.visibleListJsActions = [];
				return;
			}

			const actionEntries = Object.entries(this.listJsActions);

			// Create an array of promises, where each promise resolves to the action and its visibility.
			const visibilityPromises = actionEntries.map(async ([key, config]) => {
				try {
					// Check if config has a show function (object-based actions)
					// If not, it's a function-based action and should always be visible
					if (typeof config === 'function') {
						// Function-based action - always visible
						return { handler: config, key, isVisible: true };
					} else if (config && typeof config.show === 'function') {
						// Object-based action with show function
						const isVisible = await Promise.resolve(config.show(this.cappsListUtilityAPIs));
						return { ...config, key, isVisible };
					} else {
						// Object-based action without show function - always visible
						return { ...config, key, isVisible: true };
					}
				} catch (error) {
					console.error(`Error evaluating 'show' condition for action '${key}':`, error);
					return { ...config, key, isVisible: false }; // Hide on error for safety
				}
			});

			// Wait for all visibility checks to complete.
			const actionsWithVisibility = await Promise.all(visibilityPromises);

			// Filter the actions that are visible and update the data property.
			this.visibleListJsActions = actionsWithVisibility.filter(action => action.isVisible);
		}, 200),
		openAddScreen(item) {
			const _this = this;
			setTimeout(() => {
				_this.$router.push(`/${_this.moduleName}/doc/${_this.collection}/add/${item.ID || ""}`);
			}, 100);
		},
		openUpdateScreen(item) {
			const _this = this;
			setTimeout(() => {
				_this.$router.push(`/${_this.moduleName}/doc/${_this.collection}/update/${item.ID || ""}`);
			}, 100);
		},
		openViewScreen(item) {
			const _this = this;
			setTimeout(() => {
				_this.$router.push(`/${_this.moduleName}/doc/${_this.collection}/view_record/${item.ID || ""}`);
			}, 100);
		},
		deleteAction(item) {
			setTimeout(() => {
				const _this = this;
				this.$_confirmMessage({
					size: "md",
					msg: "Are you sure you want to delete this record?",
				}).then((value) => {
					if (!value) return;
					(function fn() {
						let vObj = {};
						vObj["_ignore_prc_con"] = _this.ignore_prc_con;
						_this.$store.commit("loading", true);
						_this.$credCAPI
							.collection(`${_this.moduleName}/${_this.collection}/delete/${item.ID || ""}`)
							.read({ body: vObj })
							.then(async (response) => {
								_this.$store.commit("loading", false);
								await _this.$responseHandler(response, fn, _this, "noRouteChange");
								_this.refreshData();
							})
							.catch((error) => console.error(error));
					}.call(this));
				});
			}, 100);
		},
		generateTableFilters() {
            const newFilters = {};
            if (!this.columns || !Array.isArray(this.columns)) {
                this.tableFilters = {};
                return;
            }

            this.columns.forEach(col => {
                if (col.filter) {
                    // Default to text filter
                    let matchMode = FilterMatchMode.CONTAINS;
                    
                    // Configure based on fieldType
                    if (col.fieldType === 'numeric' || col.key === 'ID') {
                        matchMode = FilterMatchMode.EQUALS;
                    }
                    // Add more conditions for other fieldTypes like 'date', 'boolean', etc.

                    newFilters[col.key] = {
                        operator: FilterOperator.AND,
                        constraints: [{ value: null, matchMode: matchMode }]
                    };
                }
            });
            this.tableFilters = newFilters;
        },
		registerRefreshEvent() {
			const _this = this;
			document.removeEventListener(REFRESH_EVENT_NAME, document.refreshHandler);
			function refreshHandler() {
				_this.refreshData();
			}
			document.addEventListener(REFRESH_EVENT_NAME, refreshHandler);
			document.refreshHandler = refreshHandler;
		},
		quickFilterSearch: debounce(function () {
			this.applyButtonClicked();
		}, 500),
		onStandardCreate() {
			this.$router.push({ path: `/${this.moduleName}/doc/${this.collection}/add` });
		},
		handleTablePageChange(newPage) {
			this.tableCurrentPage = newPage;
			// this.clearSelectedFilter(); // Clear selections when page changes
		},
		updateTablePaginationData({ totalRows, firstRecord, lastRecord }) {
			this.tableTotalRows = totalRows;
			this.tableFirstRecord = firstRecord;
			this.tableLastRecord = lastRecord;
		},
		...mapMutations("CollectionBlock", ["RESET"]),
		switchToView(view) {
			this.$router.push(`/${this.moduleName}/doc/${this.collection}/view/${view}`)
		},
		filterComponentHandler(isRendered) {
			this.filterRendered = (isRendered === true);
		},
		clearSelectedFilter() {
			this.$store.commit("ChoseRecord/RESET");
		},
		fetchNewData() {
			this.dataSource = Object.freeze([]);
			this.refreshKey = Date.now();
		},
		_downloadGridData({type, options}) {
			options = options || {
				body: {
					...this.customPayload,
					filter: [...(this.staticFilter || []), ...(this.selectedFilters || [])],
					redirect: "follow",
				},
				headers: {
					Accept: `${type === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : type === 'csv' ? 'text/csv' : 'text/csv'}`,
				},
			};
			const vm = this;
			vm.$showNotificationSpinner("Downloading. Please Wait ...");
			this.$credCAPI
				.collection(this.customReadAPI)
				.read(options)
				.then((result) => {
					if (result.status === "unsuccess") {
						vm.$_showAlert("Alert!!", result.error || "Something unexpected happened");
						return vm.$closeNotificationSpinner();
					}
					var blob = new Blob([result]);
					var url = window.URL.createObjectURL(blob);
					var a = document.createElement("a");
					a.href = url;
					a.download = `${this.collectionSchemaDetails.NAME || "Data"}.${type || 'csv'}`;
					vm.$closeNotificationSpinner();
					a.click();
				})
				.catch((error) => {
					console.error(error);
					vm.$closeNotificationSpinner();
				});
		},
		refreshData() {
			this.tableCurrentPage = 1; // Reset page in parent before child refreshes
			this.fetchNewData();
		},
		updateDatasource(record) {
			this.$set(this, "dataSource", Object.freeze(record));
		},
		async fetchData({ start, limit, sortField, sortOrder, multiSortMeta, filters, columnFilters }) {
			console.log("fetchData isCardView ", this.viewType === "card", { start, limit, sortField, sortOrder, multiSortMeta, filters, columnFilters });	
			const _this = this;

			await this.getCollectionSchemaDetails({
				collectionName: this.collection,
				moduleName: this.moduleName,
			});
			
			const sort2 = (sortField && {
				field: sortField || "",
				dir: sortOrder == -1 ? "DESC" : "ASC",
			}) || undefined;
		
			// Use pre-translated column filters from Vue 3 DataTable
			console.log('🔍 [Vue2] Pre-translated columnFilters received:', columnFilters);

			const vObj = {
				body: {
					..._this.customPayload,
					filter: [...(_this.staticFilter || []), ..._this.selectedFilters, ...(columnFilters || [])],
					page: { start: "" + start, limit },
					sort: sort2,
					include_child_records: _this.includeChildRecords
				},
			};

			console.log('🚀 [Vue2] Final API payload:', vObj);
			console.log('📋 [Vue2] Static filters:', _this.staticFilter || []);
			console.log('📋 [Vue2] Selected filters:', _this.selectedFilters || []);
			console.log('📋 [Vue2] Column filters (pre-translated):', columnFilters || []);

			_this.screen_loading = true;
			_this.fetchData.isLoading = true;

			typeof _this.notifyListOnload === "function" && await _this.notifyListOnload(_this.collection, _this.cappsListUtilityAPIs);
			return _this.$credCAPI.collection(_this.customReadAPI).read(vObj)
				.then(async (response) => {
					_this.dataSource = Object.freeze(response);
					_this.screen_loading = false;
					_this.fetchData.isLoading = false;
					// _this.$nextTick();
					return _this.dataSource;
				})
				.catch((error) => {
					_this.screen_loading = false;
					_this.fetchData.isLoading = false;
					console.error("Error Fetch Data Table view ...", error);
					return []
				});
		},
		filterCollection(val) {
			this.refreshData();
		},
		handleRowSelect(row) {
			this.setSelectedItem(true, row);
		},
		handleRowUnselect(row) {
			this.setSelectedItem(false, row);
		},
		setSelectedItem(checked, item) {
			this.$store.dispatch('ChoseRecord/selectItem', {
				checked, 
				item,
				primaryKey: 'SR_NO_' + item.SR_NO,
			});
		},
		resetSelections() {
			this.$store.dispatch('ChoseRecord/reset');
		},
		/**
		 * Translate PrimeVue column filters to CAPPS API filter format
		 */
		translateColumnFilters(filters) {
			console.log('🔧 Translating column filters:', filters);
			console.log('🔧 Filters type:', typeof filters);
			console.log('🔧 Filters keys:', Object.keys(filters));
			console.log('🔧 Filters entries preview:', Object.entries(filters));
			const columnFilters = [];
			
			// Skip global filter as it's handled separately
			Object.entries(filters).forEach(([fieldName, filterConfig]) => {
				console.log(`🔍 Processing filter for field: ${fieldName}`, filterConfig);
				console.log(`🔍 FilterConfig type:`, typeof filterConfig);
				console.log(`🔍 FilterConfig has value property:`, 'value' in filterConfig);
				console.log(`🔍 FilterConfig.value:`, filterConfig.value);
				console.log(`🔍 FilterConfig.matchMode:`, filterConfig.matchMode);
				console.log(`🔍 FilterConfig has constraints:`, !!filterConfig.constraints);
				if (filterConfig.constraints) {
					console.log(`🔍 FilterConfig constraints length:`, filterConfig.constraints.length);
					console.log(`🔍 FilterConfig constraints:`, filterConfig.constraints);
				}
				
				if (fieldName === 'global' || !filterConfig) {
					console.log(`⏭️ Skipping ${fieldName} - global or no config`);
					return;
				}

				// Handle both constraint-based and simple filtering structures
				let operator, value;
				
				// First try simple structure (our custom filter component creates this)
				if ((filterConfig.value !== null && filterConfig.value !== undefined && filterConfig.value !== "") || filterConfig.value === 0) {
					// Simple filtering structure - prioritize this as it's what our component creates
					operator = filterConfig.matchMode || 'equals';
					value = filterConfig.value;
					console.log(`✅ Using simple filter for ${fieldName}: operator=${operator}, value=${value}`);
				} else if (filterConfig.constraints && filterConfig.constraints.length > 0) {
					// Menu-based filtering with constraints (fallback)
					const constraint = filterConfig.constraints[0];
					console.log(`📋 Found constraint for ${fieldName}:`, constraint);
					console.log(`🔍 Constraint details - matchMode: ${constraint.matchMode}, value:`, constraint.value);
					
					// More robust value checking - check for null, undefined, empty string, but allow 0
					if (constraint.value === null || constraint.value === undefined || constraint.value === "") {
						console.log(`⏭️ Skipping ${fieldName} - constraint value is null, undefined, or empty string`);
						return; // Skip if no value
					}
					operator = constraint.matchMode;
					value = constraint.value;
					console.log(`✅ Using constraint for ${fieldName}: operator=${operator}, value=${value}`);
				} else {
					console.log(`⏭️ Skipping ${fieldName} - no value in any structure`);
					console.log(`🔍 FilterConfig structure:`, filterConfig);
					return; // Skip if no value
				}

				// Map PrimeVue FilterMatchMode to CAPPS API operators
				const operatorMapping = {
					'startsWith': 'like',
					'contains': 'like',
					'notContains': 'notlike',
					'endsWith': 'like',
					'equals': 'eq',
					'notEquals': 'neq',
					'lt': 'lt',
					'lte': 'lte',
					'gt': 'gt',
					'gte': 'gte',
					'between': 'between',
					'dateIs': 'eq',
					'dateIsNot': 'neq',
					'dateBefore': 'lt',
					'dateAfter': 'gt'
				};

				const mappedOperator = operatorMapping[operator] || operator;

				// Create filter object based on operator type
				switch (mappedOperator) {
					case 'like':
						let likeValue = value;
						// Handle different like patterns based on original operator
						if (operator === 'startsWith') {
							likeValue = `${value}%`;
						} else if (operator === 'endsWith') {
							likeValue = `%${value}`;
						} else if (operator === 'contains') {
							likeValue = `%${value}%`;
						}
						
						columnFilters.push({
							field: fieldName,
							operator: 'like',
							value: likeValue
						});
						break;
					
					case 'eq':
						columnFilters.push({
							field: fieldName,
							operator: 'eq',
							value: value
						});
						break;
					
					case 'neq':
						columnFilters.push({
							field: fieldName,
							operator: 'neq',
							value: value
						});
						break;
						
					case 'notlike':
						columnFilters.push({
							field: fieldName,
							operator: 'notlike',
							value: `%${value}%`
						});
						break;
					
					case 'in':
						if (Array.isArray(value) && value.length > 0) {
							columnFilters.push({
								field: fieldName,
								operator: 'in',
								value: value
							});
						}
						break;
					
					case 'gte':
						columnFilters.push({
							field: fieldName,
							operator: 'gte',
							value: value
						});
						break;
					
					case 'lte':
						columnFilters.push({
							field: fieldName,
							operator: 'lte',
							value: value
						});
						break;
						
					case 'lt':
						columnFilters.push({
							field: fieldName,
							operator: 'lt',
							value: value
						});
						break;
						
					case 'gt':
						columnFilters.push({
							field: fieldName,
							operator: 'gt',
							value: value
						});
						break;
					
					case 'between':
						if (value && value.start && value.end) {
							columnFilters.push(
								{
									field: fieldName,
									operator: 'gte',
									value: value.start
								},
								{
									field: fieldName,
									operator: 'lte',
									value: value.end
								}
							);
						} else if (value && value.start) {
							columnFilters.push({
								field: fieldName,
								operator: 'gte',
								value: value.start
							});
						} else if (value && value.end) {
							columnFilters.push({
								field: fieldName,
								operator: 'lte',
								value: value.end
							});
						}
						break;
					
					default:
						// Default to equals for unknown operators
						columnFilters.push({
							field: fieldName,
							operator: 'eq',
							value: value
						});
						break;
				}
			});

			console.log('Column filters translated:', columnFilters);
			return columnFilters;
		},
		/**
		 * Clear all column filters
		 */
		clearColumnFilters() {
			this.tableFilters = {};
			// Also trigger a refresh to fetch data without column filters
			this.refreshData();
		},
		/**
		 * Clear both standard and column filters
		 */
		clearAllFilters() {
			this.clearFilters(); // Clear standard filters (existing method)
			this.clearColumnFilters(); // Clear column filters
		},
		
		goToSpecificPage() {
			const pageNum = parseInt(this.gotoPageInput);
			
			// Validate page number
			if (!pageNum || pageNum < 1 || pageNum > this.tableTotalPages) {
				// Clear invalid input
				this.gotoPageInput = '';
				return;
			}
			
			// Navigate to the specified page
			this.tableCurrentPage = pageNum;
			this.gotoPageInput = ''; // Clear input after navigation
		},
	},
	mounted() {
		this.cappsListUtilityAPIs = cappsListUtilityAPIs();
		this.registerRefreshEvent();
	}
};

</script>

<style scoped lang="scss">
/* Modern pagination container */
.capps__table_pagination_controls {
	padding: 1rem 1.5rem;
	background: #fff;
	border-top: 1px solid #e9ecef;
	border-bottom: 1px solid #e9ecef;
	margin-bottom: 1rem;
}

/* Enhanced pagination wrapper styling */
.pagination-wrapper {
	display: flex;
	align-items: center;
	flex-wrap: nowrap; /* Prevent wrapping to keep inline */
	gap: 0.5rem;
	height: 36px; /* Fix container height */
}

/* Enhanced pagination styling */
/* Enhanced pagination styling for large numbers */
::v-deep .pagination-large-numbers {
	.page-item {
		margin: 0 2px;
		
		.page-link {
			border: 1px solid #dee2e6;
			border-radius: 6px;
			padding: 8px 12px;
			min-width: 40px;
			height: 36px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 14px;
			font-weight: 500;
			color: #495057;
			background-color: #fff;
			transition: all 0.15s ease-in-out;
			text-decoration: none;
			
			&:hover {
				background-color: #e9ecef;
				border-color: #adb5bd;
				color: #495057;
				transform: translateY(-1px);
				box-shadow: 0 2px 4px rgba(0,0,0,0.1);
			}
			
			&:focus {
				box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
				border-color: #007bff;
				z-index: 3;
			}
		}
		
		&.active .page-link {
			background-color: #007bff;
			border-color: #007bff;
			color: #fff;
			min-width: 44px;
			font-weight: 600;
			box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
			transform: translateY(-1px);
			
			&:hover {
				background-color: #0056b3;
				border-color: #004085;
				color: #fff;
			}
		}
		
		&.disabled .page-link {
			color: #6c757d;
			background-color: #fff;
			border-color: #dee2e6;
			opacity: 0.6;
			cursor: not-allowed;
			
			&:hover {
				transform: none;
				box-shadow: none;
			}
		}
		
		/* Navigation buttons styling */
		&:first-child .page-link,
		&:last-child .page-link {
			padding: 8px 10px;
			min-width: 36px;
			font-weight: 600;
		}
	}
}

/* Go to page input styling - Elegant and seamless */
.goto_page_wrapper {
	display: flex;
	align-items: center;
	height: 36px;
	margin-left: 10px;
	
	.goto-input {
		width: 40px;
		height: 36px;
		font-size: 14px;
		text-align: center;
		border: 1px solid #dee2e6;
		border-radius: 6px;
		padding: 8px 12px;
		line-height: 1;
		font-weight: 500;
		color: #495057;
		background-color: #f8f9fa; /* Slightly different background to hint it's interactive */
		transition: all 0.2s ease-in-out;
		margin: 0;
		cursor: text;
		
		/* Default state - blend with pagination but subtly different */
		&:not(:focus):not(:hover) {
			border-color: #dee2e6;
			background-color: #f8f9fa;
		}
		
		&:hover {
			background-color: #e9ecef;
			border-color: #adb5bd;
			color: #495057;
			transform: translateY(-1px);
			box-shadow: 0 2px 6px rgba(0,0,0,0.12);
		}
		
		&:focus {
			border-color: #007bff;
			box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
			background-color: #fff;
			color: #495057;
			outline: none;
			transform: translateY(-1px);
		}
		
		&::placeholder {
			font-size: 14px;
			color: #6c757d;
			font-weight: 500;
			opacity: 0.6;
			text-align: center;
		}
		
		/* Subtle pulse animation when empty */
		&:empty::before {
			animation: subtle-pulse 2s ease-in-out infinite;
		}
		
		/* Remove spin buttons in Webkit browsers */
		&::-webkit-outer-spin-button,
		&::-webkit-inner-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}
		
		/* Remove spin buttons in Firefox */
		&[type=number] {
			-moz-appearance: textfield;
		}
	}
}

/* Subtle pulse animation for better UX */
@keyframes subtle-pulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.7; }
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.pagination-wrapper {
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}
	
	.capps__table_pagination_controls {
		flex-direction: column;
		gap: 1rem;
	}
	
	::v-deep .pagination-large-numbers .page-item .page-link {
		padding: 6px 8px;
		min-width: 32px;
		height: 32px;
		font-size: 13px;
	}
	
	.goto_page_wrapper .goto-input {
		width: 32px;
		height: 30px;
		font-size: 12px;
		background-color: #f8f9fa;
		
		&::placeholder {
			font-size: 12px;
		}
	}
}

</style>
