<template>
  <div class="date-filter">
    <!-- Single date input for most operators -->
    <div
      v-if="operator !== 'between'"
      class="single-input"
    >
      <Calendar
        :model-value="value"
        :placeholder="getPlaceholder()"
        class="filter-input"
        date-format="yy-mm-dd"
        :show-time="showTime"
        :time-only="timeOnly"
        @update:model-value="$emit('update:value', $event)"
        @date-select="onDateChange"
      />
    </div>
    
    <!-- Date range input for 'between' operator -->
    <div
      v-else
      class="range-input"
    >
      <div class="range-field">
        <label class="range-label">From:</label>
        <Calendar
          :model-value="rangeStart"
          placeholder="Start date"
          class="filter-input"
          date-format="yy-mm-dd"
          :show-time="showTime"
          :time-only="timeOnly"
          @update:model-value="$emit('update:range-start', $event)"
          @date-select="onRangeChange"
        />
      </div>
      <div class="range-field">
        <label class="range-label">To:</label>
        <Calendar
          :model-value="rangeEnd"
          placeholder="End date"
          class="filter-input"
          date-format="yy-mm-dd"
          :show-time="showTime"
          :time-only="timeOnly"
          @update:model-value="$emit('update:range-end', $event)"
          @date-select="onRangeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Calendar from 'primevue/calendar';

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
    type: [String, Date],
    default: null
  },
  rangeStart: {
    type: [String, Date],
    default: null
  },
  rangeEnd: {
    type: [String, Date],
    default: null
  },
  showTime: {
    type: Boolean,
    default: false
  },
  timeOnly: {
    type: Boolean,
    default: false
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
      return `Select ${label}`;
    case 'noteq':
      return `Exclude ${label}`;
    case 'gteq':
      return `From ${label}`;
    case 'lteq':
      return `Until ${label}`;
    default:
      return `Select ${label}`;
  }
};

const onDateChange = () => {
  setTimeout(() => {
    emit('filter-change');
  }, 100);
};

const onRangeChange = () => {
  setTimeout(() => {
    emit('filter-change');
  }, 100);
};
</script>

<style scoped>
.date-filter {
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