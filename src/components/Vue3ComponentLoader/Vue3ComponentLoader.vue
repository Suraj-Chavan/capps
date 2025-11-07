<template>
    <div class="vue3-component-loader">
        <div v-if="showLoader" class="loading-state">
            <slot name="loading">Loading Vue 3 component...</slot>
        </div>
        <div v-if="errorLoading" class="error-state">
            <p>Error loading component: {{ errorLoading }}</p>
        </div>
        <div
            ref="vue3MountPoint"
            class="vue3-mount-point"
            :style="{ display: showLoader || errorLoading ? 'none' : 'block' }"
        ></div>
    </div>
</template>

<script>
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
        };
    },
    async mounted() {
        await this.loadAndMountVue3Component();
    },
    beforeDestroy() {
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
            this.isLoading = true;
            this.errorLoading = null;
            this.unmountVue3Component(); // Ensure previous instance is cleaned up

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

                if (this.$refs.vue3MountPoint && mfeInterface && typeof mfeInterface.mount === 'function') {
                    console.log('Mounting Vue 3 component...');
                    const mountedAppControls = mfeInterface.mount(this.$refs.vue3MountPoint, {
                        // Pass the combined props to the Vue 3 component
                        ...this.componentProps, // Pass direct data props
                        ...this.mapEventHandlersToProps() // Pass event handlers as props
                    });

                    this.vue3App = { unmount: mountedAppControls.unmount }; // Store the unmount control
                    this.vue3UpdateFn = mountedAppControls.update; // Store the update control

                    console.log('Vue 3 component mounted.');
                    if (typeof this.vue3UpdateFn !== 'function') {
                        console.warn('Vue 3 MFE did not return an update function. Prop changes will require re-mounts.');
                    }
                } else {
                    throw new Error('Mount point or mount function not available or not a function.');
                }
            } catch (error) {
                console.error('Failed to load or mount Vue 3 component:', error);
                this.errorLoading = error.message || 'An error occurred while loading the component.';
                // Optionally, emit an event or set a data property to show an error UI
            } finally {
                this.isLoading = false;
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
        }
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
