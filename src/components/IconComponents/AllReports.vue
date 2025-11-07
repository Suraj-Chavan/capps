<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		:width="setwidth"
		:height="setheight"
		viewBox="0 0 20 20"
		fill="none"
	>
		<path
			d="M5 19C3.89543 19 3 18.1046 3 17V1H12L17 6V17C17 18.1046 16.1046 19 15 19H5Z"
			:stroke="fillcolor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M11 1V7H17"
			:stroke="fillcolor"
			stroke-width="1.5"
			stroke-linejoin="round"
		/>
		<path
			d="M7 11H13"
			:stroke="fillcolor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M7 15H13"
			:stroke="fillcolor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</template>

<script>
export default {
	name: "AllReports",
    props: {
		fillcolor :{
			type:String,
			default: "#335474"
		},
		setwidth:{
			type:String,
			default:"20"
		},
		setheight:{
			type:String,
			default:"20"
		}
	}
};
</script>

<style></style>
