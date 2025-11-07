<template>
  <div class="select-filter">
    <!-- Single select for most operators -->
    <div
      v-if="operator !== 'in'"
      class="single-select"
    >
      <Dropdown
        :model-value="value"
        :options="fieldOptions"
        option-label="label"
        option-value="value"
        :placeholder="getPlaceholder()"
        class="filter-input"
        show-clear
        @update:model-value="$emit('update:value', $event)"
        @change="onSelectChange"
      />
    </div>
    
    <!-- Multi-select for 'in' operator -->
    <div
      v-else
      class="multi-select"
    >
      <MultiSelect
        :model-value="values"
        :options="fieldOptions"
        option-label="label"
        option-value="value"
        :placeholder="'Select multiple values'"
        class="filter-input"
        :max-selected-labels="2"
        @update:model-value="$emit('update:values', $event)"
        @change="onMultiSelectChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';

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
  },
  values: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:value', 'update:values', 'filter-change']);

// Reactive state
const fieldOptions = ref([]);
const loading = ref(false);

// Computed properties
const fieldLabel = computed(() => props.field.label || props.field.key || '');

// Methods
const getPlaceholder = () => {
  const label = fieldLabel.value;
  switch (props.operator) {
    case 'eq':
      return `Select ${label}`;
    case 'noteq':
      return `Exclude ${label}`;
    default:
      return `Select ${label}`;
  }
};

const onSelectChange = () => {
  setTimeout(() => {
    emit('filter-change');
  }, 100);
};

const onMultiSelectChange = () => {
  setTimeout(() => {
    emit('filter-change');
  }, 100);
};

const loadFieldOptions = async () => {
  try {
    loading.value = true;
    
    // Check if field has linked_to configuration for dynamic options
    if (props.field.linked_to) {
      // TODO: Implement API call to fetch options based on linked_to configuration
      // For now, provide some example options
      fieldOptions.value = [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
        { label: 'Option 3', value: 'opt3' }
      ];
    } else if (props.field.options) {
      // Use static options from field configuration
      fieldOptions.value = props.field.options;
    } else {
      // For boolean fields or other simple cases
      if (props.field.fieldtype === 'check') {
        fieldOptions.value = [
          { label: 'Yes', value: 1 },
          { label: 'No', value: 0 }
        ];
      } else {
        fieldOptions.value = [];
      }
    }
  } catch (error) {
    console.error('Error loading field options:', error);
    fieldOptions.value = [];
  } finally {
    loading.value = false;
  }
};

// Load options on mount
onMounted(() => {
  loadFieldOptions();
});
</script>

<style scoped>
.select-filter {
  width: 100%;
}

.single-select,
.multi-select {
  width: 100%;
}

.filter-input {
  width: 100%;
}

/* Custom styling for multi-select */
:deep(.p-multiselect-label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>