<template>
	<section>
		<section class="card-table"> <!-- v-show="isBusy || localItems.length" -->
			<div class="card">
				<div 
					class="card-body p-0 table-first-row" 
					style="position: relative" 
					v-shadow-on-scroll
				>
					<b-table 
						v-bind="props"
						v-on="inputListeners"
						striped 
						sm
						borderless 
						:items="items" 
						:fields="tableFields"
						ref="selectableTable"
						:sort-icon-left="false"
						:sort-by.sync="sortBy"
            			:sort-desc.sync="sortDesc"
						thead-class="thead-dark"
						hover
						sticky-header
						head-variant="dark"
						responsive="sm"
						class="mb-0"
						show-empty
						:no-provider-sorting="true"
						:no-provider-filtering="false"
						id="table___view"
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

						<template
							v-for="(field, idx) in tableFields"
							v-slot:[`cell(${field.key})`]="data"
						>
							<div
								:style="{
									width: field.width === 'auto' ? 'max-content' : `${field.width + 5}px`
								}"
								:key="idx + field.key"
								class="td__content" 
								v-overflow-ellipsis
							>
								<slot :name="field.key" v-bind="data.item" :v-html="data.item">
									<span
										:title="data.value"
										v-b-tooltip.hover="{ variant: 'secondary' }" 
										:keyq="idx + field.key"
										class="cursor-pointer d-inline-block w-100"
										v-html="data.value"
									></span>
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
								<slot :name="`cell(action)`" :record="data" ></slot>
							</div>
						</template>
					</b-table>
				</div>
			</div>
		</section>
	</section>
</template>
<script>
import shadowOnScroll from '@/components/DataVisualisation/TableView/shadowOnScroll.js';
import overflowEllipsis from "@/components/DataVisualisation/TableView/overflow-ellipsis.js";

export default {
	props: [
		"items",
		"columns",
		"handlers",
		"tbodyTrAttr"
	],
	data() {
		return {
			sortBy: "",
			sortDesc: ""
		}
	},
	directives: { shadowOnScroll, overflowEllipsis },
	computed: {
		tableFields() {
			const TABLE_FIELDS = [
			 ...[
					(
						this.props.noActionAllowed ?
						{} : 
						{ 
							key: 'action', 
							label: ' ', 
							width: 100,
							stickyColumn: true 
						}
					),
					...this.columns,
				]
			];
			const LAST_FIELD = TABLE_FIELDS[TABLE_FIELDS.length - 1];
			LAST_FIELD.width = undefined;
			return TABLE_FIELDS;
		},
		props() {
			return Object.assign(
				{},
				this.$attrs,
				this.$props
			);
	  	},
		inputListeners: function () {
			return Object.assign({}, this.$listeners);
		},
	},
	methods: {
		editRecord(record) {
			this.$emit("edit:record", record);
		},
		deleteRecord(record) {
			this.$emit("delete:record", record);
		}
	},
};
</script>

<style lang="scss" scoped>
section {
	section.card-table {
		padding: 0!important;
		::v-deep { 
			.b-table-sticky-header {
				min-height: auto;
			}
			.table {
				tr {
					th.text-right {
						padding: 3px 10px;
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
</style>