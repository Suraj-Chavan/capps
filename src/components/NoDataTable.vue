<template>
    <b-card 
        class="no-data-module text-center">
        <div class="position-fixed image-wrapper">
            <div class="image-container">
                <NoDataSVG />
            </div>
            <div class="mb-5 ">
                <slot name="msg"></slot>
            </div>
        </div>
    </b-card>
</template>
<script>
import NoData from "./IconComponents/NoData.vue"

export default {
    props:['msg','imgHeigth'],
    data:()=>({

    }),
    components: {
        NoDataSVG : NoData
    }
}
</script>

<style lang="scss" scoped>
.no-data-module {
    box-shadow: none;
    .image-wrapper {
        left: -50%;
        right: -50%;
        top: 53%;
        .image-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14.4px;
            img {
                width: 85.632px;
                height: 75.648px;
                flex-shrink: 0;
            }
        }
    }
}
</style>