# CAPPS Framework Documentation

## UI Methods

### 1. Alert Box
```javascript
capps.ui.alert({
    message: string,          // Required: Message to display
    size?: "sm" | "md" | "lg" | "xl",  // Optional: Size of alert box
    buttonSize?: "sm" | "md" | "lg",   // Optional: Size of buttons
    okVariant?: "success" | "danger" | "info" | "warning",  // Optional: Button style
    centered?: boolean,       // Optional: Center the alert box
    noCloseOnBackdrop?: boolean,  // Optional: Prevent closing on backdrop click
    title?: string           // Optional: Alert title
})
```
Shows an alert box and returns a promise that resolves when the alert is closed.

Example:
```javascript
await capps.ui.alert({
    title: "Success",
    message: "Record saved successfully!",
    size: "md",
    okVariant: "success"
});
```

### 2. Confirm Box
```javascript
capps.ui.confirm({
    title?: string,          // Optional: Confirmation title
    message: string,         // Required: Confirmation message
    size?: "sm" | "md" | "lg" | "xl",  // Optional: Size of confirm box
    buttonSize?: "sm" | "md" | "lg",   // Optional: Size of buttons
    okVariant?: "primary" | "success" | "danger" | "info" | "warning",  // Optional: Button style
    okTitle?: string,        // Optional: Confirm button text
    cancelTitle?: string,    // Optional: Cancel button text
    footerClass?: string,    // Optional: Custom CSS class for footer
    hideHeaderClose?: boolean  // Optional: Hide close button in header
})
```
Shows a confirmation box and returns a promise that resolves to:
- `true` if user clicks confirm
- `false` if user clicks cancel or closes the dialog

Example:
```javascript
const confirmed = await capps.ui.confirm({
    title: "Confirm Action",
    message: "Are you sure you want to delete this record?",
    okVariant: "danger",
    okTitle: "Delete",
    cancelTitle: "Cancel"
});

if (confirmed) {
    // Proceed with deletion
}
```

### 3. Toast Notification
```javascript
capps.ui.toast({
    title?: string,          // Optional: Toast title
    variant?: "success" | "danger" | "info" | "warning",  // Optional: Toast style
    message: string,         // Required: Toast message
    solid?: boolean,         // Optional: Solid background style
    autoHideDelay?: number   // Optional: Auto-hide delay in milliseconds
})
```
Displays a toast notification that automatically hides after the specified delay.

Example:
```javascript
capps.ui.toast({
    title: "Success",
    message: "Record saved successfully",
    variant: "success",
    autoHideDelay: 5000  // 5 seconds
});
```

### 4. Refresh List
```javascript
capps.ui.refresh()
```
Refreshes the current list collection by reloading data from the server.

Example:
```javascript
// After successful update
await capps.rest.credbooks.accounting_entries_mast.update["1"]({ data: { ... }});
capps.ui.refresh();  // Refresh the list to show updated data
```

### 5. Open Modal
```javascript
capps.ui.open_modal({
    title?: string,          // Optional: Modal title
    content: string,         // Required: HTML content or plain text
    size?: "sm" | "md" | "lg" | "xl",  // Optional: Modal size
    footer?: string,         // Optional: HTML content for footer
    style?: string,          // Optional: CSS styles for body content
    fields?: object[],       // Optional: Schema.json configuration for form
    handlers?: object[],     // Optional: Custom button handlers
    hideCloseButton?: boolean,  // Optional: Hide default close button (default: false)
    closeButtonLabel?: string   // Optional: Change close button text (default: "Close")
})
```
Opens a custom modal with specified content and styles. Returns a promise that resolves when the modal is closed.

Examples:

**Basic Modal:**
```javascript
await capps.ui.open_modal({
    title: "Information",
    content: "<p>This is a basic modal.</p>",
    size: "md"
});
```

**Modal with Custom Close Button Label:**
```javascript
await capps.ui.open_modal({
    title: "Confirmation",
    content: "<p>Are you sure you want to proceed?</p>",
    closeButtonLabel: "Cancel"
});
```

**Modal with Hidden Close Button:**
```javascript
await capps.ui.open_modal({
    title: "Loading",
    content: "<p>Please wait while we process your request...</p>",
    hideCloseButton: true
});
```

**Modal with Custom Handlers:**
```javascript
await capps.ui.open_modal({
    title: "Confirm Action",
    content: "<p>Do you want to save these changes?</p>",
    handlers: [
        {
            label: "Save",
            variant: "primary",
            handler: (ctx) => {
                // Save logic here
                ctx.closeModal();
            }
        },
        {
            label: "Cancel",
            variant: "secondary", 
            handler: (ctx) => ctx.closeModal()
        }
    ]
});
```

**Modal with Form Fields:**
```javascript
await capps.ui.open_modal({
    title: "Add New Record",
    content: "<div>Fill out the form below:</div>",
    size: "lg",
    fields: [
        {
            field: "name",
            label: "Name",
            type: "text",
            required: true
        },
        {
            field: "email",
            label: "Email",
            type: "email",
            required: true
        }
    ]
});
```

## REST APIs

### 1. Read Collection Data
```javascript
capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.read({ 
    filter: Array<{
        field: string,      // Field name to filter on
        value: any,         // Value to filter by
        asgn: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin",  // Assignment operator
        type?: string       // Optional: Data type for value comparison
    }>,
    sort?: Array<{
        field: string,      // Field to sort by
        order: "asc" | "desc"  // Sort order
    }>,
    limit?: number,         // Optional: Maximum number of records to return
})
```
Returns a promise that resolves to an array of records.

Example:
```javascript
const records = await capps.rest.credbooks.accounting_entries_mast.read({
    filter: [
        { field: "STATUS", value: "ACTIVE", asgn: "eq" },
        { field: "AMOUNT", value: 1000, asgn: "gt", type: "number" }
    ],
    sort: [
        { field: "CREATED_DATE", order: "desc" }
    ],
    limit: 10,
    offset: 0
});
```

### 2. Update Record
```javascript
capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.update[<<ID>>]({ 
    data: {
        [field: string]: any  // Field-value pairs to update
    }
})
```
Returns a promise that resolves to the updated record.

Example:
```javascript
const updated = await capps.rest.credbooks.accounting_entries_mast.update["1"]({
    data: {
        STATUS: "INACTIVE",
        UPDATED_BY: "USER123"
    }
});
```

### 3. Create Record
```javascript
capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.create({ 
    data: {
        [field: string]: any  // Field-value pairs for new record
    }
})
```
Returns a promise that resolves to the created record.

Example:
```javascript
const created = await capps.rest.credbooks.accounting_entries_mast.create({
    data: {
        NAME: "New Record",
        STATUS: "ACTIVE",
        CREATED_BY: "USER123"
    }
});
```

### 4. Delete Record
```javascript
capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.delete[<<ID>>]()
```
Returns a promise that resolves when the record is deleted.

Example:
```javascript
await capps.rest.credbooks.accounting_entries_mast.delete["1"]();
```

## RPC (Remote Procedure Call)

```javascript
capps.rpc.<<APP_NAME>>.<<Plugin_Name>>.<<FUNCTION_NAME>>({ 
    payload: any  // Function-specific payload
})
```
Returns a promise that resolves to the function's result.

Example:
```javascript
const result = await capps.rpc.credbooks.FUNDS.isValidAmountExpression({
    amount: 1000,
    currency: "USD"
});
```

## Common Utilities

### 1. Route Utilities

#### a. Get Route (capps.get_route)
```javascript
capps.get_route()
```
Returns an array containing the current route information in the format: `[appName, docType, documentName, ...restPath]`

Example:
```javascript
const route = capps.get_route();
// Returns: ["credbooks", "doc", "accounting_entries_mast", "list"]
```

#### b. Set Route (capps.set_route)
```javascript
capps.set_route(route: string | string[], options?: {
    filter?: object,
    defaults?: object,
    [key: string]: any
})
```
Navigates to a specified route with optional query parameters.

Parameters:
- `route`: String or array representing the route path
- `options`: Optional object containing:
  - `filter`: Object for filtering data
  - `defaults`: Object for default values
  - Any additional query parameters

Example:
```javascript
// Navigate to list view with filter
capps.set_route("list", {
    filter: { STATUS: "ACTIVE" },
    defaults: { TYPE: "SALE" }
});

// Navigate to specific document
capps.set_route(["doc", "accounting_entries_mast", "form", "123"]);
```

### 2. Format Utility (capps.format)
```javascript
capps.format(value: any, options?: {
    fieldtype?: 'Date' | 'Datetime' | 'Currency' | 'Int' | 'Float',
    format?: string,
    inputFormat?: string,
    currency?: string,
    precision?: number
})
```
Formats a value based on the specified field type and options.

Parameters:
- `value`: Value to format
- `options`: Formatting options:
  - `fieldtype`: Type of field ('Date', 'Datetime', 'Currency', 'Int', 'Float')
  - `format`: Output format (for dates)
  - `inputFormat`: Input format (for dates)
  - `currency`: Currency symbol (for currency)
  - `precision`: Number of decimal places (for numbers)

Example:
```javascript
// Format date
capps.format("2024-03-25", {
    fieldtype: "Date",
    format: "DD/MM/YYYY"
}); // Returns: "25/03/2024"

// Format currency
capps.format(1234.56, {
    fieldtype: "Currency",
    currency: "$"
}); // Returns: "$1,234.56"

// Format number
capps.format(1234.5678, {
    fieldtype: "Float",
    precision: 2
}); // Returns: "1,234.57"
```

### 3. Require Utility (capps.require)
```javascript
capps.require(assets: string | string[], callback?: function)
```
Loads external assets (JS, CSS, HTML) and executes a callback when complete.

Parameters:
- `assets`: Single asset URL or array of asset URLs
- `callback`: Optional function to execute after assets are loaded

Supported asset types:
- `.js`: JavaScript files
- `.css`: Stylesheet files
- `.html`/`.htm`: HTML files (including embedded scripts and stylesheets)

Example:
```javascript
// Load single asset
capps.require("/path/to/script.js", (result) => {
    console.log("Script loaded");
});

// Load multiple assets
capps.require([
    "/path/to/script.js",
    "/path/to/style.css",
    "/path/to/template.html"
], (results) => {
    console.log("All assets loaded");
});

// Load HTML with embedded scripts and styles
capps.require("/path/to/template.html", (htmlContent) => {
    // htmlContent contains the HTML with scripts and styles removed
    // as they are loaded separately
});
```

Note: The require utility:
- Handles relative and absolute URLs
- Loads scripts asynchronously
- Processes embedded scripts and styles in HTML files
- Returns a Promise that resolves when all assets are loaded
- Automatically resolves relative paths in HTML files
- Handles errors for failed asset loading

## Collection Access

### Access Collection Details

```javascript
capps.ui.collection
```

Provides access to the current collection's metadata.

#### Properties

- **collectionName**  
  The internal name of the collection (e.g., "bill").

- **schema**  
  An object describing the collection schema, with the following keys:
  - `ACTIONS`: Array of allowed actions (e.g., `["CREATE", "DELETE", "EXPORT"]`)
  - `DATA_MODEL`: Backend data model name (e.g., `"CA_BOOK_MASTER"`)
  - `FIELDS`: Object containing all field definitions
  - `NAME`: Human-readable collection name (e.g., `"Books"`)
  - `VIRTUAL_COLLECTION`: (if present) Indicates if this is a virtual collection
  - ... (any other keys present in the schema)

#### Example

```javascript
// Get collection name
const name = capps.ui.collection.collectionName;

// Get schema object
const schema = capps.ui.collection.schema;

// Get all actions allowed on this collection
const actions = schema.ACTIONS;

// Get all field definitions
const fields = schema.FIELDS;

// Get the backend data model name
const dataModel = schema.DATA_MODEL;

// Get the human-readable collection name
const displayName = schema.NAME;
```

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
/* Style all collection forms */
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

/* Style form sections differently for different collections */
.capps-collection-form--accounting-ledger .form-section {
  border-left: 4px solid #007bff;
  padding-left: 1rem;
}

/* Apply different spacing for specific module-collection combinations */
.capps-collection-form--funds-portfolio .form-group {
  margin-bottom: 2rem;
}
```

### Advanced Styling Patterns

#### Responsive Design for Collection Forms
```css
/* Mobile-first responsive styling for specific collections */
.capps-collection-form--trading-orders .form-field {
  width: 100%;
}

@media (min-width: 768px) {
  .capps-collection-form--trading-orders .form-field {
    width: 50%;
    display: inline-block;
    margin-right: 1rem;
  }
}
```

#### Action-Specific Form Modifications
```css
/* Hide certain fields in view mode */
.capps-form-action--view .internal-notes-field {
  display: none;
}

/* Highlight required fields differently in add mode */
.capps-form-action--add .form-field[required] {
  border-left: 4px solid #dc3545;
}

/* Subtle styling for update mode */
.capps-form-action--update .form-field {
  background-color: #fffbf0;
}
```

#### Collection-Specific Input Styling
```css
/* Financial collections - currency input styling */
.capps-collection-form--finance-invoices input[type="number"],
.capps-collection-form--accounting-ledger input[type="number"] {
  text-align: right;
  font-family: 'Courier New', monospace;
  background-color: #f8f9fa;
}

/* HR collections - consistent spacing */
.capps-collection-form--hrms-employees .form-row {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}
```

### Implementation Notes

1. **Isolation**: These selectors only affect collection forms in the InputForm component, not filter forms, search forms, or other UI elements
2. **Specificity**: Use more specific selectors (module + collection + action) for precise targeting
3. **Maintainability**: The naming convention follows BEM methodology for clear, maintainable styles
4. **Performance**: CSS is scoped to avoid conflicts and minimize style recalculation
5. **Flexibility**: Selectors can be combined for complex styling requirements

### Best Practices

- **Start General, Get Specific**: Begin with `.capps-collection-form` for base styles, then use specific selectors for exceptions
- **Use Action Selectors Wisely**: Leverage action-based classes to provide different experiences for add, update, and view modes
- **Combine Selectors Carefully**: When combining multiple selectors, ensure the specificity doesn't become unmanageable
- **Test Across Collections**: Verify that general styles work well across different collection types
- **Document Custom Styles**: Add comments explaining the purpose of specific collection styling overrides

## Placeholder Text System

CAPPS includes an intelligent placeholder text system that automatically generates appropriate placeholder text for form fields.

### Automatic Placeholder Generation

#### Text Field Types
- **Input fields** (text, email, password, number): `"ENTER FIELD_LABEL"`
- **Textarea fields**: `"ENTER FIELD_LABEL"`

#### Selection Field Types  
- **Select dropdowns**: `"SELECT FIELD_LABEL"`
- **Date/DateTime fields**: `"SELECT FIELD_LABEL"`
- **Time fields**: `"SELECT FIELD_LABEL"`
- **File upload fields**: `"SELECT FIELD_LABEL"`

#### Special Behavior
- **Disabled fields**: No placeholder (empty string) - automatic hiding for cleaner UI
- **Readonly fields**: Normal placeholder behavior (field is visible but not editable)

### Placeholder Text Sources

The system determines placeholder text using this priority order:

1. **Locale Translation** (highest priority)
   ```json
   // In locale file (e.g., locales/en.json)
   {
     "fields": {
       "CUSTOMER_EMAIL": "Customer Email Address"
     }
   }
   ```

2. **Field Label Property**
   ```json
   {
     "CUSTOMER_EMAIL": {
       "fieldtype": "email",
       "label": "Customer Email"
     }
   }
   ```

3. **Field Name** (lowest priority - automatic conversion)
   ```json
   {
     "CUSTOMER_EMAIL": {
       "fieldtype": "email"
       // No label - uses "CUSTOMER EMAIL" (underscores → spaces)
     }
   }
   ```

### Examples

```json
{
  "FIELDS": {
    "EMAIL_ADDRESS": {
      "fieldtype": "email",
      "label": "Email Address",
      "required": 1,
      "disabled": 0
    },
    "BIRTH_DATE": {
      "fieldtype": "date", 
      "label": "Date of Birth",
      "disabled": 0
    },
    "INTERNAL_NOTES": {
      "fieldtype": "textarea",
      "label": "Internal Notes",
      "disabled": 1
    }
  }
}
```

**Results**:
- Email Address: `"ENTER EMAIL ADDRESS"`
- Birth Date: `"SELECT DATE OF BIRTH"` 
- Internal Notes: No placeholder (field is disabled)

### Dynamic Placeholder Behavior

Placeholders automatically respond to field state changes:

- **Field becomes disabled**: Placeholder immediately disappears
- **Field becomes enabled**: Placeholder immediately appears
- **Label changes**: Placeholder updates accordingly
- **Locale changes**: Placeholder uses new translation

### Best Practices

1. **Provide Clear Labels**: Use descriptive labels for better placeholder text
   ```json
   // Good
   "label": "Customer Phone Number"
   
   // Avoid
   "label": "Phone"
   ```

2. **Use Locale Files**: For multi-language applications, define placeholder text in locale files
   ```json
   {
     "fields": {
       "PHONE_NUMBER": "Enter your phone number with country code"
     }
   }
   ```

3. **Consider Disabled States**: The system automatically handles disabled field placeholders, providing a cleaner interface

4. **Field Naming**: Use descriptive field names as they serve as fallback placeholder text
   ```json
   // Good - readable fallback
   "CUSTOMER_PHONE_NUMBER": { ... }
   
   // Poor - unclear fallback  
   "CUST_PH": { ... }
   ```

This placeholder system ensures consistent, user-friendly form interfaces across all CAPPS applications while automatically handling edge cases like disabled fields.

## Form Field Types and HTML Structure Reference

This comprehensive guide documents all available CAPPS form field types, their generated HTML structures, and CSS selectors for easy styling customization.

### Common Form Group Structure

All form fields are wrapped in a consistent structure:

```html
<div class="input_field_wrapper item validation-provider" data-vv-name="FIELD_NAME">
  <div class="form-group form-group-{field-type} label-direction-{direction}">
    <label class="form-group-label">Field Label</label>
    <!-- Field-specific HTML here -->
    <div class="invalid-feedback">Error message</div>
  </div>
</div>
```

**Common CSS Selectors:**
- `.input_field_wrapper` - Outer wrapper for all fields
- `.form-group-{field-type}` - Field type specific wrapper
- `.form-group-label` - Field labels
- `.invalid-feedback` - Error messages

### Basic Input Fields

#### 1. Text Field (`textfield`)

**Configuration:**
```json
{
  "CUSTOMER_NAME": {
    "fieldtype": "textfield",
    "label": "Customer Name",
    "maxlength": 100
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-text">
  <label class="form-group-label">Customer Name</label>
  <input type="text" 
         class="form-control" 
         placeholder="ENTER CUSTOMER NAME"
         maxlength="100"
         name="CUSTOMER_NAME">
</div>
```

**CSS Selectors:**
```css
.form-group-text input[type="text"] { }
.form-group-text .form-control { }
```

#### 2. Email Field (`email`)

**Configuration:**
```json
{
  "EMAIL_ADDRESS": {
    "fieldtype": "email",
    "label": "Email Address"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-email">
  <label class="form-group-label">Email Address</label>
  <input type="email" 
         class="form-control" 
         placeholder="ENTER EMAIL ADDRESS"
         name="EMAIL_ADDRESS">
</div>
```

**CSS Selectors:**
```css
.form-group-email input[type="email"] { }
```

#### 3. Password Field (`password`)

**Configuration:**
```json
{
  "USER_PASSWORD": {
    "fieldtype": "password",
    "label": "Password"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-password">
  <label class="form-group-label">Password</label>
  <input type="password" 
         class="form-control" 
         placeholder="ENTER PASSWORD"
         autocomplete="off"
         name="USER_PASSWORD">
</div>
```

**CSS Selectors:**
```css
.form-group-password input[type="password"] { }
```

#### 4. Number Field (`number`)

**Configuration:**
```json
{
  "AGE": {
    "fieldtype": "number",
    "label": "Age",
    "rules": {
      "min": [18],
      "max": [100]
    }
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-number">
  <label class="form-group-label">Age</label>
  <input type="number" 
         class="form-control" 
         placeholder="ENTER AGE"
         min="18"
         max="100"
         name="AGE">
</div>
```

**CSS Selectors:**
```css
.form-group-number input[type="number"] { }
```

### Selection Fields

#### 5. Select Dropdown (`select`)

**Configuration:**
```json
{
  "COUNTRY": {
    "fieldtype": "select",
    "label": "Country",
    "options": "India,USA,UK,Canada"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-select">
  <label class="form-group-label">Country</label>
  <div class="v-select vs--single vs--searchable">
    <div class="vs__dropdown-toggle">
      <div class="vs__selected-options">
        <input class="vs__search" placeholder="SELECT COUNTRY">
      </div>
      <div class="vs__actions">
        <button class="vs__clear"></button>
        <div class="vs__open-indicator"></div>
      </div>
    </div>
    <div class="vs__dropdown-menu">
      <ul class="vs__dropdown-options">
        <li class="vs__dropdown-option">India</li>
        <li class="vs__dropdown-option">USA</li>
      </ul>
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-select .v-select { }
.form-group-select .vs__dropdown-toggle { }
.form-group-select .vs__search { }
.form-group-select .vs__dropdown-menu { }
.form-group-select .vs__dropdown-option { }
```

#### 6. Remote Select (`remote-select`)

**Configuration:**
```json
{
  "CUSTOMER": {
    "fieldtype": "remote-select",
    "label": "Customer",
    "linked_to": {
      "ref": "customers",
      "key": "ID",
      "display_name": "NAME"
    }
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-remote-select">
  <label class="form-group-label">Customer</label>
  <div class="v-select vs--single vs--searchable">
    <!-- Similar to select but with remote data loading -->
    <div class="vs__dropdown-toggle">
      <div class="vs__selected-options">
        <input class="vs__search" placeholder="SELECT CUSTOMER">
      </div>
    </div>
    <div class="vs__dropdown-menu">
      <ul class="vs__dropdown-options">
        <li class="vs__dropdown-option">
          <div style="display: flex; align-items: baseline">
            <strong>Customer Name</strong>
            <span>- Customer Code</span>
          </div>
          <br>
          <span>Additional sub-label info</span>
        </li>
      </ul>
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-remote-select .v-select { }
.form-group-remote-select .vs__dropdown-option strong { }
.form-group-remote-select .vs__dropdown-option span { }
```

#### 7. Checkbox (`checkbox`)

**Configuration:**
```json
{
  "AGREE_TERMS": {
    "fieldtype": "checkbox",
    "label": "I agree to terms and conditions"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-checkbox">
  <div class="custom-control custom-checkbox b-custom-control-lg">
    <input type="checkbox" 
           class="custom-control-input" 
           value="Y"
           name="AGREE_TERMS">
    <label class="custom-control-label">I agree to terms and conditions</label>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-checkbox .custom-control-input { }
.form-group-checkbox .custom-control-label { }
```

#### 8. Radio Button (`radio`)

**Configuration:**
```json
{
  "GENDER": {
    "fieldtype": "radio",
    "label": "Gender",
    "checked-val": "M"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-radio">
  <div class="custom-control custom-radio b-custom-control-lg parent-radio">
    <input type="radio" 
           class="custom-control-input" 
           value="M"
           name="GENDER">
    <label class="custom-control-label">Male</label>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-radio .custom-control-input { }
.form-group-radio .parent-radio .custom-control-label { }
```

#### 9. Radio Group (`radio_options`)

**Configuration:**
```json
{
  "PRIORITY": {
    "fieldtype": "radio_options",
    "label": "Priority",
    "enum": ["High", "Medium", "Low"]
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-radio_options">
  <label class="form-group-label">Priority</label>
  <div class="bv-no-focus-ring">
    <div class="custom-control custom-radio b-custom-control-lg">
      <input type="radio" class="custom-control-input" value="High">
      <label class="custom-control-label">High</label>
    </div>
    <div class="custom-control custom-radio b-custom-control-lg">
      <input type="radio" class="custom-control-input" value="Medium">
      <label class="custom-control-label">Medium</label>
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-radio_options .custom-control { }
.form-group-radio_options .custom-control-input { }
```

#### 10. Checkbox Group (`checkbox-group`)

**Configuration:**
```json
{
  "INTERESTS": {
    "fieldtype": "checkbox-group",
    "label": "Interests",
    "options": "Sports,Music,Reading,Travel"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-checkbox-group">
  <label class="form-group-label">Interests</label>
  <div class="bv-no-focus-ring">
    <div class="custom-control custom-checkbox b-custom-control-lg">
      <input type="checkbox" class="custom-control-input" value="Sports">
      <label class="custom-control-label">Sports</label>
    </div>
    <div class="custom-control custom-checkbox b-custom-control-lg">
      <input type="checkbox" class="custom-control-input" value="Music">
      <label class="custom-control-label">Music</label>
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-checkbox-group .custom-control { }
.form-group-checkbox-group .custom-control-input { }
```

### Date and Time Fields

#### 11. Date Field (`date`)

**Configuration:**
```json
{
  "BIRTH_DATE": {
    "fieldtype": "date",
    "label": "Birth Date"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-date">
  <label class="form-group-label">Birth Date</label>
  <div class="mx-datepicker mx-datepicker-range">
    <div class="mx-input-wrapper">
      <input type="text" 
             class="mx-input form-control" 
             placeholder="SELECT BIRTH DATE"
             readonly>
      <span class="mx-icon-calendar mx-input-append">
        <svg><!-- Calendar icon --></svg>
      </span>
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-date .mx-datepicker { }
.form-group-date .mx-input { }
.form-group-date .mx-icon-calendar { }
```

#### 12. DateTime Field (`datetime`)

**Configuration:**
```json
{
  "EVENT_TIME": {
    "fieldtype": "datetime",
    "label": "Event Date & Time"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-datetime">
  <label class="form-group-label">Event Date & Time</label>
  <div class="mx-datepicker mx-datepicker-range">
    <div class="mx-input-wrapper">
      <input type="text" 
             class="mx-input form-control" 
             placeholder="SELECT EVENT DATE & TIME">
      <span class="mx-icon-calendar mx-input-append">
        <svg><!-- Calendar icon --></svg>
      </span>
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-datetime .mx-datepicker { }
.form-group-datetime .mx-input { }
```

#### 13. Time Field (`time`)

**Configuration:**
```json
{
  "MEETING_TIME": {
    "fieldtype": "time",
    "label": "Meeting Time"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-time">
  <label class="form-group-label">Meeting Time</label>
  <div class="mx-datepicker">
    <div class="mx-input-wrapper">
      <input type="text" 
             class="mx-input form-control" 
             placeholder="SELECT MEETING TIME">
      <span class="mx-input-append">
        <svg class="b-icon bi-clock"><!-- Clock icon --></svg>
      </span>
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-time .mx-datepicker { }
.form-group-time .mx-input { }
.form-group-time .b-icon-clock { }
```

#### 14. Date Range Field (`daterange`)

**Configuration:**
```json
{
  "REPORT_PERIOD": {
    "fieldtype": "daterange",
    "label": "Report Period"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-daterange">
  <label class="form-group-label">Report Period</label>
  <div class="mx-datepicker mx-datepicker-range text-right">
    <div class="mx-input-wrapper">
      <input type="text" 
             class="mx-input form-control" 
             placeholder="SELECT REPORT PERIOD">
      <span class="mx-icon-calendar mx-input-append">
        <svg><!-- Calendar icon --></svg>
      </span>
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-daterange .mx-datepicker-range { }
.form-group-daterange.text-right .mx-input { }
```

### Complex Input Fields

#### 15. Textarea Field (`textarea`)

**Configuration:**
```json
{
  "COMMENTS": {
    "fieldtype": "textarea",
    "label": "Comments",
    "rows": 4,
    "max-rows": 8
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-textarea">
  <label class="form-group-label">Comments</label>
  <textarea class="form-control custom-scroll-textarea" 
            rows="4" 
            placeholder="ENTER COMMENTS"
            name="COMMENTS">
  </textarea>
</div>
```

**CSS Selectors:**
```css
.form-group-textarea textarea { }
.form-group-textarea .custom-scroll-textarea { }
```

#### 16. Rich Text Editor (`rich_text_editor`)

**Configuration:**
```json
{
  "DESCRIPTION": {
    "fieldtype": "rich_text_editor",
    "label": "Description"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-rich_text_editor">
  <label class="form-group-label">Description</label>
  <div class="rich-text-editor">
    <div class="quill-editor">
      <div class="ql-toolbar ql-snow">
        <span class="ql-formats">
          <button class="ql-bold"></button>
          <button class="ql-italic"></button>
        </span>
      </div>
      <div class="ql-container ql-snow">
        <div class="ql-editor" contenteditable="true">
          <p><br></p>
        </div>
      </div>
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-rich_text_editor .rich-text-editor { }
.form-group-rich_text_editor .ql-toolbar { }
.form-group-rich_text_editor .ql-editor { }
.form-group-rich_text_editor .ql-container { }
```

#### 17. File Upload Field (`filefield`)

**Configuration:**
```json
{
  "ATTACHMENT": {
    "fieldtype": "filefield",
    "label": "Attachment",
    "accept": ".pdf,.doc,.docx"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-filefield">
  <label class="form-group-label">Attachment</label>
  <div>
    <!-- Current file info (if file selected) -->
    <div class="mb-1 current-file-info small">
      <svg class="b-icon bi-paperclip"></svg>
      Current file: <strong class="cursor-pointer">filename.pdf</strong>
      <span> (2.5 MB)</span>
      <button class="btn btn-link p-0 ml-1 text-danger" title="Clear selection">
        <svg class="b-icon bi-x-circle-fill"></svg>
      </button>
    </div>
    
    <!-- File input -->
    <div class="custom-file b-form-file">
      <input type="file" 
             class="custom-file-input" 
             accept=".pdf,.doc,.docx"
             name="ATTACHMENT">
      <label class="custom-file-label">SELECT ATTACHMENT</label>
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-filefield .custom-file { }
.form-group-filefield .custom-file-input { }
.form-group-filefield .custom-file-label { }
.form-group-filefield .current-file-info { }
```

#### 18. Tags Field (`tags`)

**Configuration:**
```json
{
  "KEYWORDS": {
    "fieldtype": "tags",
    "label": "Keywords"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-tags">
  <label class="form-group-label">Keywords</label>
  <div class="b-form-tags form-control h-auto">
    <div class="input-group mb-2">
      <input type="text" class="form-control">
      <div class="input-group-append">
        <button class="btn btn-primary">Add</button>
      </div>
    </div>
    <div class="tags-list">
      <span class="badge badge-secondary mr-1">
        tag1
        <button class="btn-close">×</button>
      </span>
      <span class="badge badge-secondary mr-1">
        tag2
        <button class="btn-close">×</button>
      </span>
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-tags .b-form-tags { }
.form-group-tags .input-group { }
.form-group-tags .tags-list { }
.form-group-tags .badge { }
```

### Interactive Fields

#### 19. Star Rating Field (`ratings`)

**Configuration:**
```json
{
  "RATING": {
    "fieldtype": "ratings",
    "label": "Rating",
    "stars": 5,
    "size": 25
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-ratings">
  <label class="form-group-label">Rating</label>
  <div class="vue-star-rating">
    <div class="sr-only">Rated 0 out of 5</div>
    <span class="vue-star-rating-star">
      <svg class="vue-star-rating-star-svg">
        <polygon class="vue-star-rating-star-polygon"></polygon>
      </svg>
    </span>
    <!-- Repeated for each star -->
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-ratings .vue-star-rating { }
.form-group-ratings .vue-star-rating-star { }
.form-group-ratings .vue-star-rating-star-svg { }
```

#### 20. Button Field (`button`)

**Configuration:**
```json
{
  "CALCULATE": {
    "fieldtype": "button"
    // Note: No "label" property - button takes full width automatically
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-button no-label">
  <button class="btn btn-secondary btn-md">
    CALCULATE
  </button>
</div>
```

**CSS Selectors:**
```css
.form-group-button .btn { }
.form-group-button .btn-secondary { }

/* Button fields automatically take full width when no label is specified */
.form-group-button.no-label .btn {
  width: 100%;
  display: block;
}
```

**Special Behavior:**
- Button fields do not display labels in the form UI
- Automatically take full width of the container in horizontal layouts
- Button text comes from field name (converted from underscores to spaces) or explicit label property

#### 21. Hyperlink Field (`hyperlink`)

**Configuration:**
```json
{
  "WEBSITE": {
    "fieldtype": "hyperlink",
    "href": "https://example.com",
    "target": "_blank"
    // Note: No "label" property - hyperlink takes full width automatically
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-hyperlink no-label">
  <a href="https://example.com" 
     target="_blank" 
     class="btn-link">
    WEBSITE
  </a>
</div>
```

**CSS Selectors:**
```css
.form-group-hyperlink a { }
.form-group-hyperlink .btn-link { }

/* Hyperlink fields automatically take full width when no label is specified */
.form-group-hyperlink.no-label a {
  width: 100%;
  display: block;
}
```

**Special Behavior:**
- Hyperlink fields do not display labels in the form UI
- Automatically take full width of the container in horizontal layouts
- Link text comes from field name (converted from underscores to spaces) or explicit label property

### Advanced Custom Fields

#### 22. HTML Field (`html`)

**Configuration:**
```json
{
  "CUSTOM_CONTENT": {
    "fieldtype": "html",
    "reference": "custom-form-template"
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-html">
  <div class="html_content">
    <div class="custom_input_form">
      <!-- Dynamic HTML content loaded from reference -->
    </div>
  </div>
</div>
```

**CSS Selectors:**
```css
.form-group-html .html_content { }
.form-group-html .custom_input_form { }
```

#### 23. Data Expression Field (`data-expression`)

**Configuration:**
```json
{
  "FORMULA": {
    "fieldtype": "data-expression",
    "label": "Formula",
    "suggestions": ["SUM", "AVG", "COUNT"]
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-data-expression">
  <label class="form-group-label">Formula</label>
  <span class="position-relative">
    <textarea class="form-control custom-scroll-textarea" 
              placeholder="ENTER FORMULA">
    </textarea>
    <!-- Popover for suggestions -->
    <div class="popover bs-popover-bottom">
      <div class="base-data-expression--container scroll-y">
        <button class="dropdown-item">SUM</button>
        <button class="dropdown-item">AVG</button>
      </div>
    </div>
  </span>
</div>
```

**CSS Selectors:**
```css
.form-group-data-expression textarea { }
.form-group-data-expression .base-data-expression--container { }
.form-group-data-expression .dropdown-item { }
```

#### 24. Command Palette Field (`command-palette`)

**Configuration:**
```json
{
  "ACTIONS": {
    "fieldtype": "command-palette",
    "label": "Actions",
    "commands": ["Save", "Delete", "Export"]
  }
}
```

**Generated HTML:**
```html
<div class="form-group form-group-command-palette">
  <label class="form-group-label">Actions</label>
  <!-- Similar structure to data-expression with command suggestions -->
  <span class="position-relative">
    <textarea class="form-control" placeholder="ENTER ACTIONS"></textarea>
    <div class="popover bs-popover-bottom">
      <div class="command-palette--container">
        <button class="dropdown-item">Save</button>
        <button class="dropdown-item">Delete</button>
      </div>
    </div>
  </span>
</div>
```

**CSS Selectors:**
```css
.form-group-command-palette textarea { }
.form-group-command-palette .command-palette--container { }
```

### Field State Classes

All fields can have additional state-based CSS classes:

#### Validation States
```css
/* Field with error */
.input_field_wrapper.invalid .form-control { }
.is-invalid { }

/* Field with success */
.input_field_wrapper.valid .form-control { }
.is-valid { }
```

#### Disabled State
```css
/* Disabled field */
.input_field_wrapper.disabled { }
.form-control:disabled { }
```

#### Required Fields
```css
/* Required field indicator */
.input_field_wrapper.isRequired .form-group-label::after {
  content: "*";
  color: #dc3545;
}
```

### Label Direction Classes

Fields support different label positions:

```css
/* Top to bottom (default) */
.label-direction-top-bottom { }

/* Bottom to top */
.label-direction-bottom-top {
  display: flex;
  flex-direction: column-reverse;
}

/* Left to right */
.label-direction-left-right {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}

/* Right to left */
.label-direction-right-left {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: 12px;
}
```

### Common Styling Patterns

#### Consistent Field Spacing
```css
.capps-collection-form .form-group {
  margin-bottom: 1.5rem;
}
```

#### Custom Input Styling
```css
.capps-collection-form .form-control {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: border-color 0.15s ease-in-out;
}

.capps-collection-form .form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
```

#### Label Styling
```css
.capps-collection-form .form-group-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}
```

#### Error State Styling
```css
.capps-collection-form .is-invalid {
  border-color: #dc3545;
}

.capps-collection-form .invalid-feedback {
  color: #dc3545;
  font-size: 0.875em;
}
```

This comprehensive reference provides all the necessary HTML structures and CSS selectors needed to style any CAPPS form field effectively.