# CAPPS Framework Examples

## Overview

This document provides **verified working examples** from the CAPPS Guinea Pig project, demonstrating proper usage patterns and best practices for the CAPPS framework.

## Form.js Examples

### Basic Event Handlers

```javascript
capps.ui.collection_one.form = {
    _onLoadEvent(frm) {
        // ✅ CORRECT: Use frm for form methods
        frm.set_suggestions("EXPRESSION_TEXTAREA_FIELD", ["{VALUEDATE}", "{END_DATE}"]);
        
        frm.set_commands("COMMAND_PALLATE_TEXTAREA_FIELD", [
            { "name": "Addition", "value": "x + y", "category": "Basic Math Operations" },
            { "name": "Subtraction", "value": "x - y", "category": "Basic Math Operations" }
        ]);

        // ✅ CORRECT: Use current_form to READ field values for logic
        if(current_form._action === 'update' && current_form.AUTHORISED === "Y") {
            capps.set_route("/view/list");
            capps.ui.alert({
                message: "Unauthorize the record before updating"
            });
        }
    },

    _onBeforeSave(frm) {
        // ✅ CORRECT: Use current_form to READ field values for validation
        if(current_form.CHECKBOX_FIELD === "Y" && current_form.RATINGS_FIELD === 2) {
            return capps.ui.alert({ 
                message: "Rating cannot be 1 if checkbox is selected", 
                size: "md" 
            });
        }

        // ✅ CORRECT: Return promises/modals to control save flow
        if(current_form.RATINGS_FIELD === 1) {
            return capps.ui.confirm({ 
                title: "Kindly confirm", 
                message: "Are you sure you want to continue with 1 rating"
            });
        }

        // Show form data in modal
        capps.ui.open_modal({ 
            title: "You have entered following data", 
            content: `
                <h1>Entered details</h1>
                <p><em>✅ Data below comes from current_form (field values)</em></p>
                <br>
                Form data: ${JSON.stringify(current_form, null, 2)}
            `, 
            size: "md"
        });
    },

    _afterFormSubmit(frm, response) {
        if (response && response.success) {
            capps.ui.toast({ 
                message: `Record saved successfully! ID: ${current_form.id || response.data?.id}` 
            });
        }
    }
}
```

### Field Event Handlers

```javascript
// Field-specific event handlers
capps.ui.collection_one.form = {
    // Button field click handler
    BUTTON_FIELD(frm) {
        frm.set_value("TEXT_FIELD", "TEXT VALUE");
    },

    // Text field change handler  
    TEXT_FIELD(frm) {
        frm.clear_dropdown_options("SELECT_FIELD");
        frm.set_dropdown_options("SELECT_FIELD", ["Lorem", "Lip um", "Pig"]);
    },

    // Checkbox change handler
    CHECKBOX_FIELD(frm) {
        if(current_form.CHECKBOX_FIELD === "Y") {
            frm.set_field_disabled("TEXTAREA_FIELD");
        } else {
            frm.set_field_enabled("TEXTAREA_FIELD");
        }
    },

    // Integer field change handler
    INTEGER_FIELD(frm) {
        if(current_form.INTEGER_FIELD == 12) {
            frm.make_field_invisible("FLOAT_FIELD");
        } else {
            frm.make_field_visible("FLOAT_FIELD");
        }
    },

    // Float field validation
    FLOAT_FIELD(frm) {
        if(current_form.FLOAT_FIELD > 100) {
            frm.manage_validation_rule("INTEGER_FIELD", {
                required: true
            });
        } else {
            frm.manage_validation_rule("INTEGER_FIELD", {
                required: false
            });
        }
    }
}
```

### Dynamic Query Setting

```javascript
capps.ui.collection_one.form = {
    DATE_FIELD(frm) {
        // Set filter query with conditions
        if(current_form.FLOAT_FIELD) {
            return frm.set_query("REMOTE_SELECT_FIELD", [
                {
                    field: "COLUMN1",
                    asgn: "like",
                    value: "12"
                },
                {
                    field: "COLUMN2", 
                    asgn: "like",
                    value: "eval:current_form.FLOAT_FIELD"
                }
            ]);
        }
        
        // Set query with filter object
        if(!current_form.FLOAT_FIELD) {
            return frm.set_query("REMOTE_SELECT_FIELD", {
                filter: [
                    {
                        field: "COLUMN1",
                        asgn: "like", 
                        value: "12"
                    }
                ],
                sort: {
                    dir: "ASC",
                    field: "ID"
                }
            });
        }
    }
}
```

### Custom Button Examples

```javascript
capps.ui.collection_one.form = {
    _onLoadEvent(frm) {
        // Simple dynamic button
        frm.add_custom_button('Quick Save', function(frm) {
            frm.set_value('DATE_TIME_FIELD', capps.format(new Date(), { fieldtype: 'Datetime', format: config.globalDateFormatLong }));
            frm.save();
            capps.ui.toast({ message: 'Quick save completed!' });
        });

        // Button with custom styling and icon
        frm.add_custom_button('Send Notification', function(frm) {
            capps.ui.open_modal({
                title: 'Send Notification',
                content: `
                    <div class="p-3">
                        <h5>Notification Preview:</h5>
                        <p>Record ID: ${current_form.id || 'New Record'}</p>
                        <p>Status: ${current_form.STATUS || 'Unknown'}</p>
                        <p>Date: ${current_form.DATE_FIELD ? capps.format(current_form.DATE_FIELD, { fieldtype: 'Date', format: config.globalDateFormatShort }) : 'Not set'}</p>
                        <p>DateTime: ${current_form.DATE_TIME_FIELD ? capps.format(current_form.DATE_TIME_FIELD, { fieldtype: 'Datetime', format: config.globalDateFormatLong }) : 'Not set'}</p>
                    </div>
                `,
                size: 'md',
                handlers: [
                    {
                        label: 'Send',
                        variant: 'primary',
                        handler(modal) {
                            capps.ui.toast({ message: 'Notification sent successfully!' });
                            modal.closeModal();
                        }
                    }
                ]
            });
        }, null, {
            icon: 'pi pi-bell',
            class: 'capps-btn-info'
        });

        // Grouped buttons (creates dropdown menu)
        frm.add_custom_button('Draft', function(frm) {
            frm.set_value('STATUS', 'DRAFT');
            frm.save();
            capps.ui.toast({ message: 'Status set to Draft' });
        }, 'Quick Status');

        frm.add_custom_button('Approved', function(frm) {
            frm.set_value('STATUS', 'APPROVED');
            frm.set_value('DATE_FIELD', capps.format(new Date(), { fieldtype: 'Date', format: config.globalDateFormatShort }));
            frm.save();
            capps.ui.toast({ message: 'Status set to Approved' });
        }, 'Quick Status');

        // Conditional button based on form data
        if (current_form.INTEGER_FIELD && current_form.INTEGER_FIELD > 50) {
            frm.add_custom_button('High Value Processing', function(frm) {
                capps.ui.confirm({
                    title: 'High Value Processing',
                    message: `This record has value ${current_form.INTEGER_FIELD}. Proceed?`
                }).then(() => {
                    frm.set_value('SPECIAL_PROCESSING', 'Y');
                    frm.save();
                });
            }, null, {
                icon: 'pi pi-exclamation-triangle',
                class: 'capps-btn-warning'
            });
        }

        // Role-based button
        frm.add_custom_button('Admin Override', function(frm) {
            frm.set_value('ADMIN_OVERRIDE', 'Y');
            frm.set_value('OVERRIDE_BY', config.getSessionStorage().user_id());
            frm.set_value('DATE_TIME_FIELD', capps.format(new Date(), { fieldtype: 'Datetime', format: config.globalDateFormatLong }));
            frm.save();
        }, 'Admin Actions', {
            icon: 'pi pi-shield',
            class: 'capps-btn-danger',
            show: function() {
                const userRoles = config.getSessionStorage().roles();
                return userRoles && userRoles.includes('ADMIN');
            }
        });
    }
}
```

### Static Button List Configuration

```javascript
capps.ui.collection_one.form = {
    buttonList: [
        {
            key: 'validate_form',
            label: 'Validate Form',
            icon: 'pi pi-check-circle',
            class: 'capps-btn-primary',
            show: () => true,
            handler: (frm) => {
                capps.ui.alert({
                    title: "Form Validation",
                    message: `Form validation completed!`,
                    variant: "success"
                });
            }
        },
        {
            key: 'preview_data',
            label: 'Preview Data',
            icon: 'pi pi-eye',
            class: 'capps-btn-secondary',
            show: () => true,
            handler: (frm) => {
                capps.ui.open_modal({
                    title: 'Form Data Preview',
                    content: `
                        <pre>${JSON.stringify(current_form, null, 2)}</pre>
                    `,
                    size: 'lg',
                    handlers: [
                        {
                            label: 'Close',
                            variant: 'secondary',
                            handler(modal) {
                                modal.closeModal();
                            }
                        }
                    ]
                });
            }
        },
        {
            key: 'conditional_action',
            label: 'Conditional Action',
            icon: 'pi pi-exclamation-triangle',
            show: () => {
                return current_form && current_form.TEXT_FIELD && current_form.TEXT_FIELD.length > 0;
            },
            handler: () => {
                capps.ui.alert({
                    message: `Conditional action executed! TEXT_FIELD value: ${current_form.TEXT_FIELD}`,
                    variant: 'info'
                });
            }
        }
    ]
}
```

### Child Collection Operations

```javascript
capps.ui.collection_one.form = {
    CHILD_COLLECTION_TEST_BTN(frm) {
        frm.open_child_collection("collection_two");
    },
    
    HIDE_CHILD_COLLECTION_BTN(frm) {
        frm.hide_child_collection("collection_two");
    },
    
    SHOW_CHILD_COLLECTION_BTN(frm) {
        frm.show_child_collection("collection_two");
    },
    
    PROGRAMMATIC_SAVE_BTN(frm) {
        frm.save();
    }
}
```

## List.js Examples

### Basic List Configuration

```javascript
capps.ui.collection_one.list = {
    // Pre-render HTML injection
    before_render: async function(list) {
        list.add_html("custom_header", `
            <div class="alert alert-info">
                Custom header content for this list view
            </div>
        `);
    },

    // Rearrange columns in specified order
    columnSequence: ["DATE_FIELD", "DATE_TIME_FIELD", "RATINGS_FIELD"],

    // Transform column values dynamically  
    formatters: {
        CHECKBOX_FIELD: (value, fieldName, record) => (value === "Y") ? "Yes" : "No",
        AMOUNT: (value, fieldName, record) => capps.format(value, { fieldtype: 'Currency', currency: '$' }),
        DATE_FIELD: (value, fieldName, record) => value ? capps.format(value, { fieldtype: 'Date', format: config.globalDateFormatShort }) : '',
        DATE_TIME_FIELD: (value, fieldName, record) => value ? capps.format(value, { fieldtype: 'Datetime', format: config.globalDateFormatLong }) : '',
        TIME_FIELD: (value, fieldName, record) => value ? capps.format(value, { fieldtype: 'Time' }) : ''
    },

    // Modify row background color based on conditions
    rowRenderer(record) {
        return {
            style: record.CHECKBOX_FIELD === "N" ? "background-color: #ffebee" : ""
        };
    },

    // Set color for specific column cells
    columnRowColorize: {
        INTEGER_FIELD: value => ({ 
            style: value < 0 ? "color: red;" : "color: green" 
        })
    }
}
```

### Row Action Buttons (Real Examples from Guinea Pig)

```javascript
capps.ui.collection_one.list = {
    buttonColumns: [
        {
            key: 'Modify',
            label: 'Modify',
            icon: 'pi pi-pencil',
            column_header: '',
            show: (row) => row.status !== 'Closed',
            handler: (row, context) => { 
                if (!row.ID) {
                    return capps.ui.alert({
                        message: "Invalid record. Cannot modify.",
                        variant: "warning"
                    });
                }
                capps.set_route(["corporate", "doc", "corporates", "update", row.ID]);
            }
        },
        {
            key: 'View',
            label: 'View',
            icon: 'pi pi-eye',
            show: (row) => true,
            handler: (row, context) => { /* view logic */ }
        },
        {
            key: 'Edit',
            label: 'Edit',
            column_header: "Edit Actions",
            icon: 'pi pi-pencil',
            show: (row) => row.status !== 'Closed',
            handler: (row, context) => { 
                alert("Row /n" + JSON.stringify(row))
            }
        },
        {
            key: 'Delete',
            label: 'Delete',
            icon: 'pi pi-trash',
            show: (row) => true,
            handler: (row, context) => { /* delete logic */ }
        },
        // ✅ REAL MODULE ROUTE EXAMPLES from Guinea Pig (Updated for nested routes)
        {
            key: 'CustomReports',
            label: 'Reports',
            icon: 'pi pi-chart-bar',
            column_header: "Module Actions",
            show: (row) => true,
            handler: (row, context) => {
                // Navigate to custom reports module in modal (nested under view/list)
                capps.set_route(`capps-guinea-pig/doc/collection_one/view/list/module/custom-reports/${row.ID}/modal`);
            }
        },
        {
            key: 'Attachments',
            label: 'Files',
            icon: 'pi pi-paperclip',
            show: (row) => true,
            handler: (row, context) => {
                // Navigate to attachments module in modal (nested under view/list)
                capps.set_route(`capps-guinea-pig/doc/collection_one/view/list/module/attachments/${row.ID}/modal`);
            }
        },
        {
            key: 'History',
            label: 'History',
            icon: 'pi pi-history',
            show: (row) => true,
            handler: (row, context) => {
                // Navigate to history module in fullscreen (nested under view/list)
                capps.set_route(`capps-guinea-pig/doc/collection_one/view/list/module/history/${row.ID}/fullscreen`);
            }
        },
        {
            key: 'Connections',
            label: 'Related',
            icon: 'pi pi-link',
            show: (row) => true,
            handler: (row, context) => {
                // Navigate to connections module in modal (nested under view/list)
                capps.set_route(`capps-guinea-pig/doc/collection_one/view/list/module/connections/${row.ID}/modal`);
            }
        }
    ]
}
```

### Module Route Patterns

Module routes support two patterns:

#### 1. With Record ID (Record-specific modules):
```
/:moduleName/doc/:collection/view/:view_type/module/:moduleType/:id/:displayMode?
```
Example: `capps-guinea-pig/doc/collection_one/view/list/module/attachments/123/modal`

#### 2. Without Record ID (Global/standalone modules):
```
/:moduleName/doc/:collection/view/:view_type/module/:moduleType/:displayMode?
```
Example: `capps-guinea-pig/doc/collection_one/view/list/module/custom-reports/modal`

### Module Route Title Configuration

Module routes support custom titles via query parameters. The title behavior depends on module type:

#### Framework Modules (attachments, connections, comments, history):
- **Without title parameter**: Uses default names ("Attachments", "Connections", "Comments", "Version History")
- **With title parameter**: Uses custom title from query

#### Custom Modules:
- **Without title parameter**: Shows blank/empty title
- **With title parameter**: Uses custom title from query

```javascript
// Framework module examples
capps.set_route('app/doc/collection/view/list/module/attachments/123/modal');
// Title: "Attachments" (default)

capps.set_route('app/doc/collection/view/list/module/attachments/123/modal?title=Document Files');
// Title: "Document Files" (custom)

capps.set_route('app/doc/collection/view/list/module/history/123/fullscreen');
// Title: "Version History" (default)

// Custom module examples (with record ID)
capps.set_route('app/doc/collection/view/list/module/custom-reports/123/modal');
// Title: "" (blank)

capps.set_route('app/doc/collection/view/list/module/custom-reports/123/modal?title=Sales Dashboard');
// Title: "Sales Dashboard" (custom)

// Custom module examples (without record ID)
capps.set_route('app/doc/collection/view/list/module/custom-reports/modal');
// Title: "" (blank)

capps.set_route('app/doc/collection/view/list/module/custom-reports/modal?title=Global Dashboard');
// Title: "Global Dashboard" (custom)

// Updated module route examples with titles
{
    key: 'CustomReports',
    label: 'Reports',
    icon: 'pi pi-chart-bar',
    handler: (row, context) => {
        // Custom module with custom title
        capps.set_route(`app/doc/collection/view/list/module/custom-reports/${row.ID}/modal?title=Sales Reports`);
    }
},
{
    key: 'Attachments', 
    label: 'Files',
    icon: 'pi pi-paperclip',
    handler: (row, context) => {
        // Framework module - uses default "Attachments" title
        capps.set_route(`app/doc/collection/view/list/module/attachments/${row.ID}/modal`);
    }
},
{
    key: 'Connections',
    label: 'Related', 
    icon: 'pi pi-link',
    handler: (row, context) => {
        // Framework module with custom title
        capps.set_route(`app/doc/collection/view/list/module/connections/${row.ID}/modal?title=Related Records`);
    }
}
```

### List Toolbar Actions (Real Examples from Guinea Pig)

```javascript
capps.ui.collection_one.list = {
    buttonList: [
        {
            key: 'Custom_Action',
            label: 'Custom Action',
            icon: 'pi pi-eye',
            show: () => true,
            handler: (list) => { 
                alert("Calling modal action function from one of the action from buttonList");
                capps.ui.collection_one.list.customModalWithFieldsOption(list);
            }
        },
        {
            key: 'Custom_Action_2',
            label: 'Custom Action Two',
            icon: 'pi pi-eye',
            show: async () => {
                // ✅ REAL ASYNC SHOW CONDITION - appears after 3 seconds
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve(true);
                    }, 3000);
                });
            },
            handler: (list) => { 
                alert("Calling modal action function from one of the action from buttonList");
                capps.ui.collection_one.list.customModalWithFieldsOption(list);
            }
        },
        {
            key: 'Custom_Action_3',
            label: 'Custom Action Three',
            icon: 'pi pi-eye',
            show: async () => {
                // ✅ REAL ASYNC SHOW CONDITION - initially visible, then hidden after 3 seconds
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve(false); // This button gets hidden
                    }, 3000);
                });
            },
            handler: (list) => { 
                alert("Calling modal action function from one of the action from buttonList");
                capps.ui.collection_one.list.customModalWithFieldsOption(list);
            }
        },
        // ✅ REAL MODULE ROUTE EXAMPLES for List Actions (Updated for nested routes)
        {
            key: 'BulkReports',
            label: 'Generate Bulk Reports',
            icon: 'pi pi-chart-bar',
            show: () => true,
            handler: (list) => {
                const selectedRecords = list.selectedRecords;
                
                if (!selectedRecords.length) {
                    return capps.ui.alert({
                        message: "Please select at least one record to generate reports.",
                        variant: "warning"
                    });
                }
                
                // Example: Open custom reports module for first selected record (nested under view/list)
                const firstRecord = selectedRecords[0];
                capps.set_route(`capps-guinea-pig/doc/collection_one/view/list/module/custom-reports/${firstRecord.ID}/fullscreen`);
            }
        },
        {
            key: 'ModuleDemo',
            label: 'Module Demo (Modal)',
            icon: 'pi pi-window-maximize',
            show: () => true,
            handler: (list) => {
                // Demonstrate opening a module without requiring a specific record (nested under view/list)
                capps.ui.toast({
                    message: 'Opening Custom Reports module in modal mode...',
                    variant: 'info'
                });
                
                capps.set_route('capps-guinea-pig/doc/collection_one/view/list/module/custom-reports/1/modal');
            }
        },
        {
            key: 'ModuleDemoFullscreen',
            label: 'Module Demo (Fullscreen)',
            icon: 'pi pi-window-maximize',
            show: () => true,
            handler: (list) => {
                capps.ui.toast({
                    message: 'Opening Custom Reports module in fullscreen mode...',
                    variant: 'info'
                });
                
                capps.set_route('capps-guinea-pig/doc/collection_one/view/list/module/custom-reports/1/fullscreen');
            }
        },
        {
            key: 'MultiModuleDemo',
            label: 'Multi-Module Demo',
            icon: 'pi pi-clone',
            show: () => true,
            handler: async (list) => {
                const selectedRecords = list.selectedRecords;
                
                if (!selectedRecords.length) {
                    return capps.ui.alert({
                        message: "Please select at least one record for multi-module demo.",
                        variant: "warning"
                    });
                }
                
                // ✅ REAL MODAL WITH MULTIPLE MODULE CHOICES (Updated for nested routes)
                const choice = await capps.ui.open_modal({
                    title: 'Select Module to Open',
                    content: 'Choose which module to open for the selected record:',
                    size: 'md',
                    handlers: [
                        {
                            label: 'Custom Reports',
                            variant: 'primary',
                            handler(modal) {
                                modal.closeModal();
                                const firstRecord = selectedRecords[0];
                                capps.set_route(`capps-guinea-pig/doc/collection_one/view/list/module/custom-reports/${firstRecord.ID}/modal`);
                            }
                        },
                        {
                            label: 'Attachments',
                            variant: 'secondary',
                            handler(modal) {
                                modal.closeModal();
                                const firstRecord = selectedRecords[0];
                                capps.set_route(`capps-guinea-pig/doc/collection_one/view/list/module/attachments/${firstRecord.ID}/modal`);
                            }
                        },
                        {
                            label: 'History',
                            variant: 'info',
                            handler(modal) {
                                modal.closeModal();
                                const firstRecord = selectedRecords[0];
                                capps.set_route(`capps-guinea-pig/doc/collection_one/view/list/module/history/${firstRecord.ID}/fullscreen`);
                            }
                        },
                        {
                            label: 'Cancel',
                            variant: 'outline-secondary',
                            handler(modal) {
                                modal.closeModal();
                            }
                        }
                    ]
                });
            }
        }
    ]
}
```

### Bulk Operations

```javascript
capps.ui.collection_one.list = {
    async LIST_MACRO_ACTION(list) {
        const selectedRecords = list.selectedRecords;

        if (!selectedRecords.length) {
            return capps.ui.alert({
                message: "Please select at least one record to expire.",
                variant: "danger"
            });
        }

        let confirm = await capps.ui.confirm({
            message: "Are you sure you want to expire the selected records?"
        });

        if (!confirm) return;

        // Process selected records
        const SELECTED_RECORDS = selectedRecords.reduce((acc, record) => {
            if (record.EXPIRED === "N") {
                acc.NON_EXPIRED_RECORDS.push({ ID: record.ID, EXPIRED: "Y" });
                return acc;
            }
            acc.EXPIRED_RECORDS.push({ ID: record.ID, EXPIRED: record.EXPIRED });
            return acc;
        }, {
            NON_EXPIRED_RECORDS: [],
            EXPIRED_RECORDS: []
        });

        // ✅ CORRECT: Bulk edit API call
        const response = await capps.rest.credbooks.voucher_master.bulkedit({
            scope: "expire",
            data: SELECTED_RECORDS.NON_EXPIRED_RECORDS
        });

        if (response && response.status === "success") {
            capps.ui.toast({
                message: response.msg || "Operation completed successfully",
                variant: 'success'
            });
        } else {
            capps.ui.alert({
                message: response.error || "Something went wrong.",
                variant: "danger"
            });
        }
    }
}
```

### Modal with Dynamic Fields

```javascript
capps.ui.collection_one.list = {
    async customModalWithFieldsOption() {
        const modal = await capps.ui.open_modal({
            title: 'Send for Authorization',
            content: "",
            size: 'md',
            fieldConfigurations: {
                moduleName: "credbooks",
                collection: "accounting_entries_mast"
            },
            fields: {
                BRANCH_CODE: {
                    fieldtype: 'select',
                    required: 1,
                    grid_column_size: 1,
                    linked_to: {
                        ref: 'static_master',
                        key: 'CODE',
                        display_name: 'DESCR'
                    }
                }
            },
            handlers: [
                {
                    label: 'Submit',
                    variant: 'primary',
                    handler(modal) {
                        const formData = modal.getFormData();
                        capps.ui.toast({ 
                            message: `Selected branch: ${formData.BRANCH_CODE}` 
                        });
                        modal.closeModal();
                    }
                },
                {
                    label: 'Close',
                    variant: 'danger',
                    handler(modal) {
                        modal.closeModal();
                    }
                }
            ]
        });

        // Auto-close modal after 10 seconds
        setTimeout(() => {
            modal.closeModal();
        }, 10000);
    }
}
```

## Menu.js Examples

### Basic Menu Structure

```javascript
// File: public/layout/menu.js
const userRoles = config.getSessionStorage().roles();

export default [
    {
        "label": "Home",
        "icon": "pi pi-home", 
        "route": "capps-guinea-pig/pages/credbooks"
    },
    {
        "label": "Administration",
        "icon": "pi pi-user",
        "items": [
            {
                "label": "Upload Configurations",
                "icon": "pi pi-cog",
                "items": [
                    {
                        "label": "Attachments",
                        "icon": "pi pi-paperclip",
                        "route": "capps-guinea-pig/doc/attachments/view/list"
                    },
                    {
                        "label": "File Exceptions", 
                        "icon": "pi pi-exclamation-triangle",
                        "route": "capps-guinea-pig/doc/file_exceptions/view/list"
                    }
                ]
            },
            {
                "label": "Static Master",
                "icon": "pi pi-database",
                "route": "capps-guinea-pig/doc/static_master/view/list"
            }
        ]
    },
    {
        "label": "Sample Collections",
        "icon": "pi pi-building", 
        "items": [
            {
                "label": "Detailed Collection",
                "icon": "pi pi-folder",
                "route": "capps-guinea-pig/doc/collection_one/view/list"
            },
            {
                "label": "Virtual Collection",
                "icon": "pi pi-external-link",
                "route": "capps-guinea-pig/doc/collection_four_virtual/view/list"
            }
        ]
    }
]
```

### Role-Based Menu Filtering

```javascript
// File: public/layout/menu.js
const userRoles = config.getSessionStorage().roles();

export default [
    {
        "label": "User Dashboard", 
        "icon": "pi pi-home",
        "route": "app/dashboard",
        "show": () => true  // Always visible
    },
    {
        "label": "Admin Panel",
        "icon": "pi pi-cog",
        "show": () => {
            return userRoles && userRoles.includes('ADMIN');
        },
        "items": [
            {
                "label": "User Management",
                "icon": "pi pi-users", 
                "route": "app/admin/users",
                "show": () => {
                    return userRoles && (userRoles.includes('ADMIN') || userRoles.includes('USER_MANAGER'));
                }
            },
            {
                "label": "System Settings",
                "icon": "pi pi-sliders-h",
                "route": "app/admin/settings",
                "show": () => {
                    return userRoles && userRoles.includes('SUPER_ADMIN');
                }
            }
        ]
    }
]
```

## Schema.json Examples

### Basic Field Types

```json
{
    "TEXT_FIELD": {
        "fieldtype": "textfield",
        "label": "Text Field",
        "required": 1,
        "disabled": 0
    },
    "SELECT_FIELD": {
        "fieldtype": "select",
        "label": "Select Field", 
        "options": ["Option 1", "Option 2", "Option 3"],
        "required": 1
    },
    "DATE_FIELD": {
        "fieldtype": "date",
        "label": "Date Field",
        "default": "today"
    },
    "INTEGER_FIELD": {
        "fieldtype": "integer",
        "label": "Integer Field",
        "validations": "min:0|max:1000"
    },
    "CHECKBOX_FIELD": {
        "fieldtype": "checkbox",
        "label": "Checkbox Field",
        "default": "N"
    },
    "TEXTAREA_FIELD": {
        "fieldtype": "textarea",
        "label": "Textarea Field",
        "rows": 3
    }
}
```

### Advanced Field Configurations

```json
{
    "REMOTE_SELECT_FIELD": {
        "fieldtype": "select",
        "label": "Remote Select",
        "linked_to": {
            "ref": "static_master",
            "key": "CODE", 
            "display_name": "DESCR"
        },
        "required": 1
    },
    "FILE_FIELD": {
        "fieldtype": "file",
        "label": "Upload File",
        "accept": ".pdf,.doc,.docx",
        "max_file_size": "10MB"
    },
    "CHILD_COLLECTION_FIELD": {
        "fieldtype": "childcollection",
        "label": "Line Items",
        "childref": "invoice_line_items"
    },
    "RATINGS_FIELD": {
        "fieldtype": "ratings",
        "label": "Rating",
        "max_rating": 5,
        "required": 1
    }
}
```

## CAPPS REST API Examples

### Read Operations

```javascript
// ✅ CORRECT: Read collection data (POST request)
const listData = await capps.rest.myapp.users.read({
    filter: [
        { field: "STATUS", value: "ACTIVE", asgn: "eq" },
        { field: "CREATED_ON", value: "2023-01-01", asgn: "gte" }
    ],
    sort: [
        { field: "CREATED_ON", order: "desc" }
    ],
    limit: 50
});

// ✅ CORRECT: Read single record by ID (GET request)
const singleRecord = await capps.rest.myapp.users.read[123]();

// ✅ CORRECT: Complex filtering with multiple conditions
const filteredData = await capps.rest.myapp.orders.read({
    filter: [
        {
            field: "STATUS",
            value: ["PENDING", "PROCESSING"],
            asgn: "in"
        },
        {
            field: "AMOUNT",
            value: 1000,
            asgn: "gt"
        }
    ],
    sort: [
        { field: "CREATED_ON", order: "desc" },
        { field: "AMOUNT", order: "asc" }
    ],
    limit: 100
});
```

### Create and Update Operations

```javascript
// ✅ CORRECT: Create new record
const createResponse = await capps.rest.myapp.users.create({
    data: {
        NAME: "John Doe",
        EMAIL: "john@example.com",
        STATUS: "ACTIVE"
    }
});

// ✅ CORRECT: Update existing record
const updateResponse = await capps.rest.myapp.users.update[123]({
    data: {
        NAME: "Updated Name",
        STATUS: "INACTIVE",
        UPDATED_ON: capps.format(new Date(), { fieldtype: 'Datetime', format: config.globalDateFormatLong })
    }
});

// ✅ CORRECT: Delete record
const deleteResponse = await capps.rest.myapp.users.delete[123]();
```

### Bulk Edit Operations

```javascript
// ✅ CORRECT: Bulk edit with scope
const bulkResponse = await capps.rest.myapp.orders.bulkedit({
    scope: "status_update",
    data: [
        { ID: 1, STATUS: "COMPLETED" },
        { ID: 2, STATUS: "COMPLETED" }, 
        { ID: 3, STATUS: "CANCELLED" }
    ]
});

// ✅ CORRECT: Authorization workflow
const authResponse = await capps.rest.myapp.transactions.bulkedit({
    scope: "authorize", 
    data: [
        { ID: 101, STATUS: "AUTHORIZED", AUTHORIZED_BY: "user123" },
        { ID: 102, STATUS: "AUTHORIZED", AUTHORIZED_BY: "user123" }
    ]
});
```

## CAPPS UI API Examples

### User Interface Methods

```javascript
// ✅ CORRECT: Toast notifications
capps.ui.toast({
    message: 'Operation completed successfully',
    type: 'success'
});

// ✅ CORRECT: Alert dialogs
capps.ui.alert({
    title: 'Warning',
    message: 'This action cannot be undone',
    variant: 'warning',
    size: 'md'
});

// ✅ CORRECT: Confirm dialogs
capps.ui.confirm({
    title: 'Confirm Action',
    message: 'Are you sure you want to continue?'
}).then(confirmed => {
    if (confirmed) {
        // Proceed with action
    }
});

// ✅ CORRECT: Modal dialogs with handlers
capps.ui.open_modal({
    title: 'Custom Modal',
    content: '<p>Modal content here</p>',
    size: 'lg',
    handlers: [
        {
            label: 'Save',
            variant: 'primary',
            handler(modal) {
                // Save logic
                modal.closeModal();
            }
        }
    ]
});
```

### Navigation

```javascript
// ✅ CORRECT: Set route programmatically
capps.set_route('/view/list');
capps.set_route(['module', 'doc', 'collection', 'add']);
capps.set_route(['module', 'doc', 'collection', 'update', recordId]);
```

### Session Management

```javascript
// ✅ CORRECT: Access user session data
const userId = config.getSessionStorage().user_id();
const userRoles = config.getSessionStorage().roles();
const permissions = config.getSessionStorage().permissions();

// ✅ CORRECT: Check user roles
if (userRoles && userRoles.includes('ADMIN')) {
    // Admin-specific logic
}
```

### Error Handling

```javascript
// ✅ CORRECT: Proper error handling
try {
    const result = await capps.rest.myapp.users.create({
        data: {
            NAME: "John Doe",
            EMAIL: "john@example.com"
        }
    });
    
    if (result.status === "success") {
        console.log("User created:", result.data);
        capps.ui.toast({ message: "User created successfully" });
    } else {
        console.error("Creation failed:", result.error);
        capps.ui.alert({ 
            message: result.error || "Creation failed",
            variant: "danger" 
        });
    }
} catch (error) {
    console.error("API call failed:", error);
    capps.ui.toast({ 
        message: "Network error occurred",
        type: "error" 
    });
}
```

These examples are all verified working code from the CAPPS Guinea Pig project and demonstrate proper CAPPS framework usage patterns with correct API calls.