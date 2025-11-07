# CAPPS Advanced Field Properties

This document details advanced field properties and configurations available in CAPPS beyond the basic field types, providing comprehensive control over field behavior, validation, display, and user interaction.

## Core Field Properties

### Basic Properties

```json
{
    "FIELD_NAME": {
        "fieldtype": "textfield",
        "label": "Display Label",
        "required": 1,
        "readonly": 0,
        "disabled": 0,
        "hidden": 0
    }
}
```

- **`fieldtype`** (string): Field type (textfield, select, date, etc.)
- **`label`** (string): Display label for the field
- **`required`** (0/1): Whether field is required for form submission
- **`readonly`** (0/1): Makes field read-only (visible but not editable)
- **`disabled`** (0/1): Disables the field (grayed out, not interactive)
- **`hidden`** (0/1): Hides the field from the form

## Display and Layout Properties

### Grid and List Display

```json
{
    "FIELD_NAME": {
        "fieldtype": "textfield",
        "in_list_view": 1,
        "in_standard_filter": 1,
        "grid_column_size": 4,
        "width": "70%"
    }
}
```

- **`in_list_view`** (0/1): Show field in list/table view
- **`in_standard_filter`** (0/1): Include field in standard filter options
- **`grid_column_size`** (number): Column width (1-12 grid system)
- **`width`** (string): Specific width for the field (%, px, etc.)

### Section and Column Breaks

```json
{
    "SECTION_BREAK": {
        "fieldtype": "section_break",
        "label": "Contact Information"
    },
    "COLUMN_BREAK": {
        "fieldtype": "column_break",
        "label": "Additional Details"
    }
}
```

- **Section breaks** create horizontal divisions with optional headings
- **Column breaks** organize fields into columns within sections

## Data Validation Properties

### Length and Size Constraints

```json
{
    "TEXT_FIELD": {
        "fieldtype": "textfield",
        "maxlength": 50,
        "minlength": 5
    },
    "TEXTAREA_FIELD": {
        "fieldtype": "textarea",
        "rows": 4,
        "max-rows": 8,
        "maxlength": 500
    }
}
```

- **`maxlength`** (number): Maximum character length
- **`minlength`** (number): Minimum character length
- **`rows`** (number): Initial textarea rows
- **`max-rows`** (number): Maximum expandable rows

### Unique Constraints

```json
{
    "UNIQUE_FIELD": {
        "fieldtype": "textfield",
        "unique": 1,
        "dont_copy_on_duplicate": 1
    }
}
```

- **`unique`** (0/1): Enforces field uniqueness across records
- **`dont_copy_on_duplicate`** (0/1): Excludes field when duplicating records

### Checkbox and Switch Values

```json
{
    "CHECKBOX_FIELD": {
        "fieldtype": "checkbox",
        "checked-value": "Y",
        "unchecked-value": "N"
    },
    "SWITCH_FIELD": {
        "fieldtype": "switch", 
        "checked-value": "ACTIVE",
        "unchecked-value": "INACTIVE"
    }
}
```

- **`checked-value`** (string): Value when checked/on
- **`unchecked-value`** (string): Value when unchecked/off

## Field Type-Specific Properties

### Select Field Options

```json
{
    "STATIC_SELECT": {
        "fieldtype": "select",
        "multiple": 0,
        "enum": ["Option 1", "Option 2", "Option 3"]
    },
    "LINKED_SELECT": {
        "fieldtype": "select",
        "linked_to": {
            "ref": "other_collection",
            "filter": [["status", "=", "active"]],
            "key": "id",
            "display_name": "name"
        },
        "sub_labels": "Status: {status} | Code: {code}"
    }
}
```

- **`multiple`** (0/1): Allow multiple selections
- **`enum`** (array): Static list of options
- **`linked_to`** (object): Dynamic options from another collection
  - **`ref`**: Reference collection name
  - **`filter`**: Filter conditions for options
  - **`key`**: Field to use as option value
  - **`display_name`**: Field to display as option text
- **`sub_labels`** (string): Additional info template using {field_name} placeholders

### Date Field Constraints

```json
{
    "DATE_FIELD": {
        "fieldtype": "date",
        "disable_past_dates": 1,
        "disable_future_dates": 0,
        "default": "CURRENT_TIMESTAMP"
    }
}
```

- **`disable_past_dates`** (0/1): Prevents selecting past dates
- **`disable_future_dates`** (0/1): Prevents selecting future dates
- **`default`** (string): Default value (CURRENT_TIMESTAMP, specific date, etc.)

### Numeric Field Properties

```json
{
    "AMOUNT_FIELD": {
        "fieldtype": "float",
        "is_amount": 1,
        "precision": 2,
        "min_value": 0,
        "max_value": 999999
    }
}
```

- **`is_amount`** (0/1): Formats as currency/amount
- **`precision`** (number): Decimal places for float fields
- **`min_value`** (number): Minimum allowed value
- **`max_value`** (number): Maximum allowed value

### File Field Restrictions

```json
{
    "FILE_FIELD": {
        "fieldtype": "file",
        "allowed_file_types": ["jpg", "jpeg", "png", "pdf"],
        "max_file_size_in_mb": 10,
        "multiple_files": 1
    }
}
```

- **`allowed_file_types`** (array): Permitted file extensions
- **`max_file_size_in_mb`** (number): Maximum file size in MB
- **`multiple_files`** (0/1): Allow multiple file selection

### Rich Text Editor Options

```json
{
    "RICH_TEXT": {
        "fieldtype": "rich_text_editor",
        "toolbar_options": ["bold", "italic", "link", "image"],
        "height": "300px",
        "allow_html": 1
    }
}
```

- **`toolbar_options`** (array): Available formatting tools
- **`height`** (string): Editor height
- **`allow_html`** (0/1): Allow raw HTML input

### HTML Field Properties

```json
{
    "HTML_DISPLAY": {
        "fieldtype": "html",
        "value": "<h3>Static HTML Content</h3>",
        "reference": "app-name/public/path/to/template.html",
        "width": "100%",
        "height": "200px"
    }
}
```

- **`value`** (string): Static HTML content
- **`reference`** (string): Path to external HTML template file
- **`width`** (string): Display width
- **`height`** (string): Display height

### Hyperlink Configuration

```json
{
    "LINK_FIELD": {
        "fieldtype": "hyperlink",
        "href": "/path/to/destination",
        "target": "_blank",
        "link_text": "Click Here"
    }
}
```

- **`href`** (string): Link destination URL
- **`target`** (string): Link target (_blank, _self, etc.)
- **`link_text`** (string): Display text for the link

### Radio Field Configuration

```json
{
    "RADIO_FIELD": {
        "fieldtype": "radio",
        "enum": ["Option A", "Option B", "Option C"],
        "orientation": "horizontal",
        "default": "Option A"
    }
}
```

- **`enum`** (array): Radio button options
- **`orientation`** (string): Layout direction (horizontal/vertical)
- **`default`** (string): Default selected option

### Password Field Security

```json
{
    "PASSWORD_FIELD": {
        "fieldtype": "password",
        "min_strength": 3,
        "show_strength_meter": 1,
        "require_confirmation": 1
    }
}
```

- **`min_strength`** (number): Minimum password strength (1-5)
- **`show_strength_meter`** (0/1): Display strength indicator
- **`require_confirmation`** (0/1): Require password confirmation

### Email Validation

```json
{
    "EMAIL_FIELD": {
        "fieldtype": "email_address",
        "validate_domain": 1,
        "allowed_domains": ["company.com", "organization.org"]
    }
}
```

- **`validate_domain`** (0/1): Enable domain validation
- **`allowed_domains`** (array): Permitted email domains

## Advanced Configuration Properties

### Key and Relationship Properties

```json
{
    "PRIMARY_KEY": {
        "fieldtype": "float",
        "iskey": 1,
        "auto_increment": 1
    },
    "PARENT_RELATION": {
        "fieldtype": "table",
        "ref": "child_collection",
        "parent.field": "parent_id"
    }
}
```

- **`iskey`** (0/1): Marks field as primary key
- **`auto_increment`** (0/1): Auto-increment for primary keys
- **`parent.field`** (string): Parent-child relationship field mapping

### Access Control Properties

```json
{
    "RESTRICTED_FIELD": {
        "fieldtype": "textfield",
        "restrict_modify": 1,
        "permissions": {
            "read": ["manager", "admin"],
            "write": ["admin"]
        }
    }
}
```

- **`restrict_modify`** (0/1): Prevents field modification after creation
- **`permissions`** (object): Role-based field access control

### Default Values and Auto-Population

```json
{
    "AUTO_FIELD": {
        "fieldtype": "textfield",
        "default": "AUTO_GENERATED",
        "auto_populate": {
            "method": "sequence",
            "prefix": "DOC-",
            "suffix": "-2024",
            "padding": 5
        }
    }
}
```

- **`default`** (string): Default field value
- **`auto_populate`** (object): Automatic value generation settings

### Conditional Display Properties

```json
{
    "CONDITIONAL_FIELD": {
        "fieldtype": "textfield",
        "depends_on": "eval:doc.TYPE == 'CUSTOM'",
        "show_if": {
            "field": "STATUS",
            "operator": "in",
            "value": ["ACTIVE", "PENDING"]
        }
    }
}
```

- **`depends_on`** (string): JavaScript expression for conditional display
- **`show_if`** (object): Simple conditional display rules

### Custom Validation

```json
{
    "VALIDATED_FIELD": {
        "fieldtype": "textfield",
        "validation": {
            "pattern": "^[A-Z]{3}[0-9]{3}$",
            "message": "Format must be 3 letters followed by 3 numbers"
        },
        "custom_validation": "validateCustomLogic"
    }
}
```

- **`validation`** (object): Pattern-based validation with custom message
- **`custom_validation`** (string): Reference to custom validation function

## Collection-Level Schema Properties

### Collection Configuration

```json
{
    "DATA_MODEL": "MY_TABLE_NAME",
    "NAME": "Display Name",
    "DEFAULT_VIEW": "list",
    "MODAL_SIZE": "xl",
    "SORT_FIELD": "CREATED_DATE",
    "SORT_ORDER": "DESC",
    "ACTIONS": ["CREATE", "UPDATE", "DELETE", "EXPORT"]
}
```

- **`DATA_MODEL`**: Database table name
- **`NAME`**: Collection display name
- **`DEFAULT_VIEW`**: Default view (list/form/card)
- **`MODAL_SIZE`**: Modal dialog size (sm/md/lg/xl)
- **`SORT_FIELD`**: Default sort field
- **`SORT_ORDER`**: Sort direction (ASC/DESC)
- **`ACTIONS`**: Available operations

### Virtual Collection Properties

```json
{
    "VIRTUAL_COLLECTION": 1,
    "SQL": "SELECT a.id, a.name, b.description FROM table_a a JOIN table_b b ON a.id = b.a_id WHERE a.active = 1",
    "REFRESH_INTERVAL": 300
}
```

- **`VIRTUAL_COLLECTION`**: Marks collection as virtual (read-only)
- **`SQL`**: Custom SQL query for data retrieval
- **`REFRESH_INTERVAL`**: Data refresh interval in seconds

### Data Table Configuration

```json
{
    "DATA_TABLE_SCROLL_HEIGHT": "calc(100vh - 250px)",
    "PAGINATION_SIZE": 25,
    "ENABLE_SEARCH": 1,
    "QUICK_FILTERS": ["status", "category"]
}
```

- **`DATA_TABLE_SCROLL_HEIGHT`**: Table container height
- **`PAGINATION_SIZE`**: Records per page
- **`ENABLE_SEARCH`**: Enable global search
- **`QUICK_FILTERS`**: Fields available for quick filtering

## Integration Properties

### API and External Integration

```json
{
    "API_FIELD": {
        "fieldtype": "textfield",
        "api_source": {
            "endpoint": "/api/external/data",
            "method": "GET",
            "headers": {"Authorization": "Bearer {token}"}
        },
        "sync_on_change": 1
    }
}
```

- **`api_source`**: External API configuration for field data
- **`sync_on_change`**: Trigger sync when field value changes

### Workflow Integration

```json
{
    "WORKFLOW_FIELD": {
        "fieldtype": "select",
        "workflow_state": 1,
        "transitions": {
            "PENDING": ["APPROVED", "REJECTED"],
            "APPROVED": ["COMPLETED"],
            "REJECTED": ["PENDING"]
        }
    }
}
```

- **`workflow_state`**: Marks field as workflow state controller
- **`transitions`**: Allowed state transitions

## Performance and Caching Properties

### Caching Configuration

```json
{
    "CACHED_FIELD": {
        "fieldtype": "select",
        "cache_results": 1,
        "cache_duration": 3600,
        "preload_data": 1
    }
}
```

- **`cache_results`**: Cache field options/data
- **`cache_duration`**: Cache expiration in seconds
- **`preload_data`**: Load data when form initializes

### Search and Indexing

```json
{
    "SEARCHABLE_FIELD": {
        "fieldtype": "textfield",
        "search_index": 1,
        "search_weight": 5,
        "fuzzy_search": 1
    }
}
```

- **`search_index`**: Include field in search indexing
- **`search_weight`**: Field importance in search results (1-10)
- **`fuzzy_search`**: Enable fuzzy/partial matching

## Best Practices

### Performance Optimization
- Use `in_list_view: 0` for fields not needed in list views
- Set appropriate `maxlength` to optimize database storage
- Use `preload_data: 1` judiciously for frequently accessed select options

### User Experience
- Provide meaningful `label` values for all fields
- Use `sub_labels` for additional context in select fields
- Implement appropriate `default` values to minimize user input

### Data Integrity
- Always set `required: 1` for essential fields
- Use `unique: 1` for fields that must be unique
- Implement `validation` patterns for format enforcement

### Security
- Use `restrict_modify: 1` for sensitive fields that shouldn't change
- Implement role-based `permissions` for sensitive data
- Use `readonly: 1` instead of `disabled: 1` when field value is important

---

These advanced field properties provide comprehensive control over CAPPS application behavior, enabling sophisticated form designs, data validation, user interactions, and system integrations while maintaining performance and security.