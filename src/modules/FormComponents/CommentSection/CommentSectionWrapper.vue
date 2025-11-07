<template>
	<div class="comment-section-module-wrapper">
		<!-- Comments Header -->
		<div class="comments-module-header">
			<div class="header-content">
				<div class="title-section">
					<h3 class="comments-title">Comments</h3>
					<p class="comments-subtitle" v-if="subtitle">{{ subtitle }}</p>
				</div>
				<div class="sort-section">
					<div class="comment-sort-dropdown">
						<div class="simple-dropdown" @click="toggleDropdown">
							<span class="dropdown-text">{{ sortLabel }}</span>
							<svg 
								class="dropdown-arrow" 
								:class="{ 'open': isDropdownOpen }"
								width="12" 
								height="12" 
								viewBox="0 0 12 12" 
								fill="none" 
								xmlns="http://www.w3.org/2000/svg"
							>
								<path 
									d="M3 4.5L6 7.5L9 4.5" 
									stroke="currentColor" 
									stroke-width="1.5" 
									stroke-linecap="round" 
									stroke-linejoin="round"
								/>
							</svg>
						</div>
						<div v-if="isDropdownOpen" class="dropdown-menu-custom">
							<div 
								class="dropdown-item-custom"
								:class="{ 'active': sortOrder === 'DESC' }"
								@click="setSortOrder('DESC')"
							>
								Newest First
							</div>
							<div 
								class="dropdown-item-custom"
								:class="{ 'active': sortOrder === 'ASC' }"
								@click="setSortOrder('ASC')"
							>
								Oldest First
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Comments Content -->
		<div class="comments-module-content">
			<CommentSection
				v-bind="$attrs"
				:sort-order="sortOrder"
				@update:sortOrder="sortOrder = $event"
			/>
		</div>
	</div>
</template>

<script>
import CommentSection from './CommentSection.vue';

export default {
	name: 'CommentSectionWrapper',
	components: {
		CommentSection
	},
	inheritAttrs: false,
	props: {
		collection: {
			type: String,
			required: false
		},
		recordId: {
			type: [String, Number],
			required: false
		},
		initialSortOrder: {
			type: String,
			default: 'DESC',
			validator: value => ['ASC', 'DESC'].includes(value)
		}
	},

	data() {
		return {
			sortOrder: this.initialSortOrder,
			isDropdownOpen: false
		};
	},

	computed: {
		subtitle() {
			if (this.collection && this.recordId) {
				return `${this.formatCollectionName(this.collection)} - Record ${this.recordId}`;
			}
			return null;
		},

		sortLabel() {
			return this.sortOrder === 'DESC' ? 'Newest First' : 'Oldest First';
		}
	},

	methods: {
		formatCollectionName(collection) {
			if (!collection) return '';
			
			return collection
				.replace(/[-_]/g, ' ')
				.replace(/\b\w/g, l => l.toUpperCase());
		},

		toggleDropdown() {
			this.isDropdownOpen = !this.isDropdownOpen;
		},

		setSortOrder(order) {
			this.sortOrder = order;
			this.isDropdownOpen = false;
			this.$emit('update:sortOrder', order);
		},

		closeDropdown(event) {
			if (!this.$el.contains(event.target)) {
				this.isDropdownOpen = false;
			}
		}
	},

	mounted() {
		document.addEventListener('click', this.closeDropdown);
	},

	beforeDestroy() {
		document.removeEventListener('click', this.closeDropdown);
	}
};
</script>

<style scoped>
.comment-section-module-wrapper {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: white;
	border-radius: 8px;
	overflow: hidden;
}

.comments-module-header {
	background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	color: white;
	padding: 1rem 1.5rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	flex-shrink: 0;
}

.header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
}

.title-section {
	flex: 1;
	min-width: 0;
}

.comments-title {
	margin: 0;
	font-size: 1.25rem;
	font-weight: 600;
	color: white;
	line-height: 1.2;
}

.comments-subtitle {
	margin: 0.25rem 0 0 0;
	font-size: 0.875rem;
	opacity: 0.9;
	color: white;
	line-height: 1.2;
}

.sort-section {
	flex-shrink: 0;
}

.comment-sort-dropdown {
	position: relative;
}

.simple-dropdown {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	background: rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s ease;
	color: white;
	font-size: 0.875rem;
}

.simple-dropdown:hover {
	background: rgba(255, 255, 255, 0.25);
	border-color: rgba(255, 255, 255, 0.3);
}

.dropdown-text {
	font-weight: 500;
}

.dropdown-arrow {
	transition: transform 0.2s ease;
	opacity: 0.8;
}

.dropdown-arrow.open {
	transform: rotate(180deg);
}

.dropdown-menu-custom {
	position: absolute;
	top: calc(100% + 0.25rem);
	right: 0;
	min-width: 140px;
	background: white;
	border: 1px solid #e9ecef;
	border-radius: 6px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	z-index: 1000;
	overflow: hidden;
}

.dropdown-item-custom {
	padding: 0.75rem 1rem;
	color: #495057;
	cursor: pointer;
	transition: all 0.2s ease;
	font-size: 0.875rem;
	border-bottom: 1px solid #f8f9fa;
}

.dropdown-item-custom:last-child {
	border-bottom: none;
}

.dropdown-item-custom:hover {
	background: #f8f9fa;
	color: #212529;
}

.dropdown-item-custom.active {
	background: #e3f2fd;
	color: #1976d2;
	font-weight: 500;
}

.comments-module-content {
	flex: 1;
	min-height: 0;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.comments-module-header {
		padding: 1rem;
	}
	
	.comments-title {
		font-size: 1.125rem;
	}
	
	.comments-subtitle {
		font-size: 0.8rem;
	}

	.header-content {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.sort-section {
		width: 100%;
		display: flex;
		justify-content: flex-end;
	}
}
</style>

<!-- Global styles to hide nested CommentSection headers -->
<style>
.comment-section-module-wrapper .comment-section-wrapper .comment-section-header {
	display: none !important;
}

.comment-section-module-wrapper .comment-section-wrapper .section-divider {
	display: none !important;
}

.comment-section-module-wrapper .comment-section-wrapper {
	padding: 0;
	background: transparent;
	border: none;
	box-shadow: none;
}

.comment-section-module-wrapper .comment-section-container {
	padding: 1.5rem;
	background: transparent;
	height: 100%;
	overflow: auto;
}
</style>