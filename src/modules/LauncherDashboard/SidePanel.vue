<template>
	<div class="launcher-dashboard-side-panel">
		<div class="search-bar-controller-capps d-flex">
			<div class="search-bar-container-capps flex-1">
				<b-input-group class="m-0">
					<div class="search-icon-capps">
						<b-iconstack font-scale="2">
							<b-icon stacked icon="search" variant="secondary" scale="0.5"></b-icon>
							<b-icon stacked icon="" variant="secondary"></b-icon>
						</b-iconstack>
					</div>
					<b-form-input
						autocomplete="off"
						@focus="focusedOnSearch"
						@input="searchDashboardsForQuery"
						@blur="blurredOutSearch"
						v-model="enteredSearchText"
						placeholder="Search"
						id="search_input_control"
					></b-form-input>
				</b-input-group>
			</div>
		</div>

		<div class="favorite-dashboards" v-if="!isSearchActive">
			<h6 class="color-blue mb-0 d-flex align-items-end">
				<icon-star></icon-star><span class="ml-2">STARRED</span>
			</h6>

			<b-alert 
				v-if="!starredDashboards.length" 
				show 
				variant="info"
				class="mt-4"
			>
				No dashboards found to display
			</b-alert>
			<dashboards-group
				v-else
				class="starred_dashboards"
				:dashboards="starredDashboards"
				v-model="activeDashboard"
				@input="onDashboardChanged"
			>
				<template #actions="{ PAGEID }">
					<span
						class="ml-auto cursor-pointer favorite-icon-container pr-1"
						@click.prevent.stop="toggleFavorite(PAGEID)"
					>
						<b-iconstack font-scale="1.3">
							<b-icon stacked icon="star-fill" variant="warning" scale="0.9"></b-icon>
							<b-icon stacked icon="slash-circle" variant="danger" scale="1.4"></b-icon>
						</b-iconstack>
					</span>
				</template>
			</dashboards-group>
		</div>

		<hr v-if="!isSearchActive" />

		<div class="all-dashboards" v-if="!isSearchActive">
			<h6 class="color-blue mb-0 d-flex align-items-end">
				<icon-all></icon-all><span class="ml-2">ALL DASHBOARDS</span>
			</h6>

			<b-alert 
				v-if="!allDashboards.length" 
				show 
				variant="info"
				class="mt-4"
			>
				No dashboards found to display
			</b-alert>
			<dashboards-group
				v-else
				class="all_dashboards"
				:dashboards="allDashboards"
				v-model="activeDashboard"
				@input="onDashboardChanged"
			>
				<template #actions="{ PAGEID }">
					<span
						class="ml-auto cursor-pointer favorite-icon-container pr-1"
						@click.prevent.stop="toggleFavorite(PAGEID)"
					>
						<b-icon
							scale="1.3"
							:icon="favoriteCards[PAGEID] === true ? 'star-fill' : 'star'"
							:variant="favoriteCards[PAGEID] ? 'warning' : 'secondary'"
						></b-icon>
					</span>
				</template>
			</dashboards-group>
		</div>

		<div class="search-results" v-if="isSearchActive">
			<h6 class="color-blue mb-0 d-flex align-items-end">
				<span class="ml-2">SEARCH RESULTS</span>
			</h6>
			<dashboards-group
				class="search-result-dashboards"
				:dashboards="searchResults"
				v-model="activeDashboard"
				@input="onDashboardChanged"
			>
				<template #actions="{ PAGEID }">
					<span
						class="ml-auto cursor-pointer favorite-icon-container pr-1"
						@click.prevent.stop="toggleFavorite(PAGEID)"
					>
						<b-icon
							scale="1.3"
							:icon="favoriteCards[PAGEID] === true ? 'star-fill' : 'star'"
							:variant="favoriteCards[PAGEID] ? 'warning' : 'secondary'"
						></b-icon>
					</span>
				</template>
			</dashboards-group>
		</div>
	</div>
</template>
  
  <script>
import DashboardsGroup from "./DashboardsGroup.vue";
import IconAll from "./Icons/IconAll.vue";
import IconStar from "./Icons/IconStar.vue";
import Fuse from "fuse.js";
import { createAppSettings } from "@/app_settings";
import { APP_NAME } from "@/constant.js";
import { mapState, mapMutations } from "vuex";
import { debounce } from "@/Framework/utility/debounce.js";


export default {
	props: {
		value: {
			type: Object			
		},
		allDashboards: {
			type: Array,
			default: () => [],
		},
		starredDashboards: {
			type: Array,
			default: () => [],
		},
	},
	components: {
		IconStar,
		IconAll,
		DashboardsGroup,
	},
	data() {
		return {
			isSearchActive: false,
			enteredSearchText: "",
			searchResults: [],
		};
	},
	computed: {
		...mapState("AppSettingsLoad", ["APP_SETTINGS"]),
		favoriteCards() {
			return (this.APP_SETTINGS[APP_NAME] || {}).fav || {};
		},
		activeDashboard: {
			get () {
				return this.value;
			},
			set(value) {
				this.$emit("input", value);
			}
		}
	},
	methods: {
		...mapMutations("AppSettingsLoad", ["CHANGE_FAVORITE_SETTING"]),
		async toggleFavorite(dashboardId) {
			const IS_STARRED = !this.favoriteCards[dashboardId] ? true : false;
			this.CHANGE_FAVORITE_SETTING({
				ID: dashboardId,
				isFavorite: IS_STARRED,
				APP_NAME,
			});
			const response = await createAppSettings(this.APP_SETTINGS);
			response.status != "success" &&
				this.$_errorMessage(
					response.error ||
						response.msg ||
						"Something unexpected happened, please try again"
				);
		},
		closeClicked() {
			this.$emit("side-panel-toggle");
		},
		onDashboardChanged(item) {
			this.$emit("dashboard-changed", {
				dashboardId: item.PAGEID,
				dashboardName: item.PAGENAME || "",
			});
		},
		focusedOnSearch() {
			this.isSearchActive = true;
		},
		searchDashboardsForQuery: debounce(function (searchPattern) {
			this.isSearchActive = true;
			const fuse = new Fuse(this.allDashboards, {
				isCaseSensitive: false,
				includeScore: true,
				ignoreDiacritics: true,
				shouldSort: true,
				includeMatches: false,
				findAllMatches: false,
				minMatchCharLength: 1,
				location: 0,
				threshold: 0.6,
				distance: 100,
				useExtendedSearch: true,
				ignoreLocation: false,
				ignoreFieldNorm: false,
				fieldNormWeight: 1,
				keys: ["PAGENAME", "PAGEID"],
			});
			const SEARCH_RESULTS = fuse.search(searchPattern).map(({ item }) => item);
			this.searchResults = SEARCH_RESULTS;
		}, 500),
		blurredOutSearch() {
			if (!this.enteredSearchText) this.isSearchActive = false;
		},
	},
};
</script>
  
<style lang="scss" scoped>
.launcher-dashboard-side-panel {
	.search-bar-controller-capps {
		margin-bottom: 2em;

		.close-icon-container {
			display: flex;
			flex-direction: column-reverse;
			justify-content: center;
			margin-left: 16px;

			span {
				font-weight: bolder;
			}
		}

		.search-bar-container-capps {
			position: relative;
			padding: 1px;
			border: 0.5px solid #d0d1d5;
			border-radius: 5px;
			display: flex;
			background: #f6f7f6;

			.search-icon-capps {
				margin: 0px auto;
				font-size: 16px;
			}

			::v-deep {
				.form-control {
					border-color: #ffffff00 !important;
					background: #ffffff00 !important;
					padding: 0;
					margin: 0;
					margin-left: 1px;

					&:focus,
					&:active {
						border-color: #ff000000 !important;
						background: #ff000000 !important;
						box-shadow: none !important;
					}

					&::placeholder {
						color: #605f65 !important;
						opacity: 1;
					}

					&:-ms-input-placeholder {
						color: #605f65 !important;
						opacity: 1;
					}

					&::-ms-input-placeholder {
						color: #605f65 !important; 
						opacity: 1;
					}
				}
			}
		}
	}

	.starred_dashboards {
		max-height: 15vh;
	}
	.all_dashboards {
		max-height: 40vh;
	}

	.search-result-dashboards {
		max-height: 90vh;
	}


	.starred_dashboards, .all_dashboards, .search-result-dashboards {
		.favorite-icon-container {
			display: none;
		}
	
		::v-deep {
			.dashboard-item {
				&:hover {
					.favorite-icon-container {
						display: inline-block;
					}	
				}
			}
		}
	}

	.color-blue {
		color: #013576;
	}
}
</style>
  