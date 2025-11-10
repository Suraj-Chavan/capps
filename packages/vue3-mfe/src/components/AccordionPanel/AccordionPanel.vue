<template>
  <Panel
    :header="header"
    :toggleable="toggleable"
    :collapsed="collapsed"
    @toggle="handleToggle"
    :class="['capps-accordion-panel', customClass]"
  >
    <template #header>
      <div class="panel-header-content">
        <i v-if="icon" :class="[icon, 'mr-2', 'panel-icon']" :style="{ color: iconColor }"></i>
        <span class="panel-header-text">{{ header }}</span>
        <small v-if="badge" :class="['ml-2', badgeClass]">{{ badge }}</small>
      </div>
    </template>

    <template #default>
      <!-- Empty body - content is managed by Vue 2 parent -->
      <div style="display: none;"></div>
    </template>
  </Panel>
</template>

<script setup>
import { watch } from 'vue';
import Panel from 'primevue/panel';

const props = defineProps({
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
});

const emit = defineEmits(['toggle', 'update:collapsed']);

const handleToggle = (event) => {
  emit('update:collapsed', event.value);
  emit('toggle', event.value);
};

// Watch for external changes to collapsed prop
watch(() => props.collapsed, (newVal) => {
  console.log(`Panel "${props.header}" collapsed state changed:`, newVal);
});
</script>

<style scoped lang="scss">
.capps-accordion-panel {
  margin-bottom: 0.5rem;

  ::v-deep(.p-panel-header) {
    padding: 0.875rem 1rem;
  }

  ::v-deep(.p-panel-content) {
    padding: 0.5rem;
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
