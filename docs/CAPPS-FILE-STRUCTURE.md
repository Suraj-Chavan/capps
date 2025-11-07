# CAPPS File Structure & Conventions Guide

## Overview

CAPPS applications follow a **standardized file structure** that enables automatic discovery and loading of schemas, events, and UI configurations. Understanding this structure is crucial for proper development.

## Application Directory Structure

### Standard CAPPS Application Layout
```
{app-name}/                          # Application root directory
├── public/
│   ├── layout/
│   │   └── menu.js                  # Navigation menu configuration
│   └── index.html                   # Application entry point
├── rest/
│   ├── collection/
│   │   └── {collection-name}/       # Collection-specific files
│   │       ├── schema.json          # Collection schema definition
│   │       ├── form.js              # Form event handlers (ES module)
│   │       ├── list.js              # List event handlers (ES module)
│   │       └── card.js              # Card view configuration (optional)
│   ├── api/                         # Custom API endpoints
│   ├── hooks/                       # Event hooks for background processing
│   └── plugins/                     # RPC plugins for business logic
├── uploads/                         # File upload storage
├── reports/                         # Generated reports
└── config/
    └── database.json                # Database connection configuration
```

### Example: `my_financial_app` Directory
```
my_financial_app/
├── public/layout/menu.js
├── rest/collection/
│   ├── customers/
│   │   ├── schema.json
│   │   ├── form.js
│   │   └── list.js
│   ├── invoices/
│   │   ├── schema.json
│   │   ├── form.js
│   │   └── list.js
│   └── payments/
│       ├── schema.json
│       ├── form.js
│       └── list.js
└── rest/api/
    ├── reports.js
    └── calculations.js
```

## File Naming Conventions

### 1. Collection Names
- **Format**: lowercase with underscores (snake_case)
- **Examples**: `customers`, `invoice_items`, `payment_history`
- **Rule**: Collection name must match directory name exactly

### 2. Module Names  
- **Format**: lowercase with hyphens (kebab-case) or underscores
- **Examples**: `finance`, `hrms`, `inventory-management`
- **Rule**: Module name equals application name

### 3. File Extensions
- **Schema**: `.json` (strict JSON format)
- **Events**: `.js` (ES module format with `export default`)
- **Menu**: `.js` (ES module format)

## Required Files & Their Purpose

### 1. schema.json - Collection Definition
```json
{
    "FIELD_NAME": {
        "fieldtype": "textfield",
        "label": "Field Label",
        "required": 1,
        "disabled": 0
    }
}
```

**Location**: `{app}/rest/collection/{collection}/schema.json`
**Purpose**: Defines collection structure, field types, validation rules, and UI configuration

### 2. form.js - Form Event Handlers
```javascript
export default {
    asModule: true,  // Required for ES module loading
    
    _onLoadEvent() {
        // Form load logic
    },
    
    _onBeforeSave() {
        // Validation and pre-save logic
        // Throw error to prevent save
    },
    
    _afterFormSubmit() {
        // Post-save logic
    }
}
```

**Location**: `{app}/rest/collection/{collection}/form.js`
**Purpose**: Handles form lifecycle events, validation, and custom business logic

### 3. list.js - List View Configuration
```javascript
export default {
    asModule: true,  // Required for ES module loading
    
    columnSequence: ['FIELD1', 'FIELD2', 'FIELD3'],
    
    formatters: {
        FIELD1: (value, record) => `Formatted: ${value}`
    },
    
    buttonColumns: [{
        label: 'Action',
        handler: (record) => { /* action logic */ }
    }],
    
    buttonList: [{
        label: 'Bulk Action',
        handler: (list) => { /* bulk action logic */ }
    }]
}
```

**Location**: `{app}/rest/collection/{collection}/list.js`
**Purpose**: Configures list view display, formatting, and actions

### 4. menu.js - Navigation Configuration
```javascript
export default [
    {
        label: 'Dashboard',
        route: '/dashboard'
    },
    {
        label: 'Masters',
        children: [
            {
                label: 'Customers',
                route: '/capps/finance/customers'
            },
            {
                label: 'Products',
                route: '/capps/finance/products'
            }
        ]
    }
]
```

**Location**: `{app}/public/layout/menu.js`
**Purpose**: Defines application navigation structure

## File Loading Patterns

### 1. Schema Loading
```javascript
// Framework automatically loads from:
const schemaUrl = `/rest/collection/${module}/${collection}/schema`;
```

### 2. Form Event Loading
```javascript
// Dynamic import with ES module support:
const formModule = await import(`/apps/${app}/rest/collection/${collection}/form.js`);
const formEvents = formModule.default;
```

### 3. Menu Loading
```javascript
// Menu loaded in HeaderBar.vue:
const menuModule = await import(`/apps/${app}/public/layout/menu.js`);
const menuItems = menuModule.default;
```

## Common File Placement Mistakes

### ❌ Incorrect Placements
```
❌ rest/collections/customers/schema.json  # Wrong: 'collections' (plural)
❌ rest/customer/schema.json               # Wrong: Missing 'collection' directory
❌ public/menu.js                          # Wrong: Missing 'layout' directory
❌ rest/collection/customers/form.json     # Wrong: .json extension for events
```

### ✅ Correct Placements
```
✅ rest/collection/customers/schema.json
✅ rest/collection/customers/form.js
✅ public/layout/menu.js
```

## ES Module Format Requirements

### Form/List Event Files Must Use:
```javascript
export default {
    asModule: true,  // REQUIRED: Enables ES module loading
    
    // Event handlers and configurations
}
```

### Without `asModule: true`:
- Files will not load properly
- Events will not be bound to components
- Runtime errors will occur

## File Permission Requirements

### Development Environment
- All files must be readable by the development server
- Upload directories need write permissions
- Config files should be protected from public access

### Production Environment
- Static files served by web server (public/ directory)
- REST files processed by backend services
- Upload directories with restricted access

## Integration with CAPPS Framework

### 1. Automatic Discovery
The CAPPS framework automatically discovers and loads files based on:
- URL route parameters (`/capps/{module}/{collection}`)
- Standard directory structure
- File naming conventions

### 2. Caching Behavior
- **Schema**: Cached in Vuex store until collection update
- **Events**: Loaded once per component lifecycle
- **Menu**: Cached until application restart

### 3. Error Handling
```javascript
// Schema loading error
if (!schemaLoaded) {
    console.error(`Schema not found: ${module}/${collection}`);
    // Show error page or redirect
}

// Event loading error  
try {
    const formEvents = await import(`/apps/${app}/rest/collection/${collection}/form.js`);
} catch (error) {
    console.warn(`Form events not found for ${collection}`);
    // Continue without custom events
}
```

## Development Workflow

### 1. Creating New Collection
```bash
# 1. Create collection directory
mkdir -p {app}/rest/collection/{collection-name}

# 2. Create required files
touch {app}/rest/collection/{collection-name}/schema.json
touch {app}/rest/collection/{collection-name}/form.js
touch {app}/rest/collection/{collection-name}/list.js
```

### 2. File Template Generation
Use CAPPS CLI or copy from existing collections:
```bash
# Copy from reference collection
cp -r existing_collection/ new_collection/
# Then modify contents for new collection
```

### 3. Testing File Structure
```javascript
// Verify schema loads
GET /rest/collection/{module}/{collection}/schema

// Verify form events load
GET /apps/{app}/rest/collection/{collection}/form.js

// Verify menu loads
GET /apps/{app}/public/layout/menu.js
```

## Best Practices

### 1. File Organization
- Keep related files together in collection directories
- Use consistent naming across all collections
- Group similar functionality in subdirectories when needed

### 2. Code Structure
- Always include `asModule: true` in event files
- Use meaningful function names for event handlers
- Add comments for complex business logic

### 3. Error Prevention
- Validate file structure before deployment
- Test file loading in development environment
- Use version control to track structural changes

### 4. Documentation
- Include README files for complex applications
- Document custom file structures or deviations
- Maintain change logs for file structure modifications

This file structure ensures CAPPS can automatically discover, load, and integrate all application components without manual configuration.