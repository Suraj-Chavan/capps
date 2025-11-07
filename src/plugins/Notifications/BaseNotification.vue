<template>
	<b-nav-text class="d-flex flex-nowrap notification_wrapper">
		<div class="nav-link p-0 mx-3">
			<span id="nav-item-notification">
				<b-icon-bell
					class="icon d-none d-lg-inline"
					:class="{ bell: NotifyArr.length }"
				/>
			</span>
			<span class="d-inline-block d-lg-none">Notifications</span>
			<b-badge variant="success" v-if="NotifyArr.length">{{
				NotifyArr.length
			}}</b-badge>

			<b-popover
				target="nav-item-notification"
				triggers="hover"
				placement="bottom"
				right
				
			>
				<b-list-group flush>
					<b-list-group-item class="p-1">
						<b-icon-bell /> You have
						{{ NotifyArr.length }} notifications</b-list-group-item
					>
					<b-list-group-item
						class="p-1"
						v-for="(item, index) in NotifyArr"
						:key="index"
					>
							<div
								class="d-flex justify-content-between align-items-start"
								v-if="item && item.hasOwnProperty('url') && item.url !== ''"
							>
								<div>
									<span
										@click="download(item.url, item.filename, item.fileid, index)"
										class="file-link"
										>{{ item.filename }}
									</span>
									is ready for download
								</div>
								<div>
									<b-link
										size="sm"
										class="ml-auto"
										variant="outline-default"
										@click="DeleteNotification(index)"
									>
										<b-icon-x-circle />
									</b-link>
								</div>
							</div>
							<div class="d-flex justify-content-between align-items-start" v-else>
								<span class="mr-2"> {{ item.msg }} </span>
								<div>
									<b-link
										size="sm"
										class="ml-auto"
										variant="outline-default"
										@click="DeleteNotification(index)"
									>
										<b-icon-x-circle />
									</b-link>
								</div>
							</div>
					</b-list-group-item>
				</b-list-group>
			</b-popover>
		</div>
		<div class="nav-link p-0 mx-3">
			<span id="nav-item-progressbar">
				<b-icon-flag
					class="icon d-none d-lg-inline"
					:class="{ bell: Object.keys(ProcessProgressData).length }"
				/>
			</span>
			<b-badge variant="success" v-if="Object.keys(ProcessProgressData).length">{{
				Object.keys(ProcessProgressData).length
			}}</b-badge>

			<b-popover
				target="nav-item-progressbar"
				triggers="hover"
				placement="bottom"
				right
			>
				<b-list-group flush style="width:200px">
					<b-list-group-item class="p-1">
						<b-icon-flag /> You have total {{ Object.keys(ProcessProgressData).length }} process
					</b-list-group-item>
					<b-list-group-item
						v-for="(item, key) in ProcessProgressData"
						:key="key"
						class="p-1"
					>
					<div class="position-relative">
						<bar :data="item" />
						<b-link
							size="sm"
							class="ml-auto"
							variant="outline-default"
							v-if="(item||{}).enddate"
							@click="deleteProgress(ProcessProgressData,key)"
							style="position:absolute; right:0; top:0"
						>
							<b-icon-x-circle />
						</b-link>
					</div>
					</b-list-group-item>
				</b-list-group>
			</b-popover>
			<ProgressBarWrapper
				ref="progressModal"
				:ProcessProgressData="ProcessProgressData"
			/>
		</div>
	</b-nav-text>
</template>
<script>
import NC from "./n.client.lib.js";
import ProgressBarMixin from "./ProgressBarMixin";
export default {
	mixins: [ProgressBarMixin],
	props: {
		configurl: {
			type: [String],
			required: true,
			default: "/NREST/",
		},
		user_id: {
			type: [Function],
			required: true,
			default: "",
		},
		_ticket: {
			type: [Function],
			required: true,
			default: "",
		},
		connect_room: {
			type: [String],
			required: true,
			default: "npa",
		},
	},
	data() {
		return {
			NotifyArr: [],
		};
	},
	mounted() {
		let self = this;
		const notiSocket = new NC();
		notiSocket.startSession(self.user_id(), self._ticket());
		var onNotifyMsg = (notice) => {
			let dummyArr = [];
			self.noteArr = notice.map((item) => {
				console.table(item.data);
				if (item.data.msg !== "" && item.type !== "process_progress"){
					this.notifyMe(item.data.msg);
					dummyArr.push(item.data);
				}
				else if(item.type == "process_progress"){
					if(self.ProcessProgressData[item.data.id] && self.ProcessProgressData[item.data.id].enddate)
						return item.data
					self.$set(self.ProcessProgressData, item.data.id, item.data);
				}
				return item.data;
			});
			self.NotifyArr = [...self.NotifyArr, ...dummyArr];
		};
		notiSocket.subMessages(onNotifyMsg);
		notiSocket.subCollection(self.connect_room, self.CollectionMsg);
	},
	methods: {
		notifyMe(notifyBody) {
			let vnotification = null;
			var options = {
				body: notifyBody,
				icon: "",
				requireInteraction: "",
			};

			// Let's check if the browser supports notifications
			if (!("Notification" in window)) {
				alert("This browser does not support desktop notification");
			}
			// Let's check whether notification permissions have already been granted
			else if (Notification.permission === "granted") {
				// If it's okay let's create a notification
				vnotification = new Notification("ETF - AP Management", options);
				vnotification.addEventListener("click", function () {
					window.focus();
				});
				setTimeout(function () {
					vnotification.close();
				}, 8000);
			}

			// Otherwise, we need to ask the user for permission
			else if (Notification.permission !== "denied") {
				Notification.requestPermission().then(function (permission) {
					// If the user accepts, let's create a notification
					if (permission === "granted") {
						vnotification = new Notification("ETF - AP Management", options);
						setTimeout(function () {
							vnotification.close();
						}, 8000);
					}
				});
			}
		},
		deleteProgress(ProcessProgressData,key){
			this.$delete(ProcessProgressData, key);
		},
		DeleteNotification(index) {
			this.NotifyArr.splice(index, 1);
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
</style>