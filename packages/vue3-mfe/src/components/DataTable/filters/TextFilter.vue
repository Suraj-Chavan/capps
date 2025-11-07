<template>
  <div class="text-filter">
    <!-- Single value input for most operators -->
    <div
      v-if="operator !== 'in'"
      class="single-input"
    >
      <InputText
        :model-value="value"
        :placeholder="getPlaceholder()"
        class="filter-input"
        @update:model-value="$emit('update:value', $event)"
        @input="onInputChange"
      />
    </div>
    
    <!-- Multiple values input for 'in' operator -->
    <div
      v-else
      class="multiple-input"
    >
      <Chips
        :model-value="values"
        :placeholder="'Enter values and press Enter'"
        separator=","
        class="filter-chips"
        @update:model-value="$emit('update:values', $event)"
        @add="onValuesChange"
        @remove="onValuesChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import InputText from 'primevue/inputtext';
import Chips from 'primevue/chips';

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  operator: {
    type: String,
    default: 'like'
  },
  value: {
    type: [String, Number],
    default: ''
  },
  values: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:value', 'update:values', 'filter-change']);

// Computed properties
const fieldLabel = computed(() => props.field.label || props.field.key || '');

// Methods
const getPlaceholder = () => {
  const label = fieldLabel.value;
  switch (props.operator) {
    case 'like':
      return `Search ${label}...`;
    case 'eq':
      return `Enter ${label}`;
    case 'noteq':
      return `Exclude ${label}`;
    default:
      return `Enter ${label}`;
  }
};

const onInputChange = () => {
  // Debounce the filter change emission
  setTimeout(() => {
    emit('filter-change');
  }, 300);
};

const onValuesChange = () => {
  setTimeout(() => {
    emit('filter-change');
  }, 300);
};
</script>

<style scoped>
.text-filter {
  width: 100%;
}

.single-input,
.multiple-input {
  width: 100%;
}

.filter-input {
  width: 100%;
}

.filter-chips {
  width: 100%;
}

/* Custom styling for chips */
:deep(.p-chips-multiple-container) {
  min-height: 2.5rem;
}

:deep(.p-chips-token) {
  background: var(--primary-color);
  color: white;
}
</style>