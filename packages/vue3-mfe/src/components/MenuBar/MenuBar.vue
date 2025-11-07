<template>
  <div class="capps__menu_bar">
    <!-- The actual, visible Menubar component -->
    <Menubar :model="menu">
      <template #item="{ item, props, hasSubmenu }">
        <a 
          v-if="item.route" 
          v-ripple 
          href="javascript:void(0)" 
          v-bind="props.action" 
          :class="{ 'p-menuitem-active': activeRoute.includes(item.route) }"
          @click="navigateToRoute(item, props)"
        >
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
        <a 
          v-else 
          v-bind="props.action" 
          href="javascript:void(0)" 
          :class="{ 'p-menuitem-active': activeRoute.includes(item.route) }"
        >
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
          <span
            v-if="hasSubmenu"
            class="pi pi-fw pi-angle-down"
          />
        </a>
      </template>
    </Menubar>

    <!-- 
      Hidden container for measuring item widths.
      'visibility: hidden' and 'position: absolute' ensure it doesn't affect layout
      but its children can still be measured for their offsetWidth.
    -->
    <div class="measurement-container">
      <span 
        v-for="item in props.menuData" 
        :key="item.label" 
        :ref="el => { if (el) menuItemRefs.push(el) }" 
        class="menu-bar-item-measure"
      >
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
        <span
          v-if="item.items"
          class="pi pi-fw pi-angle-down"
        />
      </span>
    </div>
  </div>
</template>

<script setup>
const capps = window.capps;

import Menubar from 'primevue/menubar';
import vRipple from 'primevue/ripple';
import { computed, ref, onMounted, onUnmounted, watch, nextTick, onBeforeUpdate } from 'vue';
import debounce from 'lodash/debounce';

const props = defineProps({
  menuData: { type: Array, required: true },
  parentSelector: { type: String, required: true },
  activeRoute: { type: String, default: "/" },
});

function navigateToRoute(item, props) {
  console.log(props);
  capps.set_route(item.route);
}

// For measurement elements
const menuItemRefs = ref([]);
// This will hold the calculated number of items that can be displayed
const maxVisible = ref(props.menuData.length);

// This hook ensures the refs array is cleared before each render,
// so it can be repopulated correctly by the v-for.
onBeforeUpdate(() => {
  menuItemRefs.value = [];
});

const calculateMaxVisible = () => {
  const parentEl = document.querySelector(props.parentSelector);
  if (!parentEl) {
    return;
  }
  
  const parentWidth = parentEl.offsetWidth;
  const measurementItems = menuItemRefs.value;
  let usedWidth = 0;
  let visibleCount = 0;
  
  // A buffer for the "More" button, assuming it will be around 80px wide.
  const moreButtonBuffer = 80;

  for (const itemEl of measurementItems) {
    if (itemEl) {
      usedWidth += itemEl.offsetWidth;
      if (usedWidth + moreButtonBuffer > parentWidth) {
        break; // Stop counting, we've reached the limit
      }
      visibleCount++;
    }
  }
  
  // If all items fit, we don't need the buffer.
  let allItemsWidth = 0;
  measurementItems.forEach(item => { if(item) allItemsWidth += item.offsetWidth });
  
  if (allItemsWidth <= parentWidth) {
      maxVisible.value = props.menuData.length;
  } else {
      maxVisible.value = visibleCount;
  }
};

// Debounce the calculation for performance on resize
const debouncedCalculate = debounce(calculateMaxVisible, 150);

onMounted(() => {
  // Use nextTick to ensure the measurement elements are rendered before we calculate
  nextTick(() => {
    calculateMaxVisible();
    window.addEventListener('resize', debouncedCalculate);
  });
});
onUnmounted(() => {
  window.removeEventListener('resize', debouncedCalculate);
});

// Watch for data changes to recalculate
watch(() => props.menuData, () => {
  maxVisible.value = props.menuData.length;
  nextTick(() => {
    calculateMaxVisible();
  });
}, { deep: true, immediate: true });

const visibleMenuItems = computed(() => {
    return props.menuData.slice(0, maxVisible.value);
});

const overflowMenuItems = computed(() => {
    return props.menuData.slice(maxVisible.value);
});

const menu = computed(() => {
  if (overflowMenuItems.value.length === 0) return visibleMenuItems.value;
  return [
    ...visibleMenuItems.value,
    {
      label: 'More',
      icon: 'pi pi-ellipsis-h',
      items: overflowMenuItems.value
    }
  ];
});
</script>
<style lang="scss">
.capps__menu_bar {
  padding: 0px 16px;
  position: relative;
  width: 100%;
  min-width: 0;

  // PrimeVue variables override (double surety)
  .p-menubar {
    --p-menubar-background: #0a3972 !important;
    --p-menubar-color: #fff !important;
    --p-menubar-border-color: transparent !important;
    --p-menubar-root-list-item-text-color: #fff !important;
    --p-menubar-root-list-item-icon-color: #fff !important;
    --p-menubar-root-list-item-text-hover-color: #fff !important;
    --p-menubar-root-list-item-icon-hover-color: #fff !important;
    --p-menubar-root-list-item-text-active-color: #fff !important;
    --p-menubar-root-list-item-icon-active-color: #fff !important;
    --p-menubar-item-focus-background: rgba(21, 101, 192, 0.25) !important;
    --p-menubar-item-focus-color: #fff !important;
    --p-menubar-item-color: #fff !important;
    --p-menubar-item-active-background: rgba(21, 101, 192, 0.25) !important;
    --p-menubar-item-active-color: #fff !important;
    --p-menubar-submenu-background: #0a3972 !important;
    --p-menubar-submenu-border-color: transparent !important;
    --p-menubar-submenu-shadow: 0 2px 12px rgba(0,0,0,0.08) !important;
    --p-menubar-submenu-item-hover-background: rgba(21, 101, 192, 0.25) !important;
    --p-menubar-submenu-item-hover-color: #fff !important;
    --p-menubar-submenu-item-active-background: rgba(21, 101, 192, 0.25) !important;
    --p-menubar-submenu-item-active-color: #fff !important;
    background: #0a3972 !important;
    color: #fff !important;
    border: none !important;
    padding: 0;
    border-radius: 4px;
    .p-menubar-root-list {
      flex-wrap: nowrap;
    }
  }

  // Submenu overlays
  .p-menubar-submenu,
  .p-menu,
  .p-menu-overlay {
    background: #0a3972 !important;
    color: #fff !important;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    border: 1px solid #1976d2;
    margin-top: 4px;
  }

  // All menu items (top-level + submenu)
  .p-menuitem-content,
  .p-menuitem-link,
  .p-menuitem-text,
  .p-menuitem-icon,
  .pi {
    color: #fff !important;
    opacity: 1 !important;
    text-shadow: none !important;
  }

  // Hover/active/focus
  .p-menuitem-content:hover,
  .p-menuitem-content.p-menuitem-active,
  .p-menuitem-content:focus {
    background: rgba(21, 101, 192, 0.25) !important;
    color: #fff !important;
    opacity: 1 !important;
    backdrop-filter: blur(2px);
  }

  .p-menuitem-active {
    background: rgba(8, 72, 154) !important;
    color: #fff !important;
    opacity: 1 !important;
    backdrop-filter: blur(2px);
    border-radius: 5px;
  }

  // Force menu label text to white
  .p-menubar .p-menubar-item-link > span:not([class]) {
    color: #fff !important;
    opacity: 1 !important;
  }

  .p-menubar .p-menuitem-text,
  .p-menubar .p-menuitem-icon,
  .p-menubar .pi {
    color: #fff !important;
    opacity: 1 !important;
  }

  // Measurement container (hidden)
  .measurement-container {
    visibility: hidden;
    position: absolute;
    top: -9999px;
    left: -9999px;
    white-space: nowrap;
  }
  .menu-bar-item-measure {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.25rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: 1rem;
    gap: 0.5rem;
  }
  .menu-bar-item-measure > span {
    padding-right: 0.5rem;
  }
}

// .capps__menu_bar .p-menuitem-content a,
// .capps__menu_bar .p-menuitem-content a:visited {
//   color: #fff !important;
//   text-decoration: none !important;
// }
// .capps__menu_bar .p-menuitem-content a:hover,
// .capps__menu_bar .p-menuitem-content a:active {
//   color: #fff !important;
//   text-decoration: underline !important;
// }
</style>