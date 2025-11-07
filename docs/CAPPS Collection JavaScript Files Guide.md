# CAPPS Collection JavaScript Files Guide

This guide explains how to create and configure **form.js**, **list.js**, and **card.js** files for CAPPS collections with clear examples and proper syntax.

## 📁 File Structure

Collection JavaScript files are located in your application's collection directory:

```plaintext
<<APP_NAME>>/
└── rest/
    └── collection/
        └── <<COLLECTION_NAME>>/
            ├── schema.json        # Required: Collection schema
            ├── form.js           # Optional: Form behavior & validation
            ├── list.js           # Optional: List view customization
            └── card.js           # Optional: Card view template
```

## ⚠️ **IMPORTANT: File Format Distinction**

### Production Applications
For **actual applications** (like `my_financial_app`), use **direct assignment**:

```javascript
// ✅ Correct for production applications
capps.ui.collection_name.form = {
    // Your code here
};
```

### Testing/Development (JSON Server)
For **testing with json-server** (in `ui/capps/json_server/` directory), use **module.exports**:

```javascript
// ✅ Correct for json-server testing only
module.exports = `capps.ui.collection_name.form = {
    // Your code here
}`;
```

---

## 📄 **1. form.js - Form Behavior & Validation**

### Basic Structure

```javascript
capps.ui.investments.form = {
    // Field change handlers
    FIELD_NAME: async function (frm) {
        // Handler logic
    },
    
    // Lifecycle events
    _onLoadEvent: async function (frm) {
        // Form initialization
    },
    
    _onBeforeSave: async function (frm) {
        // Validation & transformation
    },
    
    _afterFormSubmit: async function (frm, { result, resultHandler }) {
        // Post-submission logic
    }
};
```

### Lifecycle Events

#### **_onLoadEvent** - Form Initialization
Called when the form loads:

```javascript
capps.ui.investments.form = {
    _onLoadEvent: async function (frm) {
        // Set default values
        frm.set_value("STATUS", "Active");
        frm.set_value("CURRENCY", "USD");
        
        // Load user information
        const session = config.getSessionStorage();
        frm.set_value("CREATED_BY", session.userid || "System");
        
        console.log("Form loaded and initialized");
    }
};
```

#### **_onBeforeSave** - Validation & Confirmation
Called before saving. **Throw errors to prevent saving**:

```javascript
capps.ui.investments.form = {
    _onBeforeSave: async function (frm) {
        // Validation using current_form (read-only)
        if (!current_form.INVESTOR_NAME || current_form.INVESTOR_NAME.trim() === "") {
            await capps.ui.alert({
                title: "Validation Error",
                message: "Investor Name is required",
                okVariant: "danger"
            });
            throw new Error("Investor Name is required"); // ✅ This stops the save
        }
        
        // Amount validation
        const amount = parseFloat(current_form.AMOUNT);
        if (amount <= 0) {
            await capps.ui.alert({
                title: "Invalid Amount",
                message: "Investment amount must be greater than 0",
                okVariant: "danger"
            });
            throw new Error("Invalid amount"); // ✅ This stops the save
        }
        
        // Confirmation dialog
        const confirmed = await capps.ui.confirm({
            title: "Confirm Save",
            message: `Save investment of ${current_form.CURRENCY} ${amount} for ${current_form.INVESTOR_NAME}?`,
            okTitle: "Save",
            cancelTitle: "Cancel"
        });
        
        if (!confirmed) {
            throw new Error("Save cancelled by user"); // ✅ This stops the save
        }
        
        // Data transformation (use frm.set_value, not current_form)
        if (current_form.INVESTOR_NAME) {
            frm.set_value("INVESTOR_NAME", current_form.INVESTOR_NAME.toUpperCase());
        }
        
        return true; // Optional: explicitly indicate success
    }
};
```

#### **_afterFormSubmit** - Post-Save Actions
Called after successful save:

```javascript
capps.ui.investments.form = {
    _afterFormSubmit: async function (frm, { result, resultHandler }) {
        console.log("Save result:", result);
        
        // Show success message
        await capps.ui.toast({
            title: "Success",
            message: "Investment saved successfully!",
            variant: "success"
        });
        
        // Navigate to list view
        capps.set_route("view/list");
        
        // Prevent default behavior
        return { preventDefault: true };
    }
};
```

### Field Change Handlers

Handle changes to specific fields:

```javascript
capps.ui.investments.form = {
    INVESTMENT_TYPE: async function (frm) {
        const type = current_form.INVESTMENT_TYPE;
        
        // Set risk level based on investment type
        const riskLevels = {
            "Bond": "Low",
            "Equity": "High", 
            "Mutual Fund": "Medium",
            "ETF": "Medium"
        };
        
        if (riskLevels[type]) {
            frm.set_value("RISK_LEVEL", riskLevels[type]);
            
            capps.ui.toast({
                message: `Risk level set to ${riskLevels[type]}`,
                variant: "info",
                autoHideDelay: 3000
            });
        }
    },
    
    AMOUNT: async function (frm) {
        const amount = parseFloat(current_form.AMOUNT) || 0;
        
        // Auto-assign portfolio based on amount
        let portfolio = "Basic Portfolio";
        if (amount >= 1000000) portfolio = "Premium Portfolio";
        else if (amount >= 100000) portfolio = "Growth Portfolio";
        else if (amount >= 10000) portfolio = "Balanced Portfolio";
        
        frm.set_value("PORTFOLIO", portfolio);
    }
};
```

### Available Methods

| Method | Description | Example |
|--------|-------------|---------|
| `frm.set_value(field, value)` | Set field value | `frm.set_value("STATUS", "Active")` |
| `frm.clear_dropdown_options(field)` | Clear dropdown options | `frm.clear_dropdown_options("TYPE")` |
| `frm.set_dropdown_options(field, options)` | Set dropdown options | `frm.set_dropdown_options("TYPE", [{label: "A", value: "1"}])` |
| `frm.set_field_enabled(field, enabled)` | Enable/disable field | `frm.set_field_enabled("AMOUNT", false)` |
| `frm.show_child_collection(name)` | Show child collection | `frm.show_child_collection("details")` |

---

## 📊 **2. list.js - List View Customization**

### Basic Structure

```javascript
capps.ui.investments.list = {
    // Custom actions
    Approve: async function (list) {
        // Bulk action logic
    },
    
    // Column configuration
    columnSequence: ["ID", "INVESTOR_NAME", "AMOUNT", "STATUS"],
    
    // Data formatting
    formatters: {
        AMOUNT: function(value, row) {
            // Custom formatting
        }
    },
    
    // Row styling
    rowColorizer: function(row) {
        // Conditional styling
    },
    
    // Lifecycle hooks
    before_render: function() {
        // Pre-render setup
    }
};
```

### Custom Actions

#### Simple Actions
Actions that work with selected records:

```javascript
capps.ui.investments.list = {
    Approve: async function (list) {
        const selected = list.selectedRecords;
        
        if (!selected.length) {
            return capps.ui.alert({
                message: "Please select at least one record to approve",
                variant: "warning"
            });
        }
        
        const confirmed = await capps.ui.confirm({
            title: "Confirm Approval",
            message: `Approve ${selected.length} investment(s)?`,
            okTitle: "Approve"
        });
        
        if (!confirmed) return;
        
        try {
            // Process approvals (example with REST API call)
            const updates = selected.map(record => ({
                ID: record.ID,
                STATUS: "Approved"
            }));
            
            // Example bulk update call
            await capps.rest.my_financial_app.investments.bulkedit({
                data: updates
            });
            
            capps.ui.toast({
                title: "Success",
                message: `${selected.length} investment(s) approved`,
                variant: "success"
            });
            
            capps.ui.refresh(); // Refresh the list
        } catch (error) {
            capps.ui.alert({
                title: "Error",
                message: "Failed to approve investments: " + error.message,
                variant: "danger"
            });
        }
    },
    
    Generate_Report: async function (list) {
        // Custom report generation logic
        capps.ui.toast({
            message: "Generating investment report...",
            variant: "info"
        });
        
        // Your report generation logic here
    }
};
```

#### Advanced Button Configuration
Using `buttonList` for more control:

```javascript
capps.ui.investments.list = {
    buttonList: [
        {
            key: 'Export_PDF',
            label: 'Export to PDF',
            icon: 'pi pi-file-pdf', // PrimeNG icon
            class: 'btn btn-primary',
            show: () => true, // Always visible
            handler: async (list) => {
                const data = list.selectedRecords;
                if (!data.length) {
                    return capps.ui.alert({
                        message: "Please select records to export",
                        variant: "warning"
                    });
                }
                
                // Export logic here
                capps.ui.toast({
                    message: "Exporting to PDF...",
                    variant: "info"
                });
            }
        },
        {
            key: 'Import_Data',
            label: 'Import Investments',
            icon: 'pi pi-upload',
            class: 'btn btn-success',
            show: async () => {
                // Check user permissions
                const session = config.getSessionStorage();
                const userRoles = session.roles() || [];
                return userRoles.includes('ADMIN');
            },
            handler: async (list) => {
                // Show import modal
                const context = await capps.ui.open_modal({
                    title: 'Import Investment Data',
                    content: '<p>Select CSV file to import:</p><input type="file" accept=".csv" id="import-file">',
                    size: 'md',
                    handlers: [{
                        label: 'Import',
                        variant: 'primary',
                        handler: (ctx) => {
                            const fileInput = document.getElementById('import-file');
                            if (fileInput.files.length > 0) {
                                // Process file upload
                                capps.ui.toast({
                                    message: "Processing import...",
                                    variant: "info"
                                });
                                ctx.closeModal();
                            }
                        }
                    }]
                });
            }
        }
    ]
};
```

### Column Configuration

#### Column Sequence
Control the order of columns:

```javascript
capps.ui.investments.list = {
    columnSequence: [
        "ID",
        "INVESTOR_NAME", 
        "INVESTMENT_TYPE",
        "AMOUNT",
        "CURRENCY",
        "STATUS",
        "INVESTMENT_DATE"
    ]
};
```

#### Data Formatting
Transform how data appears in columns:

```javascript
capps.ui.investments.list = {
    formatters: {
        AMOUNT: function(value, row, field) {
            const currency = row.CURRENCY || 'USD';
            const amount = parseFloat(value) || 0;
            return currency + ' ' + amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        
        STATUS: function(value, row, field) {
            const statusColors = {
                'Active': 'success',
                'Pending': 'warning',
                'Cancelled': 'danger',
                'Matured': 'info'
            };
            
            const color = statusColors[value] || 'secondary';
            return `<span class="badge badge-${color}">${value}</span>`;
        },
        
        INVESTMENT_DATE: function(value, row, field) {
            if (!value) return '';
            const date = new Date(value);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short', 
                day: 'numeric'
            });
        }
    }
};
```

### Row Styling

#### Row Colorizing
Apply conditional styling to entire rows:

```javascript
capps.ui.investments.list = {
    rowColorizer: function(row, rowIndex) {
        const amount = parseFloat(row.AMOUNT) || 0;
        const status = row.STATUS;
        
        // High-value investments - green background
        if (amount >= 1000000) {
            return 'table-success';
        }
        
        // Cancelled investments - red background  
        if (status === 'Cancelled') {
            return 'table-danger';
        }
        
        // Pending investments - yellow background
        if (status === 'Pending') {
            return 'table-warning';
        }
        
        return ''; // Default styling
    }
};
```

#### Column Cell Styling
Style individual cells:

```javascript
capps.ui.investments.list = {
    columnRowColorize: {
        STATUS: function(record) {
            if (record.STATUS === "Active") {
                return { style: "color: green; font-weight: bold;" };
            }
            if (record.STATUS === "Cancelled") {
                return { style: "color: red; font-weight: bold;" };
            }
        },
        
        AMOUNT: function(record) {
            const amount = parseFloat(record.AMOUNT) || 0;
            if (amount >= 1000000) {
                return { style: "color: gold; font-weight: bold;" };
            }
        }
    }
};
```

### Lifecycle Hooks

#### Before Render
Execute logic before list renders:

```javascript
capps.ui.investments.list = {
    before_render: async function(list) {
        console.log('List is about to render');
        
        // Load additional data if needed
        // Set up custom filters
        // Modify display options
    }
};
```

---

## 🃏 **3. card.js - Card View Template**

### Basic Structure

```javascript
capps.ui.investments.card = {
    template: `
        <div class="card">
            <div class="card-header">
                <!-- Header content -->
            </div>
            <div class="card-body">
                <!-- Body content with field bindings -->
            </div>
        </div>
    `
};
```

### Complete Example

```javascript
capps.ui.investments.card = {
    template: `
        <div class="card investment-card">
            <div class="card-header">
                <div class="row">
                    <div class="col-8">
                        <h5 class="card-title text-capitalize">
                            {{ doc.INVESTOR_NAME }}
                        </h5>
                        <p class="card-subtitle text-muted">
                            Investment #{{ doc.ID }}
                        </p>
                    </div>
                    <div class="col-4 text-right">
                        <span class="badge badge-{{doc.STATUS === 'Active' ? 'success' : doc.STATUS === 'Pending' ? 'warning' : 'secondary'}} badge-pill">
                            {{ doc.STATUS }}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="card-body">
                <div class="row card-content">
                    <div class="col-md-6 mb-3">
                        <div class="info-item">
                            <div class="info-label">Investment Type</div>
                            <div class="info-value">{{ doc.INVESTMENT_TYPE }}</div>
                        </div>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <div class="info-item">
                            <div class="info-label">Amount</div>
                            <div class="info-value amount">
                                {{ doc.CURRENCY }} {{ parseFloat(doc.AMOUNT).toLocaleString() }}
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <div class="info-item">
                            <div class="info-label">Investment Date</div>
                            <div class="info-value">{{ new Date(doc.INVESTMENT_DATE).toLocaleDateString() }}</div>
                        </div>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <div class="info-item">
                            <div class="info-label">Portfolio</div>
                            <div class="info-value">{{ doc.PORTFOLIO || 'Not Assigned' }}</div>
                        </div>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <div class="info-item">
                            <div class="info-label">Risk Level</div>
                            <div class="info-value">
                                <span class="badge badge-{{doc.RISK_LEVEL === 'Low' ? 'success' : doc.RISK_LEVEL === 'Medium' ? 'warning' : 'danger'}}">
                                    {{ doc.RISK_LEVEL }}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <div class="info-item">
                            <div class="info-label">Expected Return</div>
                            <div class="info-value">{{ doc.EXPECTED_RETURN }}%</div>
                        </div>
                    </div>
                </div>
                
                {{#if doc.NOTES}}
                <div class="row">
                    <div class="col-12">
                        <div class="info-item">
                            <div class="info-label">Notes</div>
                            <div class="info-value notes">{{ doc.NOTES }}</div>
                        </div>
                    </div>
                </div>
                {{/if}}
            </div>
        </div>
        
        <style>
        .investment-card {
            margin-bottom: 20px;
            border: 1px solid #e3e6f0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .info-item {
            margin-bottom: 10px;
        }
        
        .info-label {
            font-weight: 600;
            color: #6c757d;
            font-size: 0.875rem;
            margin-bottom: 2px;
        }
        
        .info-value {
            color: #495057;
            font-size: 1rem;
        }
        
        .info-value.amount {
            font-weight: 700;
            color: #28a745;
            font-size: 1.1rem;
        }
        
        .info-value.notes {
            font-style: italic;
            background: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            border-left: 3px solid #007bff;
        }
        </style>
    `
};
```

### Template Features

#### Data Binding
- Use `{{ doc.FIELD_NAME }}` to display field values
- Access nested properties: `{{ doc.user.name }}`
- Use conditional expressions: `{{ doc.STATUS === 'Active' ? 'success' : 'warning' }}`

#### Conditional Rendering
```html
{{#if doc.NOTES}}
    <div>Notes: {{ doc.NOTES }}</div>
{{/if}}

{{#unless doc.HIDDEN}}
    <div>This shows when HIDDEN is false</div>
{{/unless}}
```

#### Styling
- Include custom CSS within `<style>` tags in the template
- Use Bootstrap classes for responsive layout
- Apply conditional classes based on data values

---

## 🚀 **Complete Working Example**

Let me now create the corrected files for your application:

### form.js

```javascript
capps.ui.investments.form = {
    _onLoadEvent: async function (frm) {
        frm.set_value("STATUS", "Active");
        frm.set_value("CURRENCY", "USD");
        
        const session = config.getSessionStorage();
        frm.set_value("CREATED_BY", session.userid || "System");
    },
    
    INVESTMENT_TYPE: async function (frm) {
        const type = current_form.INVESTMENT_TYPE;
        const riskLevels = {
            "Bond": "Low", "Equity": "High", "Mutual Fund": "Medium", "ETF": "Medium"
        };
        
        if (riskLevels[type]) {
            frm.set_value("RISK_LEVEL", riskLevels[type]);
        }
    },
    
    AMOUNT: async function (frm) {
        const amount = parseFloat(current_form.AMOUNT) || 0;
        let portfolio = "Basic Portfolio";
        if (amount >= 1000000) portfolio = "Premium Portfolio";
        else if (amount >= 100000) portfolio = "Growth Portfolio";
        else if (amount >= 10000) portfolio = "Balanced Portfolio";
        
        frm.set_value("PORTFOLIO", portfolio);
    },
    
    _onBeforeSave: async function (frm) {
        if (!current_form.INVESTOR_NAME?.trim()) {
            await capps.ui.alert({
                message: "Investor Name is required",
                variant: "danger"
            });
            throw new Error("Validation failed");
        }
        
        const amount = parseFloat(current_form.AMOUNT);
        if (amount <= 0) {
            await capps.ui.alert({
                message: "Investment amount must be greater than 0",
                variant: "danger"
            });
            throw new Error("Validation failed");
        }
        
        return true;
    }
};
```

This comprehensive guide should help developers understand the correct format and usage of CAPPS collection JavaScript files!

---
[Go back to main page](../README.md)
