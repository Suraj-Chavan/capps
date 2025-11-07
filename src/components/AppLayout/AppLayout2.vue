<template>
    <div id="app-layout2">
        <HeaderBar v-bind="$props" v-show="shouldHeaderBarShow" :key="moduleName"/>
        <div id="app-empty-container"></div>
        <div id="main-router-view-wrapper">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import HeaderBar from "@/components/HeaderBar";

export default {
    name: "AppLayout2",
    props: {
		moduleName: {
			type: String,
			required: true,
		},
	},
    components: {
        HeaderBar,
    },
    computed: {
        shouldHeaderBarShow() {
            if(window.self !== window.top) return false;
            return true
        }
    },
    watch: {
        moduleName: {
            immediate: true,
            handler(moduleName) {
                document.title = moduleName || "capps";
            }
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