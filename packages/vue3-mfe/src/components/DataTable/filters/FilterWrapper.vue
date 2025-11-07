<template>
  <div class="capps-column-filter">
    <!-- Operator Selection -->
    <div
      v-if="availableOperators.length > 1"
      class="filter-operator-section"
    >
      <Dropdown
        v-model="selectedOperator"
        :options="operatorOptions"
        option-label="label"
        option-value="value"
        placeholder="Select operator"
        class="filter-operator-dropdown"
        @change="onOperatorChange"
      />
    </div>
    
    <!-- Filter Input Component -->
    <div class="filter-input-section">
      <component
        :is="filterInputComponent"
        :field="field"
        :operator="selectedOperator"
        :value="filterValue"
        :values="filterValues"
        :range-start="rangeStart"
        :range-end="rangeEnd"
        @update:value="onValueChange"
        @update:values="onValuesChange"
        @update:range-start="onRangeStartChange"
        @update:range-end="onRangeEndChange"
        @filter-change="emitFilterChange"
      />
    </div>
    
    <!-- Clear Filter Button -->
    <div
      v-if="hasFilterValue"
      class="filter-actions"
    >
      <Button
        icon="pi pi-times"
        class="p-button-text p-button-sm filter-clear-btn"
        title="Clear filter"
        @click="clearFilter"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

// Import filter components
import TextFilter from './TextFilter.vue';
import SelectFilter from './SelectFilter.vue';
import DateFilter from './DateFilter.vue';
import DateTimeFilter from './DateTimeFilter.vue';
import NumberFilter from './NumberFilter.vue';
import BooleanFilter from './BooleanFilter.vue';

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  filterModel: {
    type: Object,
    required: true
  },
  operators: {
    type: Array,
    default: () => ['eq', 'noteq']
  },
  componentType: {
    type: String,
    default: 'TextFilter'
  }
});

const emit = defineEmits(['filter-change']);

// Reactive state
const selectedOperator = ref(props.field.defaultFilterOperator || 'eq');
const filterValue = ref('');
const filterValues = ref([]);
const rangeStart = ref('');
const rangeEnd = ref('');

// Computed properties
const availableOperators = computed(() => props.operators || ['eq', 'noteq']);

const operatorOptions = computed(() => {
  const operatorLabels = {
    'like': 'Contains',
    'eq': 'Equals',
    'noteq': 'Not Equal',
    'in': 'In',
    'gteq': 'Greater Than or Equal',
    'lteq': 'Less Than or Equal',
    'between': 'Between'
  };
  
  return availableOperators.value.map(op => ({
    value: op,
    label: operatorLabels[op] || op.toUpperCase()
  }));
});

const filterInputComponent = computed(() => {
  const componentMap = {
    'TextFilter': TextFilter,
    'SelectFilter': SelectFilter,
    'DateFilter': DateFilter,
    'DateTimeFilter': DateTimeFilter,
    'NumberFilter': NumberFilter,
    'BooleanFilter': BooleanFilter
  };
  
  return componentMap[props.componentType] || TextFilter;
});

const hasFilterValue = computed(() => {
  switch (selectedOperator.value) {
    case 'in':
      return filterValues.value && filterValues.value.length > 0;
    case 'between':
      return rangeStart.value || rangeEnd.value;
    default:
      return filterValue.value !== '' && filterValue.value !== null && filterValue.value !== undefined;
  }
});

// Methods
const onOperatorChange = () => {
  // Clear existing values when operator changes
  clearFilterValues();
  emitFilterChange();
};

const onValueChange = (value) => {
  filterValue.value = value;
  emitFilterChange();
};

const onValuesChange = (values) => {
  filterValues.value = values;
  emitFilterChange();
};

const onRangeStartChange = (value) => {
  rangeStart.value = value;
  emitFilterChange();
};

const onRangeEndChange = (value) => {
  rangeEnd.value = value;
  emitFilterChange();
};

const clearFilter = () => {
  clearFilterValues();
  emitFilterChange();
};

const clearFilterValues = () => {
  filterValue.value = '';
  filterValues.value = [];
  rangeStart.value = '';
  rangeEnd.value = '';
};

const emitFilterChange = () => {
  let filterData = {
    operator: selectedOperator.value,
    value: null
  };

  switch (selectedOperator.value) {
    case 'in':
      if (filterValues.value && filterValues.value.length > 0) {
        filterData.value = filterValues.value;
      }
      break;
    case 'between':
      if (rangeStart.value && rangeEnd.value) {
        filterData.value = {
          start: rangeStart.value,
          end: rangeEnd.value
        };
      } else if (rangeStart.value) {
        filterData.operator = 'gteq';
        filterData.value = rangeStart.value;
      } else if (rangeEnd.value) {
        filterData.operator = 'lteq';
        filterData.value = rangeEnd.value;
      }
      break;
    default:
      if (filterValue.value !== '' && filterValue.value !== null && filterValue.value !== undefined) {
        filterData.value = filterValue.value;
      }
      break;
  }

  // Use the callback approach instead of direct prop mutation
  const filterModelUpdate = {
    value: filterData.value,
    matchMode: selectedOperator.value
  };

  emit('filter-change', filterModelUpdate);
};

// Initialize filter state from existing model
onMounted(() => {
  if (props.filterModel.value) {
    const existingValue = props.filterModel.value;
    const existingOperator = props.filterModel.matchMode || selectedOperator.value;
    
    selectedOperator.value = existingOperator;
    
    if (Array.isArray(existingValue)) {
      filterValues.value = existingValue;
    } else if (typeof existingValue === 'object' && existingValue.start !== undefined) {
      rangeStart.value = existingValue.start;
      rangeEnd.value = existingValue.end;
    } else {
      filterValue.value = existingValue;
    }
  }
});

// Watch for external changes to filter model
watch(() => props.filterModel.value, (newValue) => {
  if (!newValue) {
    clearFilterValues();
  }
}, { deep: true });
</script>

<style scoped>
.capps-column-filter {
  padding: 0.75rem;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-operator-section .filter-operator-dropdown {
  width: 100%;
}

.filter-input-section {
  width: 100%;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
}

.filter-clear-btn {
  padding: 0.25rem 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .capps-column-filter {
    min-width: 200px;
  }
}
</style>