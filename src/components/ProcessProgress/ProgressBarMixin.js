import { events } from "./event";
import Bar from "./Bar";
import ProgressBarWrapper from './ProgressBarWrapper'
export default {
    props: {
        ProcessProgressData: {
            type: Object,
        }
    },
    components: {
        Bar,
        ProgressBarWrapper
    },
    data() {
        return {
            striped: true,
            max: 100,
        };
    },

    methods: {
        initiateListeners({
            initProgressBar,
            closeProgessBar
        }) {
            events.$on("showProcessStatus", initProgressBar);
            events.$on("close-showProcessStatus", closeProgessBar);
        }
    }
}