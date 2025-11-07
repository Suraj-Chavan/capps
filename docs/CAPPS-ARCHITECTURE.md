# CAPPS Architecture Guide

## Overview

CAPPS (Credence Application Platform and Services) follows a **schema-driven, component-based architecture** with clear separation of concerns between UI rendering, data management, and business logic.

## Core Architecture Patterns

### 1. Schema-Driven Development Flow

```
JSON Schema Definition → UI Component Generation → Event Handler Attachment → Data Processing
```

**File Locations:**
- Schema definitions: `{app}/rest/collection/{collection}/schema.json`
- Form events: `{app}/rest/collection/{collection}/form.js`
- List events: `{app}/rest/collection/{collection}/list.js`
- Menu configuration: `{app}/public/layout/menu.js`

### 2. Component Hierarchy & Data Flow

```
App.vue (Root)
└── RouterView
    └── CollectionScreen.vue (Main Container)
        ├── ListView.vue (List View)
        │   └── DataTable/CardView components
        └── FormScreen.vue (Form Container)
            └── InputForm.vue (Form Renderer)
                ├── Individual Field Components
                └── ChildCollectionGrid.vue (Nested Collections)
```

**Data Flow:**
1. **Schema Loading**: CollectionScreen loads schema from REST API
2. **Component Rendering**: FormScreen/ListView render based on schema
3. **Event Binding**: form.js/list.js events attached to rendered components
4. **User Interaction**: Events trigger business logic via event handlers
5. **Data Updates**: Changes propagated through Vuex store and REST calls

### 3. API Architecture Separation

#### Form API Context (`form.js` files)
```javascript
// current_form - READ ONLY field data
const customerName = current_form.CUSTOMER_NAME;

// frm - Form manipulation methods
frm.set_value('CUSTOMER_NAME', 'New Value');
frm.add_custom_button('Action', () => {});

// config - Session and configuration
const userRole = config.getSessionStorage('role');

// capps - Core framework APIs
capps.ui.toast({message: 'Success'});
capps.rest.get('/api/data');
```

#### List API Context (`list.js` files)
```javascript
// list.selectedRecords - Array of selected records
const selected = list.selectedRecords;

// list DOM manipulation methods
list.add_html('custom_section', '<div>Custom HTML</div>');
list.remove_html('custom_section');

// buttonColumns/buttonList - Action definitions
buttonColumns: [{
    label: 'Edit',
    handler: (record) => { /* action */ }
}]
```

### 4. Module Federation Integration

```
Main Vue 2 Application
├── Local Components (src/components/)
├── Vue3 MFE Package (packages/vue3-mfe/)
│   └── Exposed Components via Module Federation
└── External Remote Apps
    ├── app-components (Vue 2 components)
    └── page-builder (Layout components)
```

**Component Loading Pattern:**
```javascript
// Vue3 Component in Vue2 App
<Vue3ComponentLoader 
  :exposed-module="'./DataTable'"
  :component-props="{ data: tableData }"
  :component-events="{ rowSelect: handleRowSelect }"
/>
```

## Component Relationships

### 1. InputForm.vue - Form Rendering Engine

**Responsibilities:**
- Dynamic field rendering based on schema
- Validation rule application
- Custom button management
- Child collection integration
- Form submission handling

**Key Integration Points:**
- `cappsFormUtilityAPIs.js` - Form manipulation methods
- `FormComponents/` - Individual field type components
- `ChildCollectionGrid.vue` - Nested collection handling
- Vuex store for state management

### 2. CollectionScreen.vue - Main Data Container

**Responsibilities:**
- Schema loading and caching
- Route parameter handling
- View mode switching (list/form)
- Permission checking
- Loading state management

**Integration Pattern:**
```javascript
// Schema loading
this.schemaData = await capps.rest.get(`/rest/collection/${module}/${collection}/schema`);

// Component switching based on mode
if (this.$route.query.mode === 'form') {
    // Show FormScreen.vue
} else {
    // Show ListView.vue
}
```

### 3. HeaderBar.vue - Navigation System

**Responsibilities:**
- Menu rendering from menu.js configuration
- User authentication display
- Application switching
- Breadcrumb management

**Menu Integration:**
```javascript
// Menu loading pattern
const menuConfig = await import(`/apps/${appName}/public/layout/menu.js`);
this.menuItems = menuConfig.default;
```

### 4. DataTable/CardView - Data Presentation

**Responsibilities:**
- Server-side pagination
- Column-level filtering
- Row selection management
- Action button rendering

**Filter Integration:**
```javascript
// Filter format (KEY-VALUE PAIRS ONLY)
const filters = {
    "STATUS": "ACTIVE",
    "CREATED_DATE": "2024-01-01"
};
```

## Framework Limitations & Constraints

### 1. Filter Query Format
- **Supported**: `?filter={"FIELD":"VALUE"}` (key-value pairs only)
- **Not Supported**: Complex operators, nested queries, OR conditions
- **Workaround**: Use separate API endpoints for complex filtering

### 2. API Context Separation
- `current_form` contains ONLY field values (no methods)
- `frm` contains ONLY methods (no field data)
- **Mixing these contexts causes runtime errors**

### 3. Module Federation Constraints
- Vue 2 and Vue 3 components require wrapper components
- Async loading requires proper error handling
- Build order dependencies (Vue3 MFE must build before main app)

### 4. Event Handler Timing
- Form utilities use `setTimeout(..., 0)` for DOM updates
- **Always use async operations for DOM manipulations in form events**

## Data Flow Patterns

### 1. Form Submission Flow
```
User Input → Field Validation → form.js _onBeforeSave → 
Server Validation → Database Update → form.js _afterFormSubmit → 
UI Update/Redirect
```

### 2. List Action Flow
```
User Click → buttonColumns handler → Business Logic → 
Server Action → UI Feedback → List Refresh
```

### 3. Menu Navigation Flow
```
Menu Click → Route Change → CollectionScreen Mount → 
Schema Load → Component Render → Event Binding
```

## Performance Considerations

### 1. Schema Caching
- Schemas cached in Vuex store to prevent repeated API calls
- Cache invalidation on collection updates

### 2. Lazy Loading
- Form components loaded on-demand
- Large lists use server-side pagination
- Module federation components loaded asynchronously

### 3. Memory Management
- Component cleanup in beforeDestroy lifecycle
- Event listener removal to prevent memory leaks
- Vuex state cleanup on route changes

## Error Handling Patterns

### 1. Form Validation Errors
```javascript
// In _onBeforeSave
if (!validateData()) {
    throw new Error('Validation failed'); // Stops submission
}
```

### 2. API Error Handling
```javascript
// Standard error response
capps.rest.get('/api/data')
    .then(response => { /* success */ })
    .catch(error => {
        capps.ui.toast({
            message: error.message,
            type: 'error'
        });
    });
```

### 3. Component Loading Errors
```javascript
// Module federation error fallback
<Vue3ComponentLoader 
  :exposed-module="'./DataTable'"
  @error="handleComponentError"
/>
```

## Security Architecture

### 1. Role-Based Access Control
- Menu items filtered by user roles
- Collection permissions enforced at schema level
- Field-level security through schema configuration

### 2. Session Management
```javascript
// Access user session
const userRole = config.getSessionStorage('role');
const permissions = config.getSessionStorage('permissions');
```

### 3. API Security
- All REST calls include authentication headers
- CSRF protection on form submissions
- Input sanitization at field level

## Integration Points

### 1. External System Integration
- RPC plugins for custom business logic
- Event hooks for background processing
- REST API for third-party integrations

### 2. Database Integration
- Dynamic collection mapping
- Field type validation at database level
- Audit trail through event hooks

### 3. File System Integration
- File uploads through dedicated endpoints
- Bulk operations via file processing
- Report generation and downloads

This architecture ensures scalability, maintainability, and clear separation of concerns across the CAPPS framework.