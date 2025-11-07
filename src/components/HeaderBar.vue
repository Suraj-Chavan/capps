<template>
	<div style="position: sticky; top: 0; z-index: 9">
		<section class="header">
			<b-navbar toggleable="xl" type="dark">
				<header-bar
					id="header-bar"
					class="header"
					:componentsProps="componentsProps"
					:container-style="myStyles" 
					:left-container-style="leftContainerStyle" 
					:middle-container-style="middleContainerStyle" 
					:right-container-style="rightContainerStyle"
					ref="headerBar"
				>
					<template #navigation-section> 
						<div class="header_bar__menu_bar">
							<vue3-component-loader
								exposed-module="./MenuBar"
								:component-props="{
									menuData: appMenuData,
									parentSelector: '#middle-content-headerBar',
									activeRoute: $route.path
								}"
							>
								<template #loading>
									<span></span>
								</template>
							</vue3-component-loader>
						</div>
					</template>
					<template #product-title-headerBar>
						<b-navbar-brand
							class="brand-logo d-flex align-items-center cursor-pointer"
							@click="goToHomePage"
						>
							<span class="image-span-container">
								{{ currentApplicationDetails.NAME || moduleName }}
							</span>
						</b-navbar-brand>
					</template>
					<template #product-nav-items> </template>
				</header-bar>
			</b-navbar>
		</section>
	</div>
</template>

<script>
import Vue from "@/ourVue";
import getRemoteModule from "@/plugins/get-remote-module.js";
import {
	getSessionStorage,
	signOutConfiguration,
	changePwdConfiguration,
	remoteApplicationDetails,
	globalDateFormatLong,
} from "config";
import { mapState } from "vuex";
import StatusProgress from "@/components/ProcessProgress/index.js";
import { MENU_JSON_BASE_PATH, VIEW_LOG_BASE_PATH } from "../Framework/constants/basePaths.js";
import { interpolate } from "../Framework/utility/utility.js";
import moment from 'moment';


const REMOTE_APP1 = remoteApplicationDetails.remoteApp1;
const FEDERATED_MODULES = REMOTE_APP1.federatedModules;

Vue.use(StatusProgress);

export default {
	props: {
		moduleName: {
			type: String,
			required: true,
		},
	},
	components: {
		"header-bar": () => getRemoteModule({
			remoteAppName: REMOTE_APP1.appName,
			remoteURL: REMOTE_APP1.remoteURL,
			callback: (loadComponent) => loadComponent(FEDERATED_MODULES.HeaderBar)
		}),
		Vue3ComponentLoader: () => import("./Vue3ComponentLoader/Vue3ComponentLoader.vue")
	},
	data() {
		return {
			leftContainerStyle: {
				flex: 0.5
			},
			middleContainerStyle: {
				flex: "3 1 45%",
				minWidth: "0",
				maxWidth: "80%",
				display: "flex",
				alignItems: "center",
			},
			rightContainerStyle: {
				flex: 3
			},
			localeName: "app",
			user: {
				name: getSessionStorage().user_name || "",
			},
			myStyles: { "padding-left": "12px" },
			notificationTypeHandlers: {},
			ProcessProgressData: {},
			componentsProps: {},
			appMenuData: [],
		};
	},
	computed: {
		...mapState("ModuleBlock", ["moduleConfigurations"]),
		...mapState("CappsPageConfigurations", ["homePage"]),
		localeEl() {
			return this.$t(this.localeName);
		},
		currentApplicationDetails() {
			const APPLICATION_DETAILS = this.moduleConfigurations || {};
			return APPLICATION_DETAILS;
		},
		menuBarProps() {
			return {
				menuData: this.appMenuData,
			}
		},
		menuBarEvents() {
			return {}
		},
	},
	watch: {
		moduleName: {
			immediate: true,
			handler(newV, oldV) {
				if(newV && newV !== oldV) this.getAppMenuData();
			},
		},
	},
	methods: {
		session_userid() {
			return getSessionStorage().userid;
		},
		session_ticket() {
			return getSessionStorage().sessionid;
		},
		goToHomePage() {
			if (this.currentApplicationDetails.DEFAULT_VIEW)
				return this.$router.push({
					path: `/${this.moduleName}/${this.currentApplicationDetails.DEFAULT_VIEW}`,
				});
			if (!this.homePage) this.$router.go(-1);
			this.$router.push({
				path: this.homePage,
			});
		},
		headerBarMounted() {
			const self = this;
			this.notificationTypeHandlers = {
				process_progress(item) {
					const data = item.data || {};
					let { originalMessage, processedMessage }= (item?.data?.details || []).reduce((acc, curr) => {
						acc.originalMessage += curr;
						acc.processedMessage += `<b>${curr}</b><br>`;
						return acc;
					}, { originalMessage: "", processedMessage: "" });

					item.data.msg = originalMessage;
					item.data._msg_ = processedMessage;

					data.formattedStartDate = data.startdate ? moment(data.startdate).format(globalDateFormatLong) : null;

					self.$set(
						self.ProcessProgressData, 
						item.data.id, 
						{ 
							version: item.version, 
							moduleName: data.app_name, 
							...item.data
						}
					);

					const IS_CURRENT_ACTIVE_ROUTE = [
						`${data.app_name}/doc/${data.process_name}/view/list`, 
						`${data.app_name}/doc/${data.process_name}/view/card`,
					].includes(capps.get_route().join("/"));

					if(data.enddate) {
						let { filter } = data;

						if(typeof filter === "string") filter = new Function("return " + filter)();

						if(item.version  === "2.0") {	

							if(data.errors > 0) {
								if(IS_CURRENT_ACTIVE_ROUTE) {
									const basePath = interpolate(VIEW_LOG_BASE_PATH, { moduleName: data.app_name, recordId: filter.PARENT_ID }) + "?hideFormHeader=true";
									window.capps.ui.open_modal({
										title: "Process",
										content: `<div id="process__iframe-container__${data.app_name}_${data.process_name}">
											<iframe src="${basePath}" class="process__iframe-container" style="height: 70vh;width: 100%;border: 0"></iframe>
										</div>`,
										size: "xl",
										style: `
											#process__iframe-container__${data.app_name}_${data.process_name} {
											width: 100%;
											height: 100%;
											}

											.process__iframe-container {
												height: 70vh;
												width: 100%;
											}
										`
									});
								}
							}

							const IS_UPLOAD_PROCESS = data.processid.startsWith("Upload_");
							if(IS_UPLOAD_PROCESS) {
								capps.rest[data.app_name].file_interface.read[data.file_id]()
								.then(function(exemptions) {
									if(exemptions?.STATUS === "ERR") data.file_exceptions = true;
									else data.file_exceptions = false;

									self.$set(
										self.ProcessProgressData, 
										data.id, 
										{ 
											...item.data,
											...data,
											version: item.version, 
										}
									);
								})
								.catch(function () {
									data.file_exceptions = false;
								});
							}

							if(IS_CURRENT_ACTIVE_ROUTE) {
								setTimeout(function () {
									window.capps.ui.refresh();
								}, 0);
							}

						}
					}

					item.data = { ...item.data, ...data };

					return "PROCESS_PROGRESS";
				},
			};
		},
		async getAppMenuData() {
			const _this = this;
			_this.appMenuData = [];
			_this.appMenuData.length = 0;
			const basePath = interpolate(MENU_JSON_BASE_PATH, { moduleName: _this.moduleName });
			// Only load menu.js (no role-based loading)
			let menuData = [];
			try {
				menuData = await new Promise((resolve, reject) => {
					capps.require(basePath + "menu.js", function (menuData) {
						resolve(menuData);
					}, { asModule: true }).catch(err => {
						console.log("Error occurred while loading application menu data:", err);
						resolve([]);
					});
				});
			} catch (err) {
				console.log("Error occurred while loading application menu data:", err);
				menuData = [];
			}
			_this.appMenuData = menuData;
		}
	},
	created() {
		const MODULE_NAME = this.moduleName;
		const _this = this;
		this.headerBarMounted();
		this.componentsProps = {
			Theme: {
				hidden: true,
			},
			DashboardButton: {
				props() {
					return {
						element: "#main-router-view-wrapper",
						hideElementSelector: "#main-router-view-wrapper > div,#subnav__navbar",
						folder: [MODULE_NAME],
						dashboardRoute: `/${MODULE_NAME}/dashboard-hub`,
					};
				},
			},
			Notification: {
				props: () => {
					return {
						user_id: _this.session_userid,
						_ticket: _this.session_ticket,
						subCollectionProcess: {
							name: MODULE_NAME,
							callBack(data, fn) {
								fn && fn(data);
							},
						},
						ProcessProgressData: _this.ProcessProgressData,
						notificationTypeHandlers: _this.notificationTypeHandlers,
						ref: "notification",
					};
				},
				listeners: {},
				slots: {
					footer: {
						component: () => import("@/components/ProcessProgress/ProgressBar.vue"),
						props: () => {
							return {
								ProcessProgressData: _this.ProcessProgressData,
							};
						},
						ref: "progress_bar_slot",
					},
				},
			},
			UserProfile: {
				props: () => {
					return {
						user_name: _this.user.name,
						user_id: _this.session_userid(),
						sessionId: _this.session_ticket(),
						signOutConfiguration: signOutConfiguration,
						changePasswordHide: false,
						changePwdConfiguration: changePwdConfiguration,
					};
				},
			},
		};
	},
};
</script>

<style lang="scss" scoped>
.ml-auto::v-deep {
	display: flex !important;
	justify-content: flex-start;
	align-items: center;
	gap: 1.3rem;
	flex-direction: row;

	a {
		display: flex !important;
		justify-content: center;
		align-items: center;
		padding-left: 0 !important;
		padding-right: 0 !important;
	}
	svg {
		margin: 0 !important;
		padding: 0;
	}
}
.brand-logo {
	height: 3rem;
	padding: 0px;
	.image-span-container {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	img {
		max-width: 90%;
		height: 90%;
	}
}

.pop-over-container-list {
	height: 80vh;
	background: transparent;
	width: inherit;
}

.header {
	#nav-collapse {
		background: var(--header-color);
		z-index: 3;
	}
	.more-navigation-list__button {
		position: sticky;
		left: 0;
		z-index: 1;
		background: transparent;
	}

	::v-deep {
		#right-content-headerBar {
			.notePop-up {
				left: -9rem !important;
				top: 1.7rem;
			}
		}
	}

	.navbar-dark {
		background: var(--blue-dark);
		height: 50px;

		.nav-item {
			padding-right: 0.2rem;
			padding-left: 0.2rem;
		}

		.nav-link {
			color: rgb(255 255 255 / 70%);

			/*  display: flex; */
			.navbar-nav {
				padding: 0 1rem;
			}

			.b-icon {
				margin: 0 5px;
			}

			&:focus,
			&.router-link-active {
				color: #fff;
			}

			img {
				height: 15px;
				margin: 0 5px;
			}

			.icon {
				width: 18px;
				height: 18px;
			}
		}
	}

	.navbar-light.subnav {
		font-size: 14px;
		font-weight: 500;
		padding: 0.3rem 1rem;
		background: #fff;
		max-height: 40px;
		border-bottom: 1px solid var(--border-color);

		ul {
			gap: 15px;
		}

		.more-navigation-list__button {
			margin-right: 12px;
			a {
				border-width: 1px;
				border-style: solid;
				border-color: #738499;
				padding: 1px 6px !important;
				border-radius: 8px;
				margin-top: 3px;

				svg {
					height: 12px !important;
					width: 12px !important;
					position: relative;
					top: -1.5px;
				}
			}
		}
		.nav-link {
			position: relative;
			padding-left: 1rem;
			padding-right: 1rem;
			color: var(--main-text);

			&::after {
				content: "";
				position: absolute;
				bottom: -2px;
				left: 50%;
				width: 0;
				height: 2px;
				background: var(--active);
				transition: width 0.4s ease-in-out;
				transform: translateX(-50%);
			}

			&:focus,
			&.router-link-active {
				color: var(--active);
			}

			&.router-link-active::after {
				width: 100%;
			}
		}
	}

	.dashboardIcon {
		svg {
			opacity: 0.7;
			&:hover {
				opacity: 0.9;
			}
		}
	}

	.close-btn {
		position: sticky;
		bottom: 10px;
		transition: 200ms ease-out;
	}

	#dashboard-modal {
		height: 100%;
		width: 100vw;
		background-color: #fff;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 10;
		transition: 200ms ease-in;
	}

	#dashboard-modal_header_title {
		font-weight: 500;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;

		svg {
			margin-bottom: 3px;
		}
	}

	#dashboard-modal_header {
		width: 100vw;
		background-color: #070f63;
		display: flex;
		align-items: center;
		padding: 15px;
		justify-content: space-between;
	}

	#dashboard-modal_header_right {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 15px;

		button {
			background-color: transparent;
			border: none;
			color: #f8f9fa !important;
			opacity: 0.5;

			&:hover {
				opacity: 0.75;
			}
		}
	}

	.iframe-cotainer {
		height: 111vh;
		padding: 20px;
	}
}

#subnav__navbar:hover {
	overflow: auto !important;
}

#subnav__navbar {
	background-color: var(--white);
	overflow: hidden !important;
}

.navbar {
	padding: 0.2rem 1rem !important;
}
</style>