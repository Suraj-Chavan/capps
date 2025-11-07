<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		:width="setwidth"
		:height="setheight"
		viewBox="0 0 20 20"
		fill="none"
	>
		<circle
			cx="10"
			cy="9.99994"
			r="9"
			:stroke="fillcolor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="10"
			y="14"
			width="0.01"
			height="0.01"
			:stroke="fillcolor"
			stroke-width="2.25"
			stroke-linejoin="round"
		/>
		<path
			d="M8.58579 5.58572C8.97541 5.1961 9.4858 5.00083 9.99647 4.99994C10.5095 4.99904 11.0228 5.1943 11.4142 5.58572C11.8047 5.97625 12 6.48809 12 6.99994C12 7.51178 11.8047 8.02363 11.4142 8.41415C11.0228 8.80557 10.5095 9.00083 9.99647 8.99993L10 9.99994"
			:stroke="fillcolor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</template>

<script>
export default {
	name: "MarkAsIncomplete",
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
