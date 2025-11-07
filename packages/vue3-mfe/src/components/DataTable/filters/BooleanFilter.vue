<template>
  <div class="boolean-filter">
    <Dropdown
      :model-value="value"
      :options="booleanOptions"
      option-label="label"
      option-value="value"
      :placeholder="getPlaceholder()"
      class="filter-input"
      show-clear
      @update:model-value="$emit('update:value', $event)"
      @change="onSelectChange"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Dropdown from 'primevue/dropdown';

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  operator: {
    type: String,
    default: 'eq'
  },
  value: {
    type: [String, Number, Boolean],
    default: null
  }
});

const emit = defineEmits(['update:value', 'filter-change']);

// Computed properties
const fieldLabel = computed(() => props.field.label || props.field.key || '');

const booleanOptions = computed(() => [
  { label: 'Yes', value: 1 },
  { label: 'No', value: 0 }
]);

// Methods
const getPlaceholder = () => {
  const label = fieldLabel.value;
  return `Select ${label}`;
};

const onSelectChange = () => {
  setTimeout(() => {
    emit('filter-change');
  }, 100);
};
</script>

<style scoped>
.boolean-filter {
  width: 100%;
}

.filter-input {
  width: 100%;
}
</style>