<template>
  <div
    ref="containerRef"
    class="datatable-container"
    @contextmenu="onContainerRightClick"
  >
    <DataTable
      v-if="props.columns && props.columns.length > 0"
      ref="dataTableRef"
      v-model:filters="internalFilters"
      v-model:sort-field="lazyParams.sortField"
      v-model:sort-order="lazyParams.sortOrder"
      v-model:selection="selectedRows"
      v-model:expandedRows="expandedRows"
      :value="tableData"
      :first="lazyParams.first"
      :rows="lazyParams.rows"
      striped-rows
      :total-records="props.totalRows"
      :loading="loading"
      :row-class="getRowClass"
      lazy
      :row-style="getRowStyle"
      :row-data="getRowAttrs"
      :virtual-scroller-options="virtualScrollOptions"
      :class="{'compact-table': compactMode}"
      :paginator="false"
      rowGroupMode="subheader"
      groupRowsBy="__GROUP_BY_SR_NO"
      filter-display="menu"
      data-key="SR_NO"
      removable-sort
      sort-mode="single"
      selection-mode="multiple"
      resizable-columns
      column-resize-mode="expand"
      reorderable-columns
      scrollable
      :scroll-height="props.dataTableScrollHeight"
      table-style="min-width: 50rem"
      @page="onPage"
      @sort="onSort"
      @filter="onFilter"
      @column-reorder="onColReorder"
      @column-resize-end="onColumnResizeEnd"
      @row-select="onRowSelect"
      @row-unselect="onRowUnselect"
      @row-select-all="onRowSelectAll"
      @row-unselect-all="onRowUnselectAll"
      @row-contextmenu="onRowRightClick"
    >
      <Column
        :reorderable="false"
        frozen
        :exportable="false"
        :reorderable-column="false"
        column-key="__GROUP_BY_SR_NO"
        field="__GROUP_BY_SR_NO"
        :sortable="false"
        :filterable="false"
        header=""
        :style="{ width: '4rem', maxWidth: 'min-content', textAlign: 'right' }"
        header-style="width: 0.8rem"
      />
      <Column
        :reorderable="false"
        frozen
        :exportable="false"
        :reorderable-column="false"
        column-key="SR_NO"
        field="SR_NO"
        :sortable="false"
        :filterable="false"
        header=""
        :style="{ width: '4rem', maxWidth: 'min-content', textAlign: 'right' }"
        header-style="width: 0.8rem"
      />
      <Column
        selection-mode="multiple"
        :reorderable="false"
        frozen
        :exportable="false"
        :reorderable-column="false"
        column-key="selection-col"
        :style="{ width: 'min-content', maxWidth: '10px' }"
        header-style="width: 0.8rem"
      />
      <!-- Row Expansion Column -->
      <Column 
        v-if="props.includeChildRecords"
        expander 
        frozen
        :reorderable="false"
        :exportable="false"
        :reorderable-column="false"
        column-key="expander-col"
        style="width: 3rem" 
      />
      <!-- Row Expansion Template -->
      <template 
        #expansion="{ data }"
      >
        <div class="nested-table-container">
          <!-- Render each child collection -->
          <div 
            v-for="(childConfig, fieldName) in props.childCollections"
            :key="fieldName"
            class="child-collection-section"
          >
            <div 
              class="child-collection-wrapper"
            >
              <!-- PrimeVue DataTable for child collection data -->
              <DataTable
                :value="data[fieldName] || []"
                class="nested-datatable"
                :paginator="false"
                :scrollable="true"
                striped-rows
                data-key="ID"
                table-style="min-width: 30rem"
                :show-grid-lines="true"
                resizable-columns
                column-resize-mode="expand"
                reorderable-columns
                scroll-height="300px"
              >
                <Column
                  v-for="col in childConfig.columnList"
                  :key="col.key"
                  :field="col.key"
                  :column-key="col.key"
                  :header="col.label || col.key"
                  :sortable="col.sortable"
                  :style="{ width: col.width ? (col.width + 10) + 'px' : 'auto', maxWidth: col.width ? (col.width + 10) + 'px' : 'auto' }"
                  :body-class="col.class"
                  :frozen="!!col.stickyColumn"
                >
                  <template #body="{ data: childRowData }">
                    {{ childRowData[col.key] }}
                  </template>
                </Column>
                <template #empty> 
                  No relevant data found 
                </template>
                <template #loading> 
                  Loading data. Please wait... 
                </template>
              </DataTable>
            </div>
          </div>
        </div>
      </template>
      <Column
        v-for="col in renderableColumns"
        :key="col.key"
        :field="col.key"
        :column-key="col.key"
        :header="(col.type === 'button' || col.type === 'button-group') ? (col.column_header ?? '     ') : (col.label || col.key)"
        :sortable="col.sortable"
        :filter="col.filter"
        :show-filter-menu="col.filterable"
        :filter-match-mode-options="getFilterMatchModeOptions(col.fieldtype)"
        :frozen="!!col.stickyColumn"
        :style="{ width: col.width ? (col.width + 10) + 'px' : 'auto', maxWidth: col.width ? (col.width + 10) + 'px' : 'auto' }"
        :body-class="col.class"
      >
        <!-- Column Filter Template -->
        <template
          v-if="col.filterable && col.type !== 'button'"
          #filter="{ filterModel, filterCallback }"
        >
          <!-- Use PrimeVue's built-in filter components -->
          <InputText 
            v-if="['textfield', 'textarea', 'email_address'].includes(col.fieldtype)"
            v-model="filterModel.value" 
            type="text" 
            class="p-column-filter" 
            placeholder="Search..." 
            @input="filterCallback()" 
          />
          <InputNumber
            v-else-if="['int', 'float'].includes(col.fieldtype)"
            v-model="filterModel.value"
            class="p-column-filter"
            placeholder="Enter number..."
            @input="filterCallback()"
          />
          <DatePicker
            v-else-if="['date', 'datetime'].includes(col.fieldtype)"
            v-model="filterModel.value"
            :dateFormat="getDateFormat(col.fieldtype)"
            :showTime="col.fieldtype === 'datetime'"
            :hourFormat="getHourFormat(col.fieldtype)"
            :showSeconds="getShowSeconds(col.fieldtype)"
            placeholder="Select date..."
            class="p-column-filter"
            @date-select="filterCallback()"
          />
          <InputText
            v-else-if="['select', 'radio', 'checkbox', 'switch'].includes(col.fieldtype)"
            v-model="filterModel.value"
            type="text"
            class="p-column-filter"
            placeholder="Search..."
            @input="filterCallback()"
          />
          <InputText 
            v-else
            v-model="filterModel.value" 
            type="text" 
            class="p-column-filter" 
            placeholder="Search..." 
            @input="filterCallback()" 
          />
        </template>

        <!-- Button column: Render a button in this column -->
        <template
          v-if="col.type === 'button'"
          #body="{ data }"
        >
          <Button
            v-if="col.show ? col.show(data) : true"
            :icon="col.icon"
            :label="col.label"
            class="p-button-text p-button-sm"
            @click="() => onClickEvent(col, data)"
          />
        </template>

        <!-- Button group column: Render grouped buttons as dropdown -->
        <template
          v-else-if="col.type === 'button-group'"
          #body="{ data }"
        >
          <div v-if="getVisibleGroupButtons(col.buttons, data).length > 0" class="button-group-container">
            <Button
              :label="col.label || ''"
              :icon="col.icon || 'pi pi-ellipsis-v'"
              :aria-haspopup="true"
              :aria-expanded="false"
              class="p-button-text p-button-sm"
              @click="(event) => toggleGroupMenu(event, `${col.key}-${data.SR_NO}`, col.buttons, data)"
            />
            <Menu
              :ref="(el) => { if (el) menuRefs[`${col.key}-${data.SR_NO}`] = el }"
              :model="getDropdownMenuItems(col.buttons, data)"
              :popup="true"
            />
          </div>
        </template>

        <!-- Normal column: Render formatted value with cell style and click handler -->
        <template
          v-else
          #body="{ data, field }"
        >
          <span
            class="cell-content"
            :class="{ 'clickable-cell': props.enableDoubleClickShowData }"
            :style="cellStyleMap[data.SR_NO]?.[field]"
            @dblclick="props.enableDoubleClickShowData && showFullData(String(formattedCellMap[data.SR_NO]?.[field] ?? ''))"
            v-html="formattedCellMap[data.SR_NO]?.[field] ?? ''"
          />
        </template>
      </Column>

      <template #groupheader="slotProps" v-if="props.rowHeaderTemplateRenderer">
        <div class="group-header-content" v-html="props.rowHeaderTemplateRenderer(slotProps.data)"></div>
      </template>
      <template #groupfooter="slotProps" v-if="props.rowFooterTemplateRenderer">
        <div class="group-footer-content" v-html="props.rowFooterTemplateRenderer(slotProps.data)"></div>
      </template>

      <template #empty> 
        No relevant data found 
      </template>
      <template #loading> 
        Loading data. Please wait... 
      </template>
    </DataTable>

    <div
      v-else
      class="text-center py-4"
    >
      <i
        class="pi pi-spin pi-spinner"
        style="font-size: 2em"
      />
      <div>Waiting for column configuration...</div>
    </div>

    <!-- Row Context Menu -->
    <ContextMenu 
      ref="rowContextMenu" 
      :model="rowContextMenuItems" 
    />

    <Dialog
      v-model:visible="showDialog"
      header="Content Overview"
      :modal="true"
      :dismissable-mask="true"
      style="width: 600px;"
    >
      <template #default>
        <div
          v-if="fullDataLoading"
          class="text-center py-4"
        >
          <i
            class="pi pi-spin pi-spinner"
            style="font-size: 2em"
          />
          <div>Loading...</div>
        </div>
        <pre
          v-else
          style="white-space: pre-wrap; max-height: 400px; overflow-y: auto;"
          v-html="fullData"
        />
      </template>
    </Dialog>

    <!-- Floating actions overlay, now a direct child of datatable-container -->
    <div
      v-if="props.enableHoverActions && hoveredRow"
      :class="['floating-row-actions-overlay', { 'overlay-minimized': actionsMinimized }]"
      :style="floatingActionsStyle"
    >
      <div
        class="actions-container"
        :class="{ 'actions-container--expanded': !actionsMinimized }"
      >
        <Button
          v-for="(action, idx) in props.actions"
          :key="idx"
          :icon="action.icon"
          :outlined="action.outlined !== false"
          :rounded="action.rounded !== false"
          :severity="action.severity"
          :disabled="action.disabled"
          :title="action.label"
          @click="() => action.onClick && action.onClick(hoveredRow)"
        />
      </div>
      <Button
        :key="togglePulse + '-' + (hoveredRow ? hoveredRow.SR_NO : '')"
        :icon="actionsMinimized ? 'pi pi-ellipsis-h' : 'pi pi-chevron-right'"
        outlined
        rounded
        :title="actionsMinimized ? 'Show actions' : 'Hide actions'"
        :class="['actions-toggle-button', 'distinct-toggle', { 'toggle-highlight': togglePulse, 'minimized-pulse-animation': actionsMinimized }]"
        @click.stop="actionsMinimized = !actionsMinimized"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, reactive, watchEffect, onBeforeUnmount, nextTick } from 'vue';
import capps from "capps";
import {
    hasOwn,
} from "@credenceanalytics/utilities";
import debounce from 'lodash/debounce';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

import DatePicker from 'primevue/datepicker';
import { globalDateFormatShort, globalDateFormatLong } from "config";
// import isEqual from 'lodash/isEqual';
const emit = defineEmits(['data-metrics-updated', 'update:currentPage', 'update:filters', 'row-select', 'row-unselect', 'reset-selections', "update:sortByField", "update:sortByOrder"]);

const props = defineProps({
  fetchData: { type: Function, required: true },
  columns: { type: Array, required: true },
  currentPage: { type: Number, default: 1 },
  perPage: { type: Number, default: 20 },
  compactMode: { type: Boolean, default: false },
  totalRows: { type: Number, default: 0 },
  rowRenderer: {
    type: Function,
    default: () => ({})
  },
  columnRowColorize: {
    type: Object,
    default: () => ({})
  },
  formatters: {
    type: Object,
    default: () => ({})
  },
  rowHeaderTemplateRenderer: {
    type: Function,
    default: null
  },
  rowFooterTemplateRenderer: {
    type: Function,
    default: null
  },
  collection: {
    type: String,
    default: "",
  },
  localeEl: {
    type: Object,
    default: () => ({})
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  actions: {
    type: Array,
    default: () => []
  },
  refreshKey: {
    type: [String, Number],
    default: Date.now()
  },
  enableDoubleClickShowData: {
    type: Boolean,
    default: false
  },
  enableHoverActions: {
    type: Boolean,
    default: true
  },
  sortByField: { type: String, default: null },
  sortByOrder: { type: Number, default: null },
  dataTableScrollHeight: { type: String, default: "calc(100vh - 190px)" },
  
  // Row expansion props
  includeChildRecords: { type: Boolean, default: false },
  childCollections: { type: Object, default: () => ({}) },
  expandDataKey: { type: String, default: 'ID' },
});

// This ref is used for rendering the columns. It is initialized once with the correct
// order and widths and is NOT modified by reorder/resize events to prevent re-render conflicts.
const renderableColumns = ref([]);
// This is a non-reactive, plain JS variable used ONLY for persistence logic.
let persistedColumnState = { order: [], widths: {} };
const tableData = ref([]);
const loading = ref(false);
const selectedRows = ref([]);

// Row expansion state
const expandedRows = ref({}); // PrimeVue expects an object for v-model:expandedRows

const lazyParams = ref({
  first: 0,
  rows: props.perPage,
  sortField: null,
  sortOrder: null,
});

const STORAGE_KEY = computed(() => `datatable-state-${props.collection}`);
const dataTableRef = ref(null); // Reference to the PrimeVue DataTable component
const containerRef = ref(null); // Reference to the .datatable-container div
const hoveredRow = ref(null); // Stores the data of the currently hovered row
const floatingActionsStyle = ref({}); // Stores dynamic styles for the floating overlay
const actionsMinimized = ref(false); // State for the new minimize feature (default: not minimized)

// Context menu for table rows
const rowContextMenu = ref(null);
const rowContextMenuItems = ref([]);

// Helper function to get default match mode for field type (only supported operators)
const getMatchModeForFieldType = (fieldtype) => {
  const matchModeMap = {
    'textfield': FilterMatchMode.CONTAINS, // Changed from STARTS_WITH to CONTAINS
    'textarea': FilterMatchMode.CONTAINS,
    'select': FilterMatchMode.EQUALS,
    'date': FilterMatchMode.DATE_IS,
    'datetime': FilterMatchMode.DATE_IS,
    'float': FilterMatchMode.EQUALS,
    'int': FilterMatchMode.EQUALS,
    'email_address': FilterMatchMode.CONTAINS,
    'checkbox': FilterMatchMode.EQUALS,
    'switch': FilterMatchMode.EQUALS,
    'radio': FilterMatchMode.EQUALS,
  };
  return matchModeMap[fieldtype] || FilterMatchMode.CONTAINS; // Changed default from STARTS_WITH to CONTAINS
};

// Create a reactive filter state
const filterState = ref({});

// Initialize filters when columns change
watch(() => props.columns, (newColumns) => {
  if (newColumns && newColumns.length > 0) {
    const filters = {};
    newColumns.forEach(col => {
      if (col.filterable && col.key) {
        filters[col.key] = {
          operator: FilterOperator.AND,
          constraints: [{ 
            value: null, 
            matchMode: getMatchModeForFieldType(col.fieldtype) 
          }]
        };
      }
    });
    filterState.value = filters;
  }
}, { immediate: true });

// Create a writable computed property to proxy the `filters` prop for v-model.
const internalFilters = computed({
  get: () => filterState.value,
  set: (value) => {
    filterState.value = value;
    emit('update:filters', value);
  }
});

// --- PrimeVue Imports (Keep these local imports) ---
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';
import ContextMenu from 'primevue/contextmenu';


const onClickEvent = (col, data) => {
  col.handler && col.handler(data, { context: 'list' });
}

// Helper functions for button group handling
function getVisibleGroupButtons(buttons, data) {
  return buttons.filter(btn => btn.show ? btn.show(data) : true);
}

function getDropdownMenuItems(buttons, data) {
  const visibleButtons = getVisibleGroupButtons(buttons, data);
  
  // Return all buttons as menu items
  return visibleButtons.map(btn => ({
    label: btn.label,
    icon: btn.icon,
    command: () => onClickEvent(btn, data)
  }));
}

// Store menu refs
const menuRefs = ref({});

// Function to toggle the group menu
function toggleGroupMenu(event, menuKey) {
  const menuComponent = menuRefs.value[menuKey];
  if (menuComponent && menuComponent.toggle) {
    menuComponent.toggle(event);
  }
}

// import NumberFilter from './filters/NumberFilter.vue';

// --- Virtual Scroll Row Height Management ---
const normalRowHeight = ref(40); // Default/initial height for normal mode
const compactRowHeight = ref(32); // Default/initial height for compact mode

// This effect dynamically measures the actual rendered row height and updates the
// reactive refs. This makes the virtual scroller robust against CSS changes to row padding/height.
watchEffect(async () => {
    // We need rows to be present to measure an element.
    if (tableData.value.length === 0) return;

    // Wait for the DOM to be updated after a change (e.g., compactMode toggle).
    await nextTick();

    const firstRowEl = dataTableRef.value?.$el?.querySelector('.p-datatable-tbody tr');
    if (firstRowEl) {
        const measuredHeight = firstRowEl.offsetHeight;
        if (measuredHeight > 0) {
            if (props.compactMode) {
                compactRowHeight.value = measuredHeight;
            } else {
                normalRowHeight.value = measuredHeight;
            }
        }
    }
});

// --- Virtual Scroll Option ---
// The itemSize is now dynamically bound to our measured heights.
const virtualScrollOptions = computed(() => ({
    itemSize: props.compactMode ? compactRowHeight.value : normalRowHeight.value,
    buffer: 2
}));

// --- Row Styling ---
function getRowClass(data) {
  const rendererResult = props.rowRenderer ? props.rowRenderer(data) : {};
  const classes = [];

  if (rendererResult.class) {
    classes.push(rendererResult.class);
  }

  if (hoveredRow.value && hoveredRow.value.SR_NO === data.SR_NO) {
    classes.push('row-hovered');
  }
  return classes.join(' ');
}

function getRowStyle(data) {
  const res = props.rowRenderer ? props.rowRenderer(data) : {};
  return res.style || {};
}

function getRowAttrs(data) {
  const res = props.rowRenderer ? props.rowRenderer(data) : {};
  return res.attrs || {};
}

const debouncedLoadData = debounce(loadData, 300);

// 1. Mounted मधून debouncedLoadData() काढा (delete करा)

// 2. Existing columns watcher — फक्त column state साठी
watch(() => props.columns, (newColumns) => {
    if (newColumns && newColumns.length > 0) {
        loadColumnState();
    }
}, { immediate: true, deep: true });

// 3. Optimised watcher — data load साठी, duplicate call टाळण्यासाठी
watch(
  [() => props.columns, () => props.sortByField, () => props.sortByOrder],
  ([columns, field, order]) => {
    if (columns && columns.length > 0) {
      lazyParams.value.sortField = field;
      lazyParams.value.sortOrder = order;

      debouncedLoadData();
    }
  },
  { immediate: true }
);

// 4. refreshKey watcher — parent कडून refresh साठी
watch(() => props.refreshKey, () => {
  // Props → Local state sync
  lazyParams.value.sortField = props.sortByField;
  lazyParams.value.sortOrder = props.sortByOrder;
  debouncedLoadData();
});

watch([() => props.sortByField, () => props.sortByOrder], ([field, order]) => {
    const sortChanged = lazyParams.value.sortField !== field || lazyParams.value.sortOrder !== order;
    if (sortChanged) {
        lazyParams.value.sortField = field;
        lazyParams.value.sortOrder = order;
        onSort();
    }
}, { immediate: false });

// --- Event Handlers ---
function onPage(event) {
  lazyParams.value.first = event.first;
  lazyParams.value.rows = event.rows;
  debouncedLoadData();
}

function onSort() {
  // With v-model:sortField and v-model:sortOrder, lazyParams is already updated.
  emit('update:sortByField', lazyParams.value.sortField);
  emit('update:sortByOrder', lazyParams.value.sortOrder);
  // We just need to reset to the first page and reload the data.
  lazyParams.value.first = 0; // Reset internal paginator state for PrimeVue
  emit('update:currentPage', 1); // IMPORTANT: Reset parent's page state to 1
  debouncedLoadData();
}

function onFilter(event) {
  // Only trigger API call when filters are actually applied, not on every keystroke
  // PrimeVue menu-based filtering triggers this when Apply button is clicked
  console.log('🔍 Filter applied:', event.filters);
  
  // Update internal filter state
  filterState.value = event.filters;
  console.log('🔍 Updated filterState.value:', filterState.value);
  
  // Update the filters prop to parent component
  emit('update:filters', event.filters);
  
  lazyParams.value.first = 0; // Reset internal paginator state for PrimeVue
  emit('update:currentPage', 1); // IMPORTANT: Reset parent's page state to 1
  
  // Wait for next tick to ensure state is updated before loading data
  nextTick(() => {
    console.log('🔍 filterState.value before loadData:', filterState.value);
    debouncedLoadData();
  });
}

function onColReorder(event) {
  // Update the order in our plain JS variable for persistence.
  // We do NOT update the `renderableColumns` ref, allowing PrimeVue to handle the
  // DOM reordering without a conflicting Vue re-render.
  const movedItem = persistedColumnState.order.splice(event.dragIndex, 1)[0];
  persistedColumnState.order.splice(event.dropIndex, 0, movedItem);
  saveColumnState();
}

function onColumnResizeEnd(event) {
    // Add a guard clause to ensure event.column exists. This can happen if a resize
    // event is triggered programmatically (e.g., after a reorder) without a specific column context.
    if (!event || !event.column) return;
    // In PrimeVue 4, event.column is the column component instance.
    const columnComponent = event.column;
    const columnKey = columnComponent.props.columnKey;

    // The corresponding <th> element is available via the component's $el
    const thElement = columnComponent.$el;
    if (!thElement || !columnKey) return;

    const newWidth = thElement.offsetWidth;

    // Update the width in our plain JS variable for persistence.
    // The style adds 10px for padding/border, so we store the base width.
    persistedColumnState.widths[columnKey] = newWidth - 10;
    saveColumnState();
}

function saveColumnState() {
    // Save the plain JS variable to localStorage.
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify(persistedColumnState));
}

// Context menu functions for table rows
function onRowRightClick(event) {
  event.originalEvent.preventDefault(); // Prevent browser's default context menu
  showContextMenu(event.originalEvent);
}

// Context menu function for empty table area
function onContainerRightClick(event) {
  // Only show context menu if right-click is on empty area (not on rows)
  // Check if the click target is not within a table row
  const clickedElement = event.target;
  const isOnRow = clickedElement.closest('tr[role="row"]');
  
  if (!isOnRow) {
    event.preventDefault(); // Prevent browser's default context menu
    showContextMenu(event);
  }
}

// Common function to show context menu
function showContextMenu(event) {
  // Build context menu items
  rowContextMenuItems.value = [
    {
      label: 'Clear All Column Filters',
      icon: 'pi pi-filter-slash',
      command: () => clearAllColumnFilters(),
      disabled: !hasAnyColumnFilters()
    }
  ];
  
  // Show context menu at cursor position
  rowContextMenu.value.show(event);
}


function hasAnyColumnFilters() {
  return Object.keys(filterState.value || {}).some(key => {
    if (key === 'global') return false; // Skip global filter
    
    const columnFilter = filterState.value[key];
    if (!columnFilter) return false;
    
    // Check if there are constraints with values
    if (columnFilter.constraints && columnFilter.constraints.length > 0) {
      return columnFilter.constraints.some(constraint => {
        const value = constraint.value;
        // Consider null, undefined, empty string, and empty array as no filter
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      });
    }
    
    // Check direct value
    const value = columnFilter.value;
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
}


function clearAllColumnFilters() {
  console.log('🗑️ Clearing all column filters');
  console.log('🔍 Current filterState.value before clearing:', JSON.stringify(filterState.value, null, 2));
  
  // Create updated filters object, preserving global filter and structure
  const updatedFilters = { ...filterState.value };
  
  // Clear all column filter values while preserving filter structure
  Object.keys(updatedFilters).forEach(key => {
    if (key === 'global') return; // Skip global filter
    
    const filterConfig = updatedFilters[key];
    if (filterConfig) {
      // Clear constraint values while preserving structure
      if (filterConfig.constraints && Array.isArray(filterConfig.constraints)) {
        filterConfig.constraints.forEach(constraint => {
          constraint.value = null;
          // Also clear any other constraint properties that might hold values
          if (hasOwn(constraint, 'values')) {
            constraint.values = [];
          }
        });
      }
      
      // Also clear direct value if it exists
      if (hasOwn(filterConfig, 'value')) {
        filterConfig.value = null;
      }
      
      // Clear direct values array if it exists (for multi-select filters)
      if (hasOwn(filterConfig, 'values')) {
        filterConfig.values = [];
      }
    }
  });
  
  console.log('🔍 Updated filters after clearing:', JSON.stringify(updatedFilters, null, 2));
  
  // Update filter state
  filterState.value = updatedFilters;
  
  // Emit updated filters to parent
  emit('update:filters', updatedFilters);
  
  // Reload data with cleared filters
  nextTick(() => {
    debouncedLoadData();
  });
}

/**
 * Creates a deep copy of an object or array, preserving functions.
 * This is safer than JSON.parse(JSON.stringify(obj)) which strips functions.
 * @param {any} obj The object or array to clone.
 * @returns {any} A deep copy of the input.
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  const clone = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}

function loadColumnState() {
    const savedStateRaw = localStorage.getItem(STORAGE_KEY.value);
    let loadedState;

    if (savedStateRaw) {
        try {
            const parsed = JSON.parse(savedStateRaw);
            if (parsed.order && parsed.widths) {
                loadedState = parsed;
            }
        } catch (e) {
            console.error("Failed to parse column state, using default.", e);
        }
    }

    const baseColumns = deepClone(props.columns);
    const columnMap = new window.Map(baseColumns.map(c => [c.key, c]));
    const newOrderedColumns = [];

    if (loadedState) {
        persistedColumnState = loadedState;

        // Use the saved order to build the array for rendering
        persistedColumnState.order.forEach(key => {
            if (columnMap.has(key)) {
                const col = columnMap.get(key);
                col.width = persistedColumnState.widths[key] || col.width; // Apply saved width
                newOrderedColumns.push(col);
                columnMap.delete(key); // Remove from map to track remaining
            }
        });

        // Add any new columns from props that weren't in the saved state
        columnMap.forEach(col => newOrderedColumns.push(col));
        
        // Also update the persisted state with any new columns that might have been added
        persistedColumnState.order = newOrderedColumns.map(c => c.key);
    } else {
        // No saved state, use defaults from props
        newOrderedColumns.push(...baseColumns);
        persistedColumnState = {
            order: baseColumns.map(c => c.key),
            widths: baseColumns.reduce((acc, col) => {
                if (col.width) {
                    acc[col.key] = col.width;
                }
                return acc;
            }, {})
        };
    }

    // Finally, set the ref that the template uses for its one-time render.
    renderableColumns.value = newOrderedColumns;
}

async function loadData() {
  resetSelection();
  tableData.value = [];
  tableData.value.length = 0;

  loading.value = true;
	// For lazy virtual scrolling, we must use the parameters from the virtual scroller event.
	const start = lazyParams.value.first;
	const limit = lazyParams.value.rows;
	const page = (start / limit) + 1; // Recalculate page for compatibility if the host's fetchData needs it.

  let responseData = [];
  let totalItems = 0;

  await nextTick();
  
  try {
    // Translate column filters in Vue 3 context to avoid reactivity issues
    const translatedColumnFilters = translateColumnFilters(filterState.value);
    
    console.log('📊 External filters (Vue 2):', props.filters);
    console.log('📊 Column filters (Vue 3 raw):', filterState.value);
    console.log('📊 Column filters (translated):', translatedColumnFilters);

    const result = await props.fetchData({
			start: start,
			limit: limit,
			page: page,
      ...lazyParams.value,
      filters: props.filters || {}, // External filters (standard filters, quick filters, etc.)
      columnFilters: translatedColumnFilters // Pre-translated column filters ready for API
    });

    // Case 1: Successful response is a plain array of data.
    if (Array.isArray(result)) {
      responseData = result;
      // Attempt to get total records from a legacy property on the first row.
      if (responseData.length > 0 && responseData[0]?.RC_INTERNAL) {
        totalItems = responseData[0].RC_INTERNAL;
      } else {
        totalItems = props.totalRows > responseData.length ? props.totalRows : responseData.length;
      }
    }
    // Case 2: Response is an object (could be error or { data, totalRecords }).
    else if (result && typeof result === 'object') {
      if (result.status === 'unsuccess' || result.error) {
        console.error("API Error:", result.error || 'An unsuccessful status was returned.');
      } else if (Array.isArray(result.data)) { // For flexibility, also handle the object wrapper format
        responseData = result.data;
        totalItems = result.totalRecords || 0;
      }
    }
  } catch (e) {
    console.error("Failed to fetch data:", e);
  }

  // Process data to add duplicate field for grouping
  // This allows the original SR_NO field to remain visible as a column
  const processedData = responseData.map(row => ({
    ...row,
    __GROUP_BY_SR_NO: row.SR_NO // Create duplicate field for grouping purposes
  }));
  
  tableData.value = processedData;

  // Pagination info
  const itemsOnPage = responseData.length;
  const firstRecordOnPage = itemsOnPage > 0 ? start + 1 : 0;
  const lastRecordOnPage = itemsOnPage > 0 ? start + itemsOnPage : 0;

  // Emit data-metrics-updated for parent
  emit('data-metrics-updated', {
    totalRows: totalItems,
    firstRecord: firstRecordOnPage,
    lastRecord: lastRecordOnPage
  });
  loading.value = false;
}

onMounted(() => {
  // Conditionally attach hover action listeners for better performance
  if (props.enableHoverActions) {
    // Use a watcher for `tableData` to ensure listeners are re-attached if data changes
    watch(tableData, (newRows) => {
      if (newRows.length > 0 && dataTableRef.value && dataTableRef.value.$el) {
        const tbody = dataTableRef.value.$el.querySelector('.p-datatable-tbody');
        if (tbody) {
          tbody.removeEventListener('mouseover', handleRowMouseOver); // Remove old listeners first
          tbody.removeEventListener('mouseleave', handleRowMouseLeave);
          tbody.addEventListener('mouseover', handleRowMouseOver);
          tbody.addEventListener('mouseleave', handleRowMouseLeave);
        }

        // Also attach a mouseleave listener to the main container to hide actions
        // if mouse leaves the entire table area.
        if (containerRef.value) {
          containerRef.value.removeEventListener('mouseleave', handleContainerMouseLeave);
          containerRef.value.addEventListener('mouseleave', handleContainerMouseLeave);
        }
      }
    }, { immediate: true });
  }
});

// Clean up event listeners when the component is unmounted to prevent memory leaks
onBeforeUnmount(() => {
  // Conditionally clean up hover listeners if they were attached
  if (props.enableHoverActions) {
    if (dataTableRef.value && dataTableRef.value.$el) {
      const tbody = dataTableRef.value.$el.querySelector('.p-datatable-tbody');
      if (tbody) {
        tbody.removeEventListener('mouseover', handleRowMouseOver);
        tbody.removeEventListener('mouseleave', handleRowMouseLeave);
      }
      if (containerRef.value) {
        containerRef.value.removeEventListener('mouseleave', handleContainerMouseLeave);
      }
    }
  }
});

// Event handler for mouseover on table rows
function handleRowMouseOver(event) {
  const rowEl = event.target.closest('tr[data-p-index]'); // Find the closest row element
  if (rowEl && containerRef.value) {
    const rowIndex = parseInt(rowEl.getAttribute('data-p-index')); // Get row index from PrimeVue's data attribute
    if (isNaN(rowIndex)) return; // Ensure rowIndex is a valid number

    // actionsMinimized.value = false; // Always reset to minimized on new row hover

    hoveredRow.value = tableData.value[rowIndex]; // Set the hovered row data
    if (!hoveredRow.value) return; // Ensure we have data for the row

    const rowRect = rowEl.getBoundingClientRect(); // Get position and size of the hovered row
    // Use the main container's bounding rectangle for correct relative positioning
    const containerRect = containerRef.value.getBoundingClientRect();

    // Get container's computed style to read its padding
    const containerStyles = window.getComputedStyle(containerRef.value);
    const containerPaddingRight = parseFloat(containerStyles.paddingRight);

    // Find the scrollable wrapper to account for the vertical scrollbar width
    const scrollableWrapper = dataTableRef.value.$el.querySelector('.p-datatable-wrapper');
    let scrollbarWidth = 0;
    if (scrollableWrapper) {
      // Calculate the width of the vertical scrollbar if it's present
      scrollbarWidth = scrollableWrapper.offsetWidth - scrollableWrapper.clientWidth;
    }

    // Calculate top position relative to the .datatable-container
    const top = rowRect.top - containerRect.top;

    floatingActionsStyle.value = {
      top: `${top}px`,
      // Adjust the 'right' position to account for container padding and the scrollbar
      right: `${scrollbarWidth + containerPaddingRight}px`,
      height: `${rowRect.height}px`, // Match the height of the hovered row
      opacity: 1, // Make visible
      pointerEvents: 'auto', // Enable clicks
    };
  }
}

// Event handler for mouseleave on table rows
function handleRowMouseLeave(event) {
  const rowEl = event.target.closest('tr[data-p-index]');
  const relatedTarget = event.relatedTarget;

  // Check if the mouse is moving out of the row AND not into the floating actions overlay
  if (rowEl && !rowEl.contains(relatedTarget) && !relatedTarget?.closest('.floating-row-actions-overlay')) {
    hoveredRow.value = null; // Clear hovered row data
    floatingActionsStyle.value.opacity = 0; // Hide with transition
    floatingActionsStyle.value.pointerEvents = 'none'; // Disable clicks
    actionsMinimized.value = false; // Reset on leave
  }
}

// New function to handle mouseleave from the entire container
function handleContainerMouseLeave() {
  // This ensures the floating actions are hidden if the mouse leaves the entire component
  hoveredRow.value = null;
  floatingActionsStyle.value.opacity = 0;
  floatingActionsStyle.value.pointerEvents = 'none';
  actionsMinimized.value = false; // Reset on leave
}


// --- Formatting ---
const formattedCellMap = reactive({});
const cellStyleMap = reactive({});

watchEffect(() => {
  console.log("Formatter watch effect called");
  Object.keys(formattedCellMap).forEach(k => delete formattedCellMap[k]);
  Object.keys(cellStyleMap).forEach(k => delete cellStyleMap[k]);
  tableData.value.forEach((row) => {
    const rowKey = row.SR_NO;
    formattedCellMap[rowKey] = {};
    cellStyleMap[rowKey] = {};
    props.columns.forEach((col) => {
      const field = col.key;
      // Format value
      if (props.formatters && typeof props.formatters[field] === 'function') {
        formattedCellMap[rowKey][field] = props.formatters[field](row[field], field, row);
      } else {
        formattedCellMap[rowKey][field] = row[field];
      }

      // Style
      if (props.columnRowColorize && typeof props.columnRowColorize[field] === 'function') {
        const result = props.columnRowColorize[field](row);
        if (result && result.style) {
          if (typeof result.style === 'string') cellStyleMap[rowKey][field] = result.style;
          else if (typeof result.style === 'object')
            cellStyleMap[rowKey][field] = Object.entries(result.style).map(([k, v]) => `${k}: ${v}`).join('; ');
        } else {
          cellStyleMap[rowKey][field] = '';
        }
      } else {
        cellStyleMap[rowKey][field] = '';
      }
    });
  });
});

const showDialog = ref(false);
const fullData = ref('');
const fullDataLoading = ref(false);

async function showFullData(value) {
  // 1. Set the dialog to visible and show the loading spinner.
  //    Clear out old data to ensure the spinner is not momentarily replaced by stale content.
  fullData.value = '';
  fullDataLoading.value = true;
  showDialog.value = true;

  // 2. Wait for the next DOM update cycle. This gives Vue and the browser
  //    time to render the dialog and its loading spinner without being
  //    blocked by the heavy content. This makes the dialog appear instantly.
  await nextTick();

  // 3. Now that the dialog is visible, assign the potentially large data.
  //    While rendering this might still take a moment, it happens *after*
  //    the dialog has already appeared, improving perceived performance.
  fullData.value = value;
  fullDataLoading.value = false;
}

watch([() => props.currentPage, () => props.perPage], () => {
  lazyParams.value.first = (props.currentPage - 1) * props.perPage;
  lazyParams.value.rows = props.perPage;
  debouncedLoadData();
});

function resetSelection() {
  selectedRows.value = [];
  selectedRows.value.length = 0;
  emit("reset-selections")
}

function onRowSelect(event) {
  const row = event.data || event.value;
  emit('row-select', row);
}

function onRowUnselect(event) {
  const row = event.data || event.value;
  emit('row-unselect', row);
}

function onRowSelectAll(event) {
  // The event.data contains an array of all rows selected on the current page.
  event.data.forEach(row => emit('row-select', row));
}

function onRowUnselectAll() {
  // When unselecting all, PrimeVue does not provide the unselected rows in the event.
  // However, we know that all currently displayed rows were just unselected.
  tableData.value.forEach(row => emit('row-unselect', row));
}

const togglePulse = ref(false);

watch(hoveredRow, (val) => {
  if (val) {
    togglePulse.value = false;
    nextTick(() => {
      togglePulse.value = true;
    });
  } else {
    togglePulse.value = false;
  }
});

// --- Column Filter Translation ---
/**
 * Translate PrimeVue column filters to CAPPS API filter format
 * Moved from Vue 2 Main-Screen-Layout to Vue 3 DataTable to avoid reactivity issues
 */
function translateColumnFilters(filters) {
  console.log('🔧 [Vue3] Translating column filters:', filters);
  console.log('🔧 [Vue3] Filters type:', typeof filters);
  console.log('🔧 [Vue3] Filters keys:', Object.keys(filters || {}));
  
  const columnFilters = [];
  
  // Skip global filter as it's handled separately
  Object.entries(filters || {}).forEach(([fieldName, filterConfig]) => {
    console.log(`🔍 [Vue3] Processing filter for field: ${fieldName}`, filterConfig);
    console.log(`🔍 [Vue3] FilterConfig has constraints:`, !!filterConfig.constraints);
    
    // Find the column definition to get field type
    const columnDef = props.columns.find(col => col.field === fieldName || col.key === fieldName);
    const fieldType = columnDef?.fieldtype;
    
    if (fieldName === 'global' || !filterConfig) {
      console.log(`⏭️ [Vue3] Skipping ${fieldName} - global or no config`);
      return;
    }

    // Handle constraint-based filtering structure (PrimeVue menu-based filters)
    let operator, value;
    
    if (filterConfig.constraints && filterConfig.constraints.length > 0) {
      // Menu-based filtering with constraints
      const constraint = filterConfig.constraints[0];
      console.log(`📋 [Vue3] Found constraint for ${fieldName}:`, constraint);
      console.log(`🔍 [Vue3] Constraint value:`, constraint.value, `type:`, typeof constraint.value);
      
      // More robust value checking - check for null, undefined, empty string, but allow 0
      if (constraint.value === null || constraint.value === undefined || constraint.value === "") {
        console.log(`⏭️ [Vue3] Skipping ${fieldName} - constraint value is null, undefined, or empty string`);
        return; // Skip if no value
      }
      operator = constraint.matchMode;
      value = constraint.value;
      
      // Format date values according to configured format
      if (fieldType && ['date', 'datetime'].includes(fieldType) && value instanceof Date) {
        const formattedValue = formatDateValue(value, fieldType);
        console.log(`🗓️ [Vue3] Formatted date value for ${fieldName}:`, value, '->', formattedValue);
        value = formattedValue;
      }
      
      console.log(`✅ [Vue3] Using constraint for ${fieldName}: operator=${operator}, value=${value}`);
    } else {
      console.log(`⏭️ [Vue3] Skipping ${fieldName} - no constraints structure`);
      console.log(`🔍 [Vue3] FilterConfig structure:`, filterConfig);
      return; // Skip if no value
    }

    // Map PrimeVue FilterMatchMode to CAPPS API operators
    // Supported: like | in | eq | noteq | gteq | lteq
    const operatorMapping = {
      'startsWith': 'like',
      'contains': 'like',
      'notContains': 'noteq',
      'endsWith': 'like',
      'equals': 'eq',
      'notEquals': 'noteq',
      'lt': 'lteq', // Use lteq as closest match
      'lte': 'lteq',
      'gt': 'gteq', // Use gteq as closest match
      'gte': 'gteq',
      'between': 'between', // Handle separately
      'dateIs': 'eq',
      'dateIsNot': 'noteq',
      'dateBefore': 'lteq',
      'dateAfter': 'gteq'
    };

    const mappedOperator = operatorMapping[operator] || operator;

    // Create filter object using CAPPS API structure: {field, value, asgn}
    // Only use supported operators: like | in | eq | noteq | gteq | lteq
    switch (mappedOperator) {
      case 'like':
        columnFilters.push({
          field: fieldName,
          value: value, // Raw value, API handles % patterns
          asgn: 'like'
        });
        break;
      
      case 'eq':
        columnFilters.push({
          field: fieldName,
          value: value,
          asgn: 'eq'
        });
        break;
      
      case 'noteq':
        columnFilters.push({
          field: fieldName,
          value: value,
          asgn: 'noteq'
        });
        break;
      
      case 'in':
        if (Array.isArray(value) && value.length > 0) {
          columnFilters.push({
            field: fieldName,
            value: value,
            asgn: 'in'
          });
        }
        break;
      
      case 'gteq':
        columnFilters.push({
          field: fieldName,
          value: value,
          asgn: 'gteq'
        });
        break;
      
      case 'lteq':
        columnFilters.push({
          field: fieldName,
          value: value,
          asgn: 'lteq'
        });
        break;
      
      case 'between':
        if (value && value.start && value.end) {
          columnFilters.push(
            {
              field: fieldName,
              value: value.start,
              asgn: 'gteq'
            },
            {
              field: fieldName,
              value: value.end,
              asgn: 'lteq'
            }
          );
        } else if (value && value.start) {
          columnFilters.push({
            field: fieldName,
            value: value.start,
            asgn: 'gteq'
          });
        } else if (value && value.end) {
          columnFilters.push({
            field: fieldName,
            value: value.end,
            asgn: 'lteq'
          });
        }
        break;
      
      default:
        // Default to equals for unknown operators
        columnFilters.push({
          field: fieldName,
          value: value,
          asgn: 'eq'
        });
        break;
    }
  });

  console.log('📋 [Vue3] Column filters translated:', columnFilters);
  return columnFilters;
}

// Convert Moment.js date format to PrimeVue DatePicker format
function convertMomentToPrimeVueFormat(momentFormat) {
  if (!momentFormat) return 'dd/mm/yy';
  
  console.log('🔄 Converting Moment format:', momentFormat);
  
  // PrimeVue DatePicker format tokens (based on official docs):
  // d = day (no leading zero), dd = day (two digit)
  // m = month (no leading zero), mm = month (two digit) 
  // y = year (two digit), yy = year (four digit)
  // Note: Time is handled separately via hourFormat and showSeconds props
  
  let primeVueFormat = momentFormat;
  
  // Remove time components first since PrimeVue handles them separately
  // Remove time patterns: HH:mm:ss, hh:mm:ss, H:mm, h:mm, etc.
  primeVueFormat = primeVueFormat.replace(/\s*[Hh]{1,2}:[mm]{1,2}(:[ss]{1,2})?\s*/, '');
  primeVueFormat = primeVueFormat.replace(/\s*[AaPp][Mm]\s*/, ''); // Remove AM/PM
  
  // Clean up any trailing/leading spaces or separators
  primeVueFormat = primeVueFormat.trim();
  
  // Step 1: Handle years (YYYY -> yy for 4-digit, YY -> y for 2-digit)
  primeVueFormat = primeVueFormat.replace(/YYYY/g, 'yy');  // 4-digit year -> yy
  primeVueFormat = primeVueFormat.replace(/YY/g, 'y');     // 2-digit year -> y
  
  // Step 2: Handle months
  primeVueFormat = primeVueFormat.replace(/MM/g, 'mm');    // 2-digit month -> mm
  primeVueFormat = primeVueFormat.replace(/(?<!m)M(?![M])/g, 'm'); // Single M -> m (not part of MM)
  
  // Step 3: Handle days 
  primeVueFormat = primeVueFormat.replace(/DD/g, 'dd');    // 2-digit day -> dd
  primeVueFormat = primeVueFormat.replace(/(?<!d)D(?![D])/g, 'd'); // Single D -> d (not part of DD)
  
  console.log('✅ Converted to PrimeVue format (date only):', primeVueFormat);
  return primeVueFormat;
}

// Get configurable date format for field type
function getDateFormat(fieldtype) {
  let momentFormat;
  
  if (fieldtype === 'datetime') {
    // For datetime fields, use long format which typically includes time
    momentFormat = globalDateFormatLong || 'MM/DD/YYYY HH:mm';
  } else if (fieldtype === 'date') {
    // For date fields, use short format
    momentFormat = globalDateFormatShort || 'MM/DD/YYYY';
  } else {
    momentFormat = 'MM/DD/YYYY';
  }
  
  // Convert Moment.js format to PrimeVue format
  return convertMomentToPrimeVueFormat(momentFormat);
}

// Get hour format for DatePicker (12 or 24 hour)
function getHourFormat(fieldtype) {
  if (fieldtype === 'datetime') {
    const momentFormat = globalDateFormatLong || 'MM/DD/YYYY HH:mm';
    // Check if format uses 24-hour (HH/H) or 12-hour (hh/h) format
    if (/HH?/.test(momentFormat)) {
      return "24"; // 24-hour format
    } else if (/hh?/.test(momentFormat)) {
      return "24"; // Still use 24-hour as hh in moment can mean 24-hour in some contexts
    }
  }
  return "24"; // Default to 24-hour format
}

// Get whether to show seconds in time picker
function getShowSeconds(fieldtype) {
  if (fieldtype === 'datetime') {
    const momentFormat = globalDateFormatLong || 'MM/DD/YYYY HH:mm';
    // Check if format includes seconds (ss or s)
    return /ss?/.test(momentFormat);
  }
  return false;
}

// Format date value according to configured format
function formatDateValue(dateValue, fieldType) {
  if (!dateValue || !(dateValue instanceof Date)) {
    return dateValue; // Return as-is if not a Date object
  }
  
  const momentFormat = fieldType === 'datetime' 
    ? (globalDateFormatLong || 'DD-MM-YYYY HH:mm:ss')
    : (globalDateFormatShort || 'DD-MM-YYYY');
  
  console.log('🗓️ Formatting date value:', dateValue, 'with format:', momentFormat);

  const cappsfieldtype = fieldType === 'datetime' ? 'Datetime' : 'Date';
  const formattedValue = capps.format(dateValue, {
    fieldtype: cappsfieldtype,
    format: momentFormat
  });
  console.log('✅ Formatted date result (capps.format):', formattedValue);
  return formattedValue;
}

// Get filter match mode options for all field types (excluding unsupported operators)
function getFilterMatchModeOptions(fieldtype) {
  // Only return operators supported by the API: like, in, eq, noteq, gteq, lteq
  // Remove: startsWith, notContains, endsWith
  const supportedOptions = [
    { label: 'Contains', value: FilterMatchMode.CONTAINS },
    { label: 'Equals', value: FilterMatchMode.EQUALS },
    { label: 'Not Equals', value: FilterMatchMode.NOT_EQUALS },
    { label: 'Less Than', value: FilterMatchMode.LESS_THAN },
    { label: 'Less Than or Equal', value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
    { label: 'Greater Than', value: FilterMatchMode.GREATER_THAN },
    { label: 'Greater Than or Equal', value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO }
  ];

  // For date fields, use only date-specific operators
  if (['date', 'datetime'].includes(fieldtype)) {
    return [
      { label: 'Date Is', value: FilterMatchMode.DATE_IS },
      { label: 'Date Is Not', value: FilterMatchMode.DATE_IS_NOT },
      { label: 'Date Before', value: FilterMatchMode.DATE_BEFORE },
      { label: 'Date After', value: FilterMatchMode.DATE_AFTER }
    ];
  }

  // For numeric fields, focus on comparison operators
  if (['int', 'float'].includes(fieldtype)) {
    return [
      { label: 'Equals', value: FilterMatchMode.EQUALS },
      { label: 'Not Equals', value: FilterMatchMode.NOT_EQUALS },
      { label: 'Less Than', value: FilterMatchMode.LESS_THAN },
      { label: 'Less Than or Equal', value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO },
      { label: 'Greater Than', value: FilterMatchMode.GREATER_THAN },
      { label: 'Greater Than or Equal', value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO }
    ];
  }

  // For text fields, use contains and equals (no startsWith, endsWith, notContains)
  if (['textfield', 'textarea', 'email_address'].includes(fieldtype)) {
    return [
      { label: 'Contains', value: FilterMatchMode.CONTAINS },
      { label: 'Equals', value: FilterMatchMode.EQUALS },
      { label: 'Not Equals', value: FilterMatchMode.NOT_EQUALS }
    ];
  }

  // For select/dropdown fields, use equals only
  if (['select', 'radio', 'checkbox', 'switch'].includes(fieldtype)) {
    return [
      { label: 'Equals', value: FilterMatchMode.EQUALS },
      { label: 'Not Equals', value: FilterMatchMode.NOT_EQUALS }
    ];
  }

  // Default for all other field types
  return supportedOptions;
}
</script>

<style lang="scss">
:root {
  --surface-ground: #f8f9fa;
  --surface-section: #ffffff;
  --surface-card: #ffffff;
  --surface-overlay: #ffffff;
  --surface-border: #dee2e6;
  --surface-hover: #e9ecef;
  --text-color: #495057;
  --text-color-secondary: #6c757d;
}
@media (prefers-color-scheme: dark) {
  :root {
    --surface-ground: #f8f9fa !important;
    --surface-section: #ffffff !important;
    --surface-card: #ffffff !important;
    --surface-overlay: #ffffff !important;
    --surface-border: #dee2e6 !important;
    --surface-hover: #e9ecef !important;
    --text-color: #495057 !important;
    --text-color-secondary: #6c757d !important;
  }
}

.datatable-container {
  padding: 1rem;
  position: relative; // Crucial for positioning the floating overlay

  .p-datatable {
    background: #ffffff;
  }
}

.row-hovered {
  /* Use !important to override default PrimeVue hover/striped styles if necessary */
  background-color: #f1f5f9 !important; 
  transition: background-color 0.2s ease-in-out;
}

.lowstock-row {
  background-color: #fff9c4 !important;
}

.compact-table tr,
.compact-table td,
.compact-table th {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  padding-left: 6px !important;
  padding-right: 6px !important;
  font-size: 0.92em !important;
}
.clickable-cell {
  // cursor: pointer;
}


.p-datatable .p-datatable-tbody > tr > td .cell-content {
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.p-dialog .p-dialog-content pre {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
}

// Header right align fix
::v-deep(.p-datatable-thead > tr > th.text-right) {
  text-align: right !important;
}

// --- Header Ellipsis ---
// This is the container for the title and icons. It must hide its overflow
// for the inner title's ellipsis to be triggered correctly.
.p-datatable .p-column-header-content {
  overflow: hidden;
}

// Apply ellipsis to the column title text if it overflows.
// This targets the specific title span within the flexbox header content
// to avoid clipping the sort/filter icons.
.p-datatable .p-column-header-content .p-column-title {
  /* Let the title grow and shrink, with a basis of 0. This is a robust way to handle flex shrinking. */
  flex: 1 1 0;
  min-width: 0; /* Required to allow shrinking below the content's intrinsic width. */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// --- Virtual Scroll Cell Padding ---
// Reduce cell padding in normal mode to ensure it fits within the fixed row height.
.p-datatable.p-datatable-virtual-scroll .p-datatable-tbody > tr > td {
    // Use flexbox to vertically center content and remove vertical padding.
    // This is the most robust way to guarantee the cell's content fits within the
    // strict row height required by the virtual scroller.
    display: flex;
    align-items: center;
    // Use !important to override any conflicting styles (e.g., from compact-mode)
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

// --- Virtual Scroll Row Height ---
// Enforce a fixed height on rows when virtual scrolling is active.
// This is crucial for performance and must match the `itemSize` in `virtualScrollOptions`.
.p-datatable-virtual-scroll .p-datatable-tbody > tr {
  height: 40px;
}
.compact-table.p-datatable-virtual-scroll .p-datatable-tbody > tr {
  height: 32px;
}
.p-datatable.p-datatable-virtual-scroll .p-datatable-tbody > tr > td {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

// New style for the floating actions overlay
.floating-row-actions-overlay {
  position: absolute;
  right: 0;
  min-width: unset;
  background-color: rgba(255, 255, 255, 0.35); /* Default: glassy effect */
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(8px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: flex-end; // Important: keep actions and toggle to the right
  gap: 0;
  pointer-events: auto;
  transition: opacity 0.3s ease-in-out;
  padding-right: 10px;
  padding-left: 0;
  box-shadow: -3px 0 5px rgba(0,0,0,0.1);
  z-index: 10;
  width: auto; /* Important: only as wide as content */
  max-width: none;
}

.floating-row-actions-overlay.overlay-minimized {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
}

/* New: outer wrappers for flex layout */
.actions-container-outer {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
}
.toggle-btn-outer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  height: 100%;
  margin-left: 0.5rem;
}

.actions-container {
  display: flex;
  gap: 12px;
  align-items: center;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transform: translateX(20px);
  transition: max-width 0.3s, opacity 0.2s, transform 0.3s;
  white-space: nowrap;
  margin-right: 2.5rem; // Toggle button width + gap
  padding-left: 0.5rem;
}

.actions-container--expanded {
  max-width: 500px;
  opacity: 1;
  transform: translateX(0);
}

.actions-toggle-button {
  margin-left: 8px;
}

.actions-toggle-button.distinct-toggle {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding: 0.2rem 0.4rem !important;
  min-width: 1.8rem;
  font-size: 1.1em;
  opacity: 0.7;
  transition: background 0.2s, opacity 0.2s;
  align-self: flex-end;
  z-index: 2;
  position: relative; /* Needed for the ping animation pseudo-element */
}
.actions-toggle-button.distinct-toggle .p-button-icon {
  /* Target the icon directly to ensure color animation works and overrides other styles. */
  color: var(--toggle-icon-color, #1976d2) !important;
  transition: color 0.2s;
}
.actions-toggle-button.distinct-toggle:hover {
  background: #e3e6ea !important;
  opacity: 1;
}
.actions-toggle-button.distinct-toggle:hover .p-button-icon {
  color: #ff9800 !important; /* Orange on hover for extra visibility */
}

/* Highlight animation for toggle button */
@keyframes toggle-pulse {
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
}
.toggle-highlight {
  animation: toggle-pulse 1.2s ease-out 2;
}

/* New "ping" animation to draw attention to the minimized toggle button */
@keyframes ping-effect {
  75%, 100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.minimized-pulse-animation {
  /* The button itself doesn't animate, but its pseudo-element does. */
}

.minimized-pulse-animation::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #1976d2; /* Primary blue color for the ping */
  animation: ping-effect 1.5s infinite cubic-bezier(0, 0, 0.2, 1);
  z-index: -1; /* Place the ping effect behind the button's icon */
}

.floating-row-actions-overlay {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0;
}

.actions-container {
  margin-right: 0.5rem;
}

// Icon color for action buttons
.floating-row-actions-overlay .p-button .p-button-icon {
  color: #1976d2; /* Primary blue */
}
.floating-row-actions-overlay .p-button.p-button-danger .p-button-icon {
  color: #d32f2f; /* Red for danger */
}
.floating-row-actions-overlay .p-button.p-button-success .p-button-icon {
  color: #388e3c; /* Green for success */
}

// Compact mode: reduce gap between buttons
.compact-table .floating-row-actions-overlay {
  gap: 4px;
}

// Compact mode: make action buttons and icons even smaller, add top/bottom spacing
.compact-table .floating-row-actions-overlay .p-button {
  min-width: 1rem;
  padding: 0.04rem 0.12rem;
  font-size: 0.78em;
  margin-top: 2px;
  margin-bottom: 2px;
}
.compact-table .floating-row-actions-overlay .p-button .p-button-icon {
  font-size: 0.82em;
}

// Normal mode: reduce row vertical padding for denser look
.p-datatable .p-datatable-tbody > tr > td {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

.p-datatable .p-datatable-thead > tr > th {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

.p-datatable .p-datatable-tbody > tr > td[data-p-selection-column="true"] {
  text-overflow: unset !important;
  overflow: visible !important;
  white-space: normal !important;
  max-width: unset !important;
  min-width: 2.5rem !important;
}

// PrimeVue 2.x/3.x (class based)
.p-datatable .p-datatable-tbody > tr > td.p-selection-column {
  text-overflow: unset !important;
  overflow: visible !important;
  white-space: normal !important;
  max-width: unset !important;
}

// Extra: Header साठी पण (जर dots वर येत असतील)
.p-datatable .p-datatable-thead > tr > th[data-pc-column-key="selection-col"],
.p-datatable .p-datatable-thead > tr > th.p-selection-column {
  text-overflow: unset !important;
  overflow: visible !important;
  white-space: normal !important;
  max-width: unset !important;
}

.floating-row-actions-overlay .p-button {
  border-color: #1976d2 !important; /* Primary blue */
}
.floating-row-actions-overlay .p-button.p-button-danger {
  border-color: #d32f2f !important; /* Red for danger */
}
.floating-row-actions-overlay .p-button.p-button-success {
  border-color: #388e3c !important; /* Green for success */
}

// Compact mode: reduce row vertical padding for even denser look
.compact-table .p-datatable-tbody > tr > td {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

.compact-table .p-datatable-thead > tr > th {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

// Row hovered class को relative बनाओ ताकि overlay row के अंदर align हो
.p-datatable-tbody > tr.row-hovered {
  position: relative;
  z-index: 2;
}

/* Table rows with context menu */
.p-datatable-tbody > tr {
  cursor: context-menu;
}

/* Container with context menu (for empty table areas) */
.datatable-container {
  cursor: context-menu;
}

/* Override cursor for specific elements inside container */
.datatable-container .p-datatable-header,
.datatable-container .p-column-header-content,
.datatable-container .p-paginator {
  cursor: default;
}

/* Context menu styling */
.p-contextmenu {
  min-width: 200px;
}

.p-contextmenu .p-menuitem-text {
  font-size: 0.875rem;
}

.p-contextmenu .p-menuitem-icon {
  margin-right: 0.5rem;
}

/* Group header and footer styling */
/* Colspan is fixed via JavaScript - see fixGroupRowColspan() function */
.group-header-content,
.group-footer-content {
  width: 100%;
  display: block;
}
</style>