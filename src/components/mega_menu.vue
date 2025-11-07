<template>
	<b-nav-item-dropdown no-caret class="megamenu">
		<template #button-content>
			<b-icon-grid3x3-gap-fill class="icon d-none d-lg-inline" />
			<span class="d-inline-block d-lg-none">Masters</span>
		</template>

		<b-dropdown-item
			style="background: url('img/finance.webp') no-repeat 50% / cover"
		>
		</b-dropdown-item>
		<b-dropdown-item
			v-for="(item, index) in menuList"
			:key="index"
			target="_blank"
			rel="opener"
			:href="'/' + item.APP_PAGE"
		>
			<div class="mm-icon-block">
				<div class="mm-icon" :class="'mm-' + item.CLS_ICON">
					<span class="path1"> </span>
					<span class="path2"> </span>
				</div>
			</div>
			<h6 class="wrap-text">{{ item.APP_NAME }}</h6>
			{{ item.name }}
		</b-dropdown-item>
	</b-nav-item-dropdown>
</template>
<script>
export default {
	props: {
		menuList: {
			type: [Array, String],
			default: "",
		},
	},
};
</script>
<style lang="scss">
.nav-item.megamenu {
	position: static;
	.dropdown-menu {
		margin: 0;
		padding: 0;
		background: var(--blue-dark);
		border: 0;
		box-shadow: 0 0 20px 0 rgb(0 0 0 / 10%);
		border-radius: 2px;
		max-height: calc(100vh - 40px);
		text-align: center;

		overflow: hidden;
		overflow-y: auto;

		&::-webkit-scrollbar {
			width: 2px;
			height: 5px;
		}
		&::-webkit-scrollbar-track {
			border-radius: 50px;
			background: #fff;
		}
		&::-webkit-scrollbar-thumb {
			border-radius: 50px;
			background: var(--blue-dark);
		}
		&::-webkit-scrollbar-thumb:window-inactive {
			border-radius: 20px;
			background: #eee;
		}

		&.show {
			display: flex;
			flex-wrap: wrap;
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(14%, 1fr));
			width: 100%;
		}
		.mm-icon-block {
			height: 80px;
			margin: 0 0 20px 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
		}
		.mm-icon {
			font-size: 50px;
			display: block;
		}

		.dropdown-item {
			position: relative;
			padding: 0;
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			color: #fff;
			&:hover {
				background-color: var(--yellow);
			}
		}
		li {
			height: 150px;
			display: flex;
		}
		li:nth-child(even) {
			background: rgba(0, 0, 0, 0.1);
		}
		li:nth-child(odd) {
			background: rgba(0, 0, 0, 0.3);
		}
	}
}
.wrap-text {
	white-space: normal;
}
</style>
