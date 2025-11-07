<template>
	<b-table
		thead-class="thead-light text-uppercase"
		striped
		sm
		:sticky-header="!!stickyHeader ? stickyHeader : true"
		borderless
		head-variant="light"
		responsive
		:items="items"
		:fields="[
			isAction == false ? '' : { key: 'action', label: '' },
			isRadio == false ? '' : 'IS_DEFAULT',
			...fields,
		]"
	>
		<template v-slot:cell(action)="data">
			<b-btn size="sm" variant="link p-0" @click="deleteRow(data)"
				><b-icon-trash
			/></b-btn>
		</template>
		<template v-slot:cell(IS_DEFAULT)="data">
			<!-- <input @change="radioSelectRow" :name="`${radio_IS_DEFAULT}_${data.index}`" v-model="checkedItem" type="checkbox" class="mt-2 mr-3" :value="data.item" :checked="data.item.IS_DEFAULT=='Y' ? true : false" /> -->
			<input
				type="radio"
				:name="`${dataref}_drone${data.index}`"
				:value="data.item"
				@change="radioSelectRow(data.item)"
				:checked="data.item.IS_DEFAULT == '1' ? 'checked' : ''"
				style="margin-top: 4px"
			/>
		</template>
	</b-table>
</template>
<script>
export default {
	props: [
		"items",
		"isAction",
		"isRadio",
		"stickyHeader",
		"validateDelete",
		"validateMsg",
		"dataref",
		"locale",
		"columns",
	],
	data: () => ({}),
	computed: {
		fields() {
			return this.$_getFieldData(
				this.columns || Object.keys(this.items[0]),
				this.locale
			);
		},
	},
	methods: {
		deleteRow(data) {
			if (this.validateDelete) {
				this.$emit("deleteRow", {
					arr: this.items,
					index: data.index,
					msg: !!this.validateMsg ? this.validateMsg : "validate",
				});
			} else {
				this.$emit("deleteRow", { arr: this.items, index: data.index });
			}
		},
		radioSelectRow(item) {
			this.$emit("radioSelectRow", { item: item, dataref: this.dataref });
		},
	},
};
</script>

<style lang="scss" scoped>
	
</style>