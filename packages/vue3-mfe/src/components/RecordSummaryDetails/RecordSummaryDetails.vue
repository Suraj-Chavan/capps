<template>
  <Panel
    :header="header"
    :toggleable="true"
    :collapsed="collapsed"
    @update:collapsed="val => collapsed.value = val"
  >
    <template #header>
      <div class="panel-header d-flex justify-content-between align-items-center">
        <span class="font-bold">{{ header }}</span>
        <input
          ref="fileInput"
          type="file"
          class="d-none"
          @change="onFileChange"
        >
      </div>
    </template>
    <div class="attachments-modern-ui mb-4">
      <!-- Drag & Drop Area -->
      <div
        class="attachment-dropzone mb-4"
        :class="{ 'drag-over': isDragOver }"
        @drop.prevent="onDrop"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @click="triggerFileInput"
      >
        <span
          class="pi pi-cloud-upload mb-2 text-secondary"
          style="font-size: 2em;"
        />
        <div class="font-bold">
          Drag & drop your files here
        </div>
        <div class="small text-muted">
          or <span
            class="text-primary browse-link"
            @click.stop="triggerFileInput"
          >browse files</span> on your computer
        </div>
      </div>
      <!-- Uploaded Files Header & List -->
      <div class="uploaded-files-list mt-3">
        <div class="uploaded-files-header mb-2">
          Uploaded Files
        </div>
        <div
          v-if="isLoading"
          class="text-center my-4"
        >
          <span class="pi pi-spin pi-spinner" /> Loading attachments...
        </div>
        <div
          v-else-if="attachments.length === 0"
          class="text-center text-muted my-4"
        >
          No attachments found.
        </div>
        <div v-else>
          <div
            v-for="attachment in attachments"
            :key="attachment.ID"
            class="attachment-card d-flex align-items-center mb-2"
          >
            <span
              :class="getFileIcon(attachment.FILENAME) + ' mr-2 text-primary'"
              style="font-size: 1.3em;"
            />
            <div class="flex-grow-1 min-width-0">
              <a
                href="javascript:void(0)"
                class="file-title font-bold text-truncate text-primary"
                :title="attachment.FILENAME"
                style="cursor:pointer; text-decoration:underline;"
                @click="downloadAttachment(attachment)"
              >
                {{ attachment.FILENAME }}
              </a>
              <div class="file-meta small text-muted">
                {{ formatFileSize(attachment.FILE_SIZE) }} • Uploaded by {{ attachment.UPDATED_BY }} on {{ formatDate(attachment.UPDATED_ON) }}
              </div>
            </div>
            <div class="file-actions d-flex align-items-center justify-content-end">
              <span class="small text-muted mr-2">{{ formatTime(attachment.UPDATED_ON) }}</span>
              <button
                class="p-button p-button-text p-button-danger p-0 delete-btn"
                title="Delete Attachment"
                @click="deleteAttachment(attachment)"
              >
                <span class="pi pi-trash" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup>
import { ref } from 'vue';
import Panel from 'primevue/panel';

defineProps({
  header: { type: String, default: 'Attachments' },
  attachments: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['file-upload', 'file-delete', 'file-download']);

const collapsed = ref(false);
const isDragOver = ref(false);

function triggerFileInput() {
  // Open file dialog
  const input = document.querySelector('input[type="file"]');
  if (input) input.click();
}
function onFileChange(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    emit('file-upload', files);
  }
}
function onDrop(event) {
  isDragOver.value = false;
  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    emit('file-upload', files);
  }
}
function onDragOver() {
  isDragOver.value = true;
}
function onDragLeave() {
  isDragOver.value = false;
}
function deleteAttachment(attachment) {
  emit('file-delete', attachment);
}
function downloadAttachment(attachment) {
  emit('file-download', attachment);
}
function getFileIcon(filename) {
  // Simple file icon logic based on extension
  const ext = filename.split('.').pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)) return 'pi pi-image';
  if (["pdf"].includes(ext)) return 'pi pi-file-pdf';
  if (["xls", "xlsx", "csv"].includes(ext)) return 'pi pi-file-excel';
  if (["doc", "docx"].includes(ext)) return 'pi pi-file-word';
  if (["zip", "rar", "7z"].includes(ext)) return 'pi pi-file-zip';
  return 'pi pi-file';
}
function formatFileSize(size) {
  if (!size) return '';
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  return (size / (1024 * 1024)).toFixed(1) + ' MB';
}
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
}
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString();
}
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.attachments-modern-ui {
  margin-bottom: 1rem;
}
.attachment-dropzone {
  border: 2px dashed #1976d2;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  background: #f4f8fd;
  transition: background 0.2s;
}
.attachment-dropzone.drag-over {
  background: #e3f2fd;
  border-color: #1565c0;
}
.uploaded-files-list {
  margin-top: 1rem;
}
.uploaded-files-header {
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.attachment-card {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  padding: 0.5rem 1rem;
}
.file-title {
  font-weight: bold;
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
}
.file-meta {
  font-size: 0.85em;
  color: #888;
}
.file-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.delete-btn {
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  margin-left: 0.5rem;
}
</style> 