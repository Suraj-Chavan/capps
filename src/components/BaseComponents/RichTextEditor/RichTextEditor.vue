<template>
	<div class="rich-text-editor" :class="{ 'disabled': disabled }">
		<quill-editor
			:value="value"
			@input="updateValue"
			ref="myQuillEditor"
			:options="editorOptions"
			@blur="onEditorBlur($event)"
			@focus="onEditorFocus($event)"
			@ready="onEditorReady($event)"
		/>
	</div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css' 
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'

export default {
	name: 'RichTextEditor',
	components: {
		quillEditor
	},
	props: {
		value: {
			type: [String, Number],
			default: ''
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			editorOption: {
				modules: {
					toolbar: [
						['bold', 'italic', 'underline', 'strike'],
						['blockquote', 'code-block'],
						[{ 'list': 'ordered'}, { 'list': 'bullet' }],
						[{ 'color': [] }, { 'background': [] }],
						[{ 'align': [] }],
						['link'],
						['clean']
					],
				},
				placeholder: 'Start writing...',
				theme: 'snow',
				formats: ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'list', 'color', 'background', 'align', 'link'],
				readOnly: this.disabled
			}
		}
	},
	computed: {
		editorOptions() {
			return {
				...this.editorOption,
				readOnly: this.disabled
			}
		}
	},
	watch: {
		disabled(newVal) {
			if (this.$refs.myQuillEditor && this.$refs.myQuillEditor.quill) {
				this.$refs.myQuillEditor.quill.enable(!newVal)
			}
		}
	},
	mounted() {
		// Wait for editor to be ready
		this.$nextTick(() => {
			if (this.$refs.myQuillEditor && this.$refs.myQuillEditor.quill) {
				const editor = this.$refs.myQuillEditor.quill
				
				// Prevent paste of binary data
				editor.root.addEventListener('paste', (e) => {
					const clipboardData = e.clipboardData
					if (clipboardData) {
						const items = clipboardData.items
						for (let i = 0; i < items.length; i++) {
							if (items[i].type.indexOf('image') !== -1 || items[i].type.indexOf('video') !== -1) {
								e.preventDefault()
								return false
							}
						}
					}
				})

				// Set initial disabled state
				if (this.disabled) {
					editor.disable()
				}
			}
		})
	},
	methods: {
		updateValue(html) {
			this.$emit('input', html)
		},
		onEditorBlur(quill) {
			this.$emit('blur', quill)
		},
		onEditorFocus(quill) {
			this.$emit('focus', quill)
		},
		onEditorReady(quill) {
			this.$emit('ready', quill)
		}
	}
}
</script>

<style>
.rich-text-editor {
	position: relative;
	width: 100%;
}

.ql-container {
	min-height: 200px;
	font-size: 16px;
	font-family: inherit;
}

.ql-editor {
	min-height: 200px;
	padding: 12px;
}

.ql-toolbar.ql-snow {
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
	background-color: #f8f9fa;
}

.ql-container.ql-snow {
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
}

/* Basic text input styles */
.ql-editor p {
	margin: 0;
	padding: 0;
}

.ql-editor {
	white-space: pre-wrap;
	word-wrap: break-word;
}

/* Ensure text input works properly */
.ql-editor[contenteditable="true"] {
	-webkit-user-modify: read-write;
	overflow-wrap: break-word;
	-webkit-line-break: after-white-space;
}

/* Disable image and video drag and drop */
.ql-editor img,
.ql-editor video {
	pointer-events: none;
	user-select: none;
}

/* Ensure text input works properly */
.ql-editor[contenteditable="true"] {
	text-transform: none !important;
}

/* Disabled state styles */
.rich-text-editor.disabled .ql-toolbar.ql-snow {
	opacity: 0.6;
	pointer-events: none;
}

.rich-text-editor.disabled .ql-container.ql-snow {
	background-color: #f8f9fa;
	opacity: 0.8;
}

.rich-text-editor.disabled .ql-editor {
	cursor: not-allowed;
}
</style>