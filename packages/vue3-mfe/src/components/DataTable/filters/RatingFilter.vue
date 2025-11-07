<template>
  <Rating
    :model-value="modelValue"
    :cancel="true"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import Rating from 'primevue/rating';

defineProps({
  modelValue: Number
});

defineEmits(['update:modelValue']);
</script>