# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CAPPS (Credence Application Platform and Services) is a Vue.js 2 framework for building financial applications. This is the UI component of a larger microservices-based platform that includes REST services, event consumers, and page builders.

## Development Commands

### Core Development
- **Development server**: `npm run serve` (runs on port 8888)
- **Build**: `npm run build`
- **Tests**: `npm run test` (Jest unit tests)
- **JSON Server** (mock data): `npm run jsonserver` (port 50001)

### Vue3 MFE (Micro-Frontend)
- **Vue3 MFE Development**: `cd packages/vue3-mfe && npm run serve` (runs on port 7979 with HTTPS)
- **Vue3 MFE Build**: `cd packages/vue3-mfe && npm run build` (outputs to `dist__vue3-mfe/`)
- **Vue3 MFE Lint**: `cd packages/vue3-mfe && npm run lint`

### Configuration
- **App configuration**: `npm run appconfig` - Manages application configuration setup

## Architecture Overview

### Core Framework Structure
- **Framework Core**: `src/Framework/capps.js` - Main framework entry point exposing REST, RPC, UI, and utility APIs
- **Bootstrap**: `src/main.js` → `src/bootstrap.js` - Application initialization with config loading
- **Configuration**: Dynamic config loading from `config.js` with product-specific overrides

### Key Architectural Components

#### 1. Module Federation Setup
- Uses webpack module federation for micro-frontends
- Remote applications configured in `micro-frontend-configs/`
- Supports loading external components (app-components, page-builder)
- **Vue3 MFE Integration**: `packages/vue3-mfe/` - Local Vue 3 micro-frontend with PrimeVue components

#### 2. Framework API Structure (`src/Framework/`)
- **REST API** (`JS API/REST/`) - HTTP request handling via `capps.rest.{app}.{collection}` pattern
- **RPC API** (`JS API/RPC/`) - Remote procedure calls via `capps.rpc.{app}.{plugin}.{function}` pattern for custom business logic
- **UI API** (`JS API/UI/`) - UI utilities and components
- **Common Utilities** - Shared utility functions

#### 3. CAPPS Module System (`src/modules/CAPPS/`)
- **CollectionScreen.vue** - Main data collection interface
- **FormScreen.vue** - Form rendering and handling
- **ListView.vue** - List/table data presentation
- **Block components** - ModuleBlock.vue, CollectionBlock.vue for layout

#### 4. Form System (`src/modules/FormComponents/`)
- Dynamic form field rendering with validation
- Field types: TextField, SelectField, DateField, NumberField, etc.
- Form element mapping and custom validation rules

#### 5. Data Visualization (`src/components/DataVisualisation/`)
- TableView and CardView components
- Pagination and filtering capabilities
- Chart integration (ApexCharts, Chart.js, Plotly)

### State Management (Vuex)
- **Store modules** in `src/store/modules/`
- Key stores: `collectionBlock.store.js`, `moduleBlock.store.js`, `cappsPageConfigurations.store.js`

### Testing Setup
- Jest configuration in `jest.config.js`
- Unit tests in `src/**/*.tests.js`
- Mock setup in `__tests__/__mocks__/`

## Key Development Patterns

### Configuration Management
- Global config object loaded dynamically at startup
- Product-specific configurations (funds, mercury, etc.) in `public/config.*.example.js`
- Environment-specific settings for NREST/JREST endpoints

### Import Aliases and Module Resolution
- **`@/`** - Standard Vue CLI alias pointing to `src/` directory (e.g., `import store from "@/store"`)
- **`config.js`** - Custom alias pointing to `./config/` directory (resolved via webpack alias)
- **External modules**: `Plotly`, `config`, `capps` are configured as webpack externals
- **Config imports**: Use `from "config.js"` to import dynamic configuration loader
- **Config access**: Runtime config available as `from "config"` for micro-frontend configurations

### Component Architecture
- Vue 2 with Bootstrap-Vue for UI components
- Mixin-based functionality in `src/mixins/`
- Custom directives in `src/directives/`

### API Integration
- REST calls through `credCAPI` utility (`src/utils/credCAPI/`)
- Server-side pagination and filtering
- Event-driven notifications system

### Schema-Driven Development
- JSON schema definitions drive form and list rendering
- Schema files in `json_server/capps/` for development
- Dynamic field validation and UI generation

## Important File Locations

### Configuration Files
- `vue.config.js` - Webpack and dev server configuration with custom aliases
- `public/config.js` - Runtime configuration loader
- `config/index.js` - Configuration loader with error handling and overlay
- `config/applicationDetails.js` - App-specific settings

### Core Framework Files
- `src/Framework/capps.js` - Main framework API exports
- `src/bootstrap.js` - Application bootstrapping
- `src/ourVue.js` - Vue instance configuration

### Key Components
- `src/App.vue` - Root application component
- `src/modules/CAPPS/CollectionScreen.vue` - Primary data collection interface
- `src/components/layout/layout.vue` - Dashboard layout system

## Development Guidelines

### When Working with Forms
- Form fields are dynamically generated from schema configurations
- Custom field types should extend base field classes in `src/modules/FormComponents/formFields/`
- Validation rules are defined in `src/utils/veeValidateRules/`

### When Working with Collections
- Use existing collection utilities in `src/modules/CollectionStateUtilities/`
- List rendering follows the ListJS pattern with configurable formatters
- Filter and search functionality is schema-driven

### When Adding New Features
- Follow the existing modular structure under `src/modules/`
- Use the centralized store pattern for state management
- Integrate with the existing notification system via `src/plugins/Notifications/`

### Micro-Frontend Integration
- Remote components loaded via webpack module federation
- Configuration in `micro-frontend-configs/remotes.js`
- Lazy loading for performance optimization

### Vue3 Component Integration (Local Mono-repo)
This project includes a local Vue 3 micro-frontend in `packages/vue3-mfe/` that provides modern Vue 3 components to the Vue 2 application.

#### Architecture:
- **Location**: `packages/vue3-mfe/` - Self-contained Vue 3 application with PrimeVue UI library
- **Build Output**: Components are built to `dist__vue3-mfe/` directory
- **Module Federation**: Exposes Vue 3 components via webpack module federation as `capps_vue3_package`
- **Integration**: Loaded in Vue 2 app via `Vue3ComponentLoader` component

#### Available Vue3 Components:
- `MyVue3Component` - Basic Vue 3 component example
- `DataTable` - PrimeVue-based data table component  
- `MenuBar` - PrimeVue menu bar component
- `RecordSummaryDetails` - Record summary component for financial data

#### How to Use Vue3 Components in Vue2 App:
```vue
<Vue3ComponentLoader 
  :exposed-module="'./DataTable'"
  :component-props="{ data: tableData, columns: columns }"
  :component-events="{ rowSelect: handleRowSelect }"
/>
```

#### Key Files:
- `packages/vue3-mfe/vue.config.js` - Module federation configuration
- `packages/vue3-mfe/src/exposes/` - Entry points for exposed components
- `packages/vue3-mfe/src/utils/createMfeInterface.js` - Vue 3 component wrapper utility
- `src/components/Vue3ComponentLoader/Vue3ComponentLoader.vue` - Vue 2 loader component
- Configuration: `remoteApp3` in `public/config.*.example.js` files

#### Development Workflow:
1. Develop Vue 3 components in `packages/vue3-mfe/src/components/`
2. Create expose entry in `packages/vue3-mfe/src/exposes/`
3. Add to module federation exposes in `packages/vue3-mfe/vue.config.js`  
4. Build Vue3 MFE: `cd packages/vue3-mfe && npm run build`
5. Use in Vue 2 app via `Vue3ComponentLoader`

## Collection Form Styling

The CAPPS InputForm component (`src/modules/FormComponents/InputForm.vue`) includes unique CSS selectors that allow for collection-specific styling overrides without affecting other forms like filters or quick filters.

### Available CSS Selectors

#### Root Container Selectors
- **`.capps_input_form`** - Root container class for the entire InputForm component
- **`.capps_input_form--{collection-name}`** - Root container specific to collection
- **`.capps_input_form--{module}-{collection}`** - Root container specific to module+collection
- **`.capps_input_form--{action}`** - Root container specific to action (add, update, view)
- Use these for overall layout changes, button positioning, sidebar styling, and container-level modifications

#### Form Content Selectors  
- **`.capps-collection-form`** - Base class for the form content area only
- Use for general collection form styling that applies to form fields and content

#### Collection-Specific Selectors
- **`.capps-collection-form--{collection-name}`** - Collection-specific styling
  - Example: `.capps-collection-form--users`, `.capps-collection-form--orders`
  - Use for styling specific to one collection across all modules

#### Module + Collection Specific Selectors  
- **`.capps-collection-form--{module}-{collection}`** - Highly specific targeting
  - Example: `.capps-collection-form--hrms-employees`, `.capps-collection-form--finance-invoices`
  - Use for styling unique to a collection within a specific module

#### Action-Based Selectors
- **`.capps-form-action--{action}`** - Action-specific styling (add, update, view)
  - Example: `.capps-form-action--add`, `.capps-form-action--view`, `.capps-form-action--update`
  - Use for styling based on form mode/action

### Usage Examples

#### Root Container Styling (Layout, Buttons, Overall Structure)

```css
/* Style the entire InputForm container */
.capps_input_form {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 12px;
}

/* Change button layout for specific collections */
.capps_input_form--invoices .section-header .d-flex {
  flex-direction: column;
  gap: 0.5rem;
}

/* Custom button styles for specific collections */
.capps_input_form--accounting-ledger .capps-btn {
  font-size: 0.9rem;
  padding: 0.375rem 0.75rem;
}

/* Hide sidebar for specific collections */
.capps_input_form--simple-forms .side-collection-container {
  display: none !important;
}

/* Adjust main content area when sidebar is hidden */
.capps_input_form--simple-forms .col-9,
.capps_input_form--simple-forms .col-12 {
  flex: 0 0 100% !important;
  max-width: 100% !important;
}

/* Action-specific container styling */
.capps_input_form--view {
  pointer-events: none;
}

.capps_input_form--view .capps-btn {
  opacity: 0.7;
}

/* Module+collection specific container modifications */
.capps_input_form--hrms-employees {
  max-width: 1200px;
  margin: 0 auto;
}

/* Custom header styling for financial forms */
.capps_input_form--finance-invoices .section-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 8px 8px 0 0;
}
```

#### Form Content Styling (Fields, Labels, Form Elements)

```css
/* Style all collection form fields */
.capps-collection-form .form-field {
  margin-bottom: 1.5rem;
  border-radius: 8px;
}

/* Style only 'users' collection forms */
.capps-collection-form--users .form-field {
  border: 2px solid #007bff;
}

/* Style only 'employees' collection in 'hrms' module */
.capps-collection-form--hrms-employees .form-field {
  background-color: #f8f9fa;
}

/* Style only forms in 'view' mode */
.capps-form-action--view .form-field {
  opacity: 0.8;
  pointer-events: none;
}

/* Combine selectors for precise targeting */
.capps-collection-form--hrms-users.capps-form-action--add .form-field {
  border-color: #28a745;
}

/* Override field labels in specific collections */
.capps-collection-form--finance-invoices .field-label {
  font-weight: 700;
  color: #dc3545;
}
```

### Key Benefits
- **Isolation**: These selectors only affect collection forms, not filter forms, search forms, or other UI elements
- **Specificity**: Target exact combinations of module, collection, and action
- **Maintainability**: Clear naming convention makes styles easy to understand and maintain
- **Flexibility**: Mix and match selectors for precise styling control

## Placeholder Text Behavior

CAPPS automatically generates placeholder text for form fields with the following behavior:

### Default Placeholder Generation
- **Text fields**: `"ENTER FIELD_LABEL"` (uppercase)
- **Select/Date fields**: `"SELECT FIELD_LABEL"` (uppercase)  
- **Disabled fields**: No placeholder text (empty string)

### Placeholder Sources (in priority order)
1. **Locale translation**: Uses locale file translation if available
2. **Field label**: Uses the `label` property from field configuration
3. **Field name**: Uses field name with underscores converted to spaces

### Field Configuration
```json
{
    "CUSTOMER_NAME": {
        "fieldtype": "textfield",
        "label": "Customer Name",
        "disabled": 0
    }
}
```
**Result**: Shows `"ENTER CUSTOMER NAME"` when enabled, no placeholder when disabled

### Disabled Field Behavior
When a field is disabled (through `disabled: 1` in schema or dynamic validation), the placeholder text is automatically hidden to provide a cleaner interface for non-interactive fields.

## CAPPS API Usage Patterns

### Form.js API Patterns
- **Form Data Access**: Use `current_form` global variable for reading form data (read-only)
- **Form Data Updates**: Use `frm.set_value(fieldName, value)` for updating form fields  
- **Session Management**: Use `config.getSessionStorage()` to access user session data
- **Error Handling in `_onBeforeSave`**: Throw errors to interrupt save operations (don't return false)
- **Available Form Utilities**: `set_value`, `set_dropdown_options`, `set_field_enabled/disabled`, `make_field_visible/invisible`, `open_child_collection`, `hide_child_collection`, `show_child_collection`, `save`

### List.js API Patterns  
- **List Handler Arguments**: Each handler receives `list` object with `selectedRecords` array and DOM manipulation methods
- **DOM Manipulation**: Use `list.add_html(id, html)`, `list.remove_html(id)`, `list.clear_html_container()`
- **Button Types**: `buttonList` for toolbar actions, `buttonColumns` for individual row actions
- **Reserved Keywords**: `columnSequence`, `formatters`, `rowRenderer`, `columnRowColorize`, `before_render`, `buttonColumns`, `buttonList`

### UI API Patterns
- **Available Methods**: `capps.ui.alert()`, `capps.ui.confirm()`, `capps.ui.toast()`, `capps.ui.open_modal()`, `capps.ui.refresh()`, `capps.ui.showProcessProgress()`
- **Bulk Operations Progress**: After bulkedit operations, use `capps.ui.showProcessProgress({ processName: response.process_id })` to show progress modal and auto-refresh when complete
- **Simple Refresh**: Use `capps.ui.refresh()` for basic refresh without progress indication
- **Complex User Input**: Use `capps.ui.open_modal()` for text prompts, dropdowns, and forms (prompt/select methods don't exist)

### Reserved Keywords and Patterns
- **Form.js Reserved**: `buttonList`, `_onLoadEvent`, `_onBeforeSave`, `_afterFormSubmit`, `_formUtilities`
- **List.js Reserved**: `columnSequence`, `formatters`, `rowRenderer`, `columnRowColorize`, `before_render`, `buttonColumns`, `buttonList`
- **Naming Convention**: Use `capps.ui.{collection_name}.form` and `capps.ui.{collection_name}.list` patterns

## CAPPS RPC System Reference

### What is RPC
RPC (Remote Procedure Call) is a comprehensive system that allows you to create and call custom business logic functions through plugins. RPC functions enable complex business operations, external integrations, and custom data processing that extends beyond standard CRUD operations.

### RPC Route Structure
All CAPPS RPC calls follow this pattern:
```
/RPC/{appname}/plugins/{plugin_name}/{function_name}
```

### Creating RPC Functions

#### 1. Create Plugin File
Create a JavaScript file in your application's `plugins/` directory:

**File:** `{app}/plugins/{PluginName}.js`
```javascript
const dbutil = require('@frameworks-and-tools/dbutils')(config, global.db_conn_pool, global.logger);

async function businessFunction(data, session) {
    try {
        const { param1, param2 } = data;
        
        // Validation
        if (!param1) {
            return {
                status: 'validation_error',
                errors: ['param1 is required'],
                error_code: 'INVALID_INPUT'
            };
        }
        
        // Business logic with database operations
        const sql = 'SELECT * FROM table WHERE field = :param1';
        const result = await dbutil.execSQL(sql, { param1 });
        
        return {
            status: 'success',
            data: result,
            message: 'Operation completed successfully'
        };
        
    } catch (error) {
        global.logger.error(`Error in businessFunction: ${error.message}`);
        return {
            status: 'error',
            message: error.message,
            error_code: 'PROCESSING_ERROR'
        };
    }
}

module.exports = { businessFunction };
```

### Using RPC Functions

#### Basic Call Pattern
```javascript
capps.rpc.{app_name}.{plugin_name}.{function_name}({
    param1: value1,
    param2: value2
})
```

#### In Form Events (form.js)
```javascript
capps.ui.collection_name.form = {
    async CALCULATE_BUTTON(frm) {
        const result = await capps.rpc.myapp.Calculator.addNumbers({
            num1: parseFloat(current_form.NUMBER_1),
            num2: parseFloat(current_form.NUMBER_2)
        });
        
        if (result.status === 'success') {
            frm.set_value('RESULT', result.data.sum);
            capps.ui.toast({ message: result.message, type: 'success' });
        } else if (result.status === 'validation_error') {
            capps.ui.alert({ 
                title: 'Validation Error', 
                message: result.errors.join('\\n'), 
                variant: 'warning' 
            });
        }
    },
    
    async _onBeforeSave(frm) {
        // Validate using RPC before save
        const validation = await capps.rpc.myapp.Validator.validateRecord({
            recordData: current_form,
            validationType: 'BEFORE_SAVE'
        });
        
        if (validation.status === 'validation_error') {
            capps.ui.alert({
                title: 'Validation Error',
                message: validation.errors.join('\\n'),
                variant: 'danger'
            });
            throw new Error('Validation failed');
        }
    }
};
```

#### In List Actions (list.js)
```javascript
capps.ui.collection_name.list = {
    buttonList: [{
        key: 'bulk_process',
        label: 'Bulk Process',
        icon: 'pi pi-cog',
        show: () => true,
        handler: async (list) => {
            const selectedRecords = list.selectedRecords;
            
            if (!selectedRecords.length) {
                return capps.ui.alert({
                    message: 'Please select records to process',
                    variant: 'warning'
                });
            }
            
            const result = await capps.rpc.myapp.BulkProcessor.processBatchRecords({
                records: selectedRecords.map(record => ({
                    id: record.ID,
                    data: record
                })),
                processType: 'BATCH_UPDATE'
            });
            
            if (result.status === 'success') {
                capps.ui.toast({
                    message: `Successfully processed ${result.data.processed_count} records`,
                    type: 'success'
                });
                capps.ui.refresh();
            }
        }
    }],
    
    buttonColumns: [{
        key: 'calculate_risk',
        label: 'Calculate Risk',
        icon: 'pi pi-calculator',
        show: (row) => row.STATUS === 'PENDING',
        handler: async (row, context) => {
            const riskResult = await capps.rpc.myapp.RiskCalculator.calculateRiskScore({
                recordId: row.ID,
                recordData: row,
                calculationType: 'STANDARD'
            });
            
            if (riskResult.status === 'success') {
                capps.ui.open_modal({
                    title: 'Risk Assessment Result',
                    content: `Risk Score: ${riskResult.data.riskScore}`,
                    size: 'lg'
                });
            }
        }
    }]
};
```

### RPC Response Format

#### Success Response
```json
{
    "status": "success",
    "data": { /* function results */ },
    "message": "Optional success message",
    "metadata": { /* optional metadata */ }
}
```

#### Error Response
```json
{
    "status": "error",
    "message": "Error description",
    "error_code": "SPECIFIC_ERROR_CODE",
    "details": { /* additional context */ }
}
```

#### Validation Error Response
```json
{
    "status": "validation_error",
    "errors": ["Error message 1", "Error message 2"],
    "error_code": "VALIDATION_FAILED",
    "details": { /* validation details */ }
}
```

### Plugin Function Parameters
- **data**: Input parameters from the RPC call as an object
- **session**: User session object with database connection and user info
  - `session.user` - User information
  - `session.db_connection` - Database connection

### Best Practices for RPC
1. **Input Validation**: Always validate input parameters
2. **Error Handling**: Use try-catch blocks and return structured error responses
3. **Database Transactions**: Use proper transaction handling for data modifications
4. **Logging**: Log errors with context for debugging
5. **Security**: Validate user permissions where needed
6. **Performance**: Consider caching for expensive operations

### Connection Mapping
```
Plugin File Path:    myapp/plugins/Calculator.js
                            ↓
RPC Call Pattern:    capps.rpc.myapp.Calculator.addNumbers()
                              ↑      ↑         ↑
                           app   plugin   function
                          name    name      name
```

## CAPPS Schema Configuration Reference

### Collection-Level Configuration
```json
{
    "DATA_MODEL": "DATABASE_TABLE_NAME",
    "NAME": "Display Name for Collection",
    "DEFAULT_VIEW": "list|form|card",
    "MODAL_SIZE": "sm|md|lg|xl",
    "label_direction": "top-bottom|left-right|right-left|bottom-top",
    "ACTIONS": ["CREATE", "UPDATE", "DELETE", "EXPORT"],
    "SORT_FIELD": "field_name",
    "SORT_ORDER": "ASC|DESC",
    "VIRTUAL_COLLECTION": 0|1,
    "SQL": "Custom SQL for virtual collections",
    "UPLOAD_COLUMN_MAP": ["FIELD1", "FIELD2", "FIELD3"],
    "INCLUDE_CHILD_RECORDS": 0|1,
    "ALLOW_USER_TOGGLE_CHILD_RECORDS": true|false
}
```

#### Child Records Configuration
- **`INCLUDE_CHILD_RECORDS`** - Schema-driven control for expandable DataTable with child collections
  - `1` - Enable expandable rows showing child collection data (like `COLLECTION_TWO`)
  - `0` - Disable child record expansion (default)
- **`ALLOW_USER_TOGGLE_CHILD_RECORDS`** - Optional user control override
  - `true` - Allow users to toggle child record visibility via UI control
  - `false` - Respect schema setting only, no user override (default)

#### Child Collection Field Configuration
Define child collections using `fieldtype: "table"` in the FIELDS section:
```json
{
    "FIELDS": {
        "COLLECTION_TWO": {
            "fieldtype": "table",
            "child_collection": "COLLECTION_TWO",
            "label": "Related Items",
            "in_list_view": 0
        }
    }
}
```

#### Complete Expandable DataTable Example

**Parent Collection Schema (collection_one):**
```json
{
    "DATA_MODEL": "COLLECTION_ONE",
    "NAME": "Main Collection",
    "DEFAULT_VIEW": "list",
    "INCLUDE_CHILD_RECORDS": 1,
    "ALLOW_USER_TOGGLE_CHILD_RECORDS": true,
    "FIELDS": {
        "ID": {
            "fieldtype": "int",
            "required": 1,
            "in_list_view": 1
        },
        "TEXT_FIELD": {
            "fieldtype": "textfield",
            "label": "Description",
            "in_list_view": 1
        },
        "COLLECTION_TWO": {
            "fieldtype": "table",
            "child_collection": "COLLECTION_TWO",
            "label": "Related Items",
            "in_list_view": 0
        }
    }
}
```

**API Response Data Structure:**
```json
[
    {
        "ID": 1,
        "TEXT_FIELD": "Test Text",
        "CHECKBOX_FIELD": "Yes",
        "INTEGER_FIELD": 10,
        "COLLECTION_TWO": [
            {
                "ID": 1,
                "NAME": "abc",
                "CREATED_ON": "30/09/2025 15:42:47",
                "PARENT_ID_1": 1
            }
        ]
    },
    {
        "ID": 5,
        "TEXT_FIELD": "Test Virtual FK Valid Updated",
        "COLLECTION_TWO": [
            {
                "ID": 6,
                "NAME": "virtual fk test updated",
                "PARENT_ID_1": 5
            },
            {
                "ID": 7,
                "NAME": "virtual fk test updated sample",
                "PARENT_ID_1": 5
            }
        ]
    }
]
```

**UI Behavior:**
- Main table shows parent records with expand/collapse icons
- Clicking expand reveals child collection data in nested DataTable
- Child tables inherit all features: sorting, filtering, actions, locale translations
- Schema controls default expansion state, optional user toggle override

### Field Types Reference
- **Text Fields**: `textfield`, `textarea`, `rich_text_editor`, `password`, `email_address`
- **Numeric Fields**: `int`, `float` (with `is_amount` and `precision` options)
- **Date/Time Fields**: `date`, `time`, `datetime` (with date restriction options)
- **Selection Fields**: `select` (static/linked), `radio`, `checkbox`, `switch`
- **Specialized Fields**: `file`, `hyperlink`, `ratings`, `html`, `button`
- **Layout Fields**: `section_break`, `column_break`, `table` (child collections)

### Common Field Properties
- **Validation**: `required`, `unique`, `readonly`, `disabled`, `hidden`, `maxlength`
- **Display**: `label`, `description`, `in_list_view`, `grid_column_size`, `field_order_no`
- **Behavior**: `default`, `dont_copy_on_duplicate`, `restrict_modify`

### Required Database Columns
Every collection table must include:
```sql
-- Primary Key
"ID" NUMBER/BIGINT AUTO_INCREMENT PRIMARY KEY,

-- Audit Columns (automatically managed by CAPPS)
"CREATED_BY" VARCHAR2(50)/VARCHAR(50),
"CREATED_ON" DATE/DATETIME,
"UPDATED_BY" VARCHAR2(50)/VARCHAR(50), 
"UPDATED_ON" DATE/DATETIME,

-- Optional
"FILE_ID" NUMBER/BIGINT
```

## CAPPS Event Hooks System

### Event Hook Structure
```javascript
// event-hooks/{hook_name}/controller.js
const create = async (msg) => {
    const { data, userObj } = msg;
    let session = {
        user: userObj,
        db: await dbutil.getOConnection(),
        batch_no: data.ID
    };
    
    try {
        // Processing logic with stream pipelines for large data
        await pipelinePromise(
            fileStream,
            CSVToJsonParser({ headers: schema.UPLOAD_COLUMN_MAP }),
            processRecordsStream(collectionName, session),
            sinkStream()
        );
    } catch (error) {
        logger.error(`Processing error: ${error.stack}`);
    } finally {
        if (session.db) await session.db.close();
    }
};

module.exports = { create };
```

### Common Event Hook Types
- **File Processing**: CSV/Excel import with validation and error handling
- **Data Change Hooks**: beforeCreate, afterCreate, beforeUpdate, afterUpdate
- **Scheduled Tasks**: Daily reports, cleanup operations
- **Integration Hooks**: External system synchronization

## CAPPS REST API Patterns

### Basic CRUD Operations
```javascript
// Read Operations
const data = await capps.rest.{app_name}.{collection}.read({
    filter: [
        { field: "STATUS", value: "ACTIVE", asgn: "eq" },
        { field: "AMOUNT", value: 1000, asgn: "gt" }
    ],
    sort: [{ field: "CREATED_ON", order: "desc" }],
    limit: 50
});

// CRUD Operations
const created = await capps.rest.{app_name}.{collection}.create({ data: {...} });
const updated = await capps.rest.{app_name}.{collection}.update[id]({ data: {...} });
await capps.rest.{app_name}.{collection}.delete[id]();

// Bulk Operations
const bulkResult = await capps.rest.{app_name}.{collection}.bulkedit({
    scope: "operation_type",
    data: [{ ID: 1, field: "value" }]
});
```

## File Structure Conventions

### Application Structure
```
{app_name}/
├── rest/collection/{collection_name}/
│   ├── schema.json          # Collection definition
│   ├── form.js             # Form event handlers
│   ├── list.js             # List event handlers
│   └── card.js             # Card view templates
├── plugins/
│   └── {PluginName}.js     # RPC plugin functions
├── event-hooks/{hook_name}/
│   └── controller.js       # Background processing
└── public/layout/
    └── menu.js             # Navigation menu
```

### Naming Conventions
- **Collections**: lowercase with underscores (e.g., `user_accounts`)
- **Plugins**: PascalCase (e.g., `CalculationEngine.js`)
- **Functions**: camelCase (e.g., `processTransaction`)
- **Database Tables**: UPPERCASE with underscores (e.g., `USER_ACCOUNTS`)
- **Field Names**: UPPERCASE with underscores (e.g., `CUSTOMER_NAME`)
- Add to memory
- Add to memory "Node service center application structure API"
