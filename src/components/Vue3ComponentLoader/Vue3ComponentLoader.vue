<script>
import { h } from 'vue';
import { remoteApplicationDetails } from "config";
import getRemoteModule from "../../plugins/get-remote-module.js";
const { remoteApp3: REMOTE_APP3 } = remoteApplicationDetails;

export default {
    name: 'Vue3ComponentLoader',
    props: {
        // This new prop will specify which module to load from the remote.
        // e.g., "./MyVue3Component" or "./AnotherVue3Component"
        exposedModule: {
            type: String,
            required: true,
        },
        // Use this to pass a bundle of props to the Vue 3 component
        componentProps: {
            type: Object,
            default: () => ({})
        },
        // New prop for event handlers
        componentEvents: {
            type: Object,
            default: () => ({})
        },
        shouldShowLoader: {
            type: Boolean,
            default: false
        }
        // Example: componentProps: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            vue3App: null,
            isLoading: false,
            errorLoading: null,
            vue3UpdateFn: null,
            slotInstance: null,
            mountObserver: null,
            actualMountElement: null, // Store actual DOM element to prevent loss during re-renders
        };
    },
    async mounted() {
        console.log('[Vue3ComponentLoader] Mounted hook called');

        // Set loading state FIRST before storing the element reference
        // This ensures the mount point div is created with the correct state
        this.isLoading = true;

        // Wait for render with loading state to complete
        await this.$nextTick();

        // NOW store the DOM element reference - this will be the stable mount point
        this.actualMountElement = this.$refs.vue3MountPoint;

        console.log('[Vue3ComponentLoader] Stored mount element reference:', this.actualMountElement);

        // Load and mount the Vue 3 component to the stable element
        await this.loadAndMountVue3Component();

        // Set loading to false to reveal the content
        this.isLoading = false;

        // Wait for visibility change to apply, then inject slot content
        await this.$nextTick();

        console.log('[Vue3ComponentLoader] After loading - checking mount element:', {
            storedElement: this.actualMountElement,
            innerHTML: this.actualMountElement ? this.actualMountElement.innerHTML.substring(0, 200) : 'N/A',
            offsetHeight: this.actualMountElement ? this.actualMountElement.offsetHeight : 0,
            offsetWidth: this.actualMountElement ? this.actualMountElement.offsetWidth : 0,
            display: this.actualMountElement ? window.getComputedStyle(this.actualMountElement).display : 'N/A'
        });

        this.injectSlotContent();
    },
    beforeDestroy() {
        // Clean up mutation observer
        if (this.mountObserver) {
            this.mountObserver.disconnect();
            this.mountObserver = null;
        }
        // Clean up slot instance
        if (this.slotInstance) {
            this.slotInstance.$destroy();
            this.slotInstance = null;
        }
        // Then unmount Vue 3 component
        this.unmountVue3Component();
    },
    watch: {
        // Watch all props that are intended for the Vue 3 component.
        // A simple approach is to watch a combined object of these props,
        // or individual critical props.
        propsForRemote: {
            handler(newProps, oldProps) {
                 if (this.vue3UpdateFn && typeof this.vue3UpdateFn === 'function') {
                    console.log('Props for remote component changed, calling MFE update function.', newProps);
                    this.vue3UpdateFn(newProps);
                } else if (this.vue3App) {
                    // Fallback to re-mount if update function is not available but app was mounted
                    // This ensures existing behavior if the MFE doesn't expose an update function.
                    console.warn('Vue 3 MFE update function not available. Re-mounting component on prop change.');
                    this.unmountVue3Component();
                    this.loadAndMountVue3Component();
                }
                // If neither vue3UpdateFn nor vue3App exists, it means the initial mount hasn't completed
                // or failed, and mounted() or its error handling is in control.
            },
            deep: true, // Watch for nested changes in componentProps
        },
    },
    computed: {
        // Combine props intended for the remote component to simplify watching
        propsForRemote() {
            return {
                ...this.componentProps,
                ...this.mapEventHandlersToProps(), // Add event handlers as props
            };
        },
        showLoader() {
            // Loader दाखवायचं का?
            return this.shouldShowLoader || this.isLoading;
        }
        //  handler(newProps, oldProps) {
        //    // Implement update strategy: re-mount or call an update function
        //  },
        //  deep: true,
        // }
    },
    methods: {
        unmountVue3Component() {
            if (this.vue3App && this.vue3App.unmount) {
                console.log('Unmounting Vue 3 component.');
                this.vue3App.unmount();
                this.vue3UpdateFn = null; // Clear the update function
                this.vue3App = null;
            }
        },
        async loadAndMountVue3Component() {
            // Note: isLoading should be set by the caller before calling this method
            this.errorLoading = null;
            this.unmountVue3Component(); // Ensure previous instance is cleaned up

            const mountElement = this.actualMountElement;

            console.log('[Vue3ComponentLoader] loadAndMountVue3Component started');
            console.log('[Vue3ComponentLoader] Mount element:', mountElement);
            console.log('[Vue3ComponentLoader] Mount element exists:', !!mountElement);

            try {
                // Dynamically import the exposed module from the Vue 3 MFE
                const loadedModule = await getRemoteModule({
                    remoteAppName: REMOTE_APP3.appName,
                    remoteURL: REMOTE_APP3.remoteURL,
                    callback: loadComponent => loadComponent(this.exposedModule) // Use the prop here
                });

                console.log('Loaded Module from getRemoteModule:', loadedModule);

                // Assuming loadedModule is an object with a mount method,
                // which itself returns an object with unmount and update methods.
                const mfeInterface = loadedModule;

                if (mountElement && mfeInterface && typeof mfeInterface.mount === 'function') {
                    console.log('[Vue3ComponentLoader] Mounting Vue 3 component to element');
                    console.log('[Vue3ComponentLoader] Mount point HTML before mount:', mountElement.innerHTML);

                    const mountedAppControls = mfeInterface.mount(mountElement, {
                        // Pass the combined props to the Vue 3 component
                        ...this.componentProps, // Pass direct data props
                        ...this.mapEventHandlersToProps(), // Pass event handlers as props
                    });

                    this.vue3App = { unmount: mountedAppControls.unmount }; // Store the unmount control
                    this.vue3UpdateFn = mountedAppControls.update; // Store the update control

                    console.log('[Vue3ComponentLoader] Vue 3 component mounted successfully');
                    console.log('[Vue3ComponentLoader] Mount point HTML after mount:', mountElement.innerHTML.substring(0, 200));

                    if (typeof this.vue3UpdateFn !== 'function') {
                        console.warn('Vue 3 MFE did not return an update function. Prop changes will require re-mounts.');
                    }
                } else {
                    console.error('[Vue3ComponentLoader] Mount failed - missing requirements:', {
                        hasMountElement: !!mountElement,
                        hasMfeInterface: !!mfeInterface,
                        hasMountFunction: !!(mfeInterface && typeof mfeInterface.mount === 'function')
                    });
                    throw new Error('Mount point or mount function not available or not a function.');
                }
            } catch (error) {
                console.error('[Vue3ComponentLoader] Failed to load or mount Vue 3 component:', error);
                this.errorLoading = error.message || 'An error occurred while loading the component.';
                // Optionally, emit an event or set a data property to show an error UI
            }
        },
        mapEventHandlersToProps() {
            const eventHandlerProps = {};
            if (this.componentEvents && typeof this.componentEvents === 'object') {
                for (const eventName in this.componentEvents) {
                    if (Object.prototype.hasOwnProperty.call(this.componentEvents, eventName)) {
                        // Convert eventName to onEventName format for Vue 3 props
                        // e.g., 'myEvent' becomes 'onMyEvent'
                        const propName = `on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;
                        eventHandlerProps[propName] = this.componentEvents[eventName];
                    }
                }
            }
            return eventHandlerProps;
        },
        injectSlotContent() {
            // Only proceed if we have slot content
            if (!this.$slots.default) {
                return;
            }

            if (!this.actualMountElement) {
                console.warn('[Vue3ComponentLoader] Mount element not available');
                return;
            }

            // Try to find the content injection point
            const contentTarget = this.actualMountElement.querySelector('.vue2-content-mount-point');

            if (contentTarget) {
                // Mount point exists, inject immediately
                this.performSlotInjection(contentTarget);
            } else {
                // Mount point doesn't exist yet (e.g., Panel is collapsed)
                // Set up a MutationObserver to wait for it to appear
                console.log('[Vue3ComponentLoader] Mount point not found yet, setting up observer...');
                this.setupMountObserver();
            }
        },

        performSlotInjection(contentTarget) {
            // Avoid injecting twice
            if (this.slotInstance) {
                console.log('[Vue3ComponentLoader] Content already injected, skipping');
                return;
            }

            console.log('[Vue3ComponentLoader] Injecting Vue 2 slot content...');

            // Create a temporary div to render our Vue 2 slot content
            const slotContainer = document.createElement('div');
            slotContainer.className = 'vue2-slot-container';

            // Mount the slot content using Vue 2's render
            const SlotComponent = {
                render: (h) => h('div', this.$slots.default)
            };

            const instance = new this.$root.constructor({
                parent: this,
                ...SlotComponent
            });

            instance.$mount(slotContainer);

            // Inject the rendered content into the Vue 3 component
            contentTarget.appendChild(instance.$el);

            console.log('[Vue3ComponentLoader] Content injected successfully');

            // Store reference for cleanup
            this.slotInstance = instance;

            // Clean up observer if it exists
            if (this.mountObserver) {
                this.mountObserver.disconnect();
                this.mountObserver = null;
            }
        },

        setupMountObserver() {
            // Clean up existing observer if any
            if (this.mountObserver) {
                this.mountObserver.disconnect();
            }

            if (!this.actualMountElement) {
                console.warn('[Vue3ComponentLoader] Cannot set up observer - mount element not available');
                return;
            }

            // Create a MutationObserver to watch for the mount point appearing
            this.mountObserver = new MutationObserver((mutations) => {
                const contentTarget = this.actualMountElement.querySelector('.vue2-content-mount-point');

                if (contentTarget) {
                    console.log('[Vue3ComponentLoader] Mount point detected by observer, injecting content...');
                    this.performSlotInjection(contentTarget);
                }
            });

            // Start observing the vue3MountPoint for changes in its subtree
            this.mountObserver.observe(this.actualMountElement, {
                childList: true,
                subtree: true
            });

            console.log('[Vue3ComponentLoader] MutationObserver set up, waiting for mount point...');
        }
    },
    render() {
        const children = [];

        console.log('[Vue3ComponentLoader] Render called:', {
            showLoader: this.showLoader,
            errorLoading: this.errorLoading,
            isLoading: this.isLoading,
            hasSlots: !!this.$slots.default
        });

        // Show loading state
        if (this.showLoader) {
            children.push(
                h('div', { class: 'loading-state' },
                    this.$slots.loading || ['Loading Vue 3 component...']
                )
            );
        }

        // Show error state
        if (this.errorLoading) {
            children.push(
                h('div', { class: 'error-state' }, [
                    h('p', {}, `Error loading component: ${this.errorLoading}`)
                ])
            );
        }

        // Always add the mount point (hidden when loading or error)
        const mountPointStyle = {
            display: this.showLoader || this.errorLoading ? 'none' : 'block'
        };

        console.log('[Vue3ComponentLoader] Mount point style:', mountPointStyle);

        children.push(
            h('div', {
                ref: 'vue3MountPoint',
                class: 'vue3-mount-point',
                style: mountPointStyle
            })
        );

        return h('div', { class: 'vue3-component-loader' }, children);
    }
};
</script>

<style scoped>
/* Styles for the loader component */
.vue3-component-loader .loading-state,
.vue3-component-loader .error-state {
    padding: 10px;
    border: 1px dashed #ccc;
}
.vue3-component-loader .error-state {
    color: red;
    border-color: red;
}
</style>
