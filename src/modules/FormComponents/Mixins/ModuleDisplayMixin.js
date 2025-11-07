import { interpolate } from "../../../Framework/utility/utility.js";
import capps from "capps";

export const ModuleDisplayMixin = {
	data() {
		return {
			isModuleLoading: false,
			moduleComponent: null,
			explicitModuleTitle: '' // Renamed to avoid conflict with computed property
		};
	},

	computed: {
		isFrameworkModule() {
			const FRAMEWORK_MODULES = ['attachments', 'connections', 'comments', 'history'];
			return FRAMEWORK_MODULES.includes(this.moduleType);
		},

		isCustomModule() {
			return !this.isFrameworkModule;
		},

		moduleComponentName() {
			if (this.isFrameworkModule) {
				return this.getFrameworkComponentName();
			}
			return 'CustomModuleComponent';
		}
	},

	methods: {
		async getModuleComponent() {
			if (this.isFrameworkModule) {
				return await this.loadFrameworkModule();
			} else {
				return await this.loadCustomModule();
			}
		},

		async loadFrameworkModule() {
			const componentMap = {
				'attachments': () => import('../ModuleComponents/AttachmentsComponent.vue'),
				'connections': () => import('../ModuleComponents/ConnectionsComponent.vue'),
				'comments': () => import('../CommentSection/CommentSection.vue'),
				'history': () => import('../ModuleComponents/HistoryComponent.vue')
			};

			try {
				const component = await componentMap[this.moduleType]();
				return component.default || component;
			} catch (error) {
				console.error(`Error loading framework module ${this.moduleType}:`, error);
				return null;
			}
		},

		async loadCustomModule() {
			// Directly return CustomHtmlComponent for custom modules
			try {
				const CustomHtmlComponent = await import('../CustomHtmlComponent.vue');
				return CustomHtmlComponent.default || CustomHtmlComponent;
			} catch (error) {
				console.error(`Error loading CustomHtmlComponent for module ${this.moduleType}:`, error);
				return this.createFallbackComponent();
			}
		},

		getFrameworkComponentName() {
			const nameMap = {
				'attachments': 'AttachmentsComponent',
				'connections': 'ConnectionsComponent', 
				'comments': 'CommentSection',
				'history': 'HistoryComponent'
			};
			return nameMap[this.moduleType] || 'UnknownComponent';
		},

		getModuleTitle() {
			// Check for title from query parameters first
			if (this.$route?.query?.title) {
				return this.$route.query.title;
			}

			// Check if moduleTitle is explicitly set
			if (this.explicitModuleTitle) {
				return this.explicitModuleTitle;
			}

			// For framework modules, use default titles when no query title provided
			if (this.isFrameworkModule) {
				const titleMap = {
					'attachments': 'Attachments',
					'connections': 'Connections',
					'comments': 'Comments',
					'history': 'Version History'
				};
				return titleMap[this.moduleType] || this.formatModuleTypeName(this.moduleType);
			}

			// For custom modules, return blank title if not provided from query
			return '';
		},

		formatModuleTypeName(moduleType) {
			if (!moduleType) return 'Module';
			
			return moduleType
				.replace(/[-_]/g, ' ')
				.replace(/\b\w/g, l => l.toUpperCase());
		},

		getModalSize() {
			// Get modal size from collection schema or use defaults
			const collectionModules = this.collectionSchemaDetails?.MODULES;
			if (collectionModules && collectionModules[this.moduleType]) {
				return collectionModules[this.moduleType].modal_size || 'lg';
			}

			// Default sizes for framework modules
			const defaultSizes = {
				'attachments': 'lg',
				'connections': 'md',
				'comments': 'lg',
				'history': 'xl'
			};

			return defaultSizes[this.moduleType] || 'lg';
		},

		isModuleEnabled() {
			// Check if module is enabled in collection schema
			const collectionModules = this.collectionSchemaDetails?.MODULES;
			if (collectionModules && collectionModules[this.moduleType]) {
				return collectionModules[this.moduleType].enabled !== false;
			}

			// Framework modules are enabled by default
			if (this.isFrameworkModule) {
				return true;
			}

			// Custom modules are enabled if no explicit schema configuration exists
			// The actual file existence will be checked during loading
			return true;
		},

		getModuleProps() {
			// Get common props that all modules need
			const baseProps = {
				id: this.id,
				collection: this.collection,
				moduleName: this.moduleName,
				action: this.action || 'view'
			};

			// Add module-specific props
			if (this.moduleType === 'history') {
				baseProps.audit_id = this.audit_id;
			}

			// Add module-specific prop mappings for framework modules
			if (this.moduleType === 'comments') {
				baseProps.recordId = this.id; // CommentSection expects recordId
				baseProps.isReadOnly = this.action === 'view';
			}

			// For custom modules, add CustomHtmlComponent specific props
			if (this.isCustomModule) {
				baseProps.moduleType = this.moduleType;
				baseProps.isModule = true;
				baseProps.hideHeader = true;
				baseProps.collectionSchemaDetails = this.collectionSchemaDetails || {};
			}

			// Add any custom props from route query parameters
			return {
				...baseProps,
				...this.$route.query
			};
		},


		navigateBack() {
			// Restore previous document title if available
			if (this.previousDocumentTitle) {
				document.title = this.previousDocumentTitle;
			}
			
			// Navigate back to the parent form or list
			if (this.redirectTo) {
				this.$router.push(this.redirectTo);
			} else if (this.action === 'view') {
				this.$router.push(`/${this.moduleName}/doc/${this.collection}/view_record/${this.id}`);
			} else {
				this.$router.push(`/${this.moduleName}/doc/${this.collection}/view/list`);
			}
		},

		openInModal() {
			if (this.displayMode === 'modal') return;
			
			const modalRoute = {
				...this.$route,
				params: {
					...this.$route.params,
					displayMode: 'modal'
				}
			};
			this.$router.push(modalRoute);
		},

		openInFullscreen() {
			if (this.displayMode === 'fullscreen') return;
			
			const fullscreenRoute = {
				...this.$route,
				params: {
					...this.$route.params,
					displayMode: 'fullscreen'
				}
			};
			this.$router.push(fullscreenRoute);
		},

		// Methods removed - now using CustomHtmlComponent for custom modules

		createFallbackComponent() {
			// Create a fallback component when no Vue options are found
			const Vue = require('@/ourVue.js').default;
			
			return Vue.extend({
				name: `FallbackModule_${this.moduleType}`,
				template: `
					<div class="custom-module-fallback">
						<b-alert show variant="warning">
							<h5 class="alert-heading">
								<b-icon icon="info-circle" class="mr-2"></b-icon>
								Custom Module Loaded
							</h5>
							<p>The module <strong>{{ moduleType }}</strong> has been loaded but no Vue component options were found.</p>
							<hr>
							<p class="mb-0">
								<small>
									To add interactivity, create a JavaScript file that uses 
									<code>capps.injectDependencies('{{ dependencyKey }}', { /* Vue options */ })</code>
								</small>
							</p>
						</b-alert>
						<div class="mt-3">
							<h6>Module Information:</h6>
							<ul class="list-unstyled">
								<li><strong>Module:</strong> {{ moduleName }}</li>
								<li><strong>Collection:</strong> {{ collection }}</li>
								<li><strong>Type:</strong> {{ moduleType }}</li>
								<li><strong>Record ID:</strong> {{ id }}</li>
								<li><strong>Action:</strong> {{ action }}</li>
							</ul>
						</div>
					</div>
				`,
				props: {
					id: [String, Number],
					collection: String,
					moduleName: String,
					action: String
				},
				computed: {
					moduleType() {
						return this.$parent.moduleType;
					},
					dependencyKey() {
						return `${this.moduleName}::${this.moduleType}::vue_options`;
					}
				}
			});
		}
	}
};