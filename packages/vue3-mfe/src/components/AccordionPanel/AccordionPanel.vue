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
        <i v-if="icon" :class="icon + ' mr-2'"></i>
        <span>{{ header }}</span>
        <small v-if="badge" :class="['ml-2', badgeClass]">{{ badge }}</small>
      </div>
    </template>

    <template #default>
      <slot></slot>
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
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    padding: 0.5rem 1rem;
    border-radius: 0 !important;
  }

  ::v-deep(.p-panel-content) {
    padding: 0.5rem;
  }

  .panel-header-content {
    display: flex;
    align-items: center;
    width: 100%;
  }
}
</style>
