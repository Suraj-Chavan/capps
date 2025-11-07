<template>
    <div id="app-layout1">
        <HeaderBar v-bind="$props" v-show="shouldHeaderBarShow"/>
        <div id="app-empty-container"></div>
        <div id="main-router-view-wrapper">
            <module-block v-bind="$props"></module-block>
        </div>
    </div>
</template>

<script>
import HeaderBar from "@/components/HeaderBar";
import ModuleBlock from "@/modules/CAPPS/Block/ModuleBlock.vue"
export default {
    name: "AppLayout1",
    props: {
        moduleName: {
            type: String,
            required: true
        }
    },
    components: {
        HeaderBar,
        ModuleBlock
    },
    computed: {
        shouldHeaderBarShow() {
            if(window.self !== window.top) return false;
            return true
        }
    }
}
</script>


<style lang="scss" scoped>
#app-empty-container {
    position: fixed;
    width: 100%;
    z-index: 2;
    top: 352px;
    left: 16px;
    z-index: 999999999;

    ::v-deep .arrow {
        display: none;
    }
}
</style>