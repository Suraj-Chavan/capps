<template>
	<div>
		<!-- Modal Mode -->
		<b-modal
			v-if="displayMode === 'modal'"
			v-model="showModal"
			:size="modalSize"
			hide-footer
			no-close-on-backdrop
			no-close-on-esc
			header-class="p-3"
			content-class="module-modal-content"
			centered
			scrollable
			@hidden="handleModalClose"
		>
			<template #modal-header="{ titleId }">
				<div class="w-100 d-flex justify-content-between align-items-center">
					<div class="modal-title-section">
						<h4 :id="titleId" class="modal-title mb-0">{{ title }}</h4>
					</div>
					
					<div class="modal-actions d-flex align-items-center">
						<b-button
							variant="link"
							class="p-1"
							@click="closeModal"
						>
							<b-icon icon="x" />
						</b-button>
					</div>
				</div>
			</template>

			<div class="module-content">
				<slot />
			</div>
		</b-modal>

		<!-- Fullscreen Mode -->
		<div v-else-if="displayMode === 'fullscreen'" class="fullscreen-module">
			<header class="fullscreen-header">
				<div class="container-fluid">
					<div class="section-header d-flex justify-content-between align-items-center px-0 py-3">
						<div class="d-flex flex-column">
							<h4 class="mb-0 font-weight-bold">{{ title }}</h4>
						</div>
						
						<div class="d-flex align-items-center" style="gap: 0.25rem;">
							<button
								type="button"
								class="btn btn-outline-secondary btn-sm d-flex align-items-center"
								@click="navigateBack"
								style="font-size: 0.875rem; padding: 0.375rem 0.75rem;"
							>
								<b-icon icon="x" class="mr-1" font-scale="1" />
								<span>Close</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			<main class="fullscreen-content">
				<div class="container-fluid py-4">
					<slot />
				</div>
			</main>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ModuleDisplayWrapper',
	props: {
		displayMode: {
			type: String,
			default: 'modal',
			validator: value => ['modal', 'fullscreen'].includes(value)
		},
		title: {
			type: String,
			required: true
		},
		modalSize: {
			type: String,
			default: 'lg',
			validator: value => ['sm', 'md', 'lg', 'xl'].includes(value)
		},
			allowFullscreen: {
			type: Boolean,
			default: true
		},
		allowModal: {
			type: Boolean,
			default: true
		}
	},

	data() {
		return {
			showModal: true
		};
	},

	methods: {
		closeModal() {
			this.showModal = false;
		},

		handleModalClose() {
			this.navigateBack();
		},

		navigateBack() {
			this.$emit('navigate-back');
		},

		openFullscreen() {
			this.$emit('open-fullscreen');
		},

		openModal() {
			this.$emit('open-modal');
		}
	}
};
</script>

<style scoped>
.module-modal-content {
	max-height: 85vh;
}

.modal-title-section {
	flex-grow: 1;
	min-width: 0;
}

.modal-actions {
	flex-shrink: 0;
}

.module-content {
	min-height: 300px;
}

.fullscreen-module {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1050;
	background: white;
	display: flex;
	flex-direction: column;
}

.fullscreen-header {
	flex-shrink: 0;
	border-bottom: 1px solid #e9ecef;
	background: white;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Section header styles to match InputForm */
.section-header {
	position: relative;
	overflow: visible !important;
	z-index: 1000;
}

.section-header .btn {
	font-weight: 500;
	box-shadow: 0 1px 4px rgba(60,60,100,0.08);
	transition: box-shadow 0.18s, background 0.18s;
}

.section-header .btn:focus, .section-header .btn:hover {
	box-shadow: 0 2px 8px rgba(60,60,100,0.16);
}

/* CAPPS button styles */
.capps-btn {
	font-weight: 600;
	font-size: 1.08rem;
	padding: 0.45rem 1.3rem;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s ease;
	text-decoration: none;
}

.capps-btn:focus, .capps-btn:hover {
	box-shadow: 0 2px 8px rgba(60,60,100,0.12);
	text-decoration: none;
}

.capps-btn-light {
	background: #f8fafc;
	color: #22223b;
	border: 1.2px solid #e3e8f0;
}

.capps-btn-light:focus, .capps-btn-light:hover {
	background: #f1f5f9;
	color: #22223b;
	border-color: #b6c6e3;
}

.capps-btn,
.capps-btn .capps-btn-text {
	font-weight: 500 !important;
}

.fullscreen-content {
	flex-grow: 1;
	overflow-y: auto;
	background: #f8f9fa;
}

.header-left h1 {
	color: #212529;
}

.header-actions {
	flex-shrink: 0;
}

@media (max-width: 768px) {
	.modal-title-section h4 {
		font-size: 1.1rem;
	}
	
	.fullscreen-header .container-fluid {
		padding-left: 1rem;
		padding-right: 1rem;
	}
	
	.header-left h1 {
		font-size: 1.25rem;
	}
	
	.header-actions .btn {
		font-size: 0.875rem;
		padding: 0.375rem 0.75rem;
	}
}
</style>