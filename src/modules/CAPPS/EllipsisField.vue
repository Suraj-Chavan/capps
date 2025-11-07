<template>
    <div 
        class="overflow-ellipsis"  
        v-b-tooltip.hover="{ variant: 'danger' }" 
        :title="item[objKey]"
    > {{ item[objKey] }} </div>
</template>

<script>
export default {
    name: "ellipsis-field",
    props: {
        item: {
            required: true
        },
        objKey: {
            type: String
        }
    }
}
</script>

<style scoped lang="scss">
.overflow-ellipsis {
    width: 13em;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}
</style>