<template>
	<svg
		:width="setWidth"
		:height="setHeight"
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g clip-path="url(#clip0_291_1076)">
			<path
				d="M1.48558 2.18283L17.0497 4.26501L4.61187 13.8503L5.30197 8.06413C5.35349 7.63221 5.23688 7.19703 4.97631 6.84874L1.48558 2.18283Z"
				:stroke="setBackground"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M12.5 13.5L14.1667 15.1667M14.1667 15.1667L15.8333 13.5M14.1667 15.1667V10"
				:stroke="setBackground"
				stroke-width="1.27"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M10.5 17.4679L17.5 17.4679"
				:stroke="setBackground"
				stroke-width="1.27"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</g>
		<defs>
			<clipPath id="clip0_291_1076">
				<rect :width="setWidth" :height="setHeight" fill="white" />
			</clipPath>
		</defs>
	</svg>
</template>

<script>
export default {
	name: "DownloadCreationUnit",
	props: {
		setBackground: {
			type: String,
			default: "#335474",
		},
		setHeight: {
			type: String,
			default: "20",
		},
		setWidth: {
			type: String,
			default: "20",
		},
	},
};
</script>

<style></style>
