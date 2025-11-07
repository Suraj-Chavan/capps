# Form.js Documentation

## Overview
The `form.js` file is used for any collection form in the application. It follows the structure:
```
<<APP NAME>>/rest/collection/<<Collection Name>>/form.js
```

The form.js file contains:
```javascript
capps.ui.<<collection_name>>.form = {
    // form handlers and methods
}
```

## Event Handlers
Form.js supports special event handlers that are called at specific points in the form lifecycle:

### _onLoadEvent
Called when the form is loaded/initialized.
```javascript
capps.ui.collection_name.form = {
    _onLoadEvent: async function (frm) {
        // Initialize form fields
        // Set default values
        // Load initial data
    }
}
```

### _onBeforeSave
Called before saving the form data. Can be used for validation, data transformation, and user confirmation.

**Important**: To properly interrupt the save operation, **throw an error** instead of returning `false`. The CAPPS framework awaits this function but doesn't check return values - only thrown errors will stop the save process.

```javascript
capps.ui.collection_name.form = {
    _onBeforeSave: async function (frm) {
        // Validate form data (read from current_form global variable)
        if (!current_form.REQUIRED_FIELD) {
            await capps.ui.alert({
                title: "Validation Error",
                message: "Please fill required field",
                okVariant: "danger"
            });
            // Throw error to interrupt save - don't return false
            throw new Error("Required field validation failed");
        }
        
        // Show confirmation dialog
        const confirmed = await capps.ui.confirm({
            title: "Confirm Save",
            message: "Are you sure you want to save this record?",
            okTitle: "Save",
            cancelTitle: "Cancel"
        });
        
        if (!confirmed) {
            // User clicked Cancel - throw error to interrupt save
            throw new Error("Save operation cancelled by user");
        }
        
        // Transform data using form utilities (not current_form directly)
        if (current_form.CODE) {
            frm.set_value('CODE', current_form.CODE.toUpperCase());
        }
        
        // Return true to proceed with save (optional, but recommended for clarity)
        return true;
    }
}
```

**Key Points**:
- **Use `async function`** for proper Promise handling
- **Throw errors to interrupt** the save operation
- **Use `await` with UI dialogs** (`capps.ui.alert`, `capps.ui.confirm`)  
- **Read data** from `current_form` (read-only global object available in all handlers)
- **Update data** using `frm.set_value()` form utilities, not `current_form` directly
- **Return `true`** to proceed with save (optional, but recommended for clarity)

### _afterFormSubmit
Called after the form is submitted. Can be used to perform operations after form submission, such as navigation, showing messages, or handling the result.

**Arguments:**
- `frm`: The form object.
- `{ result, resultHandler }`: An object containing the result of the form submission and a handler for the result.

**Usage:**
- Return `{ preventDefault: true }` to prevent the default post-submit behavior (such as navigation or automatic messages).
- You can use `capps.set_route()` to navigate programmatically after submission.

**Example:**
```javascript
capps.ui.collection_name.form = {
    async _afterFormSubmit(frm, { result, resultHandler }) {
        // Custom logic after form submit
        console.log(result);
        // Navigate to list view
        capps.set_route("view/list");
        // Prevent default behavior
        return {
            preventDefault: true
        };
    }
}
```

## Key Handlers
Form handlers are defined as functions that are called when field values change. The handler name matches the field name.

Example:
```javascript
capps.ui.collection_name.form = {
    FIELD_NAME: async function (frm) {
        // Handler logic here
    }
}
```

## Accessing Form Data

### current_form Global Variable
The `current_form` global variable provides read-only access to the current form data in all form handlers:

```javascript
capps.ui.collection_name.form = {
    FIELD_NAME: function(frm) {
        // Access current form data
        console.log(current_form.FIELD_NAME);  // Current field value
        console.log(current_form.OTHER_FIELD); // Other field values
        
        // Use for validation
        if (current_form.STATUS === "ACTIVE") {
            frm.set_field_enabled("DETAILS_FIELD");
        }
        
        // Use for conditional logic
        if (current_form.TYPE === "SPECIAL") {
            frm.show_child_collection("special_records");
        }
    }
}
```

**Important Notes:**
- `current_form` is read-only - do not modify it directly
- Use `frm.set_value()` to update field values
- Available in all form event handlers and field handlers
- Contains the current state of all form fields

### User Session Information
Access current user information using the global config object:

```javascript
capps.ui.collection_name.form = {
    _onLoadEvent: function(frm) {
        try {
            const session = config.getSessionStorage();
            const currentUserId = session.userid || 'Anonymous';
            const currentUserName = session.username || 'Anonymous';
            
            // Set user-specific defaults
            frm.set_value('CREATED_BY', currentUserId);
            frm.set_value('ASSIGNED_TO', currentUserName);
        } catch (error) {
            console.error('Error accessing session:', error);
        }
    }
}
```

## Available Methods

### 1. set_value
```javascript
frm.set_value(fieldName: string, value: any)
```
- Sets the value of a form field
- Parameters:
  - fieldName: Name of the field
  - value: New value to set

### 2. clear_dropdown_options
```javascript
frm.clear_dropdown_options(fieldName: string)
```
- Clears all options from a dropdown field
- Parameters:
  - fieldName: Name of the dropdown field

### 3. set_dropdown_options
```javascript
frm.set_dropdown_options(fieldName: string, options: array)
```
- Sets options for a dropdown field
- Parameters:
  - fieldName: Name of the dropdown field
  - options: Array of options [{ label, value }]

### 4. set_field_enabled/set_field_disabled
```javascript
frm.set_field_enabled(fieldName: string)
frm.set_field_disabled(fieldName: string)
```
- Enables/disables a field
- Parameters:
  - fieldName: Name of the field

### 5. make_field_visible/make_field_invisible
```javascript
frm.make_field_visible(fieldName: string)
frm.make_field_invisible(fieldName: string)
```
- Makes a field visible/invisible
- Parameters:
  - fieldName: Name of the field

### 6. manage_validation_rule
```javascript
frm.manage_validation_rule(fieldName: string, validationRules: object)
```
- Updates validation rules for a field
- Parameters:
  - fieldName: Name of the field
  - validationRules: Object containing validation rules

### 7. set_query
```javascript
frm.set_query(fieldName: string, query: array)
```
- Sets a query for a field
- Parameters:
  - fieldName: Name of the field
  - query: Array of query filters

### 8. set_suggestions
```javascript
frm.set_suggestions(fieldName: string, suggestions: array)
```
- Sets suggestions for a field
- Parameters:
  - fieldName: Name of the field
  - suggestions: Array of suggestions

### 9. set_commands
```javascript
frm.set_commands(fieldName: string, commands: array)
```
- Sets commands for a field
- Parameters:
  - fieldName: Name of the field
  - commands: Array of commands

### 10. open_child_collection
```javascript
frm.open_child_collection(childCollectionRef: string, action?: string, recordData?: object)
```
- Opens the child collection modal form for add/modify operations
- Parameters:
  - childCollectionRef: Reference name of the child collection (e.g., "collection_two")
  - action: Optional action type - "add" (default) or "modify"
  - recordData: Optional record data for modify action
- Example:
```javascript
// Open add form for child collection
frm.open_child_collection("collection_two");

// Open modify form with existing record
frm.open_child_collection("collection_two", "modify", recordData);
```

### 11. hide_child_collection
```javascript
frm.hide_child_collection(childCollectionRef: string)
```
- Hides a child collection grid using CSS
- Parameters:
  - childCollectionRef: Reference name of the child collection to hide
- Example:
```javascript
// Hide child collection grid
frm.hide_child_collection("collection_two");
```

### 12. show_child_collection
```javascript
frm.show_child_collection(childCollectionRef: string)
```
- Shows a previously hidden child collection grid
- Parameters:
  - childCollectionRef: Reference name of the child collection to show
- Example:
```javascript
// Show child collection grid
frm.show_child_collection("collection_two");
```

### 13. save
```javascript
frm.save()
```
- Programmatically triggers the form save operation
- Calls the main form's `structureSubmit()` method regardless of context
- Works from both main form and child collection form handlers
- Automatically traverses component hierarchy to find the main InputForm component
- Example:
```javascript
// Save the form programmatically from any field handler
frm.save();

// Example in field handler
SAVE_BUTTON_FIELD: function(frm) {
    // Perform validation before saving
    if (current_form.REQUIRED_FIELD) {
        frm.save(); // This will trigger the main form's save process
    }
}
```

### 14. add_custom_button
```javascript
frm.add_custom_button(label, callback, group, options)
```
- Dynamically adds a custom button to the form header
- Parameters:
  - label (string): Button text to display
  - callback (function): Click handler function that receives frm parameter
  - group (string, optional): Group name for creating dropdown menus
  - options (object, optional): Additional configuration
    - icon: Icon class (e.g., 'pi pi-check', 'fa fa-save')
    - class: Button styling class ('capps-btn-primary', 'capps-btn-success', etc.)
    - show: Function returning boolean for visibility condition
    - key: Unique button identifier (auto-generated if not provided)
- Returns: Button key (string)
- Examples:
```javascript
// Simple button
frm.add_custom_button('Save Draft', function(frm) {
    frm.set_value('STATUS', 'DRAFT');
    frm.save();
});

// Grouped button (creates dropdown menu)
frm.add_custom_button('Approved', function(frm) {
    frm.set_value('STATUS', 'APPROVED');
    frm.save();
}, 'Quick Status');

// Advanced button with options
frm.add_custom_button('Admin Action', function(frm) {
    // Admin logic here
}, 'Admin', {
    icon: 'pi pi-shield',
    class: 'capps-btn-danger',
    show: function() {
        return config.getSessionStorage().roles().includes('ADMIN');
    }
});
```

### 15. remove_custom_button
```javascript
frm.remove_custom_button(label, group)
```
- Removes a specific button by label
- Parameters:
  - label (string): Button label to remove
  - group (string, optional): Group name if button is grouped
- Returns: Boolean (success/failure)
- Examples:
```javascript
// Remove ungrouped button
frm.remove_custom_button('Save Draft');

// Remove button from specific group
frm.remove_custom_button('Approved', 'Quick Status');
```

### 16. clear_custom_buttons
```javascript
frm.clear_custom_buttons(group)
```
- Clears multiple buttons at once
- Parameters:
  - group (string, optional): Group name to clear, or omit for all buttons
- Returns: Number of buttons cleared
- Examples:
```javascript
// Clear ALL custom buttons
frm.clear_custom_buttons();

// Clear specific group only
frm.clear_custom_buttons('Quick Status');
```

### 17. change_custom_button_type
```javascript
frm.change_custom_button_type(label, type, group)
```
- Changes button styling/appearance (dynamic buttons only)
- Parameters:
  - label (string): Button label to modify
  - type (string): Styling type ('primary', 'success', 'danger', etc.)
  - group (string, optional): Group name if button is grouped
- Returns: Boolean (success/failure)
- Examples:
```javascript
// Change button to success style
frm.change_custom_button_type('Save Draft', 'success');

// Change grouped button style
frm.change_custom_button_type('Reject', 'danger', 'Actions');
```

### 18. show_custom_button
```javascript
frm.show_custom_button(label, group)
```
- Shows a previously hidden static button (from buttonList configuration)
- Parameters:
  - label (string): Static button label to show
  - group (string, optional): Group name if button is grouped
- Returns: Boolean (success/failure)
- Examples:
```javascript
// Show hidden static button
frm.show_custom_button('Validate Form');
```

### Custom Button Styling Classes
- capps-btn-primary (blue), capps-btn-secondary (gray), capps-btn-success (green)
- capps-btn-danger (red), capps-btn-warning (yellow), capps-btn-info (light blue)
- capps-btn-light (light gray, default), capps-btn-dark (dark gray)

### Custom Button Icon Classes
- PrimeVue: pi pi-check, pi pi-times, pi pi-save, pi pi-eye, pi pi-edit, pi pi-plus, pi pi-minus, pi pi-trash, pi pi-shield, pi pi-bell

## Child Collection Management

Child collections are tables embedded within parent forms that display related records. CAPPS provides utilities to programmatically interact with these child collections:

### Opening Child Collection Forms
Use `open_child_collection()` to trigger the modal form for adding or modifying child collection records:

```javascript
// In a field handler or button click
TEXT_FIELD(frm) {
    // Open child collection add form when text field changes
    if (current_form.TEXT_FIELD === "trigger_child") {
        frm.open_child_collection("collection_two");
    }
}

// In a custom button handler
OPEN_CHILD_BTN(frm) {
    // Open child collection with specific record for modification
    const existingRecord = { ID: 123, FIELD_NAME: "value" };
    frm.open_child_collection("collection_two", "modify", existingRecord);
}
```

### Dynamic Visibility Control
Control child collection visibility based on form conditions:

```javascript
STATUS_FIELD(frm) {
    // Hide child collection for certain statuses
    if (current_form.STATUS_FIELD === "DRAFT") {
        frm.hide_child_collection("collection_two");
    } else {
        frm.show_child_collection("collection_two");
    }
}
```

### CSS Class Selectors
Child collections automatically receive unique CSS classes for styling and visibility control:

- Base class: `child-collection-grid`
- Collection-specific: `child-collection-grid--{collection_name}`
- Parent-specific: `child-collection-grid--{parent_collection}-{child_collection}`

Example CSS classes for a "collection_two" child collection in "collection_one" parent:
- `child-collection-grid`
- `child-collection-grid--collection_two` 
- `child-collection-grid--collection_one-collection_two`

## ButtonList Configuration

The `buttonList` feature allows you to add custom action buttons to form headers that appear before the default actions (View Details, Save, Close).

### Structure
```javascript
capps.ui.collection_name.form = {
    buttonList: [
        {
            key: 'unique_button_key',      // Required: Unique identifier
            label: 'Button Label',         // Required: Display text
            icon: 'pi pi-icon-name',      // Optional: PrimeIcons icon class
            class: 'capps-btn-primary',   // Optional: CSS class for styling
            show: () => true,             // Optional: Function to control visibility
            handler: (frm) => {           // Required: Click handler function
                // Button action logic
            }
        }
    ]
}
```

### Properties

#### key (Required)
- **Type**: String
- **Description**: Unique identifier for the button
- **Example**: `'validate_form'`

#### label (Required)
- **Type**: String  
- **Description**: Text displayed on the button
- **Example**: `'Validate Form'`

#### icon (Optional)
- **Type**: String
- **Description**: CSS class for icon (supports PrimeIcons)
- **Example**: `'pi pi-check-circle'`

#### class (Optional)
- **Type**: String
- **Description**: CSS class for button styling
- **Default**: `'capps-btn-light'` (light gray styling)
- **Available Options**: 
  - `'capps-btn-primary'` (blue primary button)
  - `'capps-btn-secondary'` (gray secondary button)
  - `'capps-btn-light'` (light gray button - default)
  - Any custom CSS class
- **Example**: `'capps-btn-primary'`

#### show (Optional)
- **Type**: Function
- **Description**: Function that returns boolean to control button visibility
- **Default**: `() => true` (always visible)
- **Example**: 
```javascript
show: () => {
    return current_form && current_form.TEXT_FIELD && current_form.TEXT_FIELD.length > 0;
}
```

#### handler (Required)
- **Type**: Function
- **Description**: Function called when button is clicked
- **Parameters**: 
  - `frm`: Form utility API object with access to form data and methods
- **Example**:
```javascript
handler: (frm) => {
    capps.ui.alert({
        title: "Custom Action",
        message: `Current data: ${JSON.stringify(frm.userFormData)}`,
        variant: "info"
    });
}
```

### Complete Example
```javascript
capps.ui.collection_one.form = {
    // Other form handlers...
    
    buttonList: [
        {
            key: 'validate_form',
            label: 'Validate Form',
            icon: 'pi pi-check-circle',
            class: 'capps-btn-primary', // Blue primary button
            show: () => true,
            handler: (frm) => {
                capps.ui.alert({
                    title: "Form Validation",
                    message: `Form is valid! Current data: ${JSON.stringify(frm.userFormData)}`,
                    variant: "success"
                });
            }
        },
        {
            key: 'preview_data',
            label: 'Preview Data',
            icon: 'pi pi-eye',
            class: 'capps-btn-secondary', // Gray secondary button
            show: () => true,
            handler: (frm) => {
                capps.ui.open_modal({
                    title: 'Form Data Preview',
                    content: `<pre>${JSON.stringify(frm.userFormData, null, 2)}</pre>`,
                    size: 'lg'
                });
            }
        },
        {
            key: 'conditional_action',
            label: 'Conditional Action',
            icon: 'pi pi-exclamation-triangle',
            // No class specified - uses default 'capps-btn-light'
            show: () => {
                // Only show if TEXT_FIELD has content
                return current_form && current_form.TEXT_FIELD && current_form.TEXT_FIELD.length > 0;
            },
            handler: (frm) => {
                capps.ui.toast({
                    message: `Action executed with TEXT_FIELD: ${frm.userFormData.TEXT_FIELD}`,
                    variant: 'info'
                });
            }
        }
    ]
}
```

### Button Rendering Order
Custom buttons from `buttonList` appear **before** the default form actions in this order:
1. Custom buttons (from buttonList)
2. View Details (if applicable)
3. Save (if not in view mode)
4. Close

### Notes
- Buttons with `show: false` or `show()` returning `false` will not be displayed
- The `handler` function receives a form utility API object with access to `userFormData` and form methods
- Icons use PrimeIcons classes (e.g., `pi pi-check`, `pi pi-eye`, `pi pi-trash`)
- Button styling matches the existing form button design

## Example Usage
```javascript
// Example form.js structure
capps.ui.collection_name.form = {
    // Event handlers
    _onLoadEvent: async function (frm) {
        // Initialize form
        frm.set_value("FIELD_NAME", "default value");
        
        // Set user-specific defaults
        try {
            const session = config.getSessionStorage();
            frm.set_value("CREATED_BY", session.userid);
        } catch (error) {
            console.error('Error accessing session:', error);
        }
    },
    
    _onBeforeSave: async function (frm) {
        // Validate before save - throw error to prevent save
        if (!current_form.REQUIRED_FIELD) {
            throw new Error("Required field validation failed");
        }
    },

    // Field handler example
    FIELD_NAME: async function (frm) {
        // Access current form data
        const currentValue = current_form.FIELD_NAME;
        
        // Set field value
        frm.set_value("FIELD_NAME", "new value");
        
        // Enable/disable field based on current data
        if (current_form.STATUS === "ACTIVE") {
            frm.set_field_enabled("FIELD_NAME");
        } else {
            frm.set_field_disabled("FIELD_NAME");
        }
        
        // Set dropdown options
        frm.set_dropdown_options("FIELD_NAME", [
            { label: "Option 1", value: "1" },
            { label: "Option 2", value: "2" }
        ]);
    },

    // Child collection handlers
    STATUS_FIELD(frm) {
        // Control child collection visibility based on status
        if (current_form.STATUS_FIELD === "ACTIVE") {
            frm.show_child_collection("child_records");
            // Auto-open add form for new active records
            frm.open_child_collection("child_records");
        } else {
            frm.hide_child_collection("child_records");
        }
    },

    ADD_CHILD_RECORD_BTN(frm) {
        // Button handler to open child collection add form
        frm.open_child_collection("child_records");
    },

    DUPLICATE_RECORD_BTN(frm) {
        // Button handler to duplicate current record in child collection
        const currentRecord = {
            ID: current_form.ID,
            NAME: current_form.NAME,
            // ... other fields to duplicate
        };
        frm.open_child_collection("child_records", "modify", currentRecord);
    },

    AUTO_SAVE_BTN(frm) {
        // Programmatically save the form
        if (current_form.TEXT_FIELD && current_form.TEXT_FIELD.length > 0) {
            frm.save(); // This will trigger the main form's save operation
        }
    }
}
```

---
[Go back to main page](../README.md)
