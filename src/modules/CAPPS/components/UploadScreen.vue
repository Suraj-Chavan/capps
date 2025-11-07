<template>
    <div class="upload___screen">
        <custom-upload-file
            :OPEN_UPLOAD_SCREEN="OPEN_UPLOAD_SCREEN"
            :upload-api="uploadApi"
            :get-options="getOptions"
            @toggleUpload="toggleUpload"
            @upload-message="showUploadMessage"
            :collection="collection"
            :module-name="moduleName"
            :interface-api="interfaceApi"
            :interface-download-api="interfaceDownloadApi"
            :upload-view-details-read="uploadViewDetailsRead"
        ></custom-upload-file>
    </div>
</template>

<script>
import CustomUploadFile from "@/components/UploadManagement/upload.vue";

export default {
    name: "upload-screen",

    props: {
        moduleName: {
			type: String,
			required: true,
		},
		collection: {
			type: String,
			required: true,
		},
    },

    components: {
        CustomUploadFile
    },

    data() {
        return {
            OPEN_UPLOAD_SCREEN: true,	
        }
    },

    computed: {
        uploadApi() {
            return `/${this.moduleName}/${this.collection}/upload`;
        },
        interfaceApi() {
            return `${this.moduleName}/fileinterface/read`;
        },
        interfaceDownloadApi() {
            return `${this.moduleName}/fileinterface/download`;
        },
        uploadViewDetailsRead() {
            return `${this.moduleName}/upload/read/${this.collection}`;
        }
    },

    methods: {
        getOptions(file) {
            let formData = new FormData();
			formData.append("FILE", file[0]);
            return {
                body: formData
            }
		},
        toggleUpload(bool) {
            this.OPEN_UPLOAD_SCREEN = bool;
            if(bool) return;
            this.redirectToDefaultScreen();
        },
        redirectToDefaultScreen(defaultScreen = "list/view") {
			const DEFAULT_ROUTES = {
				"list/view": `/${this.moduleName}/doc/${this.collection}/view/list`,
			};
			this.$router.push(DEFAULT_ROUTES[defaultScreen]);
		},
        showUploadMessage({ msg }) {
            this.$parent.$_showAlert("Info", msg);
        }
    }
}
</script>
