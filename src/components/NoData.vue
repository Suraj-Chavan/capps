<template>
    <b-card class="border-0 mt-3 mb-3 text-center" >
       <!-- <img src="@/assets/img/animate_css-i.svg" alt="No Data Found" :height="imgHeigth?imgHeigth:200" /> -->
       <img src="@/assets/img/EmptyState.svg" alt="No Data Found" height="100" />
        <!-- <NoDataSVG /> -->
       <div class="mb-5">
        <h6 class="text-primary">{{ msg || "No Data Available" }}</h6>
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