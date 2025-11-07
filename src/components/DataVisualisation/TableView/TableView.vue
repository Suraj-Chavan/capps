<template>
	<section class="table-view-wrapper">

		<div class="capps_table_view__table">
			<section class="card-table" > <!-- v-show="isBusy || localItems.length" -->
				<div class="card">
					<div class="card-body p-0 table-first-row main-layout-table" style="position: relative" v-shadow-on-scroll>
						<div class="tool-container border border-primary shadow-lg" v-if="showTooltip" >
							<div class="container pl-4 pt-2 d-flex flex-column align-items-end">
								<div @click="outOfRow" style="float: right;" class="cursor-pointer text-danger">
									<b-icon-x-circle />
								</div>
								<div class="d-flex flex-wrap panel">
									<div
										class="item"
										v-for="(item, index) in Object.keys(singleRowData)"
										:key="index"
									>
										<label>{{ localeEl.fields[item] || item }}</label>
										<p>{{ singleRowData[item] || '-' }}</p>
									</div>
								</div>
							</div>
						</div>
						<b-table
							ref="selectableTable"
							:busy.sync="isBusy"
							:sort-icon-left="false"
							thead-class="thead-dark"
							striped
							hover
							sm
							borderless
							sticky-header
							head-variant="dark"
							responsive="sm"
							:items="myProvider"
							:fields="tableFields"
							:per-page="perPage" 
							:current-page="currentPageProp"
							class="mb-0"
							:sort-by.sync="sortBy"
							:sort-desc.sync="sortDesc"
							@sort-changed="onSortChanged"
							no-local-sorting
							show-empty
							:no-provider-sorting="false"
							:no-provider-filtering="false"
							id="table___view"
							selectable
							  @row-selected="onRowSelected"
							:tbody-tr-attr="tbodyTrAttr"
						>
							<template #table-colgroup="scope">
								<col
									v-for="(field) in scope.fields"
									:key="field.key"
									:style="{
										width: 'auto' === field.width ? 'max-content' : `${field.width}px`
									}"
								>
							</template>
							<!-- TD -->
							<template
								v-for="(field, idx) in tableFields"
								v-slot:[`cell(${field.key})`]="data"
							>
								<div 
									:style="{
										width: field.width === 'auto' ? 'max-content' : `${ field.width + 5 }px`
									}" 
									:key="idx + field.key" 
									class="td__content"
								>
									<slot :name="field.key" v-bind="data.item" :v-html="data.item">
										<span
											:title="data.value"
											v-b-tooltip.hover="{ variant: 'secondary' }"
											:keyq="idx + field.key"
											class="cursor-pointer d-inline-block w-100"
											v-html="data.value"
										></span>
										<!-- @click="expandAdditionalInfo(data.item)" -->
									</slot>
								</div>
							</template>
							<template v-slot:cell(action)="data">
								<div
									:style="{
										width: `max-content`
									}" 
									:keys="data.field.key" 
									class="td__content"
								>
									<span 
										class="btn-group" 
										v-if="isCheckbox"
									>
										<input-check-box
											v-model="checkedItemStateLocal['SR_NO_' + data.item.SR_NO]"
											@change="(value) => triggerTableRowSelect(value, data)"
										/>
									</span>
								</div>
								<component
									:is="Actions"
									:isAction="isAction"
									:item="data.item"
									:routePath="$route.path"
									:collection="collection"
									:referenceKey="referenceKey"
									:localeEl="localeEl"
									:showIcons="true"
									:showDots="showDots"
									:readApi="readApi"
									:customPayload="customPayload"
									:filter-setting="filterSetting"
									:moduleName="moduleName"
									@refresh:clicked="() => $emit('refresh:clicked')"
								>
								</component>
							</template>
							<template v-slot:cell(SR_NO)="data">
								<div 
									:style="{
										width: `max-content`
									}" 
									class="td__content" :keys="data.field.key"
								>
									<b><span class="btn-group d-inline-block w-100">{{  data.value }}</span></b>
								</div>
							</template>
							<template #table-busy >
								<div class="text-center text-danger my-2" style="width: 100vw">
									<b-spinner class="align-middle"></b-spinner>
									<strong class="ml-2">Loading...</strong>
								</div>
							</template>
							<template #empty>
								<no-data-table>
								</no-data-table>
							</template>
							<template #emptyfiltered>
								<no-data-table></no-data-table>
							</template>
						</b-table>
					</div>
				</div>
			</section>
		</div>

	</section>
</template>
<script>
import { ActionMixin } from "@/mixins/action-mixin";
import ViewPagination from "../Pagination/ViewPagination.vue";
import { Container, Draggable } from "vue-smooth-dnd";
import { applyDrag } from "./helpers";
import NoDataTable from "@/components/NoData.vue";
import { mapState, mapActions } from "vuex";
import InputCheckBox from './InputCheckBox.vue';
import shadowOnScroll from './shadowOnScroll.js';

export default {
	components: { ViewPagination, Container, Draggable, NoDataTable, InputCheckBox },

	directives: { shadowOnScroll },

	mixins: [ActionMixin],

	props: {
		fetchData: {
			type: Function,
			required: true,
		},
		fields: Array,
		collection: String,
		referenceKey: Array,
		localeEl: Object,
		isCheckbox: Boolean,
		isAction: Boolean,
		perPage: {
			type: Number,
			default: 10,
		},
		showSettings: {
			type: Boolean,
			default: true,
		},
		initialFetch: {
			type: Boolean,
			default: false,
		},
		showDots: {
			type: Boolean,
			default: false
		},
		moduleName: {
			type: String
		},
		sortByField: {
			type: String,
			default: ""
		},
		sortByOrder: {
			type: Boolean,
			default: false
		},
		tbodyTrAttr: {
			type: Function,
			default: () => ({})
		},
		readApi: {
            type: String
        },
        customPayload: {
            type: Object
        },
        moduleBasedActionCompPath: {
            type: String
        },
		currentPageProp: {
			type: Number,
			default: 1,
		},
        filterSetting: {
            type: Object
        }
	},

	data() {
		return {
			popoverShow: false,			
			isBusy: false,
			localItems: [],
			showTooltip: false,
			singleRowData: {},
			isRowHovered: false,
			clearTimeoutData: null,
			rowData: {},

			drag: false,
			dropPlaceholderOptions: {
				className: "drop-preview",
				animationDuration: "150",
				showOnTop: true,
			},
			computedFieldList: [],
			previousFields: null,
			checkedItemStateLocal: {}
		};
	},

	watch: {
		checkedItemState: {
			deep: true,
			handler(newVal, oldVal) {
				if(newVal && newVal != oldVal) {
					this.checkedItemStateLocal = Object.assign({}, new Function("return " + JSON.stringify({ ...newVal }))());
				}
			},
		},
		isRowHovered(newVal) {
			if (newVal) {
				this.showTooltip = true;
				this.singleRowData = Object.assign(this.rowData);
			}
		},
		fields: {
			handler(newVal) {
				if (newVal == null) this.computedFieldList = [];
				this.previousFields = new Function("return " + JSON.stringify([...newVal]))();
				this.computedFieldList = newVal;
			},
			immediate: true,
		},
	},

	computed: {
		...mapState("ChoseRecord", ["checkedItemState"]),
		sortBy: {
			get() {
				return this.sortByField;
			},
			set(field) {
				this.$emit("grid:sort:by", field)
			}
		},
		sortDesc: {
			get() {
				return this.sortByOrder;
			},
			set(order) {
				this.$emit("grid:sort:order", order);
			}
		},
		tableFields() {
			const TABLE_FIELDS = [
				...[	
					{
						label: " ",
						key: 'action',
						width: 50,
						stickyColumn: true
					},
					{
						stickyColumn: true,
						key: "SR_NO",
						label: "Sr No.",
						sortable: false,
						width: 100,
					},
					...this.computedFieldList,
				]
			];
			const LAST_FIELD = TABLE_FIELDS[TABLE_FIELDS.length - 1];
			LAST_FIELD.width = undefined;
			return TABLE_FIELDS;
		},
		rc_interval() {
			return ((this.localItems || [])[0] || {}).RC_INTERNAL;	
		},
	},

	mounted() {
		this.reset();
	},

	methods: {
		...mapActions("ChoseRecord", ["selectItem", "reset"]),
		triggerTableRowSelect(checkboxState, data) {
			if(!checkboxState) return this.unselectRow(data.index);
			this.selectRow(data.index);
		},
		setSelectedItem(checked, item) {
			this.selectItem({
				checked, 
				item,
				primaryKey: 'SR_NO_' + item.SR_NO,
			});
		},
		unselectRow(index) {
			this.$refs.selectableTable.unselectRow(index);
		},
		selectRow(index) {
			this.$refs.selectableTable.selectRow(index);
		},
		onRowSelected(items) {
			const _this = this;
			_this.reset();
			items.map(function (item) {
				_this.setSelectedItem(true, item);
			});
		},
		resetColumnOrder() {
			this.computedFieldList = this.previousFields;
			this.onClose();
		},
		saveTheOrder() {
			this.$emit("save:app:settings", {
				newFieldList: this.computedFieldList,
				previousFields: this.previousFields
			});
			this.onClose();
		},
		onClose() {
			this.popoverShow = false;
		},
		onDrop(dropResult) {
			this.drag = false;
			this.computedFieldList = applyDrag(this.computedFieldList, dropResult);
		},
		outOfRow() {
			this.showTooltip = false;
			this.isRowHovered = false;
			this.singleRowData = {};
			this.rowData = {};
		},
		expandAdditionalInfo(row) {
			let self = this;
			// clearTimeout(this.clearTimeoutData);
			// this.clearTimeoutData = setTimeout(() => {
				Object.keys(row).map((el_key) => {
					this.fields.map((el) => {
						if (el.key == el_key) {
							self.rowData[el.key] = row[el.key];
						}
					});
				});
				this.isRowHovered = true;
			// },500);
		},
		refreshData() {
			this.updateLocalData([]);
			// Current page is now controlled by parent, no need to set here
			this.$refs.selectableTable.refresh();
		},
		myProvider(ctx) {
			const _this = this;
			_this.isBusy = true;
			if(this.initialFetch) return Promise.resolve([]);
			let start = (parseInt(ctx.currentPage) - 1) * parseInt(ctx.perPage) + 1 - 1;
			return this.fetchData({
				start,
				limit: ctx.perPage,
				sortBy: ctx.sortBy, // Passing sort by column name
				sortDesc: ctx.sortDesc,
			})
				.then((response) => {
					_this.isBusy = false;
					const _local_data_ = _this.updateLocalData(response);

					const itemsOnPage = _local_data_.length;
					const totalItems = _this.rc_interval || 0;
					let firstRecordOnPage = 0;
					let lastRecordOnPage = 0;

					if (itemsOnPage > 0) {
						firstRecordOnPage = (ctx.currentPage - 1) * ctx.perPage + 1;
						lastRecordOnPage = firstRecordOnPage + itemsOnPage - 1;
					}
					
					// Emit data for parent to update pagination display
					_this.$emit('data-metrics-updated', { totalRows: totalItems, firstRecord: firstRecordOnPage, lastRecord: lastRecordOnPage });

					return _local_data_;
				})
				.catch((error) => {
					_this.isBusy = false;
					console.error(error);
					return _this.updateLocalData([]);
				});
		},
		onSortChanged(ctx) {
			this.updateLocalData([]);
			this.sortBy = ctx.sortBy; // Update sort key
			this.sortDesc = ctx.sortDesc; // Update sort order (true for descending, false for ascending)
			// Call the provider method to re-fetch sorted data from the server
      		this.$refs.selectableTable.refresh();
		},
		updateLocalData(records) {
			this.$set(this, "localItems", records || []);
			this.$emit("update:data:source", this.localItems);
			return this.localItems;
		},
		updateBusyState(bool) {
			this.isBusy = bool;
		},
		selectAllRows() {
			this.$refs.selectableTable.selectAllRows();
		},
		clearSelected() {
			this.$refs.selectableTable.clearSelected();
		},
	},
};
</script>
<style scoped lang='scss'>
.table-view-wrapper {
	display: flex;
	flex-direction: column;
	height: 100%; /* Ensure it takes full height from its parent grid cell in Main-Screen-Layout */
	overflow: hidden; /* Safeguard: Prevent this root from scrolling */
}

.capps_table_view__pagination_bar {
	flex-shrink: 0; /* Pagination bar should not shrink */
}

.capps_table_view__table {
	flex-grow: 1; /* This div should take up remaining vertical space */
	overflow: hidden; /* Explicitly prevent this div from showing scrollbars */
	display: flex; /* Allow its child (.card-table) to also fill height */
	flex-direction: column;
}

.card-table { /* Child of .capps_table_view__table */
	flex-grow: 1; /* Take available space from .capps_table_view__table */
	display: flex;
	flex-direction: column;

	.card { /* Child of .card-table */
		flex-grow: 1; /* Take available space from .card-table */
		display: flex;
		flex-direction: column;

		.card-body { /* Child of .card, has v-shadow-on-scroll which applies overflow: auto */
			flex-grow: 1; /* Take available space from .card */
			/* position: relative; is an inline style, kept for tooltip */
		}
	}
}
.cursor-pointer {
	cursor: pointer !important;
}
.flex--1 {
	flex: 1;
}
.field-list--container {
	min-height: 10vh;
	max-height: 80vh;
	overflow: hidden;
	overflow-y: scroll;
}

.card-table {
	.card {
		background-color: var(--white) !important;
		z-index: 1;
		.card-body {
			.tool-container {
					position: absolute;
				top: 0%;
				left: 13%;
				background: rgb(255, 255, 255);
				border: 1px solid rgb(204, 204, 204);
				border-radius: 4px;
				z-index: 100;
				display: block;
				.container {
					z-index: 5;
					.flex-wrap {
						.item {
							width: 122px;
								padding-bottom: 12px;
							label {
								text-overflow: ellipsis !important;
								overflow: hidden !important;
								border: 0 !important;
								font-size: 8px;
								text-transform: uppercase;
								font-weight: 700;
								margin-bottom: 0px;
											color: #070f63;
								white-space: nowrap;
							}
							p {
								margin-top: -5px;
								font-size: 10px;
								color: gray;
								font-weight: 600;
								margin-bottom: 0px;
								width: 122px;
								word-break: normal;
											}
										}
									}
								}
							}

							::v-deep {

				.table {
					tr {
						th.text-right {
							padding: 3px 8px;
							& > div {
								float: right;
								}
							}
							
							th, td {
							margin: 0 0.99px;
							border-right: 0.1px outset #0000000d;
						}
					}
				}
			}
		}
	}
}

::v-deep {
	.b-table-empty-row___ {
		background: none!important;
		border-bottom: none!important;
	}

}

.pagination-bar{
	border-bottom: 1px solid var(--border-color) !important;
	background-color: var(--white);
	padding-left:1rem;
	padding-right:1rem;
	vertical-align: middle;
    align-items: center;
}
</style>
