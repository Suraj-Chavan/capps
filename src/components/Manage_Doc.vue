<template>
	<ModalView size="md" :title="modal_title" :noPadding="true">
		<template v-slot:header>
			<div class="d-flex justify-content-between align-items-center" style="width: 34rem">
				<h4 class="mb-0">
					{{ localeEl.AP_UploadTitle }}
				</h4>
				<h5 class="mt-1" style="cursor: pointer">
					<div class="drag-file">
						<input type="file" title="Upload File" class="custom-file-input" accept="" @change="addFiles" multiple />
						<b-icon-paperclip />
					</div>
				</h5>
			</div>
		</template>
		<template v-slot:body>
			<ManageDocuments
				ref="manageDocuments"
				:reference="reference"
				:localeEl="localeEl"
				:module_name="module_name"
				:configNREST="$config.NREST"
			/>
		</template>
		<template v-slot:footer>
		</template>
		<template #footer-before-btn>
			<small class="text-info mr-auto">
				<b-icon icon="info" scale="2" variant="info"></b-icon> Drag n drop files to upload file
			</small>
		</template>
	</ModalView>
</template>

<script>
import ManageDocuments from "@/components/Manage_Documents/Manage_Documents.vue";
export default {
	name: "Manage_Doc",
	data() {
		return {
			module_name: "AP",
			localeName: "AP_Management.Authorised_Participants",
		};
	},
	components: {
		ManageDocuments,
	},
	created() {
		this.reference = JSON.parse(this.$route.query.reference);
	},
	watch: {},
	computed: {
		localeEl() {
			return this.$t(this.localeName);
		},
		modal_title() {
			const action = this.scope == "view" ? "" : "";
			// return `${this.localeEl.ModalTitle} - ${action}`;
			return `${this.localeEl.AP_UploadTitle}`;
		},
	},
	methods: {
		addFiles(e) {
			this.$refs.manageDocuments.addFile(e);
		},
	},
};
</script>

<style scoped>
.drag-file input {
	position: absolute;
	margin: 0;
	padding: 0;
	width: 3%;
	height: 6%;
	outline: none;
	opacity: 0;
	cursor: pointer !important;
}
.custom-file-input::before {
  content: '';
  display: inline-block;
  background: linear-gradient(top, #f9f9f9, #e3e3e3);
  border: 1px solid #999;
  border-radius: 3px;
  padding: 5px 8px;
  outline: none;
  white-space: nowrap;
  -webkit-user-select: none;
  cursor: pointer;
  text-shadow: 1px 1px #fff;
  font-weight: 700;
  font-size: 10pt;
}
</style>