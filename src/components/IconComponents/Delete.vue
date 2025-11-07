<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		:width="setWidth"
		:height="setHeight"
		viewBox="0 0 16 16"
		fill="none"
	>
		<path
			d="M9.6001 7.2V12"
			:stroke="setBackground"
			stroke-width="1.2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M6.3999 7.2V12"
			:stroke="setBackground"
			stroke-width="1.2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M3.2002 4V13.6C3.2002 14.4837 3.91654 15.2 4.80019 15.2H11.2002C12.0839 15.2 12.8002 14.4837 12.8002 13.6V4"
			:stroke="setBackground"
			stroke-width="1.2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M1.6001 4H14.4001"
			:stroke="setBackground"
			stroke-width="1.2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M4 4L5.6 0.800003H10.4L12 4"
			:stroke="setBackground"
			stroke-width="1.2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</template>

<script>
export default {
	name: "Delete",
    props:{
        setWidth:{
            type:String,
            default:"16"
        },
        setHeight:{
            type:String,
            default:"16"
        },
        setBackground:{
            type:String,
            default:"#335474"
        }
    }
};
</script>

<style></style>
