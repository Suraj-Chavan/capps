<template>
	<div class="launcher_dashboard__content-container scroll-y">
		<div v-if="dashboardId" class="dashboard-result-container scroll-y">
			<page-display :page-id="dashboardId" :key="dashboardId"></page-display>
		</div>
		<div v-else>
			<b-alert show variant="info">No dashboard selected for preview</b-alert>
		</div>
	</div>
</template>

<script>
import { remoteApplicationDetails } from "config";
import getRemoteModule from "@/plugins/get-remote-module.js";

const { remoteApp2: REMOTE_APP2 } = remoteApplicationDetails;
const FEDERATED_MODULES = REMOTE_APP2.federatedModules;

export default {
	name: "dashboard-preview",
	props: {
		dashboardId: {
			type: [String, Number],
		},
	},
	components: {
		PageDisplay: () =>getRemoteModule({
			remoteAppName: REMOTE_APP2.appName,
			remoteURL: REMOTE_APP2.remoteURL,
			callback: (loadComponent) => {
				return loadComponent(FEDERATED_MODULES.PageDisplay);
			},
		}),
	},
	mounted() {
		this.$emit("on:preview:mount", this.$props);
	},
};
</script>

<style lang="scss" scoped>
$max-height: calc(100vh - 11vh);
$container-color: rgb(254 254 254);

.launcher_dashboard__content-container {
	height: $max-height;
	max-height: $max-height;
	padding: 0px;
	margin: 5px;
	background-color: $container-color;

	.favorite-icon-container {
		line-height: 1.3px;
		font-size: 20px;
	}

	.dashboard-result-container {
		background: white;
	}
}
</style>