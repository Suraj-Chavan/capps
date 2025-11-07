import capps from "capps";

export const AttachmentsMixin = {
	data() {
		return {
			isAttachmentsLoading: false,
			isAttachmentsUploading: false,
			ATTACHMENTS: [],
			selectedFile: null,
			isDragOver: false
		};
	},

	methods: {
		async loadAttachmentsData() {
			if (!this.id) return;
			this.isAttachmentsLoading = true;
			this.ATTACHMENTS = [];
			try {
				const response = await capps.rest[this.moduleName].attachments.read({
					filter:[
						{
							field: "RECORD_ID",
							value: this.id, 
							asgn:"eq",
							type: "string"
						},
						{
							field: "COLLECTION_NAME",
							value: this.collection, 
							asgn:"eq",
							type: "string"
						}
					]
				}, { loader: false, cache: false });
				this.ATTACHMENTS = response;
			} catch (error) {
				console.error("Error fetching attachments:", error);
				capps.ui.toast({
					message: "Failed to load attachments.",
					variant: "danger"
				});
			} finally {
				setTimeout(() => {
					this.isAttachmentsLoading = false;
				}, 1000)
			}
		},

		async ensureAttachmentsLoaded() {
			// Load attachments if an ID is present and not currently loading.
			if (this.id && !this.isAttachmentsLoading) {
				await this.loadAttachmentsData();
			}
		},

		handleFileChange(event) {
			const files = event.target.files;
			if (files && files.length > 0) {
				this.uploadFiles(files);
			}
		},

		handleDrop(event) {
			this.isDragOver = false;
			const files = event.dataTransfer.files;
			if (files && files.length > 0) {
				this.uploadFiles(files);
			}
		},

		handleDragOver(event) {
			this.isDragOver = true;
		},

		handleDragLeave(event) {
			this.isDragOver = false;
		},

		triggerFileInput() {
			if (this.$refs.fileInput) {
				this.$refs.fileInput.click();
			}
		},

		async uploadFiles(files) {
			if (!this.id || this.restrictAttachments) return;

			this.isAttachmentsUploading = true;
			
			try {
				for (let file of files) {
					await this.uploadSingleFile(file);
				}
				
				// Reload attachments after successful upload
				await this.loadAttachmentsData();
				
				// Emit event to notify parent component
				this.$emit('module-updated', {
					type: 'attachments',
					action: 'upload',
					message: 'Attachments uploaded successfully'
				});
			} catch (error) {
				console.error('Error uploading files:', error);
				capps.ui.toast({
					message: "Error uploading files. Please try again.",
					variant: "danger"
				});
			} finally {
				this.isAttachmentsUploading = false;
				// Clear the file input
				if (this.$refs.fileInput) {
					this.$refs.fileInput.value = '';
				}
			}
		},

		async uploadSingleFile(file) {
			if (!this.selectedFile && file) {
				this.selectedFile = file;
			}
			
			return this.uploadAttachment();
		},

		async uploadAttachment() {
			if (!this.selectedFile) {
				capps.ui.toast({
					message: "Please select a file to upload.",
					variant: "warning"
				});
				return;
			}
			if (!this.id) {
				capps.ui.toast({
					message: "Cannot upload attachment: Record ID is missing.",
					variant: "danger"
				});
				return;
			}

			const FILE = this.selectedFile;
			const FILE_NAME = FILE.name || "";
			let FILETYPE = FILE_NAME.split(".");
			FILETYPE = (FILETYPE[FILETYPE.length - 1] || "").toLowerCase();
			const SIZE = FILE.size;

			const formData = new FormData();
			formData.append('COLLECTION_NAME', this.collection);
			formData.append('RECORD_ID', this.id);
			formData.append('FILEOBJECT', FILE);
			formData.append('FILENAME', FILE_NAME);
			formData.append('FILETYPE', FILETYPE);
			formData.append('FILE_SIZE', SIZE);
			formData.append('REMARKS', `File uploaded for ${this.moduleName}.${this.collection}.${this.id}`);

			try {
				const response = await capps.rest[this.moduleName].attachments.create(formData, { multiPart: true, loader: false }, { "Content-Type": "multipart/form-data" });
				await this.$responseHandler(response, () => {}, this, "noRouteChange");
				
				const uploadedFileName = this.selectedFile ? this.selectedFile.name : 'Unknown file';
				this.selectedFile = null;
				if (this.$refs.fileInput) {
					this.$refs.fileInput.reset && this.$refs.fileInput.reset();
				}
				if (response.status !== "unsuccess") {
					await this.loadAttachmentsData();
					
					// Emit event to notify parent component
					this.$emit('module-updated', {
						type: 'attachments',
						action: 'upload',
						message: `File "${uploadedFileName}" uploaded successfully`
					});
				}
			} catch (error) {
				console.error("Error uploading attachment:", error);
				const fileName = this.selectedFile ? this.selectedFile.name : 'Unknown file';
				capps.ui.toast({
					message: `Failed to upload file "${fileName}".`,
					variant: "danger"
				});
			}
		},

		async downloadAttachment(attachment) {
			if (!this.id || !attachment.ID) return;
			try {
				this.$showNotificationSpinner("Downloading. Please Wait ...");
				const result = await capps.rest[this.moduleName].attachments.get_file[attachment.ID]({}, { loader: false, parseBlob: true });
				if (result.status === "unsuccess") {
					this.$_showAlert("Alert!!", result.error || "Something unexpected happened");
					return this.$closeNotificationSpinner();
				}
				var blob = new Blob([result]);
				var url = window.URL.createObjectURL(blob);
				var a = document.createElement("a");
				a.href = url;
				a.download = attachment.FILENAME;
				this.$closeNotificationSpinner();
				a.click();
			} catch (error) {
				console.error("Error downloading attachment:", error);
				capps.ui.toast({
					message: "Error downloading file. Please try again.",
					variant: "danger"
				});
			} finally {}
		},

		async confirmDeleteAttachment(attachment) {
			const confirmed = await this.$_confirmMessage({
				title: 'Confirm Deletion',
				msg: `Are you sure you want to delete the attachment "${attachment.FILENAME}"? This action cannot be undone.`,
				okTitle: 'Delete', 
				cancelTitle: 'Cancel', 
				okVariant: 'danger'
			});
			if (confirmed) {
				this.deleteAttachment(attachment);
			}
		},

		async deleteAttachment(attachment) {
			if (!this.id || !attachment.ID) return;

			this.isAttachmentsLoading = true;
			try {
				const response = await capps.rest[this.moduleName].attachments.delete[attachment.ID]({}, { loader: false });
				await this.$responseHandler(response, () => {}, this, "noRouteChange");
				await this.loadAttachmentsData();
				
				// Emit event to notify parent component
				this.$emit('module-updated', {
					type: 'attachments',
					action: 'delete',
					message: `File "${attachment.FILENAME}" deleted successfully`
				});
			} catch (error) {
				console.error("Error deleting attachment:", error);
				capps.ui.toast({
					message: `Failed to delete "${attachment.FILENAME}".`,
					variant: "danger"
				});
			} finally {
				this.isAttachmentsLoading = false;
			}
		},

		getFileIcon(filename) {
			if (!filename) return 'file-earmark';
			const extension = filename.split('.').pop().toLowerCase();
			const iconMap = {
				pdf: 'file-earmark-pdf', 
				doc: 'file-earmark-word', 
				docx: 'file-earmark-word', 
				csv: 'file-earmark-excel',
				xls: 'file-earmark-excel', 
				xlsx: 'file-earmark-excel', 
				ppt: 'file-earmark-ppt',
				pptx: 'file-earmark-ppt', 
				txt: 'file-earmark-text', 
				jpg: 'file-image',
				jpeg: 'file-image', 
				png: 'file-image', 
				gif: 'file-image', 
				zip: 'file-earmark-zip',
				rar: 'file-earmark-zip'
			};
			return iconMap[extension] || 'file-earmark';
		},

		formatFileSize(bytes) {
			if (!bytes || bytes === 0) return '0 Bytes';
			
			const k = 1024;
			const sizes = ['Bytes', 'KB', 'MB', 'GB'];
			const i = Math.floor(Math.log(bytes) / Math.log(k));
			
			return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
		}
	}
};