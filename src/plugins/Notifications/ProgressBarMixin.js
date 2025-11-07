import { events } from "./event";
import Bar from "./Bar";
import ProgressBarWrapper from './ProgressBarWrapper'
export default {
    components: {
        Bar,
        ProgressBarWrapper
    },
    data() {
        return {
            striped: true,
            ProcessProgressData: {},
            max: 100,
        };
    },
    methods: {

    },
    mounted() {
        if (!document) return;
        events.$on("showProcessStatus", this.$refs.progressModal.initProgressBar);
        events.$on("close-showProcessStatus", this.$refs.progressModal.closeProgessBar);
    },
}