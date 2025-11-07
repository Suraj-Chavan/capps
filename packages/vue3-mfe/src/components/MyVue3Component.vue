<script setup>
import { ref, onUnmounted } from 'vue';

const count = ref(0);

const props = defineProps({
  initialMessage: {
    type: String,
    required: true,
  },
  // Accept event handlers as props (Vue 3 convention: onEventName)
  onMessageUpdated: {
    type:  Function,
    required: true,
  },
  onCounterClicked: {
    type:  Function,
    required: true,
  },
});

// Define the events this component can emit
const emit = defineEmits(['messageUpdated', 'counterClicked']);

const intervalId = setInterval(() => {
  count.value++;
  const updatePayload = `Counter is now: ${count.value}`;
  // Call prop-based handler if it exists
  if (props.onMessageUpdated) {
    props.onMessageUpdated(updatePayload);
  }
  // Also emit normally for other potential Vue 3 internal listeners
  emit('messageUpdated', updatePayload);
}, 1000);

function handleCounterClick() {
  const clickPayload = { count: count.value, timestamp: Date.now() };
  console.log('[Vue3 MFE] Counter area clicked, emitting counterClicked event', clickPayload);
  if (props.onCounterClicked) {
    props.onCounterClicked(clickPayload);
  }
  emit('counterClicked', clickPayload);
}

onUnmounted(() => {
  clearInterval(intervalId);
  console.log('MyVue3Component unmounted, interval cleared.');
});
</script>
<template>
  <div>
    This is a vue3 component;
    <h4>{{ initialMessage }}</h4>
    <hr>
    <div 
      style="cursor: pointer; border: 1px solid green; padding: 5px; margin-top: 5px;" 
      @click="handleCounterClick"
    >
      Clickable Counter Area:
      <Transition>
        <span :key="count">{{ count }}</span>
      </Transition>
    </div>
  </div>
</template>