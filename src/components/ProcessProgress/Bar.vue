<template>
	<div>
		<span class="pr-5">
			<b :title="process" class="text-primary text-truncate d-inline-block"  style="max-width:100%" >{{ process | capitalize }}</b> 
			<span v-if="data.file_id" :title="data.file_id" class="text-truncate d-inline-block"  style="max-width:100%">
				: #{{ data.file_id }}
			</span>
		</span>

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
		<b-progress 
			v-else 
			:max="max" 
			:animated="animated" 
			:striped="striped" 
			:value="totalPerc" 
			variant="success"
		></b-progress>
		<div class="" style="display: flex; gap: 8px; justify-content: space-between;">
			<div>
				<small v-if="data.formattedStartDate" class="text-muted">{{ data.formattedStartDate }}</small>
			</div>
			<div>
				<a class="text-info" v-if="data.enddate" href='javascript:void(0);' @click="viewLog">View Log</a> 
				<span class="px-2"  v-if="data.file_exceptions">|</span>
				<a class="text-danger" v-if="data.file_exceptions" href='javascript:void(0);' @click="viewFileException">View Exceptions</a>
			</div>
		</div>
	</div>
</template>

<script>
import { interpolate } from "../../Framework/utility/utility.js";
import { VIEW_LOG_BASE_PATH, VIEW_EXCEPTION_LOG_BASE_PATH } from "../../Framework/constants/basePaths.js";
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
			return this.processName ? this.processName : "Loading ...";
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
		viewLog() {
			let { moduleName, app_name, filter, version } = this.data;
			if(version === "2.0") {
				if(typeof filter === "string") filter = new Function("return " + filter)();
				const basePath = interpolate(VIEW_LOG_BASE_PATH, { moduleName: app_name || moduleName, recordId: filter.PARENT_ID });
				window.open(basePath, "_blank");
				return;
			}
			window.open("/Framewrk/ProcessLog.jsp?processid="+this.processName+"&sessionid="+sessionStorage.getItem("_ticket")+"","_blank");
		},
		viewFileException() {
			let { moduleName, app_name, file_id } = this.data;
			const basePath = interpolate(VIEW_EXCEPTION_LOG_BASE_PATH, { moduleName: app_name || moduleName, recordId: file_id });
			window.open(basePath, "_blank");
			return;
		},
		showProcessProgress(data) {
			if (!data.total_no_of_subprocess) return;
			this.total_no_of_subprocess = data.total_no_of_subprocess;
			let processPerc = (1 / data.total_no_of_subprocess) * 100;
			// let SPComp = (data.subprocess_completed / data.total_no_of_subprocess) * 100;
			let successPerc = 0,
				errorPerc = 0,
				totalPerc = 0;
			if (
				// data.subprocess_completed != data.total_no_of_subprocess &&
				data.total != 0
			) {
				successPerc =
					data.success != 0 ? (data.success / data.total) * processPerc : 0;
				errorPerc = data.errors != 0 ? (data.errors / data.total) * processPerc : 0;
			}
			totalPerc = /* SPComp + */ successPerc + errorPerc;
			data.percent = totalPerc;
			this.subprocessValue = [successPerc, errorPerc];
			this.processName = data.process_name != null ? data.process_name : data.id;
			this.successCount = ""+data.success;
			this.errorCount = ""+data.errors;
			this.totalPerc = totalPerc;
		},
	},
};
</script>