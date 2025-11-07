<template>
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="19.9999" r="18" stroke="#FF0000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="20" y="28" width="0.02" height="0.02" stroke="#FF0000" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M20 20L20 12" stroke="#FF0000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</template>

<script>
    export default {
        name: "Note",
        props: {
            fill: {
                type: String,
                default: "#000000",
            },
        },
    };
</script>