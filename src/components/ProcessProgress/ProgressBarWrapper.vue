<template>
	<div class="porgress--bar">
		<b-modal id="process-bar-a" :title="process | capitalize" centered>
			<div class="process-progres-detail">
				<span id="sp_prg_total_cnt_desc" class="subprocess-progres-detail">{{
					sp_prg_total_cnt_desc
				}}</span>
				&nbsp;&nbsp;&nbsp;
				<span id="sp_prg_total_count" class="subprocess-progres-detail">{{
					sp_prg_total_count
				}}</span>
			</div>
			<bar :data="item" />
			<template #modal-footer>
				<b-button variant="success" @click="hide"> Ok </b-button>
			</template>
		</b-modal>
	</div>
</template>


<script>
import Bar from "./Bar";
let ProcessName = "";
export default {
	name: "progress-bar",
	components: {
		Bar,
	},
	props: {
		ProcessProgressData: {
			type: Object,
		},
	},
	computed: {
		process() {
			return this.processName ? this.processName.split("_")[0] : "Loading ...";
		},
	},
	data() {
		return {
			sp_prg_total_cnt_desc: "Fetching record count :",
			sp_prg_total_count: null,
			sp_progress_elapsed_time: 0,
			enddate: true,
			processName: "",
			item: {},
		};
	},
	watch: {
		ProcessProgressData: {
			handler(newVal) {
				this.processName = this.processName || ProcessName;
				if(newVal[this.processName]) this.setProgressData(this.processName)
			},
			immediate: true,
			deep: true
		},
	},
	methods: {
		close() {
			setTimeout(this.closeProgessBar, 3000);
		},
		setProgressData(processName) {
			const FILTERED_DATA_BY_PROCESS_ID = this.ProcessProgressData[processName];
			this.sp_prg_total_cnt_desc = "Total process : ";
			this.sp_prg_total_count = ((FILTERED_DATA_BY_PROCESS_ID || {})).total || 0;
			this.$set(this, "item", (FILTERED_DATA_BY_PROCESS_ID || {}));
		},
		initProgressBar({ processName }) {
			ProcessName = processName;
			this.$set(this, "processName", processName);
			this.show();
		},
		closeProgessBar() {
			this.hide();
		},
		hide() {
			this.$bvModal.hide("process-bar-a");
		},
		show() {
			this.$bvModal.show("process-bar-a");
		},
	},
	mounted() {
		this.$emit("initiated", {
			initProgressBar: this.initProgressBar,
			closeProgessBar: this.closeProgessBar
		})
	}
};
</script>