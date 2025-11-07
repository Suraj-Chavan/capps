<template>
	<div>
		<b class="pr-5">{{ process | capitalize }}</b>

		<b-progress v-if="total_no_of_subprocess == 1" :max="max" :animated="animated" :striped="striped">
			<b-progress-bar
				:value="subprocessValue[0]"
				variant="success"
				:label="successCount"
			>
			</b-progress-bar>
			<b-progress-bar
				:value="subprocessValue[1]"
				variant="danger"
				:label="errorCount"
			>
			<!-- :label="successCount":label="errorCount" -->
			</b-progress-bar>
		</b-progress>
		<b-progress v-else :max="max" :animated="animated" :striped="striped" :value="totalPerc" variant="success">
		</b-progress>
		<div class="text-right">
			<a v-if="data.enddate" href='javascript:void(0);' @click="viewLog">View Log</a>
		</div>
	</div>
</template>

<script>
export default {
	name: "bar",
	props: {
		max: {
			type: Number,
			default: 100,
		},
		data: {
			type: Object,
			default: function () {
				return {};
			},
		},
	},
	data() {
		return {
			subprocessValue: [],
			processName: "",
			striped: true,
			animated: true,
			errorCount: "0",
			successCount: "0",
			totalPerc: 0,
			total_no_of_subprocess:0
		};
	},
	computed: {
		process() {
			return this.processName ? this.processName.split("_")[0] : "Loading ...";
		},
	},
	watch: {
		data: {
			handler(newVal) {
				this.showProcessProgress(newVal);
			},
			deep: true,
			immediate: true,
		},
		totalPerc:{
			handler(newVal){
				if (Math.round(parseFloat(newVal)) == 100) {
					this.animated = this.striped = false;
					this.$emit("completedprocess", this.processName);
				}
			},
			immediate: true
		}
	},
	methods: {
		viewLog(){
			window.open("/Framewrk/ProcessLog.jsp?processid="+this.processName+"&sessionid="+sessionStorage.getItem("_ticket")+"","_blank");
		},
		showProcessProgress(data) {
			if (!data.total_no_of_subprocess) return;
			this.total_no_of_subprocess = data.total_no_of_subprocess;
			let webnotification = true;
			let processPerc = (1 / data.total_no_of_subprocess) * 100;
			let SPComp = (data.subprocess_completed / data.total_no_of_subprocess) * 100;
			let successPerc = 0,
				errorPerc = 0,
				totalPerc = 0;
			if (
				data.subprocess_completed != data.total_no_of_subprocess &&
				data.total != 0
			) {
				successPerc =
					data.success != 0 ? (data.success / data.total) * processPerc : 0;
				errorPerc = data.errors != 0 ? (data.errors / data.total) * processPerc : 0;
			}
			totalPerc = SPComp + successPerc + errorPerc;
			data.percent = totalPerc;
			this.subprocessValue = [successPerc, errorPerc];

			this.processName = data.id;

			this.successCount = ""+data.success;
			this.errorCount = ""+data.errors;

			this.totalPerc = totalPerc;
		},
	},
};
</script>