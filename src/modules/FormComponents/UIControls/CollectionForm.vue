<template>
	<ValidationObserver tag="div" ref="formObserver">
		<div class="m-2">
			<div
				v-for="(section, sectionIndex) in groupedSections"
				:key="sectionIndex"
				class="section"
			>
				<div v-for="(row, rowIndex) in section.rows" :key="rowIndex">
					<div v-if="row.sectionLabel && groupedSections.length > 1" class="section-title font-weight-bold">
						{{ row.sectionLabel }}
						<div class="section-title-underline"></div>
					</div>

					<div v-if="row.table_configurations">
						<component
							:is="childCollectionComponent"
							v-bind="row.table_configurations"
							v-on="childEventListeners"
							v-model="userFormData[row.table_configurations.key]"
							:parent-form-data="userFormData"
							:parent-collection="parentCollection"
							:action="action"
							:id="id"
							:ref="row.table_configurations.ref || row.table_configurations.key"
						></component>
					</div>

					<div class="form-group grid" :class="`grid--${ row.columns[0]?.grid_column_size || 4 }`" v-else>
						<form-element
							v-for="(column, columnIndex) in row.columns"
							:key="columnIndex"
							:item="{
								...column,
								name: column.key,
								label: column?.label,
							}"
							:locale="localeEl.fields"
							v-model="userFormData"
							:total-column-size="row.columns.length"
							:custom-validation="customValidation"
							:ref="'form_element_' + column.key"
							:label-direction="labelDirection"
						>
						</form-element>
					</div>
				</div>
			</div>
		</div>
		<div class="comment-section-wrapper">
			<slot name="comment-section"></slot>
		</div>
	</ValidationObserver>
</template>

<script>
import { DataEntryMixin } from "@/mixins/data-entry-mixin";
import FormElement from "./FormElement.vue";

export default {
	name: "collection-form",
	mixins: [DataEntryMixin],
	components: {
		FormElement
	},
	props: {
		value: {
			type: Object,
			required: true,
		},
		id: {
			type: [String, Number],
			default: null
		},
		parentCollection: {
			type: String
		},
		groupedSections: {
			type: Array,
		},
		localeEl: {
			type: Object,
			required: true,
		},
		childEventListeners: {
			type: Object,
			required: true,
		},
		customValidation: {
			type: Object
		},
		action: {
			type: String
		},
		labelDirection: {
			type: String,
			default: 'top-bottom'
		}
	},
	computed: {
		userFormData: {
			get() {
				return this.value;
			},
			set(value) {
				this.$emit("input", value);
			},
		},
		childCollectionComponent() {
			return () => ({
				// The component to load (should be a Promise)
				component: import(
					`@/modules/FormComponents/Collection/ChildCollection.vue`
				),
				// Delay before showing the loading component. Default: 200ms.
				delay: 200,
				// The error component will be displayed if a timeout is
				// provided and exceeded. Default: Infinity.
				timeout: 3000,
			});
		},
	},
	mounted() {
		this.$emit("collection:form:mounted", true);
	}
};
</script>

<style>
.section-title {
  font-size: 1.15rem;         /* heading थोडं मोठं */
  font-weight: 600;           /* bold */
  color: #22223b;             /* dark gray/black */
  margin-bottom: 0;
  position: relative;
}

.section-title-underline {
  width: 100%;
  height: 2.5px;
  background: #60a5fa;   /* blue-400 */
  border-radius: 2px;
  margin-top: 2px;
  margin-bottom: 18px;
  opacity: 0.7;
}
</style>