<template>
  <component
    :is="filterComponent"
    :model-value="filterValue"
    v-bind="filterProps"
    :class="filterClass"
    @update:model-value="updateFilterValue"
    @input="onInputChange"
    @change="onInputChange"
    @date-select="onInputChange"
    @clear-click="onInputChange"
  />
</template>

<script setup>
import { computed } from 'vue';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  filterModel: {
    type: Object,
    required: true
  },
  filterCallback: {
    type: Function,
    required: true
  }
});

// Handle constraint-based filter value for menu display
const filterValue = computed(() => {
  // For menu-based filters, PrimeVue uses constraints array
  if (props.filterModel.constraints && props.filterModel.constraints.length > 0) {
    console.log('🎯 Getting constraint value:', props.filterModel.constraints[0].value);
    return props.filterModel.constraints[0].value;
  }
  console.log('🎯 Getting simple value:', props.filterModel.value);
  return props.filterModel.value;
});

// Handle filter value updates
function updateFilterValue(value) {
  console.log('🎯 updateFilterValue called with:', value);
  console.log('🎯 Current filterModel:', props.filterModel);
  
  if (props.filterCallback) {
    // Work directly with PrimeVue's constraint structure
    if (props.filterModel.constraints && props.filterModel.constraints.length > 0) {
      // Update existing constraint
      const newConstraints = [...props.filterModel.constraints];
      newConstraints[0] = { ...newConstraints[0], value };
      
      console.log('🎯 Updating constraint to:', newConstraints[0]);
      props.filterCallback({
        ...props.filterModel,
        constraints: newConstraints
      });
    } else {
      // Create constraint structure
      console.log('🎯 Creating new constraint with value:', value);
      props.filterCallback({
        ...props.filterModel,
        constraints: [{
          value: value,
          matchMode: props.filterModel.matchMode || 'equals'
        }]
      });
    }
  }
}

// Determine filter component based on field type
const filterComponent = computed(() => {
  const fieldType = props.field.fieldtype;
  
  switch (fieldType) {
    case 'textfield':
    case 'textarea':
    case 'email_address':
      return InputText;
      
    case 'select':
    case 'radio':
      return Dropdown;
      
    case 'date':
    case 'datetime':
      return Calendar;
      
    case 'float':
    case 'int':
      return InputNumber;
      
    case 'checkbox':
    case 'switch':
      return Dropdown; // Using dropdown for boolean selection
      
    default:
      return InputText;
  }
});

// Dynamic props based on field type
const filterProps = computed(() => {
  const fieldType = props.field.fieldtype;
  const baseProps = {
    placeholder: getPlaceholder(fieldType)
  };
  
  switch (fieldType) {
    case 'select':
    case 'radio':
      return {
        ...baseProps,
        options: getSelectOptions(),
        showClear: true,
        placeholder: 'Select...'
      };
      
    case 'date':
      return {
        ...baseProps,
        dateFormat: 'mm/dd/yy',
        placeholder: 'mm/dd/yyyy',
        showIcon: true
      };
      
    case 'datetime':
      return {
        ...baseProps,
        dateFormat: 'mm/dd/yy',
        showTime: true,
        placeholder: 'mm/dd/yyyy hh:mm',
        showIcon: true
      };
      
    case 'float':
    case 'int':
      return {
        ...baseProps,
        placeholder: 'Enter number...',
        mode: fieldType === 'float' ? 'decimal' : 'numeric'
      };
      
    case 'checkbox':
    case 'switch':
      return {
        ...baseProps,
        options: [
          { label: 'Yes', value: 'Y' },
          { label: 'No', value: 'N' }
        ],
        showClear: true,
        placeholder: 'Select...'
      };
      
    default:
      return baseProps;
  }
});

// CSS classes for the filter component
const filterClass = computed(() => {
  return ['p-column-filter', `filter-${props.field.fieldtype}`];
});

// Get placeholder text based on field type
function getPlaceholder(fieldType) {
  const placeholders = {
    'textfield': 'Search...',
    'textarea': 'Search...',
    'email_address': 'Search email...',
    'select': 'Select...',
    'date': 'Select date...',
    'datetime': 'Select date & time...',
    'float': 'Enter number...',
    'int': 'Enter number...',
    'checkbox': 'Select...',
    'switch': 'Select...',
    'radio': 'Select...'
  };
  
  return placeholders[fieldType] || 'Search...';
}

// Get options for select/dropdown fields
function getSelectOptions() {
  const field = props.field;
  
  // If field has enum values, use them
  if (field.enum && Array.isArray(field.enum)) {
    return field.enum.map(value => ({
      label: value,
      value: value
    }));
  }
  
  // If field has linked_to configuration, handle remote options
  if (field.linked_to) {
    // For now, return empty array - this would need to be handled by parent component
    // or through a separate API call
    return [];
  }
  
  // Default options for boolean-like fields
  if (field.fieldtype === 'checkbox' || field.fieldtype === 'switch') {
    return [
      { label: 'Yes', value: field['checked-value'] || 'Y' },
      { label: 'No', value: field['unchecked-value'] || 'N' }
    ];
  }
  
  return [];
}

// Handle input changes without triggering immediate API calls
function onInputChange(event) {
  // The v-model binding should handle value updates automatically
  // This function is mainly for additional handling if needed
  console.log('🎯 Filter input changed:', event);
}
</script>

<style scoped>
.p-column-filter {
  width: 100%;
  min-width: 200px;
}

.filter-textfield,
.filter-textarea,
.filter-email_address {
  max-width: 250px;
}

.filter-date,
.filter-datetime {
  max-width: 200px;
}

.filter-float,
.filter-int {
  max-width: 150px;
}

.filter-select,
.filter-checkbox,
.filter-switch,
.filter-radio {
  max-width: 200px;
}
</style>