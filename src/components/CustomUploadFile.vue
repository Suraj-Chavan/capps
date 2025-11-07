<template>
    <b-modal 
        v-model="isOpen" 
        title="Upload"  
        header-bg-variant="blue"
        header-text-variant="light" 
        content-class="upload-modal" 
        size="md"
    >
		<template #modal-header-close>
			<close-svg />
		</template>
        <div>
            <file-upload
				accepts="csv"
                dropzone
                type="single"
                v-model="file"
                file-types="csv"
				buttonTitle="Select File"
            />
        </div>
        <template #modal-footer>
            <div class="w-100 text-right btn-container">
                <b-button
                    variant="secondary"
                    size="sm"
                    @click="closeModal"
					class="btn-close"
                >
                    Close
                </b-button>
				<slot name="extraBtnForFooter"></slot>
                <b-button
                    size="sm"
                    @click="uploadFile"
					class="btn-upload"
                >
                    Upload
                </b-button>
            </div>
        </template>
    </b-modal>
</template>

<script>
	import getRemoteModule from "@/plugins/get-remote-module.js";
	import Close from "./IconComponents/Close.vue";
	import { remoteApplicationDetails, getSessionStorage,NREST } from "config";
	import { mapState } from 'vuex';

	const { sessionid } = getSessionStorage();


	const REMOTE_APP1 = remoteApplicationDetails.remoteApp1;
	const FEDERATED_MODULES = REMOTE_APP1.federatedModules;

	export default {
		props:{
			OPEN_UPLOAD_SCREEN:{
				type: Boolean,
				default: false,
				required: true
			},
			uploadApi:{
				type: String,
				default: "",
				required: true
			},
			getOptions:{
				type: Function,
				require: true
			},
		},
		computed:{
			isOpen:{
				get(){
					return this.OPEN_UPLOAD_SCREEN
				},
				set(value) {
					setTimeout(() => this.$emit('toggleUpload', value), 10);
				}
			},
			...mapState(["refreshGrid"])
		},
		components: {
			FileUpload: getRemoteModule({
				remoteAppName: REMOTE_APP1.appName,
				remoteURL: REMOTE_APP1.remoteURL,
				callback: loadComponent => () => loadComponent(FEDERATED_MODULES.FileUpload),
			}),
			CloseSvg: Close
		},
		data(){
			return{
				file: []
			}
		},
		methods: {
			async uploadFile() {
				if(this.file.length === 0) {
					this.showMessage("Information", "Please select a file first to upload");
					return;
				}

				const { body, api, headers } = this.getOptions(this.file);
				this.$store.commit("loading", true);

				try {
					const response = await fetch(
						api || (window.config.NREST + this.uploadApi), 
						{
							body: body || {},
							method: "post",
							headers: {
								sessionid,
								...headers
							},
						}
					);

					if (!response.ok) {
						throw new Error("Network response was not ok");
					}

					const data = await response.text();
					const parsedData = JSON.parse(data);

					if (parsedData.status === "success") {
						this.$emit('upload-message', {
							msg: parsedData.msg || "File uploaded successfully"
						});
						this.$emit('toggleUpload', false);
					} else {
						throw new Error(parsedData.error || "Something unexpected happened");
					}
				} catch (error) {
					this.showMessage("Error", error.message || "An error occurred while uploading the file");
				} finally {
					this.$store.commit("loading", false);
					this.file = [];
				}
			},
			closeModal() {
				this.$emit('toggleUpload', false);
			},
			showMessage(title, message) {
				this.$_showAlert(title, message);
			}
		}
	}
</script>
<style lang="scss" scoped>
	.btn-container{
		display: flex;
		justify-content: flex-end;
		gap: 0.8rem;

		.btn-close, .btn-upload{
			font-size: 12px;
			font-weight: 600;
			border-radius: 4px;
		}

		.btn-upload{
			background-color: var(--header-color);
			border: none;
		}
	}
</style>