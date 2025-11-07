<template>
  <Dropdown
    :model-value="modelValue"
    :options="options"
    option-label="label"
    option-value="value"
    :placeholder="placeholder"
    class="p-column-filter"
    show-clear
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import Dropdown from 'primevue/dropdown';

defineProps({
  modelValue: [String, Number, Boolean],
  placeholder: {
    type: String,
    default: 'Select'
  },
  options: {
    type: Array,
    required: true // e.g., [{label: 'Yes', value: 'Y'}, {label: 'No', value: 'N'}]
  }
});

defineEmits(['update:modelValue']);
</script>