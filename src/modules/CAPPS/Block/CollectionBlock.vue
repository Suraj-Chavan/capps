<template>
    <div>
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: "ModuleComponent",
    props: {
        moduleName: {
            type: String,
            required: true
        },
        collection: {
            type: String,
            required: true
        },
    },
}
</script>