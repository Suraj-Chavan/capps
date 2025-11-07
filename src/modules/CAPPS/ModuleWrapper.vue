<template>
	<div class="module-wrapper">
		<!-- Module Header -->
		<div class="module-header" v-if="showHeader">
			<div class="module-header-content">
				<div class="module-title-section">
					<h3 class="module-title">{{ moduleTitle }}</h3>
					<p class="module-subtitle" v-if="moduleSubtitle">{{ moduleSubtitle }}</p>
				</div>
				<div class="module-actions" v-if="$slots.actions">
					<slot name="actions"></slot>
				</div>
			</div>
		</div>

		<!-- Module Content -->
		<div class="module-content" :class="{ 'with-header': showHeader }">
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ModuleWrapper',
	props: {
		moduleTitle: {
			type: String,
			required: false
		},
		moduleSubtitle: {
			type: String,
			required: false
		},
		showHeader: {
			type: Boolean,
			default: true
		},
		moduleType: {
			type: String,
			required: false
		},
		collection: {
			type: String,
			required: false
		},
		recordId: {
			type: [String, Number],
			required: false
		}
	},

	computed: {
		computedTitle() {
			if (this.moduleTitle) {
				return this.moduleTitle;
			}
			
			// Default titles for framework modules
			const defaultTitles = {
				'comments': 'Comments',
				'attachments': 'Attachments', 
				'connections': 'Connections',
				'history': 'Version History'
			};
			
			return defaultTitles[this.moduleType] || this.formatModuleType(this.moduleType) || 'Module';
		},

		computedSubtitle() {
			if (this.moduleSubtitle) {
				return this.moduleSubtitle;
			}

			if (this.collection && this.recordId) {
				return `${this.formatCollectionName(this.collection)} - Record ${this.recordId}`;
			}

			return null;
		}
	},

	methods: {
		formatModuleType(moduleType) {
			if (!moduleType) return '';
			
			return moduleType
				.replace(/[-_]/g, ' ')
				.replace(/\b\w/g, l => l.toUpperCase());
		},

		formatCollectionName(collection) {
			if (!collection) return '';
			
			return collection
				.replace(/[-_]/g, ' ')
				.replace(/\b\w/g, l => l.toUpperCase());
		}
	}
};
</script>

<style scoped>
.module-wrapper {
	background: white;
	border-radius: 8px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	overflow: hidden;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.module-header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	padding: 1rem 1.5rem;
	border-bottom: 1px solid #e9ecef;
	flex-shrink: 0;
}

.module-header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
}

.module-title-section {
	flex: 1;
	min-width: 0;
}

.module-title {
	margin: 0;
	font-size: 1.25rem;
	font-weight: 600;
	color: white;
	line-height: 1.2;
}

.module-subtitle {
	margin: 0.25rem 0 0 0;
	font-size: 0.875rem;
	opacity: 0.9;
	color: white;
	line-height: 1.2;
}

.module-actions {
	flex-shrink: 0;
	display: flex;
	gap: 0.5rem;
	align-items: center;
}

.module-content {
	flex: 1;
	min-height: 0;
	overflow: auto;
}

.module-content.with-header {
	padding: 1.5rem;
}

.module-content:not(.with-header) {
	padding: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.module-header {
		padding: 1rem;
	}
	
	.module-content.with-header {
		padding: 1rem;
	}
	
	.module-title {
		font-size: 1.125rem;
	}
	
	.module-subtitle {
		font-size: 0.8rem;
	}

	.module-header-content {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.module-actions {
		width: 100%;
		justify-content: flex-end;
	}
}

/* Framework module specific styles */
.module-wrapper.comments-module .module-header {
	background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.module-wrapper.attachments-module .module-header {
	background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.module-wrapper.connections-module .module-header {
	background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.module-wrapper.history-module .module-header {
	background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
	color: #333;
}

.module-wrapper.history-module .module-title,
.module-wrapper.history-module .module-subtitle {
	color: #333;
}
</style>

<!-- Global styles for nested content -->
<style>
/* Reset some common module content styles */
.module-wrapper .module-content > * {
	margin-top: 0;
}

.module-wrapper .module-content > *:first-child {
	margin-top: 0;
}

/* Ensure proper spacing for framework modules */
.module-wrapper .comment-section-wrapper {
	padding: 0;
	background: transparent;
	border: none;
	box-shadow: none;
}

.module-wrapper .comment-section-wrapper .section-divider {
	display: none;
}

.module-wrapper .comment-section-container {
	padding: 0;
	background: transparent;
}

.module-wrapper .comment-section-header {
	display: none; /* Hide duplicate headers */
}

/* Attachments module adjustments */
.module-wrapper .attachments-container {
	padding: 0;
	background: transparent;
	border: none;
}

/* Connections module adjustments */
.module-wrapper .connections-container {
	padding: 0;
	background: transparent;
	border: none;
}

/* History module adjustments */
.module-wrapper .history-container {
	padding: 0;
	background: transparent;
	border: none;
}
</style>