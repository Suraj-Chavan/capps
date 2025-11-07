<template>
	<b-nav-text class="p-0 m-0 d-flex flex-nowrap notification_wrapper">
		<div class="d-flex flex-nowrap">
			<div>
				<div class="nav-link p-0 ml-3">
					<button id="nav-item-progressbar" class="btn btn-link p-3" >
						<b-icon-flag-fill
							class="icon d-lg-inline"
							style="color: hsla(0, 0%, 100%, .75)"
							:class="{ bell: Object.keys(ProcessProgressData).length }"
						/>
					
					<b-badge
						variant="success"
						class="mt-1"
						style="font-size: 75%;"
						v-if="Object.keys(ProcessProgressData).length"
						>{{ Object.keys(ProcessProgressData).length }}</b-badge
					>
					</button>
					<b-popover
						target="nav-item-progressbar"
						triggers="hover"
						placement="bottom"
						right
						custom-class="popover-custom"
					>
						<b-list-group flush class="popover-scroll">
							<b-list-group-item class="p-1 d-flex justify-content-between align-items-center">
								<span>
									<b-icon-flag /> You have total
									{{ Object.keys(ProcessProgressData).length }} process
								</span>
								<b-button
									v-if="Object.keys(ProcessProgressData).length"
									size="sm"
									variant="outline-danger"
									class="clear-all-btn ml-2"
									@click="clearAllProgress"
								>
									<b-icon-trash class="mr-1"></b-icon-trash> Clear All
								</b-button>
							</b-list-group-item>
							<b-list-group-item
								v-for="(item, key) in sortedProcessProgressData"
								:key="key"
								class="p-1"
							>
								<div class="position-relative">
									<bar :data="item" />
									<b-link
										size="sm"
										class="ml-auto"
										variant="outline-default"
										v-if="(item || {}).enddate"
										@click="deleteProgress(ProcessProgressData, key)"
										style="position: absolute; right: 0; top: 0"
									>
										<b-icon-x-circle />
									</b-link>
								</div>
							</b-list-group-item>
						</b-list-group>
					</b-popover>
					<ProgressBarWrapper
						ref="progressModal"
						@initiated="initiateListeners"
						:ProcessProgressData="ProcessProgressData"
					/>
				</div>
			</div>
		</div>
	</b-nav-text>
</template>
<script>
import ProgressBarMixin from "./ProgressBarMixin";
export default {
	mixins: [ProgressBarMixin],
	computed: {
		sortedProcessProgressData() {
			const data = this.ProcessProgressData;
			return Object.keys(data)
				.map(key => ({ ...data[key], _key: key }))
				.sort((a, b) => new Date(b.startdate) - new Date(a.startdate))
				.reduce((acc, item) => {
					acc[item._key] = item;
					return acc;
				}, {});
		}
	},
	methods: {
		deleteProgress(ProcessProgressData, key) {
			this.$delete(ProcessProgressData, key);
		},
		clearAllProgress() {
			// Elegant way to clear all process progress
			for (const key of Object.keys(this.ProcessProgressData)) {
				this.$delete(this.ProcessProgressData, key);
			}
		},
		CollectionMsg(data) {
			if (!!data && !/^ *$/.test(data.msg)) {
				let dummyArr = [];
				dummyArr.push(data);
				this.NotifyArr = [...this.NotifyArr, ...dummyArr];
			}
		},
		download(urls, filename, fileid, index) {
			let req = new XMLHttpRequest();
			/* eslint-disable */
			req.open("POST", this.configurl + urls, true); // Open an async AJAX request.
			/* eslint-enable */
			req.setRequestHeader("Content-Type", "application/json"); // Send JSON due to the {test: "test"} in question
			req.responseType = "blob"; // Define the expected data as blob
			req.send(
				JSON.stringify({
					user: {
						sessionid: sessionStorage.getItem("sessionid"),
					},
					data: {
						FILEID: fileid,
					},
				})
			);
			req.onreadystatechange = function () {
				if (req.readyState === 4) {
					if (req.status === 200) {
						// When data is received successfully
						var data = req.response;
						// var headers = req.getAllResponseHeaders("content-disposition");
						var defaultFilename = filename;
						// Or, you can get filename sent from backend through req.getResponseHeader('Content-Disposition')
						if (typeof window.navigator.msSaveBlob === "function") {
							// If it is IE that support download blob directly.
							window.navigator.msSaveBlob(data, defaultFilename);
						} else {
							var blob = data;
							var link = document.createElement("a");
							link.href = window.URL.createObjectURL(blob);
							link.download = defaultFilename;
							document.body.appendChild(link);
							link.click(); // create an <a> element and simulate the click operation.
						}
					}
				}
			};
			this.DeleteNotification(index);
		},
	},
};
</script>
<style lang="scss" scoped>
.default--minwidth {
	min-width: 50vh;
}
.file-link {
	cursor: pointer;
	color: blue;
}
.notification_wrapper {
	position: relative;
	.badge {
		position: absolute;
		top: 0;
	}
	.bell {
		animation: ring 4s 0.7s ease-in-out infinite;
		transform-origin: 50% 4px;
	}

	@keyframes ring {
		0% {
			transform: rotateZ(0);
		}
		1% {
			transform: rotateZ(30deg);
		}
		3% {
			transform: rotateZ(-28deg);
		}
		5% {
			transform: rotateZ(34deg);
		}
		7% {
			transform: rotateZ(-32deg);
		}
		9% {
			transform: rotateZ(30deg);
		}
		11% {
			transform: rotateZ(-28deg);
		}
		13% {
			transform: rotateZ(26deg);
		}
		15% {
			transform: rotateZ(-24deg);
		}
		17% {
			transform: rotateZ(22deg);
		}
		19% {
			transform: rotateZ(-20deg);
		}
		21% {
			transform: rotateZ(18deg);
		}
		23% {
			transform: rotateZ(-16deg);
		}
		25% {
			transform: rotateZ(14deg);
		}
		27% {
			transform: rotateZ(-12deg);
		}
		29% {
			transform: rotateZ(10deg);
		}
		31% {
			transform: rotateZ(-8deg);
		}
		33% {
			transform: rotateZ(6deg);
		}
		35% {
			transform: rotateZ(-4deg);
		}
		37% {
			transform: rotateZ(2deg);
		}
		39% {
			transform: rotateZ(-1deg);
		}
		41% {
			transform: rotateZ(1deg);
		}
		43% {
			transform: rotateZ(0);
		}
		100% {
			transform: rotateZ(0);
		}
	}
}
.clear-all-btn {
	font-weight: 500;
	padding: 2px 10px;
	display: flex;
	align-items: center;
	border-radius: 6px;
	transition: background 0.2s;
	b-icon-trash {
		margin-right: 4px;
	}
	&:hover {
		background: #ffeaea;
		color: #c82333;
	}
}
.popover-custom{max-width: 350px;}
.popover-scroll{overflow: hidden; overflow-y: auto;  max-height: 350px;}
</style>