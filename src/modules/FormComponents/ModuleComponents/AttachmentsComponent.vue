<template>
	<div class="tw-scope">
		<div class="mb-6 "> <!--border-blue-700 border-1-->
			<!-- Hidden file input - supports multiple files -->
			<input ref="fileInput" type="file" class="d-none" @change="handleFileChange" multiple />

			<!-- Drag & Drop Area - Only show for non-view actions -->
			<div
				v-if="!restrictAttachments"
				class="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center py-8 px-6 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 mb-5"
				@drop.prevent="handleDrop"
				@dragover.prevent="handleDragOver"
				@dragleave="handleDragLeave"
				@click="triggerFileInput"
				:class="{ 'border-blue-500 bg-blue-50': isDragOver }"
			>
				<div class="flex flex-col items-center">
					<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
						<b-icon icon="cloud-upload" font-scale="2" class="text-blue-600" />
					</div>
					<div class="text-lg font-semibold text-gray-800 mb-1">Drag & drop your files here</div>
					<div class="text-sm text-gray-600">
						or <span class="text-blue-600 font-medium underline cursor-pointer hover:text-blue-700" @click.stop="triggerFileInput">browse files</span> on your computer
					</div>
					<div class="text-xs text-gray-500 mt-3">
						Supports multiple files
					</div>
				</div>
			</div>

			<!-- Attachments Header & List -->
			<div>
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-xl font-semibold text-gray-800">
						Attachments
					</h2>
					<span v-if="ATTACHMENTS.length > 0" class="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-sm font-medium">
						{{ ATTACHMENTS.length }} {{ ATTACHMENTS.length === 1 ? 'file' : 'files' }}
					</span>
				</div>

				<div v-if="isAttachmentsLoading" class="text-center py-8">
					<b-spinner variant="primary" class="mb-2"></b-spinner>
					<p class="text-gray-600 text-sm">Loading attachments...</p>
				</div>

				<div v-else-if="ATTACHMENTS.length === 0" class="text-center py-12 px-4 bg-gray-50 rounded-xl border border-gray-200">
					<div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
						<b-icon icon="paperclip" font-scale="1.5" class="text-gray-400" />
					</div>
					<p class="text-gray-600 font-medium mb-1">No attachments yet</p>
					<p class="text-gray-500 text-sm">Files you upload will appear here</p>
				</div>

				<div v-else class="space-y-2">
					<div
						v-for="attachment in ATTACHMENTS"
						:key="attachment.ID"
						class="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex items-start p-4 group"
					>
						<div class="flex items-start w-full">
							<div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
								<b-icon :icon="getFileIcon(attachment.FILENAME)" font-scale="1.3" class="text-blue-600" />
							</div>

							<div class="flex-grow min-w-0 overflow-hidden">
								<a
									href="javascript:void(0)"
									class="block font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors duration-150 mb-1 truncate"
									@click="downloadAttachment(attachment)"
									:title="attachment.FILENAME"
								>
									{{ attachment.FILENAME }}
								</a>
								<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
									<span class="font-medium">{{ formatFileSize(attachment.FILE_SIZE) }}</span>
									<span class="text-gray-400">•</span>
									<span>{{ attachment.UPDATED_BY }}</span>
									<span class="text-gray-400">•</span>
									<span>{{ formatDate(attachment.UPDATED_ON) }}</span>
								</div>
							</div>

							<div class="flex-shrink-0 flex items-center gap-2 ml-3">
								<span class="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
									{{ formatTime(attachment.UPDATED_ON) }}
								</span>
								<!-- Only show delete button for non-view actions -->
								<b-button
									v-if="!restrictAttachments"
									variant="link"
									class="p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
									@click="confirmDeleteAttachment(attachment)"
									title="Delete Attachment"
								>
									<b-icon icon="trash" font-scale="1" />
								</b-button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { AttachmentsMixin } from '../Mixins/AttachmentsMixin.js';
import moment from "moment";
import { globalDateFormatLong } from "config";

export default {
	name: 'AttachmentsComponent',
	mixins: [AttachmentsMixin],
	props: {
		id: {
			type: [String, Number],
			required: true
		},
		collection: {
			type: String,
			required: true
		},
		moduleName: {
			type: String,
			required: true
		},
		action: {
			type: String,
			default: 'view'
		},
		autoLoad: {
			type: Boolean,
			default: true
		},
		restrictAttachments: {
			type: Boolean,
			default: false
		}
	},

	computed: {
		dataModelName() {
			return this.collection;
		}
	},

	async mounted() {
		if (this.autoLoad && this.id) {
			await this.loadAttachmentsData();
		}
	},

	methods: {
		formatDate(date) {
			if (!date) return '';
			return moment(date, globalDateFormatLong).format('MMM Do, YYYY');
		},

		formatTime(date) {
			if (!date) return '';
			// HH:MM AM/PM
			return moment(date, globalDateFormatLong).format('h:mm A');
		}
	}
};
</script>

<style scoped>
/* Responsive adjustments for mobile */
@media (max-width: 600px) {
	.bg-gray-50.rounded-xl {
		flex-direction: column;
		align-items: stretch;
	}
	
	.flex.items-center.justify-end {
		justify-content: flex-start;
		margin-left: 0;
		margin-top: 6px;
	}
}
</style>