# List.js Documentation

## Overview
The `list.js` file is used for configuring list/grid views and adding custom actions. It follows the structure:
```
<<APP NAME>>/rest/collection/<<Collection Name>>/list.js
```

The list.js file contains:
```javascript
capps.ui.<<collection_name>>.list = {
    // list handlers and configurations
}
```

## Features

### 1. Custom Actions
Define custom actions that can be triggered from the list view. Action names can be any valid string except reserved keywords.

Example:
```javascript
capps.ui.collection_name.list = {
    Approve: async function (list) {
        const selectedRecords = list.selectedRecords;
        // Action logic here
    },
    Reject: async function (list) {
        const selectedRecords = list.selectedRecords;
        // Action logic here
    }
}
```

### 1.a. Setting an Icon for a Custom Action (Approve/Reject etc.)
For custom actions such as Approve, Reject, etc. (i.e., actions defined as functions in your list.js), you can set an icon by targeting the action name in the list view using CSS.

> **Write these styles in:** `<<APP NAME>>/public/layout/style.css`

For example, to set an icon for the `Approve` action:

```css
li[data-action="Approve"] button::before {
    content: " ";
    background-image: url("./icons/Approve.svg");
    width: 22px;
    height: 22px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    display: inline-block;
    margin-right: 6px;
}
```

This will display the icon before the Approve button label in the list view. You can use the same approach for other custom actions by changing the `data-action` selector to match your action name (e.g., `Reject`, `Generate Bill`, etc.).

### 1.2 Custom actions using `buttonList`
The `buttonList` is a reserved key that accepts an array of action objects for creating toolbar buttons above the list/grid. This method provides more granular control over the button's appearance, visibility, and behavior compared to defining simple function-based actions. The order of buttons in the UI will match their order in the array.

**Note**: `buttonList` creates toolbar buttons that operate on selected records, while `buttonColumns` (Section 7) creates individual action buttons for each row.

#### Button Grouping Support
Buttons can be grouped into dropdown menus by adding a `group` property. Buttons with the same group name will be rendered together in a dropdown menu, while buttons without a group property will appear as individual buttons.

Each object in the `buttonList` array can have the following properties:

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `key` | `String` | Yes | A unique identifier for the action. This is used internally and for `data-action` attributes. |
| `label` | `String` | No | The text displayed on the button. If not provided, the `key` is used as a fallback. |
| `icon` | `String` | No | A CSS class for an icon (e.g., `'pi pi-eye'`). The icon will be displayed before the label. |
| `group` | `String` | No | Group name for creating dropdown menus. Buttons with the same group name will be grouped together. |
| `show` | `Function` | No | A function that determines the button's visibility. It receives the `list` utility API object. It can return a boolean synchronously or a `Promise` that resolves to a boolean for asynchronous checks. If omitted, the button is always shown. |
| `handler`| `Function` | Yes | The function to execute when the button is clicked. It receives the `list` utility API object as an argument. |

#### Basic Example (Individual Buttons):
```javascript
capps.ui.collection_name.list = {
    buttonList: [
        {
            key: 'Custom_Action',
            label: 'Custom Action',
            icon: 'pi pi-eye', // primeng icon class
            class: 'btn btn-success', // bootstrap class
            // Synchronous show: button is always visible
            show: () => true,
            handler: (list) => { 
                alert("Calling modal action function from one of the action from buttonList");
                capps.ui.collection_one.list.customModalWithFieldsOption(list);
            }
        },
        {
            key: 'Custom_Action_2',
            label: 'Custom Action Two',
            icon: 'pi pi-eye', // primeng icon class
            class: 'btn btn-success', // bootstrap class
            // Asynchronous show: button appears after 3 seconds
            show: async () => {
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        resolve(true);
                    }, 3000);
                });
            },
            handler: (list) => { 
                alert("Calling modal action function from one of the action from buttonList");
            }
        }
    ]
}
```

#### Grouped Buttons Example (Dropdown Menus):
```javascript
capps.ui.collection_name.list = {
    buttonList: [
        // Individual ungrouped button
        {
            key: 'single_action',
            label: 'Individual Action',
            icon: 'pi pi-plus',
            class: 'btn btn-primary',
            show: () => true,
            handler: (list) => { 
                capps.ui.alert({
                    title: 'Individual Action',
                    message: `Selected ${list.selectedRecords.length} records`,
                    variant: 'info'
                });
            }
        },
        
        // Grouped buttons - "Status Actions" dropdown
        {
            key: 'approve_action',
            label: 'Approve Selected',
            icon: 'pi pi-check-circle',
            group: 'Status Actions', // This creates a dropdown group
            show: (list) => list.selectedRecords.length > 0,
            handler: (list) => { 
                capps.ui.confirm({
                    title: 'Approve Records',
                    message: `Are you sure you want to approve ${list.selectedRecords.length} records?`,
                    okTitle: 'Approve',
                    cancelTitle: 'Cancel'
                }).then(confirmed => {
                    if (confirmed) {
                        // Approval logic here
                        capps.ui.toast({
                            message: 'Records approved successfully',
                            variant: 'success'
                        });
                    }
                });
            }
        },
        {
            key: 'reject_action',
            label: 'Reject Selected',
            icon: 'pi pi-times-circle',
            group: 'Status Actions', // Same group - appears in same dropdown
            show: (list) => list.selectedRecords.length > 0,
            handler: (list) => { 
                capps.ui.confirm({
                    title: 'Reject Records',
                    message: `Are you sure you want to reject ${list.selectedRecords.length} records?`,
                    okTitle: 'Reject',
                    cancelTitle: 'Cancel'
                }).then(confirmed => {
                    if (confirmed) {
                        // Rejection logic here
                        capps.ui.toast({
                            message: 'Records rejected successfully',
                            variant: 'warning'
                        });
                    }
                });
            }
        },
        {
            key: 'pending_action',
            label: 'Mark as Pending',
            icon: 'pi pi-clock',
            group: 'Status Actions', // Same group - appears in same dropdown
            show: (list) => list.selectedRecords.length > 0,
            handler: (list) => { 
                // Mark as pending logic
                capps.ui.toast({
                    message: 'Records marked as pending',
                    variant: 'info'
                });
            }
        },
        
        // Another group - "Export Actions" dropdown
        {
            key: 'export_excel',
            label: 'Export to Excel',
            icon: 'pi pi-file-excel',
            group: 'Export Actions', // Different group - separate dropdown
            show: () => true,
            handler: (list) => { 
                capps.ui.toast({
                    message: 'Exporting to Excel...',
                    variant: 'info'
                });
                // Excel export logic
            }
        },
        {
            key: 'export_pdf',
            label: 'Export to PDF',
            icon: 'pi pi-file-pdf',
            group: 'Export Actions', // Same group as above
            show: () => true,
            handler: (list) => { 
                capps.ui.toast({
                    message: 'Exporting to PDF...',
                    variant: 'info'
                });
                // PDF export logic
            }
        },
        {
            key: 'export_csv',
            label: 'Export to CSV',
            icon: 'pi pi-file',
            group: 'Export Actions', // Same group as above
            show: () => true,
            handler: (list) => { 
                capps.ui.toast({
                    message: 'Exporting to CSV...',
                    variant: 'info'
                });
                // CSV export logic
            }
        }
    ]
}
```

#### UI Rendering Behavior:
- **Individual buttons** (no `group` property): Rendered as separate buttons in the toolbar
- **Grouped buttons** (same `group` value): Rendered as dropdown menu items under a single dropdown button
- **Group names**: Used as the dropdown button label
- **Icon display**: In dropdowns, icons appear next to the label in menu items


### 2. Column Sequence
Configure the order of columns in the grid view.

```javascript
capps.ui.collection_name.list = {
    columnSequence: [
        "ID",
        "NAME",
        "STATUS",
        "CREATED_DATE"
    ]
}
```

### 3. Column Formatting
Transform column values using custom formatters.

```javascript
capps.ui.collection_name.list = {
    formatters: {
        STATUS: function(value, fieldName, record) {
            return value === "A" ? "Active" : "Inactive";
        },
        AMOUNT: function(value, fieldName, record) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: record.CURRENCY || 'USD'
            }).format(value);
        }
    }
}
```

### 4. Row Styling
Modify row appearance based on conditions.

```javascript
capps.ui.collection_name.list = {
    rowRenderer: function(row) {
        if (row.STATUS === "EXPIRED") {
            return {
                style: {
                    backgroundColor: "#ffebee"
                }
            };
        }
        return {};
    }
}
```

### 5. Column Value Styling
Style individual column values dynamically.

```javascript
capps.ui.collection_name.list = {
    columnRowColorize: {
        STATUS: function(record) {
            if (record.STATUS === "ACTIVE") return {
                style: "color: blue!important",
            };
            if (record.STATUS === "INACTIVE") return {
                    style: "color: red!important",
            };
        }
    }
}
```

### 6. Before Render Hook
Execute code before the list data is rendered.

```javascript
capps.ui.collection_name.list = {
    before_render: async function(list) {
        // Pre-render logic here
    }
}
```

### 7. Row Group Templates
Configure custom HTML content for grouped row headers and footers when using row grouping functionality. These templates work with PrimeVue's row grouping feature to display custom content above and below each record.

**Important**: `groupData` contains the current row's data (the individual record), not an array of grouped items.

```javascript
capps.ui.collection_name.list = {
    // Row Group Header Template - displays above each record
    rowHeaderTemplateRenderer: function(groupData) {
        return `<div class="group-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 16px; border-radius: 8px; margin: 8px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="margin: 0; font-size: 1.1rem; font-weight: 600;">
                        <i class="pi pi-users" style="margin-right: 8px;"></i>
                        Record: ${groupData.NAME || 'Unknown'}
                    </h4>
                    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 0.9rem;">
                        ${groupData.DESCRIPTION || 'No description'}
                    </p>
                </div>
                <div style="text-align: right;">
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 16px; font-size: 0.85rem;">
                        ID: ${groupData.ID || 'N/A'}
                    </span>
                </div>
            </div>
        </div>`;
    },
    
    // Row Group Footer Template - displays below each record
    rowFooterTemplateRenderer: function(groupData) {
        const amount = groupData.AMOUNT || 0;
        const status = groupData.STATUS === 'A' ? 'Active' : 'Inactive';
        const statusColor = groupData.STATUS === 'A' ? '#28a745' : '#dc3545';
        
        return `<div class="group-footer" style="background: #f8f9fa; padding: 12px 16px; border-radius: 6px; margin: 8px 0; border-left: 4px solid #28a745;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: #155724;">Record Summary:</strong>
                    <span style="margin-left: 16px; color: #6c757d;">
                        Amount: <strong>$${amount.toLocaleString()}</strong>
                    </span>
                </div>
                <div>
                    <span style="color: ${statusColor}; font-weight: 600;">
                        <i class="pi ${groupData.STATUS === 'A' ? 'pi-check-circle' : 'pi-times-circle'}" style="margin-right: 4px;"></i>
                        ${status}
                    </span>
                </div>
            </div>
        </div>`;
    }
}
```

**Template Parameters:**
- `groupData` - The current row's data object containing all field values
- `groupData.FIELD_NAME` - Access any field from the current record
- Return HTML string to be rendered in the template

**Usage with Row Grouping:**
To use row group templates, enable row grouping in your DataTable configuration:
- `rowGroupMode="subheader"` - Groups with headers and content separation
- `groupRowsBy="FIELD_NAME"` - Field to group records by (e.g., "ID", "SR_NO")

**Real-World Example (from collection_one):**
```javascript
capps.ui.collection_one.list = {
    rowHeaderTemplateRenderer: function(groupData) {
        return `<div class="group-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 16px; border-radius: 8px; margin: 8px 0;">
            <h4 style="margin: 0; font-size: 1.1rem;">
                <i class="pi pi-users" style="margin-right: 8px;"></i>
                Record Group: SR_NO ${groupData.SR_NO || 'Unknown'}
            </h4>
            <p style="margin: 4px 0 0 0; opacity: 0.9;">
                Text Field: ${groupData.TEXT_FIELD || 'No description'}
            </p>
        </div>`;
    },
    
    rowFooterTemplateRenderer: function(groupData) {
        const integerValue = groupData.INTEGER_FIELD || 0;
        const floatValue = groupData.FLOAT_FIELD || 0;
        const checkboxStatus = groupData.CHECKBOX_FIELD === 'Y' ? 'Active' : 'Inactive';
        const statusColor = groupData.CHECKBOX_FIELD === 'Y' ? '#28a745' : '#dc3545';
        
        return `<div class="group-footer" style="background: #e8f5e8; padding: 12px 16px; border-radius: 6px; margin: 8px 0; border-left: 4px solid #28a745;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: #155724;">Record Values:</strong>
                    <span style="margin-left: 16px;">
                        Integer: <strong>${integerValue.toLocaleString()}</strong> | 
                        Float: <strong>${parseFloat(floatValue).toFixed(2)}</strong>
                    </span>
                </div>
                <div>
                    <span style="color: ${statusColor}; font-weight: 600;">
                        <i class="pi ${groupData.CHECKBOX_FIELD === 'Y' ? 'pi-check-circle' : 'pi-times-circle'}"></i>
                        ${checkboxStatus}
                    </span>
                </div>
            </div>
        </div>`;
    }
}
```

### 8. Button Columns
You can define multiple button columns using the reserved key `buttonColumns` in your `list.js` file. Each button will be displayed in a separate column, or buttons with the same `group` property will be combined into a single column with a dropdown menu.

#### Button Column Properties:
| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `key` | `String` | Yes | A unique identifier for the button action. |
| `label` | `String` | No | The text displayed on the button. If not provided, the `key` is used as a fallback. |
| `icon` | `String` | No | A CSS class for an icon (e.g., `'pi pi-eye'`). |
| `group` | `String` | No | Group name for combining buttons into dropdown menus. Buttons with the same group will appear in one column. |
| `group_label` | `String` | No | Custom label for the group dropdown button. Empty string shows icon only. Only applies to the first button in a group. |
| `group_icon` | `String` | No | Custom icon for the group dropdown button (e.g., `'pi pi-ellipsis-v'`). Only applies to the first button in a group. |
| `group_header` | `String` | No | Custom column header text for grouped buttons. Only applies to the first button in a group. |
| `column_header` | `String` | No | Column header text for individual buttons. If not provided, the header will be blank. |
| `show` | `Function` | No | Function that determines button visibility per row. Receives the row data as parameter. |
| `handler` | `Function` | Yes | Function called when button is clicked. Receives row data and context object. |

#### Individual Button Columns Example:
```javascript
capps.ui.collection_name.list = {
    buttonColumns: [
        {
            key: 'View',
            label: 'View',
            icon: 'pi pi-eye',
            column_header: 'Details',
            show: (row) => true,
            handler: (row, context) => { 
                capps.ui.open_modal({
                    title: 'View Record',
                    content: `Viewing record ID: ${row.ID}`,
                    size: 'lg'
                });
            }
        },
        {
            key: 'Edit',
            label: 'Edit',
            icon: 'pi pi-pencil',
            column_header: 'Modify',
            show: (row) => row.STATUS !== 'CLOSED',
            handler: (row, context) => { 
                // Navigate to edit form
                context.openUpdateScreen(row);
            }
        },
        {
            key: 'Delete',
            label: 'Delete',
            icon: 'pi pi-trash',
            column_header: 'Remove',
            show: (row) => row.STATUS !== 'ARCHIVED',
            handler: (row, context) => { 
                capps.ui.confirm({
                    title: 'Delete Record',
                    message: `Are you sure you want to delete record ${row.ID}?`,
                    okTitle: 'Delete',
                    cancelTitle: 'Cancel'
                }).then(confirmed => {
                    if (confirmed) {
                        context.deleteAction(row);
                    }
                });
            }
        }
    ],
    columnSequence: [
        "ID", "NAME", "STATUS", "View", "Edit", "Delete"
    ]
}
```

#### Grouped Button Columns Example (Dropdown Menus):
```javascript
capps.ui.collection_name.list = {
    buttonColumns: [
        // Individual column
        {
            key: 'quick_view',
            label: 'Quick View',
            icon: 'pi pi-eye',
            column_header: 'View',
            show: (row) => true,
            handler: (row, context) => { 
                capps.ui.toast({
                    message: `Quick viewing record ${row.ID}`,
                    variant: 'info'
                });
            }
        },
        
        // Grouped actions - "Actions" dropdown column
        {
            key: 'edit_record',
            label: 'Edit Record',
            icon: 'pi pi-pencil',
            group: 'Actions', // Creates a dropdown column
            group_label: '', // Empty label - shows only icon
            group_icon: 'pi pi-ellipsis-v', // Three dots vertical icon
            group_header: ' ', // Minimal column header (space)
            show: (row) => row.STATUS === 'ACTIVE',
            handler: (row, context) => { 
                context.openUpdateScreen(row);
            }
        },
        {
            key: 'duplicate_record',
            label: 'Duplicate Record',
            icon: 'pi pi-copy',
            group: 'Actions', // Same group - appears in same dropdown
            show: (row) => true,
            handler: (row, context) => { 
                context.openAddScreen(row);
            }
        },
        {
            key: 'archive_record',
            label: 'Archive Record',
            icon: 'pi pi-archive',
            group: 'Actions', // Same group - appears in same dropdown
            show: (row) => row.STATUS !== 'ARCHIVED',
            handler: (row, context) => { 
                capps.ui.confirm({
                    title: 'Archive Record',
                    message: `Archive record ${row.ID}?`,
                    okTitle: 'Archive',
                    cancelTitle: 'Cancel'
                }).then(confirmed => {
                    if (confirmed) {
                        // Archive logic here
                        capps.ui.toast({
                            message: 'Record archived successfully',
                            variant: 'success'
                        });
                    }
                });
            }
        },
        
        // Another grouped column - "Reports" dropdown
        {
            key: 'generate_report',
            label: 'Generate Report',
            icon: 'pi pi-file-pdf',
            group: 'Reports', // Different group - separate dropdown column
            show: (row) => true,
            handler: (row, context) => { 
                capps.ui.toast({
                    message: `Generating report for record ${row.ID}`,
                    variant: 'info'
                });
            }
        },
        {
            key: 'email_report',
            label: 'Email Report',
            icon: 'pi pi-send',
            group: 'Reports', // Same group as above
            show: (row) => row.EMAIL_ADDRESS,
            handler: (row, context) => { 
                capps.ui.toast({
                    message: `Emailing report for record ${row.ID}`,
                    variant: 'info'
                });
            }
        }
    ],
    columnSequence: [
        "ID", "NAME", "STATUS", "quick_view", "Actions", "Reports"
    ]
}
```

#### Button Column Features:
- **Individual buttons**: Create separate columns (no `group` property)
- **Grouped buttons**: Combined into single dropdown column (same `group` value)
- **Group headers**: Column header uses group name for grouped buttons
- **Conditional visibility**: `show` function evaluated per row
- **Row context**: Handler receives row data and context object with utility functions

## Handler Arguments

### List Handler Arguments
Each custom action and hook handler receives a `list` object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| selectedRecords | Array | List of selected records from the grid (from Vuex store) |
| clear_html_container | Function | Clears all custom HTML content from the list container |
| add_html | Function | Adds custom HTML content to the list container |
| remove_html | Function | Removes specific custom HTML content by ID |

### Handler Functions Details

#### selectedRecords
Returns the array of currently selected records from the list/grid:
```javascript
CustomAction: function(list) {
    const selected = list.selectedRecords;
    console.log(`Selected ${selected.length} records`);
    selected.forEach(record => {
        console.log('Record ID:', record.ID);
    });
}
```

#### add_html(buttonId, html)
Adds custom HTML content to the list view:
```javascript
CustomAction: function(list) {
    const customContent = `
        <div class="alert alert-info">
            Processing ${list.selectedRecords.length} records...
        </div>
    `;
    list.add_html('processing_status', customContent);
}
```

#### remove_html(buttonId) 
Removes specific HTML content by its ID:
```javascript
CustomAction: function(list) {
    // Remove previously added content
    list.remove_html('processing_status');
}
```

#### clear_html_container()
Clears all custom HTML content from the container:
```javascript
CustomAction: function(list) {
    // Clear all custom HTML elements
    list.clear_html_container();
}
```

### Example Usage
```javascript
capps.ui.collection_name.list = {
    CustomAction: async function (list) {
        // Get selected records
        const selectedRecords = list.selectedRecords;
        
        // Add custom HTML
        list.add_html("customContainer", "<div>Custom Content</div>");
        
        // Remove custom HTML
        list.remove_html("customContainer");
        
        // Clear all custom HTML
        list.clear_html_container();
    }
}
```

## Reserved Keywords
The following keywords are reserved and should not be used as custom action names:
- **columnSequence** - Column display order configuration
- **formatters** - Custom column value formatters
- **rowRenderer** - Custom row styling function
- **columnRowColorize** - Column-specific row coloring
- **before_render** - Pre-render hook function
- **buttonColumns** - Individual row action buttons
- **buttonList** - Toolbar action buttons
- **rowHeaderTemplateRenderer** - Custom HTML template for grouped row headers
- **rowFooterTemplateRenderer** - Custom HTML template for grouped row footers

These reserved keys are used for list/grid features. Use any other valid string for custom action function names.

## Complete Example
```javascript
capps.ui.collection_name.list = {
    // Custom Actions (simple functions)
    Approve: async function (list) {
        const selectedRecords = list.selectedRecords;
        if (selectedRecords.length === 0) {
            list.add_html('warning', '<div class="alert alert-warning">Please select records first</div>');
            return;
        }
        
        // Process approval logic
        list.add_html('processing', '<div class="alert alert-info">Processing approval...</div>');
        // ... approval logic
        list.remove_html('processing');
        list.add_html('success', '<div class="alert alert-success">Records approved successfully</div>');
    },

    // Toolbar Button List (operates on selected records)
    buttonList: [
        {
            key: 'Custom_Action',
            label: 'Custom Action',
            icon: 'pi pi-eye',
            show: () => true,
            handler: (list) => { 
                console.log('Selected records:', list.selectedRecords);
                list.add_html('custom_info', '<div>Custom action executed</div>');
            }
        },
        {
            key: 'Bulk_Export',
            label: 'Export Selected',
            icon: 'pi pi-download',
            show: () => true,
            handler: (list) => {
                if (list.selectedRecords.length > 0) {
                    // Export logic for selected records
                    list.add_html('export_status', '<div class="alert alert-info">Exporting records...</div>');
                }
            }
        }
    ],

    // Button Columns (individual row actions)
    buttonColumns: [
        {
            key: 'View',
            label: 'View',
            icon: 'pi pi-eye',
            column_header: 'Details',
            show: (row) => true,
            handler: (row, context) => { 
                console.log('Viewing record:', row.ID);
            }
        },
        {
            key: 'Edit',
            label: 'Edit',
            icon: 'pi pi-pencil',
            column_header: '',
            show: (row) => row.status !== 'Closed',
            handler: (row, context) => { 
                console.log('Editing record:', row.ID);
            }
        }
    ],
    
    // Column Configuration
    columnSequence: ["ID", "NAME", "STATUS", "View", "Edit"],
    
    // Column Formatting
    formatters: {
        STATUS: value => value === "A" ? "Active" : "Inactive"
    },
    
    // Row Styling
    rowRenderer: row => ({
        style: row.STATUS === "EXPIRED" ? { backgroundColor: "#ffebee" } : {}
    }),
    
    // Column Value Styling
    columnRowColorize: {
        STATUS(record) {
            return (record.STATUS !== "EXPIRED" && record.AMOUNT > 1000) 
                ? {
                    style: "color: blue!important",
                } : {}
        }
    },
    
    // Before Render Hook
    before_render: async function(list) {
        // Pre-render logic
    },
    
    // Row Group Templates
    rowHeaderTemplateRenderer: function(groupData) {
        return `<div class="group-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 16px; border-radius: 8px; margin: 8px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="margin: 0; font-size: 1.1rem; font-weight: 600;">
                        <i class="pi pi-users" style="margin-right: 8px;"></i>
                        Record: ${groupData.NAME || 'Unknown'}
                    </h4>
                    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 0.9rem;">
                        ID: ${groupData.ID || 'N/A'}
                    </p>
                </div>
                <div style="text-align: right;">
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 16px; font-size: 0.85rem;">
                        ${groupData.STATUS || 'Unknown Status'}
                    </span>
                </div>
            </div>
        </div>`;
    },
    
    rowFooterTemplateRenderer: function(groupData) {
        const amount = groupData.AMOUNT || 0;
        const status = groupData.STATUS === 'ACTIVE' ? 'Active' : 'Inactive';
        const statusColor = groupData.STATUS === 'ACTIVE' ? '#28a745' : '#dc3545';
        
        return `<div class="group-footer" style="background: #f8f9fa; padding: 12px 16px; border-radius: 6px; margin: 8px 0; border-left: 4px solid #28a745;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: #155724;">Record Summary:</strong>
                    <span style="margin-left: 16px; color: #6c757d;">
                        Amount: <strong>$${amount.toLocaleString()}</strong>
                    </span>
                </div>
                <div>
                    <span style="color: ${statusColor}; font-weight: 600;">
                        <i class="pi ${groupData.STATUS === 'ACTIVE' ? 'pi-check-circle' : 'pi-times-circle'}" style="margin-right: 4px;"></i>
                        ${status}
                    </span>
                </div>
            </div>
        </div>`;
    }
}
```

---
[Go back to main page](../README.md)
