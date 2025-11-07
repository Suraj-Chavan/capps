# CAPPS Framework Troubleshooting Guide

## Common CAPPS Usage Issues

### 1. Form.js Event Issues

#### Problem: Form events not executing
**User Mistake:** Missing or incorrect function definitions in form.js

```javascript
// ❌ Wrong - function not defined properly
_onLoadEvent: function() {
    // This won't work
}

// ✅ Correct - proper function definition
_onLoadEvent() {
    // Form load logic here
    console.log('Form loaded with data:', current_form);
}
```

#### Problem: Form validation not working
**User Mistake:** Using return false instead of throwing errors in _onBeforeSave

```javascript
// ❌ Wrong - return false doesn't stop save
_onBeforeSave() {
    if (!current_form.CUSTOMER_NAME) {
        return false;  // This won't stop the save
    }
}

// ✅ Correct - throw error to stop save
_onBeforeSave() {
    if (!current_form.CUSTOMER_NAME) {
        throw new Error('Customer name is required');
    }
}
```

#### Problem: Cannot access form data
**User Mistake:** Trying to use form methods on current_form

```javascript
// ❌ Wrong - current_form only contains field values
_onLoadEvent() {
    current_form.set_value('STATUS', 'ACTIVE');  // This will fail
}

// ✅ Correct - use frm for methods, current_form for data
_onLoadEvent() {
    const customerName = current_form.CUSTOMER_NAME;  // Get data
    frm.set_value('STATUS', 'ACTIVE');               // Use methods
}
```

### 2. Schema Configuration Issues

#### Problem: Fields not appearing in form
**User Mistake:** Incorrect fieldtype names or missing required properties

```json
// ❌ Wrong - incorrect fieldtype name
{
    "CUSTOMER_NAME": {
        "fieldtype": "TextField",  // Wrong case
        "label": "Customer Name"
    }
}

// ✅ Correct - proper fieldtype name
{
    "CUSTOMER_NAME": {
        "fieldtype": "textfield",  // Lowercase
        "label": "Customer Name"
    }
}
```

#### Problem: Field validation not working
**User Mistake:** Using incorrect validation property names

```json
// ❌ Wrong - using incorrect property names
{
    "EMAIL": {
        "fieldtype": "textfield",
        "validation": "email",     // Wrong property
        "mandatory": true          // Wrong property
    }
}

// ✅ Correct - using proper CAPPS validation
{
    "EMAIL": {
        "fieldtype": "textfield",
        "validations": "email",    // Correct property
        "required": 1              // Correct property
    }
}
```

### 3. List.js Configuration Issues

#### Problem: Buttons not appearing in list
**User Mistake:** Incorrect button configuration structure

```javascript
// ❌ Wrong - incorrect button structure
buttonColumns: {
    label: 'Edit',
    handler: function() {}
}

// ✅ Correct - buttons must be arrays
buttonColumns: [{
    label: 'Edit',
    handler: function(record) {
        console.log('Editing record:', record);
    }
}]
```

#### Problem: Column formatting not working
**User Mistake:** Using wrong formatter function signature

```javascript
// ❌ Wrong - incorrect formatter parameters
formatters: {
    AMOUNT: function(value) {
        return '$' + value;  // Missing record parameter
    }
}

// ✅ Correct - formatter receives value and record
formatters: {
    AMOUNT: function(value, record) {
        return '$' + parseFloat(value).toFixed(2);
    }
}
```

### 4. CAPPS API Usage Issues

#### Problem: capps.ui methods not working
**User Mistake:** Incorrect parameter format for UI methods

```javascript
// ❌ Wrong - passing string directly
capps.ui.toast('Success message');

// ✅ Correct - using object format
capps.ui.toast({
    message: 'Success message',
    type: 'success'
});
```

#### Problem: Modal not opening properly
**User Mistake:** Using incorrect modal configuration

```javascript
// ❌ Wrong - using inline scripts
capps.ui.open_modal({
    title: 'Confirm Action',
    body: '<p>Are you sure?</p>',
    buttons: [{
        label: 'Yes',
        onclick: 'alert("Yes clicked")'  // Wrong - inline script
    }]
});

// ✅ Correct - using handlers array
capps.ui.open_modal({
    title: 'Confirm Action',
    body: '<p>Are you sure?</p>',
    handlers: [{
        label: 'Yes',
        handler: function() {
            capps.ui.toast({message: 'Confirmed'});
        }
    }]
});
```

### 5. Filter Query Issues

#### Problem: List filters not working
**User Mistake:** Using complex filter formats not supported by CAPPS

```javascript
// ❌ Wrong - complex filters not supported
const filters = {
    "STATUS": { "$in": ["ACTIVE", "PENDING"] },  // Not supported
    "$or": [
        { "PRIORITY": "HIGH" },
        { "DUE_DATE": "2024-01-01" }
    ]
};

// ✅ Correct - only key-value pairs supported
const filters = {
    "STATUS": "ACTIVE",
    "PRIORITY": "HIGH"
};
```

### 6. Session and Configuration Issues

#### Problem: Cannot access user session data
**User Mistake:** Using wrong method to access session storage

```javascript
// ❌ Wrong - direct localStorage access
const userRole = localStorage.getItem('role');

// ✅ Correct - using CAPPS config method
const userRole = config.getSessionStorage('role');
const userPermissions = config.getSessionStorage('permissions');
```

#### Problem: Configuration not loading
**User Mistake:** Accessing config before it's loaded

```javascript
// ❌ Wrong - accessing config immediately
_onLoadEvent() {
    const apiUrl = config.API_BASE_URL;  // May be undefined
}

// ✅ Correct - check if config is loaded
_onLoadEvent() {
    if (config.getSessionStorage) {
        const apiUrl = config.API_BASE_URL;
    }
}
```

### 7. Child Collection Issues

#### Problem: Child collection not displaying
**User Mistake:** Incorrect child collection schema configuration

```json
// ❌ Wrong - missing required properties
{
    "LINE_ITEMS": {
        "fieldtype": "childcollection"
    }
}

// ✅ Correct - proper child collection configuration
{
    "LINE_ITEMS": {
        "fieldtype": "childcollection",
        "childref": "invoice_line_items",
        "label": "Line Items"
    }
}
```

#### Problem: Child collection events not working
**User Mistake:** Using wrong context for child collection operations

```javascript
// ❌ Wrong - trying to access child directly
_onLoadEvent() {
    // Cannot directly manipulate child collections this way
    current_form.LINE_ITEMS.push(newItem);
}

// ✅ Correct - using frm methods for child collections
_onLoadEvent() {
    frm.open_child_collection('LINE_ITEMS', 'add', {
        ITEM_CODE: 'DEFAULT',
        QUANTITY: 1
    });
}
```

### 8. Custom Button Issues

#### Problem: Custom buttons not appearing
**User Mistake:** Adding buttons at wrong time or wrong context

```javascript
// ❌ Wrong - adding button before form is ready
frm.add_custom_button('Custom Action', function() {
    // Button added too early
});

// ✅ Correct - add buttons in _onLoadEvent
_onLoadEvent() {
    frm.add_custom_button('Process', function() {
        console.log('Processing...');
    });
}
```

#### Problem: Button handlers not working
**User Mistake:** Not handling errors in button callbacks

```javascript
// ❌ Wrong - no error handling
frm.add_custom_button('Process', function() {
    processLargeData();  // If this fails, user gets no feedback
});

// ✅ Correct - proper error handling
frm.add_custom_button('Process', function() {
    try {
        processLargeData();
        capps.ui.toast({message: 'Processing completed'});
    } catch (error) {
        capps.ui.toast({
            message: 'Processing failed: ' + error.message,
            type: 'error'
        });
    }
});
```

### 9. Menu Configuration Issues

#### Problem: Menu items not showing
**User Mistake:** Incorrect menu.js file structure or location

```javascript
// ❌ Wrong - incorrect file location or export
// File: public/menu.js (wrong location)
module.exports = [  // Wrong export format
    { label: 'Dashboard', route: '/dashboard' }
];

// ✅ Correct - proper location and format
// File: public/layout/menu.js (correct location)
export default [
    { label: 'Dashboard', route: '/dashboard' }
];
```

#### Problem: Role-based menu filtering not working
**User Mistake:** Incorrect role checking logic

```javascript
// ❌ Wrong - checking role incorrectly
export default [
    {
        label: 'Admin Panel',
        route: '/admin',
        show: function() {
            return config.role === 'admin';  // Wrong property access
        }
    }
];

// ✅ Correct - proper role checking
export default [
    {
        label: 'Admin Panel',
        route: '/admin',
        show: function() {
            const userRole = config.getSessionStorage('role');
            return userRole === 'admin';
        }
    }
];
```

### 10. File Upload Issues

#### Problem: File uploads not working
**User Mistake:** Incorrect file field configuration

```json
// ❌ Wrong - missing required file properties
{
    "ATTACHMENT": {
        "fieldtype": "file"
    }
}

// ✅ Correct - proper file field configuration
{
    "ATTACHMENT": {
        "fieldtype": "file",
        "label": "Upload File",
        "accept": ".pdf,.doc,.docx"
    }
}
```

## CAPPS Framework Limitations

### 1. Filter System
- **Only supports key-value pairs**: `{"FIELD": "VALUE"}`
- **No complex queries**: No OR, AND, IN operators
- **No date ranges**: Use separate fields for from/to dates

### 2. Form API
- **current_form is read-only**: Contains only field values
- **frm contains only methods**: No field data access
- **Validation must throw errors**: return false doesn't work

### 3. Schema Limitations
- **Fixed fieldtype names**: Must use exact CAPPS fieldtype names
- **No dynamic schemas**: Schema structure is fixed at load time
- **Limited validation options**: Only basic validation rules supported

### 4. List Configuration
- **Button arrays required**: Single button objects don't work
- **Limited column types**: Must use supported column formatters
- **No client-side sorting**: All sorting handled server-side

## Debugging CAPPS Applications

### 1. Check Browser Console
Look for CAPPS-specific error messages:
```
CAPPS Error: Schema not found for collection 'customers'
CAPPS Warning: Form events not loaded
```

### 2. Verify File Structure
Ensure files are in correct CAPPS locations:
```
{app}/rest/collection/{collection}/schema.json
{app}/rest/collection/{collection}/form.js
{app}/public/layout/menu.js
```

### 3. Test API Responses
Check CAPPS REST endpoints:
```
GET /rest/collection/{module}/{collection}/schema
GET /rest/collection/{module}/{collection}/list
```

### 4. Validate JSON Syntax
Use JSON validators for schema files:
```bash
# Test schema.json is valid JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('schema.json')))"
```

### 5. Check CAPPS Framework State
In browser console:
```javascript
// Check CAPPS framework is loaded
console.log(capps);

// Check current form state
console.log(current_form);

// Check user session
console.log(config.getSessionStorage());
```

## Best Practices for CAPPS Development

### 1. Always Use Error Handling
```javascript
_onLoadEvent() {
    try {
        // Your logic here
        frm.set_value('STATUS', 'ACTIVE');
    } catch (error) {
        capps.ui.toast({
            message: 'Error: ' + error.message,
            type: 'error'
        });
    }
}
```

### 2. Follow CAPPS Naming Conventions
- Collection names: lowercase with underscores
- Field names: UPPERCASE with underscores
- File locations: exact CAPPS directory structure

### 3. Use CAPPS APIs Consistently
- Always use `capps.ui.*` for user interface
- Always use `capps.rest.*` for API calls
- Always use `config.getSessionStorage()` for session data

### 4. Test with Real Data
- Test forms with various field types
- Test lists with large datasets
- Test filters with different data types

This troubleshooting guide focuses on common mistakes when using the CAPPS framework and provides practical solutions for CAPPS-specific issues.