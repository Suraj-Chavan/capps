<template>
	<ModuleDisplayWrapper
		:display-mode="displayMode"
		:title="moduleTitle"
		:modal-size="modalSize"
		@navigate-back="navigateBack"
		@open-fullscreen="openInFullscreen"
		@open-modal="openInModal"
	>
		<div v-if="isModuleLoading" class="text-center py-5">
			<b-spinner class="mb-3"></b-spinner>
			<p class="text-muted">Loading {{ moduleTitle }}...</p>
		</div>

		<div v-else-if="moduleLoadError" class="alert alert-danger">
			<h5>
				<b-icon icon="exclamation-triangle" class="mr-2" />
				Module Load Error
			</h5>
			<p class="mb-0">{{ moduleLoadError }}</p>
			<hr>
			<b-button variant="outline-danger" size="sm" @click="retryLoadModule">
				<b-icon icon="arrow-clockwise" class="mr-1" />
				Retry
			</b-button>
		</div>

		<component
			v-else-if="moduleComponent"
			:is="moduleComponent"
			v-bind="moduleProps"
			@module-updated="handleModuleUpdate"
			@navigate="handleModuleNavigation"
		/>

		<div v-else class="alert alert-warning">
			<h5>
				<b-icon icon="question-circle" class="mr-2" />
				Module Not Found
			</h5>
			<p class="mb-0">The requested module "{{ moduleType }}" could not be found or loaded.</p>
		</div>
	</ModuleDisplayWrapper>
</template>

<script>
import { ModuleDisplayMixin } from '../FormComponents/Mixins/ModuleDisplayMixin.js';
import { mapState } from "vuex";
import ModuleDisplayWrapper from './ModuleDisplayWrapper.vue';

export default {
	name: 'ModuleDisplay',
	components: {
		ModuleDisplayWrapper
	},
	mixins: [ModuleDisplayMixin],
	props: {
		moduleName: {
			type: String,
			required: true
		},
		collection: {
			type: String,
			required: true
		},
		moduleType: {
			type: String,
			required: true
		},
		id: {
			type: [String, Number],
			required: true
		},
		displayMode: {
			type: String,
			default: 'modal',
			validator: value => ['modal', 'fullscreen'].includes(value)
		},
		action: {
			type: String,
			default: 'view'
		},
		audit_id: {
			type: [String, Number],
			default: null
		},
		redirectTo: {
			type: String,
			default: null
		}
	},

	data() {
		return {
			moduleLoadError: null,
			previousDocumentTitle: null // Store previous title for restoration
		};
	},

	computed: {
		...mapState("CollectionBlock", ["collectionSchemaDetails"]),
		
		moduleTitle() {
			return this.getModuleTitle();
		},

		modalSize() {
			return this.getModalSize();
		},

		moduleProps() {
			return this.getModuleProps();
		},

		moduleEnabled() {
			return this.isModuleEnabled();
		}
	},

	async created() {
		// Check if module is enabled
		if (!this.moduleEnabled) {
			this.moduleLoadError = `Module "${this.moduleType}" is not enabled for this collection.`;
			return;
		}

		await this.loadModule();
	},

	methods: {
		async loadModule() {
			this.isModuleLoading = true;
			this.moduleLoadError = null;

			try {
				this.moduleComponent = await this.getModuleComponent();
				
				if (!this.moduleComponent) {
					this.moduleLoadError = `Module "${this.moduleType}" could not be loaded.`;
				}
			} catch (error) {
				console.error('Error loading module:', error);
				this.moduleLoadError = `Failed to load module "${this.moduleType}": ${error.message}`;
			} finally {
				this.isModuleLoading = false;
			}
		},

		async retryLoadModule() {
			await this.loadModule();
		},

		handleModuleUpdate(data) {
			// Handle updates from the module component
			this.$emit('module-updated', data);
		},

		handleModuleNavigation(route) {
			// Handle navigation requests from the module component
			if (route) {
				this.$router.push(route);
			}
		},

		setDocumentTitle() {
			const parts = [];
			
			if (this.moduleTitle) {
				parts.push(this.moduleTitle);
			}
			
			if (this.collection) {
				parts.push(this.collection);
			}
			
			if (this.moduleName) {
				parts.push(this.moduleName);
			}
			
			parts.push('CAPPS');
			
			document.title = parts.join(' :: ');
		}
	},

	watch: {
		moduleType: {
			immediate: false,
			handler() {
				this.loadModule();
			}
		}
	},

	mounted() {
		// Store the previous document title before setting new one
		this.previousDocumentTitle = document.title;
		this.setDocumentTitle();
	},

	beforeDestroy() {
		// Restore previous document title when component is destroyed
		if (this.previousDocumentTitle) {
			document.title = this.previousDocumentTitle;
		}
	}
};
</script>

<style scoped>
.alert {
	border-radius: 8px;
}

.alert h5 {
	margin-bottom: 0.75rem;
}

.alert hr {
	margin: 1rem 0;
}

/* Module-specific styling */
.module-loading {
	min-height: 300px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	background: #f8f9fa;
	border-radius: 8px;
	border: 1px solid #e9ecef;
}

.module-error {
	background: #fff5f5;
	border: 1px solid #fed7d7;
	border-radius: 8px;
	padding: 2rem;
}

.module-error h5 {
	color: #c53030;
}

.module-not-found {
	background: #fffbf0;
	border: 1px solid #fbbf24;
	border-radius: 8px;
	padding: 2rem;
	text-align: center;
}

.module-not-found h5 {
	color: #92400e;
}
</style>

<!-- Global module styles for dynamic components -->
<style>
/* Custom module wrapper styling */
.custom-module-wrapper {
	background: white;
	border-radius: 8px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

.module-header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	padding: 1.5rem;
	border-bottom: 1px solid #e9ecef;
}

.module-header h2 {
	margin: 0;
	font-weight: 600;
}

.module-content {
	padding: 1.5rem;
	min-height: 200px;
}

/* Fallback component styling */
.custom-module-fallback {
	padding: 1rem;
}

.custom-module-fallback .alert {
	margin-bottom: 1rem;
}

.custom-module-fallback ul {
	background: #f8f9fa;
	border: 1px solid #e9ecef;
	border-radius: 6px;
	padding: 1rem;
	margin: 0;
}

.custom-module-fallback li {
	padding: 0.25rem 0;
	border-bottom: 1px solid #e9ecef;
}

.custom-module-fallback li:last-child {
	border-bottom: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.module-header {
		padding: 1rem;
	}
	
	.module-content {
		padding: 1rem;
	}
	
	.module-header h2 {
		font-size: 1.25rem;
	}
}
</style>