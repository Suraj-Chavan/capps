<script>
import { h } from 'vue';
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
    }
  },
  emits: ['toggle', 'update:collapsed'],
  methods: {
    handleToggle(event) {
      this.$emit('update:collapsed', event.value);
      this.$emit('toggle', event.value);
    }
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

    return h(Panel, {
      header: this.header,
      toggleable: this.toggleable,
      collapsed: this.collapsed,
      onToggle: this.handleToggle,
      class: ['capps-accordion-panel', this.customClass]
    }, {
      header: () => headerContent,
      // Render a mount point where Vue 2 content will be injected
      default: () => h('div', { class: 'vue2-content-mount-point' })
    });
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

  // Mount point for Vue 2 content
  .vue2-content-mount-point {
    width: 100%;
  }
}
</style>
