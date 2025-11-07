<template>
  <div class="datatable-container">
    <DataTable
      v-model:filters="filters"
      v-model:multi-sort-meta="multiSortMeta"
      v-model:selection="selectedProduct"
      :value="products"
      lazy
      paginator
      :first="lazyParams.first"
      :rows="lazyParams.rows"
      :total-records="totalRecords"
      :loading="loading"
      filter-display="menu"
      data-key="id"
      :global-filter-fields="['name', 'category', 'code']"
      removable-sort 
      sort-mode="multiple"
      resizable-columns
      column-resize-mode="fit"
      reorderable-columns
      selection-mode="single"
      :row-class="rowClass"
      :virtual-scroller-options="virtualScroll ? { itemSize: 46 } : undefined"
      scrollable
      scroll-height="400px"
      table-style="min-width: 50rem"
      @page="onPage($event)"
      @sort="onSort($event)"
      @filter="onFilter($event)"
      @column-reorder="onColReorder"
    >
      <template #header>
        <div class="flex justify-content-between align-items-center">
          <h5 class="m-0">
            Product Catalog
          </h5>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="globalFilterValue"
              placeholder="Global Search"
              @input="onGlobalFilterInput"
            />
          </span>
        </div>
      </template>

      <Column
        selection-mode="single"
        header-style="width: 3rem"
      />
      <Column
        field="code"
        header="Code"
        sortable
        :filter="true"
        filter-placeholder="Search by code"
        :style="{minWidth: '10rem'}"
      >
        <template #filter="{filterModel,filterCallback}">
          <InputText
            v-model="filterModel.value"
            type="text"
            class="p-column-filter"
            placeholder="Search by code"
            @keydown.enter="filterCallback()"
          />
        </template>
      </Column>
      <Column
        field="name"
        header="Name"
        sortable
        :filter="true"
        filter-placeholder="Search by name"
        :style="{minWidth: '12rem'}"
      >
        <template #body="{data}">
          {{ data.name }}
        </template>
        <template #filter="{filterModel,filterCallback}">
          <InputText
            v-model="filterModel.value"
            type="text"
            class="p-column-filter"
            placeholder="Search by name"
            @keydown.enter="filterCallback()"
          />
        </template>
      </Column>
      <Column
        field="category"
        header="Category"
        sortable
        :filter="true"
        filter-field="category"
        :show-filter-match-modes="true"
        :filter-match-mode-options="categoryFilterMatchModes"
        :style="{minWidth: '10rem'}"
      >
        <template #body="{data}">
          <span :class="'product-category-' + data.category.toLowerCase()">{{ data.category }}</span>
        </template>
        <template #filter="{filterModel,filterCallback}">
          <!-- Example using a Dropdown for category filter -->
          <!-- <Dropdown v-model="filterModel.value" :options="['Electronics', 'Clothing', 'Home', 'Sports']" placeholder="Select Category" @change="filterCallback()" showClear /> -->
          <InputText
            v-model="filterModel.value"
            type="text"
            class="p-column-filter"
            placeholder="Search by category"
            @keydown.enter="filterCallback()"
          />
        </template>
      </Column>
      <Column
        field="quantity"
        header="Quantity"
        sortable
        :style="{minWidth: '8rem'}"
      >
        <template #body="{data}">
          {{ data.quantity }}
        </template>
      </Column>
      <Column
        field="price"
        header="Price"
        sortable
        :style="{minWidth: '8rem'}"
      >
        <template #body="{ data }">
          {{ formatCurrency(data.price) }}
        </template>
      </Column>
      <Column
        header="Actions"
        :exportable="false"
        :style="{minWidth: '10rem'}"
      >
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            outlined
            rounded
            class="mr-2"
            @click="editProduct(slotProps.data)"
          />
          <Button
            icon="pi pi-trash"
            outlined
            rounded
            severity="danger"
            @click="confirmDeleteProduct(slotProps.data)"
          />
        </template>
      </Column>

      <template #empty>
        No products found.
      </template>
      <template #loading>
        Loading products data. Please wait.
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
const loading = ref(false);
const totalRecords = ref(0);
const selectedProduct = ref(null);
const globalFilterValue = ref('');
const lazyParams = ref({
  first: 0,
  rows: 10, // For pagination or virtual scroll chunk size
  sortField: null,
  sortOrder: null,
  multiSortMeta: [], // For multi-column sort
  filters: {} // Will be populated by DataTable filter interactions
});
const products = ref([]); // Moved after lazyParams for clarity, though order doesn't strictly matter here

// --- PrimeVue Imports (Keep these local imports) ---
import { FilterMatchMode } from '@primevue/core/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
// import Dropdown from 'primevue/dropdown'; // If using dropdown for filters

// --- Column Filters ---
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  code: { value: null, matchMode: FilterMatchMode.STARTS_WITH }, // Simplified for PrimeVue 4+ direct v-model binding
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  category: { value: null, matchMode: FilterMatchMode.EQUALS }, // Example: EQUALS for dropdown
});

const categoryFilterMatchModes = [
  { label: 'Contains', value: FilterMatchMode.CONTAINS },
  { label: 'Starts With', value: FilterMatchMode.STARTS_WITH },
  { label: 'Equals', value: FilterMatchMode.EQUALS },
];

// --- Multi-column Sort ---
const multiSortMeta = ref([]); // Example: [{ field: 'category', order: 1 }, { field: 'name', order: -1 }]

// --- Mock Product Service ---
const ProductService = {
  async getProducts(params) {
    console.log('Fetching products with params:', params);
    return new Promise(resolve => {
    setTimeout(() => {
        const allProducts = Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          code: `P${1000 + i}`,
          name: `Product ${i + 1}`,
          category: ['Electronics', 'Clothing', 'Home', 'Sports'][i % 4],
          quantity: Math.floor(Math.random() * 100),
          price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
          inventoryStatus: (i % 3 === 0) ? 'INSTOCK' : (i % 3 === 1) ? 'LOWSTOCK' : 'OUTOFSTOCK'
        }));

        let filteredProducts = [...allProducts];

        // Apply global filter
        if (params.filters?.global?.value) {
          const globalVal = params.filters.global.value.toLowerCase()
          filteredProducts = filteredProducts.filter(p => {
          return (p.name.toLowerCase().includes(globalVal) ||
            p.code.toLowerCase().includes(globalVal) ||
            p.category.toLowerCase().includes(globalVal))
        })
        }

        // Apply column filters
        Object.entries(params.filters || {}).forEach(([field, filter]) => {
          if (field !== 'global' && filter && filter.value !== null && filter.value !== undefined && filter.value !== '') {
            filteredProducts = filteredProducts.filter(p => {
              const productValue = String(p[field]).toLowerCase();
              const filterValue = String(filter.value).toLowerCase();
              const matchMode = filter.matchMode || FilterMatchMode.CONTAINS; // Default if not set

              if (matchMode === FilterMatchMode.CONTAINS) return productValue.includes(filterValue);
              if (matchMode === FilterMatchMode.STARTS_WITH) return productValue.startsWith(filterValue);
              if (matchMode === FilterMatchMode.EQUALS) return productValue === filterValue;
              // Add more match modes as needed
              return true;
            });
          }
        });

        // Apply sorting (simplified for single sort, PrimeVue handles multiSortMeta internally for display)
        if (params.sortField) {          
          filteredProducts.sort((a, b) => {
            const valA = a[params.sortField];
            const valB = b[params.sortField];
            let comparison = 0;
            if (valA > valB) comparison = 1;
            else if (valA < valB) comparison = -1;
            return params.sortOrder === -1 ? comparison * -1 : comparison;
          });
        }
        // Note: For actual multi-sort on server, you'd iterate params.multiSortMeta

        const paginatedData = filteredProducts.slice(params.first, params.first + params.rows);
        resolve({ data: paginatedData, totalRecords: filteredProducts.length });
      }, 500);
    });
  }
};

// --- Data Loading ---
async function loadLazyData() {
  loading.value = true;
  const response = await ProductService.getProducts({
    ...lazyParams.value,
    filters: filters.value // Pass the current filters state, PrimeVue 4 handles its structure
  });
  products.value = response.data;
  totalRecords.value = response.totalRecords;
  loading.value = false;
}

onMounted(() => {
  loadLazyData();
});

// --- Event Handlers ---
function onPage(event) {
  lazyParams.value.first = event.first;
  lazyParams.value.rows = event.rows;
  loadLazyData();
}

function onSort(event) {
  // For PrimeVue 4+, v-model:multiSortMeta handles the state.
  // The event might provide sortField and sortOrder for single sort mode,
  // or multiSortMeta for multiple sort mode.
  // We update lazyParams based on what the DataTable provides.
  lazyParams.value.sortField = event.sortField;
  lazyParams.value.sortOrder = event.sortOrder;
  lazyParams.value.multiSortMeta = event.multiSortMeta || []; // Ensure it's an array
  console.log("Sort event:", event);
  lazyParams.value.first = 0; // Reset to first page on sort
  loadLazyData();
}

function onFilter(/*event*/) {
  // PrimeVue updates v-model:filters automatically.
  // The event.filters contains the current filter metadata.
  // We just need to reset pagination and reload.
  lazyParams.value.first = 0; // Reset to first page on filter
  // filters.value is already updated by v-model, so lazyParams.value.filters will reflect this in loadLazyData
  loadLazyData();
}

function onGlobalFilterInput() {
    filters.value.global.value = globalFilterValue.value;
    onFilter(); // Trigger data reload
}

function onColReorder(event) {
  console.log('Columns reordered:', event.columns);
  // You might want to save this order in user preferences
}

// --- Row Styling ---
function rowClass(data) {
  return data.inventoryStatus === 'OUTOFSTOCK' ? 'outofstock-row' : data.inventoryStatus === 'LOWSTOCK' ? 'lowstock-row' : null;
}

// --- Column Actions ---
function editProduct(product) {
  console.log('Edit product:', product);
  // Implement edit logic (e.g., open a dialog)
}

function confirmDeleteProduct(product) {
  console.log('Delete product:', product);
  // Implement delete confirmation and logic
}

// --- Formatting ---
function formatCurrency(value) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// Watch for changes in multiSortMeta if you need to trigger API calls based on it
watch(multiSortMeta, (newSortMeta) => {
    lazyParams.value.multiSortMeta = newSortMeta;
    lazyParams.value.first = 0; // Reset to first page
    // If your server handles multiSortMeta directly, you might not need this specific watch
    // if onSort already covers it. This is more for if you manually manage multiSortMeta.
    // loadLazyData();
}, { deep: true });

</script>

<style>
.datatable-container {
  padding: 1rem;
}

.outofstock-row {
  background-color: #ffcdd2 !important; /* Example: light red for out of stock */
  color: #c63737 !important;
}

.lowstock-row {
  background-color: #fff9c4 !important; /* Example: light yellow for low stock */
}

/* Add styles for category or other conditional styling */
.product-category-electronics {
    /* font-weight: bold; */
}
</style>