import capps from "capps";

export const AttachmentsMixin = {
	data() {
		return {
			isAttachmentsLoading: false,
			isAttachmentsUploading: false,
			ATTACHMENTS: [],
			selectedFile: null,
			isDragOver: false,
			restrictAttachments: false
		};
	},

	methods: {
		async loadAttachmentsData() {
			if (!this.id || this.isAttachmentsLoading) return;
			
			this.isAttachmentsLoading = true;
			try {
				const response = await capps.rest[this.moduleName][this.collection].attachments(this.id, {}, { loader: false });
				this.ATTACHMENTS = response?.data || [];
			} catch (error) {
				console.error('Error loading attachments:', error);
				this.ATTACHMENTS = [];
			} finally {
				this.isAttachmentsLoading = false;
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
					const formData = new FormData();
					formData.append('file', file);
					formData.append('collection', this.collection);
					formData.append('record_id', this.id);
					formData.append('module_name', this.moduleName);

					await capps.rest[this.moduleName][this.collection].upload(this.id, formData, { loader: false });
				}
				
				// Reload attachments after successful upload
				await this.loadAttachmentsData();
				this.$_successMessage('Files uploaded successfully!');
			} catch (error) {
				console.error('Error uploading files:', error);
				this.$_errorMessage('Error uploading files. Please try again.');
			} finally {
				this.isAttachmentsUploading = false;
				// Clear the file input
				if (this.$refs.fileInput) {
					this.$refs.fileInput.value = '';
				}
			}
		},

		async downloadAttachment(attachment) {
			try {
				const response = await capps.rest[this.moduleName][this.collection].download(this.id, {
					attachment_id: attachment.ID
				}, { loader: false });
				
				// Handle download response
				if (response && response.url) {
					window.open(response.url, '_blank');
				}
			} catch (error) {
				console.error('Error downloading attachment:', error);
				this.$_errorMessage('Error downloading file. Please try again.');
			}
		},

		async confirmDeleteAttachment(attachment) {
			const confirmed = await this.$_confirmMessage({
				size: "md",
				msg: `Are you sure you want to delete "${attachment.FILENAME}"?`,
			});
			
			if (confirmed) {
				await this.deleteAttachment(attachment);
			}
		},

		async deleteAttachment(attachment) {
			try {
				await capps.rest[this.moduleName][this.collection].deleteAttachment(this.id, {
					attachment_id: attachment.ID
				}, { loader: false });
				
				// Remove from local array
				this.ATTACHMENTS = this.ATTACHMENTS.filter(att => att.ID !== attachment.ID);
				this.$_successMessage('Attachment deleted successfully!');
			} catch (error) {
				console.error('Error deleting attachment:', error);
				this.$_errorMessage('Error deleting attachment. Please try again.');
			}
		},

		getFileIcon(filename) {
			if (!filename) return 'file-earmark';
			
			const extension = filename.split('.').pop()?.toLowerCase();
			const iconMap = {
				// Images
				'jpg': 'file-image',
				'jpeg': 'file-image',
				'png': 'file-image',
				'gif': 'file-image',
				'bmp': 'file-image',
				'svg': 'file-image',
				
				// Documents
				'pdf': 'file-pdf',
				'doc': 'file-word',
				'docx': 'file-word',
				'xls': 'file-excel',
				'xlsx': 'file-excel',
				'ppt': 'file-ppt',
				'pptx': 'file-ppt',
				'txt': 'file-text',
				'rtf': 'file-text',
				
				// Archives
				'zip': 'file-zip',
				'rar': 'file-zip',
				'7z': 'file-zip',
				'tar': 'file-zip',
				'gz': 'file-zip',
				
				// Code files
				'js': 'file-code',
				'html': 'file-code',
				'css': 'file-code',
				'json': 'file-code',
				'xml': 'file-code',
				'sql': 'file-code',
				
				// Media
				'mp3': 'file-music',
				'wav': 'file-music',
				'mp4': 'file-play',
				'avi': 'file-play',
				'mov': 'file-play'
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