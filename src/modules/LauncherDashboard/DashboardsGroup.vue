<template>
	<b-list-group class="dashboards-group scroll-y mt-4">
		<b-list-group-item
			v-for="(item, idx) in dashboards"
			:key="item.PAGEID + '_' + idx"
			class="no-border cursor-pointer dashboard-item d-flex align-items-center"
			@click="setActiveDashboard(item)"
			:class="{ 'active-dashboard': item.PAGEID === activeDashboard.PAGEID }"
		>
			<span class=""> {{ item.PAGENAME || '-/-' }}</span>
			<slot name="actions" v-bind="item"></slot>
		</b-list-group-item>
	</b-list-group>
</template>

<script>
export default {
	props: {
		dashboards: {
			type: Array,
			default: () => [],
		},
		value: {
			type: Object,
		},
	},
	computed: {
		activeDashboard: {
			get() {
				return this.value;
			},
			set(value) {
				this.$emit("input", value);
			},
		},
	},
	methods: {
		setActiveDashboard(item) {
			this.activeDashboard = item;
		},
	},
};
</script>

<style lang="scss" scoped>
.dashboards-group {
	// max-height: 40vh;
	// min-height: 54vh;
	gap: 5px;
	.no-border {
		border: none !important;
		background-color: transparent;
	}

	.dashboard-item {
		border-radius: 5px;
		padding-left: 1.2rem !important;
		gap: 4px;
		&:hover {
			background-color: #eef5ff;
		}
		&.active-dashboard {
			background-color: #013576;
			border-radius: 5px;
			color: white;
		}
	}
}
</style>