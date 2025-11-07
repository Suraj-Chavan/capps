<template>
  <div class="number-filter">
    <!-- Single value input for most operators -->
    <div
      v-if="operator !== 'between'"
      class="single-input"
    >
      <InputNumber
        :model-value="value"
        :placeholder="getPlaceholder()"
        class="filter-input"
        mode="decimal"
        @update:model-value="$emit('update:value', $event)"
        @input="onInputChange"
      />
    </div>
    
    <!-- Range input for 'between' operator -->
    <div
      v-else
      class="range-input"
    >
      <div class="range-field">
        <label class="range-label">From:</label>
        <InputNumber
          :model-value="rangeStart"
          placeholder="Min value"
          class="filter-input"
          mode="decimal"
          @update:model-value="$emit('update:range-start', $event)"
          @input="onRangeChange"
        />
      </div>
      <div class="range-field">
        <label class="range-label">To:</label>
        <InputNumber
          :model-value="rangeEnd"
          placeholder="Max value"
          class="filter-input"
          mode="decimal"
          @update:model-value="$emit('update:range-end', $event)"
          @input="onRangeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import InputNumber from 'primevue/inputnumber';

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
    type: [Number, String],
    default: null
  },
  rangeStart: {
    type: [Number, String],
    default: null
  },
  rangeEnd: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['update:value', 'update:range-start', 'update:range-end', 'filter-change']);

// Computed properties
const fieldLabel = computed(() => props.field.label || props.field.key || '');

// Methods
const getPlaceholder = () => {
  const label = fieldLabel.value;
  switch (props.operator) {
    case 'eq':
      return `Enter ${label}`;
    case 'noteq':
      return `Exclude ${label}`;
    case 'gteq':
      return `Min ${label}`;
    case 'lteq':
      return `Max ${label}`;
    default:
      return `Enter ${label}`;
  }
};

const onInputChange = () => {
  setTimeout(() => {
    emit('filter-change');
  }, 300);
};

const onRangeChange = () => {
  setTimeout(() => {
    emit('filter-change');
  }, 300);
};
</script>

<style scoped>
.number-filter {
  width: 100%;
}

.single-input {
  width: 100%;
}

.range-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.range-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.range-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color-secondary);
}

.filter-input {
  width: 100%;
}
</style>