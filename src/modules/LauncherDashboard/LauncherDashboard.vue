<template>
	<div class="launcher-dashboard scroll-y">
		<b-container fluid>
			<b-row>
				<b-col
					:class="{
						'col-md-1': isSidebarCollapsed,
						'col-md-2 dashboard-not-collapsed': !isSidebarCollapsed,
						'dashboard-collapsed': isSidebarCollapsed,
					}"
					class="m-0 p-0 side-bar-column"
				>
					<div :class="{ sidebar: true, collapsed: isSidebarCollapsed, not_collapsed: !isSidebarCollapsed }">
						<div v-show="!isSidebarCollapsed">
							<side-panel
								ref="side_panel"
								@side-panel-toggle="toggleSidebar"
								@dashboard-changed="onDashboardChange"
								:starred-dashboards="starredDashboards"
								:all-dashboards="allDashboards"
								v-model="selectedDashboard"
							>
							</side-panel>
						</div>

						<div class="sidebar-toggler" @click="toggleSidebar">
							<span>
								<b-icon icon="chevron-right"  variant="light" v-if="isSidebarCollapsed"></b-icon>
								<b-icon icon="chevron-left"  variant="light" v-else></b-icon>
							</span>
						</div>
					</div>
				</b-col>
				<b-col
					:class="{
						'col-md-11': isSidebarCollapsed,
						'col-md-10 dashboard-not-collapsed': !isSidebarCollapsed,
						'dashboard-collapsed': isSidebarCollapsed,
					}"
					class="m-0 p-0 right-preview-panel"
				>
					<router-view
						@on:preview:mount="onPreviewUiMount"
					></router-view>
				</b-col>
			</b-row>
		</b-container>
	</div>
</template>

<script>
import DashboardPreview from "./DashboardPreview.vue";
import SidePanel from "./SidePanel.vue";
import { hasOwn } from "@credenceanalytics/utilities";
import { APP_NAME } from "@/constant.js";
import { mapState } from "vuex";
import { LAUNCHER_ROUTE } from "../../router/capps.layout.route";


export default {
	name: "launcher-dashboard",
	components: {
		SidePanel,
		DashboardPreview,
	},
	data() {
		return {
			isSidebarCollapsed: true,
			selectedDashboard: {},
			allDashboards: [],
			loadingDashboards: true,
			dashboardParamChanged: false,
		};
	},
	computed: {
		...mapState("AppSettingsLoad", ["APP_SETTINGS"]),
		favoriteCards() {
			return (this.APP_SETTINGS[APP_NAME] || {}).fav || {};
		},
		starredDashboards() {
			const FAVORITE_CARDS = this.favoriteCards;
			return this.allDashboards.filter((item) => {
				return hasOwn(FAVORITE_CARDS, item.PAGEID);
			});
		},
	},
	watch: {
		"$route.params.dashboardId": {
			immediate: true,
			handler(newValue) {
				if(!newValue) this.selectFirstDashboard();
			}
		}
	},
	methods: {
		dashboardLoadPromise() {
			const _this = this;
			return new Promise((resolve) => {
				if (!_this.loadingDashboards) return resolve(_this.loadingDashboards);
				let interval = setInterval(() => {
					if (!_this.loadingDashboards) {
						clearInterval(interval);
						resolve(_this.loadingDashboards);
					}
				}, 100); // Check every 100 milliseconds
			});
		},
		onPreviewUiMount(selectedDashboard = {}) {
			if(selectedDashboard.dashboardId) {
				this.selectedDashboard = {
					PAGEID: selectedDashboard.dashboardId
				};
				return;
			};
		},
		toggleSidebar() {
			this.isSidebarCollapsed = !this.isSidebarCollapsed;
		},
		onDashboardChange(selectedDashboard) {
			this.$router.push(`${LAUNCHER_ROUTE}/${selectedDashboard.dashboardId}`);
			this.toggleSidebar();
		},
		async selectFirstDashboard() {
			await this.dashboardLoadPromise();
			if (!this.starredDashboards.length && !this.allDashboards.length) return;
			const FIRST_DASHBOARD = this.starredDashboards[0] || this.allDashboards[0];
			this.selectedDashboard = {
				PAGEID: FIRST_DASHBOARD.PAGEID,
			};
			this.$router.push(`${LAUNCHER_ROUTE}/${FIRST_DASHBOARD.PAGEID}`);
		},
		async loadTheDashboards() {
			this.loadingDashboards = true;
			const ALL_SYSTEM_DASHBOARDS = await capps.rest.pagebuilder.page.read({
				filter: [{ field: "IS_SYSTEM", value: "Y", asgn: "eq" }]
			});
			const ALL_LEGACY_DASHBOARDS = /* await capps.rest.legacy.workflow.dashboards.read({
				// filter: [{ field: "IS_SYSTEM", value: "Y", asgn: "eq" }]
			}) || */ [];

			this.allDashboards = [...ALL_SYSTEM_DASHBOARDS, ...ALL_LEGACY_DASHBOARDS];

			this.loadingDashboards = false;
		},
	},
	mounted() {
		this.loadTheDashboards();
	},
};
</script>

<style lang="scss" scoped>
$max-height: 91vh;
$container-color: rgb(252, 255, 255);

.launcher-dashboard {
	overflow: hidden;
	height: $max-height;
	max-height: $max-height;
	background-color: $container-color;

	.side-bar-column {
		transition: max-width 0.4s ease-in;
		z-index: 1070;
	}
	
	.right-preview-panel {
		transition: max-width 0.1s ease-in;
	}

	.dashboard-collapsed {
		&.col-md-1 {
			flex: 0 0 0%;
    		max-width: 0%;
			width: 0%;
			background: $container-color;
		}
		&.col-md-11 {
			flex: 0 0 100%;
			max-width: 100%;
		}
	}

	.dashboard-not-collapsed {
		&.col-md-10 {
			padding-left: 10px!important;
			flex: 0 0 83.333333%;
    		max-width: 83.333333%;
			background-color: $container-color;
		}
	}

	.sidebar {
		background-color: $container-color;
		height: $max-height;
		max-height: $max-height;
		padding: 10px;
		border: 1px solid #ced4da;
		margin-bottom: 20px;
		border-right: 1.9px solid #bcc2c88f;
		position: relative;

		&.collapsed {
			padding: 0%;
			width: 0%;
			height: $max-height;
		}

		.sidebar-toggler {
			cursor: pointer;
			position: absolute;
			background: #46464e;
			width: 16px;
			height: 44px;
			opacity: 123123123;
			z-index: 999999999;
			bottom: 0%;
			left: 100%;
			visibility: visible;
			border-radius: 0px 12px 12px 0px;
			display: flex;
			justify-content: center;
			flex-direction: column-reverse;

			span {
				color: #d5c8c8;
				font-size: 15px;
				font-weight: bold;

			}
		}

		&.collapsed {
			.sidebar-toggler {
				left: 0%;
				transition: padding 0.5s ease-in-out;
				border-radius: 0px 20px 20px 0px;

				&:hover {
					padding: 0 26px;
					align-items: center;
				}
			}
		}

		&.not_collapsed {
			.sidebar-toggler {
				transition: background-color 0.5s ease-in-out;
				align-items: center;
				padding: 10px;

				&:hover {
					background-color: rgb(174 172 208 / 36%);
					color: black;
					padding: 12px;

					::v-deep {
						.text-light {
							color: #1a0808 !important;
							font-weight: bolder;
						}
					}
				}
			}
		}
	}

	.search-icon-container {
		border: 0.5px solid #d0d1d5;
		border-radius: 50%;
		display: flex;
		background: #f6f7f6;
		width: 34px;
		height: 34px;
		flex-direction: column-reverse;
		justify-content: center;
	}

	.collapsed {
		position: relative;
		visibility: collapse!important;
	}

	.collapsed .b-list-group-item {
		display: flex;
		justify-content: center;
	}

	@media (max-width: 768px) {
		.sidebar,
		.collapsed {
			width: 100%;
			margin-bottom: 20px;
		}
	}
}
</style>