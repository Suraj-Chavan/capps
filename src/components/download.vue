<template>
    <div>
        <button class="btn btn-secondary" title="Export to CSV" @click="fetch()">
            <i class="fa fa-download" style="font-size:14px"></i>
        </button>
    </div>
</template>
<script>
import formUtils from '@/utils/var/formUtil';
export default {
    props: ['filters', 'modules'],
    data() {
        return {

        }
    },
    watch: {
        filters() {

        },
        modules() {

        }

    },
    mounted() {
        //        formUtils.eventBus.$on('ExportToCsv',(response) => {
        //         this.fetch(response);
        // })
    },
    methods: {
        //         filters: {}
        // _module: deallisting
        fetch() {
            formUtils.axiosPost("IDEAL/REST/download/create", {

                'filters': JSON.stringify(
                    {
                        // "asondate":config.VAR_DATE, 
                        // "VAR_METHOD": config.VAR_METHOD,
                        // "DEFAULT_HOLDING" : config.HORIZON,
                        // "LOOP_BACK_PERIOD": config.LOOP_BACK_PERIOD,
                        // "RETURNS_METHOD": config.RETURNS_METHOD,
                        // "DEFAULT_CF" : config.PROBABILITY,
                        // "RETURNS_TYPE":config.RETURNS_TYPE
                    }

                ),
                '_module': 'deallisting'

            }).then(response => {

            })
        }
    }

}
</script>
<style lang="scss" scoped>
.btn-secondary {
    width: 35px;
    height: 35px;
    line-height: 39px;
    margin-top: 6px;
    border-width: 0px;
    color: white;
    /* font-size: 8px; */
    border-radius: 100%;
    background-color: #EF5350;
}
</style>