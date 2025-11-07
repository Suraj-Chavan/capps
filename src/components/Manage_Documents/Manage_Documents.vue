<template>
	<div
		class="hello position-relative manageDocuments"
		style="height: auto"
		v-cloak
		@dragenter="startDragFunc"
		@dragover.prevent
	>
		<div>
			<div class="well border-dashed position-relative">
				<div class="container customScroll">
					<ul class="p-0" style="list-style: none">
						<li v-for="(file, index) in filesCopy" :key="index" style="height: 44px">
							<div class="d-flex justify-content-between">
								<div
									class="d-flex"
									:class="file.UP_STATUS == 'completed' ? 'text-primary' : ''"
								>
									<!-- <img :src="`img/${file.FILETYPE}.png`" height="32" class="mr-2" /> -->
									<component
										:is="file.FILETYPE.toLowerCase()"
									/>
									<div class="d-flex flex-column">
										<span>{{ file.FILENAME.split(".")[0] }}</span>
										<small>
											<span 
												class="text-capitalize uploaded-by" 
											>
												{{ file.UPLOADED_BY }} /
											</span>
											<span class="uploaded-on">
												{{ file.UPLOADED_ON }} 
											</span>
										</small>
									</div>
								</div>
								<div class="mt-1 ml-5 d-flex">
									<b-progress
										v-show="file.UP_STATUS == 'completed' ? false : true"
										:key="rerender + 'pro-bar'"
										style="width: 100px"
										:id="'progress-bar-' + index"
										:class="file.LOADING_PERC == 100 ? 'hideMe' : ''"
										:value="file.LOADING_PERC"
										show-progress
										animated
										variant="success"
									></b-progress>
									<div class="ml-2 cursor-pointer">
										<span :title="'Download'" class="csv-svg">
											<b-icon-download
												@click="downloadFile(file.FILEID, file.FILENAME, file.FILETYPE)"
												class="mb-5 mr-3"
											/>
										</span>
										<span :title="'Delete'" class="text-danger">
											<b-icon-trash @click="deleteFile(file.FILEID)" class="mb-5" />
										</span>
									</div>
								</div>
							</div>
						</li>
					</ul>
					<div class="no-data-found">
						<no-data v-if="!filesCopy.length" :imgHeigth="100">
							<template v-slot:msg>
								<h5 class="no-data-msg">
									Sorry! no documents found for {{ localeEl.fields.AP_ID+': '+reference }}
								</h5>
							</template>
						</no-data>
					</div>
				</div>
			</div>
		</div>
		<div
			class="drag-overlay"
			v-if="isDragActive"
			v-cloak
			@dragenter="startDragFunc"
			@dragleave="stopDragFunc"
			@drop.prevent="addFile"
			@dragover.prevent
		>
			<h2 class="drag-text">{{ localeEl.headings.drop_files }}</h2>
		</div>
	</div>
</template>

<script>
import axios from "axios";
import CSV from "../IconComponents/CSV.vue";
import PDF from "../IconComponents/PDF.vue";
import PNG from "../IconComponents/PNG.vue";

export default {
	name: "ManageDocuments",
	data() {
		return {
			files: [],
			filesCopy: [],
			uploadProgress: 0,
			rerender: 0,
			isDragActive: false,
		};
	},
	props: ["reference", "localeEl", "module_name", "configNREST"],
	created() {
		this.fetchDocuments();
	},
	components :{
		csv: CSV,
		pdf: PDF,
		png: PNG
	},
	watch: {},
	filters: {
		kb(val) {
			return Math.floor(val / 1024);
		},
	},
	computed: {
		modal_title() {
			const action = this.scope == "view" ? "" : "";
			// return `${this.localeEl.ModalTitle} - ${action}`;
			return `${this.localeEl.AP_UploadTitle}`;
		},
	},
	methods: {
		stopDragFunc() {
			this.isDragActive = false;
		},
		startDragFunc() {
			this.isDragActive = true;
		},
		fetchDocuments() {
			const vObj = {
					filter: [
						{
							field: "ref_id",
							value: this.reference,
							asgn: "eq",
						},
						{
							field: "module_name",
							value: this.module_name,
							asgn: "eq",
						},
					],
			};
			this.$store.commit("loading", true);
			this.$credCAPI
				.collection(encodeURI(`var/documents/read`))
				.read({body: vObj})
				.then((response) => {
					let self = this;
					if (response && response.status == "unsuccess") {
						this.$_errorMessage(
							response.msg || response.error || `Error while processing`
						);
					}
					if (response && Object.keys(response).length) {
						this.filesCopy = response;
						this.filesCopy.map((el, index) => {
							this.filesCopy[index]["UP_STATUS"] = "completed";
						});
					} else {
						this.filesCopy = response;
					}
					this.$store.commit("loading", false);
				})
				.catch((error) => console.error(error));
		},
		addFile(e) {
			this.isDragActive = false;
			let filesToUpload;
			this.files.length = 0;
			filesToUpload = "dataTransfer" in e ? e.dataTransfer.files : e.target.files;
			if (!filesToUpload) return;
			// var allowedExtensions = /(\.csv)$/i;
			[...filesToUpload].forEach((f) => {
				// if (!allowedExtensions.exec(f.name)) {
				// 	this.$_showAlert(
				// 		"Information",
				// 		`Incorrect file type.<br /><b class='text-primary'>${f.name}</b>`
				// 	);
				// 	return false;
				// } else {
				f["unic_id"] = "_" + Math.random().toString(36).substr(2, 9);
				this.files.push(f);
				this.filesCopy.push({
					FILENAME: f.name,
					FILETYPE: f.name.split(".")[1],
					REF_ID: this.$route.query.reference,
					FILEID: "",
					UNIC_ID: f.unic_id,
					UPLOADED_BY: sessionStorage.getItem("user_id") || sessionStorage.getItem("userid") || sessionStorage.getItem("_userid"),
					UPLOADED_ON: this.$today(),
					DOCUMENT_NAME: f.name,
				});
			});
			this.upload();
		},
		removeFile(file) {
			this.filesCopy = this.filesCopy.filter((f) => {
				return f != file;
			});
		},
		upload() {
			let self = this;
			this.uploadProgress = 0;
			const options = {
				headers: {
					sessionid: sessionStorage.getItem("_ticket"),
					"Content-Type": "multipart/form-data",
				},
			};
			this.files.forEach((f, x) => {
				let formData = new FormData();
				formData.append("FILE", f);
				formData.append("MODULE_NAME", this.module_name);
				formData.append("REF_ID", this.$route.query.reference);
				formData.append("DOCUMENT_NAME", f.name.split(".")[0].toUpperCase());
				axios
					.request({
						method: "POST",
						url: `${this.configNREST}/var/documents/upload`,
						data: formData,
						headers: options.headers,
						onUploadProgress: (progressEvent) => {
							let self = this;
							var percentCompleted = Math.round(
								(progressEvent.loaded * 100) / progressEvent.total
							);
							self.filesCopy.map((el, index) => {
								self.filesCopy[index]["LOADING_PERC"] = percentCompleted;
								setTimeout(() => {
									self.filesCopy[index]["UP_STATUS"] = "completed";
									self.rerender += 1;
								}, 1000);
								self.rerender += 1;
							});
						},
					})
					.then((response) => {
						if (response.data.status == "unsuccess") {
							self.files = [];
							self.filesCopy.pop();
							self.$_showAlert("Information", `${response.data.error}`);
						}
						self.filesCopy.map((in_el, in_index) => {
							if (in_el.UNIC_ID == f.unic_id) {
								self.filesCopy[in_index]["FILEID"] = response.data.FILEID[0];
							}
						});
					});
			});
		},
		downloadFile(field_id, filename, filetype) {
			const _this = this;
			_this.$showNotificationSpinner("Downloading. Please Wait ...");
			const options = {
				reqpayload: {
					user: {
						userid: sessionStorage.getItem("user_id"),
						sessionid: sessionStorage.getItem("sessionid"),
					},
					data: { FILEID: field_id },
				},
				headers: {
					sessionid: sessionStorage.getItem("_ticket"),
					"Content-Type": "application/json",
				},
			};
			axios
				.request({
					method: "POST",
					data: options.reqpayload,
					url: `${_this.configNREST}/var/documents/download`,
					headers: options.headers,
					responseType: "blob", //important
				})
				.then(({ data }) => {
					const downloadUrl = window.URL.createObjectURL(new Blob([data]));
					const link = document.createElement("a");
					link.href = downloadUrl;
					link.setAttribute("download", filename + "." + filetype);
					document.body.appendChild(link);
					link.click();
					link.remove();
					return _this.$closeNotificationSpinner();
				})
				.catch(err => {
					console.log(err);
					return _this.$closeNotificationSpinner();
				});
		},
		deleteFile(field_id) {
			const vObj = {
					data: {
						FILEID: field_id,
					},
			};
			this.$_confirmMessage({ action: "delete" })
				.then(async (value) => {
					if (value) {
						this.$store.commit("loading", true);
						this.$credCAPI
							.collection(encodeURI(`var/documents/delete`))
							.delete({body: vObj})
							.then((response) => {
								let self = this;
								if (response && response.status == "unsuccess") {
									this.$_errorMessage(
										response.msg || response.error || `Error while processing`
									);
								}
								if (response && Object.keys(response).length) {
									this.fetchDocuments();
								}
								this.$store.commit("loading", false);
							})
							.catch((error) => console.error(error));
					}
				})
				.catch((err) => {
					console.log(err);
				});
		},
	},
};

function getEl(vm) {
	return {};
}
</script>

<style lang="scss" scoped>
.cursor-pointer {
	cursor: pointer;
}
.well {
	/* min-height: 20px; */
	padding: 1rem 0;
	/* margin-bottom: 20px;
	background-color: #f5f5f5;
	border: 2px dashed #ccc;
	border-radius: 4px;
	-webkit-box-shadow: inset 0 1px 1px rgb(0 0 0 / 5%);
	box-shadow: inset 0 1px 1px rgb(0 0 0 / 5%); */
}
.hideMe {
	-webkit-animation: cssAnimation 0s ease-in 1s forwards;
	animation: cssAnimation 0s ease-in 1s forwards;
	-webkit-animation-fill-mode: forwards;
	animation-fill-mode: forwards;
}
@keyframes cssAnimation {
	to {
		width: 0;
		height: 0;
		overflow: hidden;
	}
}
@-webkit-keyframes cssAnimation {
	to {
		width: 0;
		height: 0;
		visibility: hidden;
	}
}
.customScroll {
	overflow: auto;
	height: 300px;
}
.customScroll::-webkit-scrollbar {
	width: 5px;
	border-width: 5px;
}

.customScroll::-webkit-scrollbar-track-piece {
	background-color: var(--action-btn-bg);
}

.customScroll::-webkit-scrollbar-thumb {
	border-radius: 4px;
	background-color: var(--active);
}
li {
	padding: 6px;
	background-color: var(--white);
	margin: 0.5rem;
	border-radius: 4px ;
	border: 1px solid var(--border-color)
}
li:nth-child(odd) {
	background-color:var(--main-grid-even-row-color) ;
}
.drag-overlay {
	width: 100%;
	height: auto;
	background-color: rgba(21, 23, 35, 0.4);
	position: absolute;
	top: 0;
	left: 0;
	z-index: 999;
}
.drag-text {
	vertical-align: middle;
	line-height: 340px;
	text-align: center !important;
	color: #fff;
}
/* background: #f8f3f3; */
.text-primary{
	color: var(--black) !important;
	font-weight: 500;
}

.uploaded-by, .uploaded-on{
	color: var(--sm-sub-text) !important;
}

.no-data-found ::v-deep{
	.card{
		border: 1px dashed var(--border-color);
		.card-body{
			background-color: var(--action-btn-bg) !important;
		}
	}
}

.no-data-msg{
	color: var(--black)
}
</style>