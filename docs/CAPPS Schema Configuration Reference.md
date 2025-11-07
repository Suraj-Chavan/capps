# CAPPS Schema Configuration Reference

This reference documents the schema configuration options in the CAPPS framework, based on codebase implementation analysis.

## Collection-Level Configuration

### Basic Collection Properties

```json
{
    "DATA_MODEL": "DATABASE_TABLE_NAME",
    "NAME": "Display Name for Collection",
    "DEFAULT_VIEW": "list|form|card",
    "MODAL_SIZE": "sm|md|lg|xl",
    "label_direction": "top-bottom|bottom-top|left-right|right-left",
    "ACTIONS": ["CREATE", "UPDATE", "DELETE", "EXPORT"],
    "SORT_FIELD": "field_name",
    "SORT_ORDER": "ASC|DESC",
    "VIRTUAL_COLLECTION": 0|1,
    "SQL": "Custom SQL query for virtual collections",
    "HIDE_ATTACHMENTS": 0|1,
    "HIDE_CONNECTIONS": 0|1,
    "HIDE_HISTORY": 0|1,
    "RESTRICT_ATTACHMENTS": 0|1,
    "INCLUDE_CHILD_RECORDS": 0|1,
    "ALLOW_USER_TOGGLE_CHILD_RECORDS": true|false
}
```

#### Property Details

- **`DATA_MODEL`** (string, required): Database table name
- **`NAME`** (string, required): Human-readable collection name
- **`DEFAULT_VIEW`** (string): Default display mode
  - `list`: Table/grid view
  - `form`: Single record form view  
  - `card`: Card-based layout
- **`MODAL_SIZE`** (string): Modal dialog size for forms
- **`label_direction`** (string): Controls field label placement in Add/Modify forms
  - `top-bottom`: Label above form field (default)
  - `bottom-top`: Label below form field
  - `left-right`: Label to the left of form field (horizontal layout)
  - `right-left`: Label to the right of form field (reverse horizontal layout)
  - Note: Horizontal layouts automatically switch to vertical on mobile devices (< 768px)
- **`ACTIONS`** (array): Available user operations
- **`SORT_FIELD`** (string): Default sorting field
- **`SORT_ORDER`** (string): Sort direction
- **`VIRTUAL_COLLECTION`** (0/1): Read-only collection from custom SQL
- **`SQL`** (string): Custom query for virtual collections
- **`HIDE_ATTACHMENTS`** (0/1): Hide attachments section in form sidebar
- **`HIDE_CONNECTIONS`** (0/1): Hide connections section in form sidebar
- **`HIDE_HISTORY`** (0/1): Hide version history section in form sidebar
- **`RESTRICT_ATTACHMENTS`** (0/1): Make attachments read-only (view existing files but disable upload/delete)
- **`INCLUDE_CHILD_RECORDS`** (0/1): Enable expandable DataTable with child collections
  - `1`: Enable expandable rows showing child collection data (requires `fieldtype: "table"` fields)
  - `0`: Disable child record expansion (default)
- **`ALLOW_USER_TOGGLE_CHILD_RECORDS`** (true/false): Allow user override of child records visibility
  - `true`: Display UI toggle for users to show/hide child records
  - `false`: Respect schema setting only, no user override (default)

### Advanced Collection Properties

```json
{
    "DATA_TABLE_SCROLL_HEIGHT": "calc(100vh - 250px)",
    "UPLOAD_COLUMN_MAP": ["FIELD1", "FIELD2", "FIELD3"]
}
```

#### Property Details

- **`DATA_TABLE_SCROLL_HEIGHT`** (string): Table container height (CSS value)
- **`UPLOAD_COLUMN_MAP`** (array): CSV column mapping for file uploads

## Field Type Reference

### Basic Field Types

#### Text Field
```json
{
    "FIELD_NAME": {
        "fieldtype": "textfield",
        "label": "Display Label",
        "maxlength": 100,
        "required": 1,
        "unique": 1,
        "readonly": 0,
        "disabled": 0,
        "hidden": 0,
        "default": "Default value"
    }
}
```

#### Textarea Field (Basic)
```json
{
    "TEXTAREA_FIELD": {
        "fieldtype": "textarea",
        "rows": 4,
        "max-rows": 8,
        "maxlength": 2000
    }
}
```

#### Textarea Field (Expression Builder)
```json
{
    "EXPRESSION_TEXTAREA_FIELD": {
        "fieldtype": "textarea",
        "rows": 3,
        "max-rows": 4,
        "expression_builder": 1,
        "suggestions": ["SURAJ", "SURAJ2"]
    }
}
```

#### Textarea Field (Command Palette)
```json
{
    "COMMAND_PALETTE_TEXTAREA_FIELD": {
        "fieldtype": "textarea",
        "rows": 3,
        "max-rows": 4,
        "command_palette": 1,
        "commands": [{
            "value": "Command 1",
            "name": "Command sample",
            "category": "Sample One",
            "desc": "This is a command description"
        }]
    }
}
```

#### Rich Text Editor
```json
{
    "RICH_TEXT_FIELD": {
        "fieldtype": "rich_text_editor",
        "grid_column_size": 1
    }
}
```

### Numeric Field Types

#### Integer Field
```json
{
    "INTEGER_FIELD": {
        "fieldtype": "int",
        "is_amount": 1,
        "dont_copy_on_duplicate": 1
    }
}
```

#### Float Field
```json
{
    "FLOAT_FIELD": {
        "fieldtype": "float",
        "is_amount": 1,
        "precision": 2
    }
}
```

### Date and Time Fields

#### Date Field
```json
{
    "DATE_FIELD": {
        "fieldtype": "date",
        "disable_past_dates": 0,
        "disable_future_dates": 0
    }
}
```

#### Time Field
```json
{
    "TIME_FIELD": {
        "fieldtype": "time"
    }
}
```

#### DateTime Field
```json
{
    "DATETIME_FIELD": {
        "fieldtype": "datetime"
    }
}
```

### Selection Field Types

#### Select Field (Static Options)
```json
{
    "SELECT_FIELD": {
        "fieldtype": "select",
        "multiple": 0,
        "enum": ["VALUE1", "VALUE2"]
    }
}
```

#### Select Field (Dynamic/Linked)
```json
{
    "LINKED_SELECT_FIELD": {
        "fieldtype": "select",
        "multiple": 0,
        "linked_to": {
            "ref": "other_collection",
            "filter": [],
            "key": "ID",
            "display_name": "ID",
            "fetch_field": {
                "additional_field_1": "Additional Field 1",
                "additional_field_2": "Additional Field 2"
            }
        },
        "sub_labels": "Collection Id = {ID}"
    }
}
```

#### Radio Field
```json
{
    "RADIO_FIELD": {
        "fieldtype": "radio",
        "enum": ["VALUE1", "VALUE2", "VALUE3", "VALUE4"]
    }
}
```

### Boolean Field Types

#### Checkbox Field
```json
{
    "CHECKBOX_FIELD": {
        "fieldtype": "checkbox",
        "checked-value": "Y",
        "unchecked-value": "N"
    }
}
```

#### Switch Field
```json
{
    "SWITCH_FIELD": {
        "fieldtype": "switch",
        "checked-value": "Y",
        "unchecked-value": "N"
    }
}
```

### Specialized Field Types

#### Email Field
```json
{
    "EMAIL_FIELD": {
        "fieldtype": "email_address"
    }
}
```

#### Password Field
```json
{
    "PASSWORD_FIELD": {
        "fieldtype": "password"
    }
}
```

#### File Field
```json
{
    "FILE_FIELD": {
        "fieldtype": "file",
        "allowed_file_types": ["jpeg", "jpg", "png", "svg"],
        "max_file_size_in_mb": 10
    }
}
```

#### Hyperlink Field
```json
{
    "HYPERLINK_FIELD": {
        "fieldtype": "hyperlink",
        "href": "/capps/dist/index.html#/capps-guinea-pig/doc/collection_two/view/list"
    }
}
```

#### Ratings Field
```json
{
    "RATINGS_FIELD": {
        "fieldtype": "ratings"
    }
}
```

### Layout Field Types

#### HTML Field
```json
{
    "HTML_FIELD": {
        "fieldtype": "html",
        "value": "<b>The html text contents from html field type</b>"
    }
}
```

#### HTML Field (External Reference)
```json
{
    "HTML_FIELD2": {
        "fieldtype": "html",
        "reference": "capps-guinea-pig/public/collection/collection_one/image_file_preview.html",
        "width": "70%"
    }
}
```

#### Section Break
```json
{
    "SECTION_BREAK": {
        "fieldtype": "section_break",
        "label": "Section Break"
    }
}
```

#### Column Break
```json
{
    "COLUMN_BREAK": {
        "fieldtype": "column_break"
    }
}
```

#### Button Field
```json
{
    "BUTTON_FIELD": {
        "fieldtype": "button"
    }
}
```

### Relationship Field Types

#### Table Field (Child Collection)
```json
{
    "CHILD_TABLE": {
        "fieldtype": "table",
        "ref": "collection_two",
        "parent.field": "PARENT_ID"
    }
}
```

#### Table Field (Expandable DataTable Child Collection)
For use with `INCLUDE_CHILD_RECORDS` feature:
```json
{
    "COLLECTION_TWO": {
        "fieldtype": "table",
        "child_collection": "COLLECTION_TWO",
        "label": "Related Items",
        "in_list_view": 0
    }
}
```

**Note**: Child collection templates can be customized using `rowHeaderTemplateRenderer` and `rowFooterTemplateRenderer` in the list.js configuration.

## Common Field Properties

### Display and Layout Properties

```json
{
    "FIELD_NAME": {
        "label": "Display Label",
        "in_list_view": 1,
        "in_standard_filter": 1,
        "in_quick_filter": 1,
        "grid_column_size": 6,
        "list_column_size": 100,
        "field_order_no": 1,
        "sortable": 1,
        "sticky_column": 1
    }
}
```

### Validation Properties

```json
{
    "FIELD_NAME": {
        "required": 0,
        "unique": 1,
        "readonly": 0,
        "disabled": 0,
        "hidden": 0,
        "maxlength": 100,
        "restrict_modify": 0
    }
}
```

### Behavioral Properties

```json
{
    "FIELD_NAME": {
        "default": "default_value",
        "dont_copy_on_duplicate": 1
    }
}
```

## Complete Property Reference

### **Collection-Level Properties**
- `DATA_MODEL` - Database table name
- `NAME` - Collection display name
- `DEFAULT_VIEW` - Default view type (list/form/card)  
- `MODAL_SIZE` - Modal dialog size (sm/md/lg/xl)
- `label_direction` - Form field label placement (top-bottom/bottom-top/left-right/right-left)
- `ACTIONS` - Available operations array
- `SORT_FIELD` - Default sort field
- `SORT_ORDER` - Sort direction (ASC/DESC)
- `VIRTUAL_COLLECTION` - Virtual collection flag (0/1)
- `SQL` - Custom SQL for virtual collections
- `DATA_TABLE_SCROLL_HEIGHT` - Table container height
- `UPLOAD_COLUMN_MAP` - CSV import column mapping
- `HIDE_ATTACHMENTS` - Hide attachments section in form sidebar (0/1)
- `HIDE_CONNECTIONS` - Hide connections section in form sidebar (0/1)
- `HIDE_HISTORY` - Hide version history section in form sidebar (0/1)
- `RESTRICT_ATTACHMENTS` - Make attachments read-only (view existing files but disable upload/delete) (0/1)
- `INCLUDE_CHILD_RECORDS` - Enable expandable DataTable with child collections (0/1)
- `ALLOW_USER_TOGGLE_CHILD_RECORDS` - Allow user override of child records visibility (true/false)

### **Common Field Properties**
- `fieldtype` - Field type (required)
- `label` - Display label
- `description` - Sub-label/help text that appears below the main label
- `required` - Required field flag (0/1)
- `readonly` - Read-only flag (0/1)
- `disabled` - Disabled flag (0/1)
- `hidden` - Hidden flag (0/1)
- `unique` - Unique constraint (0/1)
- `iskey` - Primary key flag (0/1)
- `default` - Default value
- `maxlength` - Maximum length
- `in_list_view` - Show in list view (0/1)
- `in_standard_filter` - Show in standard filter (0/1)
- `in_quick_filter` - Show in quick filter (0/1)
- `grid_column_size` - Grid layout size (1-12)
- `list_column_size` - List column width (pixels)
- `field_order_no` - Field display order
- `sortable` - Sortable column (0/1)
- `sticky_column` - Sticky column (0/1)
- `restrict_modify` - Restrict modification (0/1)
- `dont_copy_on_duplicate` - Skip on duplicate (0/1)
- `is_amount` - Format as amount (0/1)
- `precision` - Decimal precision

### **Field-Specific Properties**

**Textarea:**
- `rows` - Number of textarea rows (default: "1")
- `max-rows` - Maximum rows (default: "1") 
- `maxlength` - Maximum character limit
- `expression_builder` - If `=== 1`, converts textarea to expression builder (cannot be used with command_palette)
- `suggestions` - Array of suggestions for expression builder (only used when expression_builder === 1)
- `command_palette` - If `=== 1`, converts textarea to command palette (cannot be used with expression_builder)
- `commands` - Array of command objects for command palette (only used when command_palette === 1)

**Select:**
- `enum` - Array of static options
- `multiple` - Boolean for multi-select
- `linked_to.ref` - Reference collection name
- `linked_to.key` - Key field for remote data
- `linked_to.display_name` - Display field for remote data
- `linked_to.sub_labels` - Sub-label configuration
- `linked_to.filter` - Filter function for remote data

**Checkbox:**
- `checked-value` - Value when checked (default: "1")
- `unchecked-value` - Value when unchecked (default: "0")

**Switch:**
- `checked-value` - Value when switched on
- `unchecked-value` - Value when switched off

**Date:**
- `disable_future_dates` - If `== 1`, allows only past dates
- `disable_past_dates` - If `== 1`, allows only future dates

**File:**
- `allowed_file_types` - Array of allowed file extensions

**HTML:**
- `reference` - HTML reference property for external templates

**Hyperlink:**
- `href` - Link URL
- `target` - Link target (default: "_blank")
- `rel` - Link relationship (default: "opener")

**Ratings:**
- `stars` - Number of stars (default: 5)
- `clearable` - Shows/hides clear button (default: true if null)
- `size` - Star size (default: 26)
- `increment` - Rating increment (default: 0.5)
- `inline` - Display mode (default: true)
- `spacing` - Padding between stars (default: 15)

**Email:**
- `rules` - Validation rules object (merged with `{ email: true }`)

**Table:**
- `ref` - Reference to linked collection
- `label` - Table label
- `parent.field` - Parent field reference

**Radio:**
- `enum` - Array of options

### Supported Field Types Summary

**Core Field Types:**
- `textfield`, `textarea`, `rich_text_editor`
- `int`, `float`, `alphanumeric`
- `date`, `time`, `datetime`

**Selection Types:**
- `select`, `radio`, `checkbox`, `switch`

**Specialized Types:**
- `email_address`, `password`, `file`, `hyperlink`, `ratings`

**Layout Types:**
- `html`, `section_break`, `column_break`, `button`, `table`

## Collection Schema Examples

### Simple Collection (Based on Real CAPPS Schema)
```json
{
    "DATA_MODEL": "RSA_COLLECTION_ONE",
    "NAME": "Collection One",
    "DEFAULT_VIEW": "list",
    "MODAL_SIZE": "xl",
    "label_direction": "left-right",
    "ACTIONS": ["EXPORT", "CREATE", "UPDATE", "DELETE"],
    "SORT_FIELD": "ID",
    "SORT_ORDER": "DESC",
    "RESTRICT_ATTACHMENTS": 1,
    "FIELDS": {
        "ID": {
            "fieldtype": "float",
            "iskey": 1
        },
        "TEXT_FIELD": {
            "fieldtype": "textfield",
            "label": "User Name",
            "description": "Enter your full name as it appears on official documents",
            "in_list_view": 1,
            "unique": 1
        },
        "EMAIL_FIELD": {
            "fieldtype": "email_address",
            "in_list_view": 1
        },
        "SELECT_FIELD": {
            "fieldtype": "select",
            "enum": ["VALUE1", "VALUE2"],
            "in_list_view": 1
        }
    }
}
```

### Collection with Child Table
```json
{
    "DATA_MODEL": "RSA_COLLECTION_TWO",
    "NAME": "Collection Two",
    "DEFAULT_VIEW": "list",
    "MODAL_SIZE": "xl",
    "ACTIONS": ["CREATE", "UPDATE", "DELETE"],
    "SORT_FIELD": "ID",
    "SORT_ORDER": "DESC",
    "UPLOAD_COLUMN_MAP": ["NAME", "PARENT_ID"],
    "FIELDS": {
        "ID": {
            "fieldtype": "float",
            "iskey": 1
        },
        "NAME": {
            "fieldtype": "textfield"
        },
        "PARENT_ID": {
            "fieldtype": "select",
            "ref": "collection_two"
        },
        "CREATED_ON": {
            "fieldtype": "datetime"
        },
        "CREATED_BY": {
            "fieldtype": "textfield"
        }
    }
}
```

### Collection with Expandable Child Records (DataTable)
```json
{
    "DATA_MODEL": "COLLECTION_ONE",
    "NAME": "Main Collection with Child Records",
    "DEFAULT_VIEW": "list",
    "MODAL_SIZE": "xl",
    "INCLUDE_CHILD_RECORDS": 1,
    "ALLOW_USER_TOGGLE_CHILD_RECORDS": true,
    "ACTIONS": ["CREATE", "UPDATE", "DELETE", "EXPORT"],
    "SORT_FIELD": "ID",
    "SORT_ORDER": "DESC",
    "FIELDS": {
        "ID": {
            "fieldtype": "int",
            "iskey": 1,
            "in_list_view": 1
        },
        "TEXT_FIELD": {
            "fieldtype": "textfield",
            "label": "Description",
            "in_list_view": 1,
            "required": 1
        },
        "CHECKBOX_FIELD": {
            "fieldtype": "checkbox",
            "label": "Active Status",
            "checked-value": "Y",
            "unchecked-value": "N",
            "in_list_view": 1
        },
        "INTEGER_FIELD": {
            "fieldtype": "int",
            "label": "Amount",
            "is_amount": 1,
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

**Expected API Response Structure:**
```json
[
    {
        "ID": 1,
        "TEXT_FIELD": "Test Text",
        "CHECKBOX_FIELD": "Y",
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
        "CHECKBOX_FIELD": "N",
        "INTEGER_FIELD": 25,
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

**Key Features:**
- Main table displays parent records with expand/collapse icons
- Clicking expand reveals child collection data in nested DataTable
- Child tables inherit all parent features: sorting, filtering, actions
- Schema-driven control with optional user toggle override
- Full feature parity with standard DataTable functionality

## Best Practices

### Performance Optimization
- Use `in_list_view: 0` for fields not needed in list views
- Set appropriate `maxlength` values to optimize database storage
- Use `DATA_TABLE_SCROLL_HEIGHT` for large datasets
- For expandable DataTable: Always set `in_list_view: 0` for `fieldtype: "table"` fields
- Consider data volume when enabling `INCLUDE_CHILD_RECORDS` for large datasets

### User Experience
- Provide meaningful `label` values for all fields
- Implement logical field grouping with section breaks
- Set sensible `default` values to minimize user input
- Use appropriate field types for data validation
- For child collections: Use descriptive `label` values for table fields (e.g., "Related Items", "Order Details")
- Consider enabling `ALLOW_USER_TOGGLE_CHILD_RECORDS` for better user control over data display

### Data Integrity
- Always set `required: 1` for essential fields
- Use `unique: 1` for fields that must be unique across records
- Use `readonly: 1` for calculated or system fields
- Set `iskey: 1` for primary key fields

### Schema Organization
- Use consistent naming conventions for fields (UPPER_SNAKE_CASE recommended)
- Group related fields with section breaks and column breaks
- Use meaningful enum values that are self-explanatory
- Set appropriate `MODAL_SIZE` based on form complexity

### File Handling
- Always specify `allowed_file_types` for file fields
- Set reasonable `max_file_size_in_mb` limits
- Use `UPLOAD_COLUMN_MAP` for bulk data import functionality

---

This schema reference provides comprehensive configuration options for the CAPPS framework based on codebase analysis and real schema examples.