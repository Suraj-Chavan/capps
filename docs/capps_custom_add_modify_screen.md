# Custom form screen development for add/modify

## HTML Field Type for Custom Screens (Non-Virtual Collections)

For regular collections (non-virtual), you can create custom screens using the `html` field type. This allows you to embed custom HTML content within your standard CAPPS form, giving you flexibility to create rich, interactive components alongside your business fields.

### HTML Field Configuration

In your collection schema, add an HTML field with a `reference` to your custom HTML file:

```json
{
  "FIELDS": {
    "CUSTOM_HTML_FIELD": {
      "fieldtype": "html",
      "reference": "<APP_NAME>/public/collection/<collection_name>/<custom_file>.html",
      "width": "100%"
    }
  }
}
```

**Example from collection_one:**
```json
{
  "HTML_FIELD2": {
    "fieldtype": "html",
    "reference": "capps-guinea-pig/public/collection/collection_one/image_file_preview.html",
    "width": "70%"
  }
}
```

### Key Properties

- **`reference`**: Path to your custom HTML file relative to the public directory
- **`width`**: Control the field width (e.g., "100%", "70%", "300px")
- **`hidden`**: Set to `1` to hide other fields and use full screen width for the HTML field

### Creating Custom HTML Content

Create your HTML file in the specified reference path:

```
<APP_NAME>/public/
  collection/
    <collection_name>/
      <custom_file>.html    // Your custom HTML content
      <custom_file>.css     // Optional: Custom styles
```

**Example HTML file:**
```html
<link rel="stylesheet" href="./custom_styles.css">

<div class="custom-component">
  <h3>Custom Interactive Component</h3>
  
  <button @click="updateFormFields" class="btn btn-primary">Update Fields</button>
  
  <!-- Your custom HTML content -->
  <vue3-component 
    name="DataTable" 
    :props="customTableProps"
    :events="customTableEvents">
  </vue3-component>
</div>

<script>
  // Vue options for interactivity
  capps.injectDependencies(`<APP_NAME>::<COLLECTION_NAME>::vue_options`, {
    data() {
      return {
        customTableProps: { 
          value: [],
          columns: [
            { field: 'name', header: 'Name' },
            { field: 'value', header: 'Value' }
          ]
        },
        customTableEvents: { 
          'row-select': this.handleRowSelect 
        }
      };
    },
    methods: {
      // Form utilities are available via this.frm
      updateFormFields() {
        this.frm.set_value('TEXT_FIELD', 'Updated from custom HTML');
        this.frm.set_field_enabled('SELECT_FIELD');
        this.frm.make_field_visible('HIDDEN_FIELD');
      },
      
      handleRowSelect(event) {
        // Update form field based on selected row
        this.frm.set_value('SELECTED_ID', event.data.id);
      }
    },
    mounted() {
      // Form utilities automatically available as this.frm
      console.log('Current form data:', this.current_form);
      
      // Set initial values
      this.frm.set_value('INITIAL_FIELD', 'Initial value from HTML');
    }
  });
</script>
```

### Integration with Form Data

Your custom HTML can interact with the form data using these built-in methods and variables:

#### Access via Vue Options (Recommended)
When using Vue options, form utilities are automatically available as `this.frm`:

```javascript
capps.injectDependencies(`<APP_NAME>::<COLLECTION_NAME>::vue_options`, {
  mounted() {
    // Access form utilities directly
    this.frm.set_value('FIELD_NAME', 'new_value');
    this.frm.set_field_enabled('SELECT_FIELD');
    this.frm.make_field_visible('HIDDEN_FIELD');
  },
  
  methods: {
    handleButtonClick() {
      // All form utility methods available via this.frm
      this.frm.set_value('TEXT_FIELD', 'Updated Value');
      this.frm.set_dropdown_options('SELECT_FIELD', ['Option 1', 'Option 2']);
      this.frm.clear_dropdown_options('ANOTHER_FIELD');
      this.frm.set_field_disabled('READONLY_FIELD');
      this.frm.make_field_invisible('CONDITIONAL_FIELD');
      this.frm.manage_validation_rule('REQUIRED_FIELD', { required: true });
      this.frm.set_query('REMOTE_SELECT', [{ field: 'status', asgn: '=', value: 'active' }]);
      this.frm.set_suggestions('AUTOCOMPLETE_FIELD', ['Suggestion 1', 'Suggestion 2']);
    }
  }
});
```

#### Available Form Utility Methods
- **`this.frm.set_value(fieldName, value)`** - Update form field value
- **`this.frm.set_field_enabled(fieldName)`** - Enable a field
- **`this.frm.set_field_disabled(fieldName)`** - Disable a field  
- **`this.frm.make_field_visible(fieldName)`** - Show a field
- **`this.frm.make_field_invisible(fieldName)`** - Hide a field
- **`this.frm.set_dropdown_options(fieldName, options)`** - Update dropdown options
- **`this.frm.clear_dropdown_options(fieldName)`** - Clear dropdown options
- **`this.frm.manage_validation_rule(fieldName, rules)`** - Add/update validation rules
- **`this.frm.set_query(fieldName, query)`** - Set field query for remote selects
- **`this.frm.set_suggestions(fieldName, suggestions)`** - Set field suggestions
- **`this.frm.set_commands(fieldName, commands)`** - Set field commands

#### Access via Pure JavaScript
For non-Vue JavaScript access:

```javascript
// Get form utilities - always available via getDependency
const formUtils = capps.getDependency(`<APP_NAME>::<COLLECTION_NAME>::form_utils`);

// Use utility methods - no need for fallbacks as form utilities are always available
formUtils.set_value('FIELD_NAME', 'new_value');
formUtils.set_field_enabled('SELECT_FIELD');
formUtils.make_field_visible('HIDDEN_FIELD');
```

**Important**: Form utilities obtained via `capps.getDependency()` are **always available** and will always contain all the required methods (`set_value`, `manage_validation_rule`, etc.). No fallback code or null checks are needed.

#### Built-in Variables
- **`current_form`**: Object containing all form field values
- **`this.id`**: Current record ID (for modify mode)

### Use Cases

1. **Custom Data Visualizations**: Charts, graphs, dashboards
2. **File Previews**: Image/document preview components  
3. **Complex Input Forms**: Multi-step wizards, dynamic forms
4. **Third-party Integrations**: Maps, external widgets
5. **PrimeVue Components**: Rich data tables, calendars, etc.

### Full-Width Custom Screen

To create a full-width custom screen, hide other fields:

```json
{
  "FIELDS": {
    "BUSINESS_FIELD1": {
      "fieldtype": "textfield",
      "hidden": 1
    },
    "BUSINESS_FIELD2": {
      "fieldtype": "date", 
      "hidden": 1
    },
    "CUSTOM_SCREEN": {
      "fieldtype": "html",
      "reference": "app-name/public/collection/collection_name/custom_screen.html",
      "width": "100%"
    }
  }
}
```

This approach gives you the flexibility of custom screens while maintaining all CAPPS business logic and data handling.

### Using PrimeVue Components with vue3-component

CAPPS supports loading PrimeVue components dynamically using the `<vue3-component>` tag. This allows you to use rich UI components without increasing bundle size.

**Available PrimeVue Components:**
- **Data**: DataTable, Column, DataView, Tree, Timeline
- **Forms**: InputText, Dropdown, Calendar, Checkbox, Button
- **Layout**: Card, Panel, Dialog, TabView, Accordion
- **Navigation**: Menu, Breadcrumb, Steps
- **Media**: Image, Carousel, Galleria
- **Feedback**: Toast, Message, ProgressBar

**Example usage:**
```html
<!-- DataTable with dynamic data -->
<vue3-component 
  name="DataTable"
  :props="{ 
    value: tableData, 
    columns: columnDefs,
    paginator: true,
    rows: 10,
    stripedRows: true 
  }"
  :events="{ 
    'row-select': handleRowSelect 
  }">
</vue3-component>

<!-- Button with click handler -->
<vue3-component 
  name="Button"
  :props="{ 
    label: 'Save Data',
    icon: 'pi pi-check',
    class: 'p-button-success' 
  }"
  :events="{ 
    click: saveFormData 
  }">
</vue3-component>

<!-- Calendar for date selection -->
<vue3-component 
  name="Calendar"
  :props="{ 
    modelValue: selectedDate,
    showIcon: true,
    dateFormat: 'yy-mm-dd'
  }"
  :events="{ 
    'update:modelValue': updateDate 
  }">
</vue3-component>
```

**Dynamic Loading Benefits:**
- Components load only when needed
- Reduces initial bundle size  
- Automatic PrimeVue theming and styling
- Full component functionality with events and props

---

## Virtual Collection Custom Add/Modify Screen

If a collection schema has `VIRTUAL_COLLECTION: 1`, you must create a custom HTML form for add and update (modify) screens.

> **Note:**
> The `public` folder should be located at the root of your app:
> 
> ```
> <APP_NAME>/public/
> ```
> 
> **Example:**
> If your app name is `capps-guinea-pig`, then the path will be:
> 
> ```
> capps-guinea-pig/public/
>   collection/
>     <collection_name>/
>       form/
>         index.html   // Only this file is used for both add and update screens
> ```

### Folder Structure

Create the following folder and file structure inside your public directory:

```
public/
  collection/
    <collection_name>/
      form/
        index.html   // Custom form for both adding and updating a record
```

**Note:**
- Only `index.html` is valid and will be used for both add and update screens.
- Do **not** create separate `add.html` or `update.html` files.

---

## Advanced: Vue.js Template and Static Assets

For advanced custom forms, you can use a dedicated folder with a template file:

```
public/
  collection/
    <collection_name>/
      form/
        index.html      // Main template for add and update screen
        mfx.js          // (Optional) Custom JS
        mfx_vue.js      // (Optional) Vue options injection
```

### index.html as Template
- The `form/index.html` file will be used as the template for both add and update screens.
- You can use standard HTML and Vue.js template syntax in this file.
- This shouldn't have HTML tags or initial head/body tags because it renders as a component rather than a new DOM page, but you can use HTML's internal or external tags to load stylesheets and scripts.

### Static Asset Loading
- You can load static assets (JS, CSS, images) using `<script>` and `<link>` tags in `index.html`.

```html
<!-- Example: Load custom JS and Vue.js integration -->
<script type="text/javascript" src="./mfx.js"></script>
<script type="text/javascript" src="./mfx_vue.js"></script>
```

### Vue.js Template Rendering
- You can use Vue.js template syntax in `index.html` for dynamic rendering.

### Injecting Vue Options
- To provide Vue options (data, methods, computed, etc.), use the following pattern in your JS file (e.g., `mfx_vue.js`):

```javascript
// public/collection/<collection_name>/form/mfx_vue.js
(function(capps) {
    capps.injectDependencies(`<<APP_NAME>>::<<COLLECTION_NAME>>::vue_options`, {
        data() {
            return {
                // Your custom data
                formData: {},
                tableData: []
            };
        },
        methods: {
            // Form utilities available as this.frm
            updateField(fieldName, value) {
                this.frm.set_value(fieldName, value);
            },
            
            validateForm() {
                // Add validation rules
                this.frm.manage_validation_rule('EMAIL_FIELD', { 
                    required: true, 
                    email: true 
                });
            },
            
            toggleFieldVisibility(fieldName, show) {
                if (show) {
                    this.frm.make_field_visible(fieldName);
                } else {
                    this.frm.make_field_invisible(fieldName);
                }
            }
        },
        computed: {},
        watch: {},
        mounted() {
            // Form utilities automatically available as this.frm
            console.log('Form utilities:', this.frm);
            
            // Set initial values
            this.frm.set_value('STATUS', 'DRAFT');
            
            // Set dropdown options
            this.frm.set_dropdown_options('CATEGORY', ['Option 1', 'Option 2']);
        }
    });
})(window.capps);
```

**Example:**
For the `bill` collection in the `capps-guinea-pig` app:
- Template: `capps-guinea-pig/public/collection/bill/form/index.html`
- Vue options: `capps-guinea-pig/public/collection/bill/form/mfx_vue.js`

---

### Important Notes

- You are responsible for implementing form fields, validation, and submit logic in this custom HTML file.
- The CAPPS framework will use `index.html` as the add/modify screen for the virtual collection.
- If this file is not present, the default form UI will not be shown for virtual collections.

## Form.js Event Handlers with Custom HTML Fields

**IMPORTANT LIMITATION**: When using custom HTML fields (either HTML field type or virtual collections), field-specific event handlers in `form.js` will **NOT** work for the custom HTML inputs.

### What Works:
- **Lifecycle Events**: `_onLoadEvent`, `_onBeforeSave`, `_afterFormSubmit`
- **Form Utilities**: `frm.set_value()`, validation, etc. - but only for the actual schema fields
- **Global Logic**: Business validation, data processing, navigation

### What Doesn't Work:
```javascript
// ❌ These field handlers will NOT be triggered for custom HTML inputs
capps.ui.collection_name.form = {
    CODE(frm) {
        // This will NOT execute when user types in custom HTML input
    },
    DESCR(frm) {  
        // This will NOT execute for custom HTML field
    }
}
```

### Why Field Handlers Don't Work:
1. Field handlers are only triggered for **CAPPS-rendered form fields**
2. Custom HTML inputs are not connected to the CAPPS field event system
3. Hidden schema fields (`"hidden": 1`) are not rendered, so their handlers won't trigger
4. Custom HTML fields bypass the standard CAPPS field change detection

### Alternative Approaches:

#### 1. Handle Events in Vue.js Component
```javascript
// In vue_options.js
methods: {
    updateField(fieldName, value) {
        // Custom validation and processing here
        this.validateField(fieldName, value);
        
        // Update CAPPS form data - this.frm is always available
        this.frm.set_value(fieldName, value);
        
        // Custom business logic
        if (fieldName === 'CODE') {
            this.handleCodeChange(value);
        }
    },
    
    handleCodeChange(value) {
        // Custom logic for CODE field changes
        const upperCase = value.toUpperCase();
        if (upperCase !== value) {
            // No need for null checks - this.frm is always available
            this.frm.set_value('CODE', upperCase);
        }
    }
}
```

#### 2. Use Lifecycle Events for Validation
```javascript
// In form.js - use _onBeforeSave instead of field handlers
capps.ui.collection_name.form = {
    _onBeforeSave(frm) {
        // Validate and process all fields before save
        if (current_form.CODE) {
            const upperCode = current_form.CODE.toUpperCase();
            frm.set_value('CODE', upperCode);
        }
        
        // Custom validation logic
        if (!this.validateCustomFields()) {
            return false; // Prevent save
        }
    }
}
```

#### 3. Direct DOM Event Listeners (Vanilla JavaScript)
```javascript
// In custom JavaScript file
function initializeForm() {
    // Get form utilities - always available
    const formUtils = capps.getDependency('app-name::collection-name::form_utils');
    
    // Add direct event listeners to custom inputs
    const codeInput = document.querySelector('input[placeholder="ENTER CODE"]');
    if (codeInput) {
        codeInput.addEventListener('input', (e) => {
            // Update CAPPS form data directly - no fallbacks needed
            formUtils.set_value('CODE', e.target.value);
        });
    }
}
```

### Best Practice:
For custom HTML fields, handle all field-level logic within the **Vue.js component** using the `vue_options.js` file, and use `form.js` only for:
- Form initialization (`_onLoadEvent`)
- Pre-save validation (`_onBeforeSave`) 
- Post-save actions (`_afterFormSubmit`)

---

[Go back to main page](../README.md)
