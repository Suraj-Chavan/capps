<template>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="Icon Frame">
    <circle id="Ellipse 14" cx="9.99994" cy="10" r="9" :stroke="stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="Vector" d="M6.99994 10L9.99994 13M9.99994 13L12.9999 10M9.99994 13L9.99994 7" :stroke="stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    </svg>
</template>
<script>
export default {
    name: "Download",
    props: {
        stroke: {
            type:  String,
            default: "#335474"
        }
    }
}
</script>