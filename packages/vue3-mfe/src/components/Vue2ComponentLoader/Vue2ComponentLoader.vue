<template>
  <div ref="vue2MountPoint" class="vue2-component-mount-point"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

export default {
  name: 'Vue2ComponentLoader',
  props: {
    // Function that receives a DOM element and mounts Vue 2 content into it
    mountHandler: {
      type: Function,
      required: true
    },
    // Optional unmount handler for cleanup
    unmountHandler: {
      type: Function,
      default: null
    },
    // Trigger key to force remount
    remountKey: {
      type: [String, Number],
      default: null
    }
  },
  setup(props) {
    const vue2MountPoint = ref(null);
    let cleanupFn = null;

    const mountVue2Component = () => {
      if (vue2MountPoint.value) {
        // Call the mount handler with the DOM element
        // The parent Vue 2 app will handle mounting the component
        cleanupFn = props.mountHandler(vue2MountPoint.value);
      }
    };

    const unmountVue2Component = () => {
      if (cleanupFn && typeof cleanupFn === 'function') {
        cleanupFn();
      } else if (props.unmountHandler) {
        props.unmountHandler(vue2MountPoint.value);
      }
      cleanupFn = null;
    };

    onMounted(() => {
      mountVue2Component();
    });

    onBeforeUnmount(() => {
      unmountVue2Component();
    });

    // Watch for remount trigger
    watch(() => props.remountKey, (newVal, oldVal) => {
      if (newVal !== oldVal && oldVal !== null) {
        unmountVue2Component();
        mountVue2Component();
      }
    });

    return {
      vue2MountPoint
    };
  }
};
</script>

<style scoped>
.vue2-component-mount-point {
  width: 100%;
}
</style>
