<script>
import { h, ref } from 'vue';
import Panel from 'primevue/panel';

export default {
  props: {
    header: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    },
    iconColor: {
      type: String,
      default: ''
    },
    badge: {
      type: String,
      default: ''
    },
    badgeClass: {
      type: String,
      default: 'text-warning'
    },
    toggleable: {
      type: Boolean,
      default: true
    },
    collapsed: {
      type: Boolean,
      default: true
    },
    customClass: {
      type: String,
      default: ''
    },
    // Function to mount Vue 2 content
    mountHandler: {
      type: Function,
      default: null
    }
  },
  emits: ['toggle', 'update:collapsed'],
  watch: {
    collapsed(newVal) {
      console.log(`Panel "${this.header}" collapsed state changed:`, newVal);
    }
  },
  methods: {
    handleToggle(event) {
      this.$emit('update:collapsed', event.value);
      this.$emit('toggle', event.value);
    }
  },
  setup() {
    const vue2ContentRef = ref(null);

    return {
      vue2ContentRef
    };
  },
  render() {
    const headerContent = h('div', { class: 'panel-header-content' }, [
      // Icon
      this.icon ? h('i', {
        class: [this.icon, 'mr-2', 'panel-icon'],
        style: { color: this.iconColor }
      }) : null,
      // Header text
      h('span', { class: 'panel-header-text' }, this.header),
      // Badge
      this.badge ? h('small', { class: ['ml-2', this.badgeClass] }, this.badge) : null
    ].filter(Boolean));

    // Create default slot content
    const defaultSlotContent = () => {
      if (this.$slots.default) {
        return this.$slots.default();
      } else if (this.mountHandler) {
        // Create a mount point for Vue 2 content
        return h('div', {
          ref: this.vue2ContentRef,
          class: 'vue2-content-mount-point'
        });
      }
      return null;
    };

    return h(Panel, {
      header: this.header,
      toggleable: this.toggleable,
      collapsed: this.collapsed,
      onToggle: this.handleToggle,
      class: ['capps-accordion-panel', this.customClass]
    }, {
      header: () => headerContent,
      default: defaultSlotContent
    });
  },
  mounted() {
    // If mountHandler is provided and we have a mount point, call it
    // In Vue 3, refs need to be accessed via .value to get the actual DOM element
    if (this.mountHandler && this.vue2ContentRef && this.vue2ContentRef.value) {
      console.log('Mounting Vue 2 content into:', this.vue2ContentRef.value);
      this.cleanupFn = this.mountHandler(this.vue2ContentRef.value);
    } else if (this.mountHandler) {
      console.warn('mountHandler provided but vue2ContentRef not available');
    }
  },
  beforeUnmount() {
    // Call cleanup function if it exists
    if (this.cleanupFn && typeof this.cleanupFn === 'function') {
      this.cleanupFn();
    }
  },
  data() {
    return {
      cleanupFn: null
    };
  }
}
</script>

<style scoped lang="scss">
.capps-accordion-panel {
  margin-bottom: 0.5rem;

  ::v-deep(.p-panel-header) {
    padding: 0.875rem 1rem;
  }

  ::v-deep(.p-panel-content) {
    padding: 0.5rem 1rem;
  }

  .panel-header-content {
    display: flex;
    align-items: center;
    width: 100%;

    .panel-icon {
      font-size: 1.35rem;
      opacity: 1;
      margin-right: 0.625rem;
    }

    .panel-header-text {
      font-weight: 700;
      font-size: 1.1rem;
      line-height: 1.3;
    }
  }
}
</style>
