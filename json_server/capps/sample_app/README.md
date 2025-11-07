# Sample CAPPS Application

A comprehensive sample application demonstrating CAPPS framework features including schema design, form events, and list customization.

## Directory Structure

```
sample_app/
├── config.json              # Module configuration
├── en.json                  # Locale translations
├── README.md               # This file
└── customers/              # Customer collection
    ├── schema.json         # Collection schema definition
    ├── form.js            # Form event handlers
    ├── list.js            # List view customization
    └── README.md          # Collection-specific documentation
```

## Quick Start

### 1. Copy to Your Application

Copy this entire `sample_app` directory to your CAPPS application:

**For guinea-pig application:**
```
D:\credence\Servers\Funds\Apps\capps-guinea-pig\rest\collection\sample_app\
```

**For other applications:**
```
{your_app_path}/rest/collection/sample_app/
```

### 2. Create Database Table

Execute the SQL in `customers/README.md` to create the CUSTOMERS table.

### 3. Access the Collection

Navigate to: `http://localhost:8888/#/collection/sample_app/customers`

## What This Sample Demonstrates

### Schema Features (schema.json)
- ✅ Multiple field types (text, email, date, select, checkbox, etc.)
- ✅ Field validation (required, unique, maxlength)
- ✅ Layout control (sections, column breaks)
- ✅ List view configuration
- ✅ Filter configuration (standard & quick filters)
- ✅ Default values and readonly fields
- ✅ Amount/currency fields with precision
- ✅ Audit fields (created/updated tracking)

### Form Events (form.js)
- ✅ `_onLoadEvent` - Form initialization
- ✅ `_onBeforeSave` - Pre-save validation
- ✅ `_afterFormSubmit` - Post-save operations
- ✅ Field change handlers (CUSTOMER_TYPE, EMAIL, etc.)
- ✅ Custom buttons with conditional visibility
- ✅ Dynamic field visibility/enabled state
- ✅ Real-time validation
- ✅ Duplicate checking
- ✅ Utility functions

### List Customization (list.js)
- ✅ Column formatters (colors, icons, badges)
- ✅ Bulk actions (buttonList)
- ✅ Row actions (buttonColumns)
- ✅ Conditional button visibility
- ✅ Currency formatting
- ✅ Status indicators
- ✅ Custom row styling
- ✅ Modal dialogs
- ✅ Confirmations and alerts

## Use Cases Covered

1. **Form Validation**: Email format, phone number validation
2. **Conditional Logic**: VIP customers get auto-approval
3. **Dynamic UI**: Fields show/hide based on customer type
4. **Bulk Operations**: Activate/deactivate multiple records
5. **Per-Row Actions**: Send email, toggle VIP status
6. **Data Formatting**: Currency, dates, status badges
7. **User Feedback**: Toasts, alerts, confirmations
8. **API Integration**: REST calls for CRUD operations

## Learning Path

1. **Start Here**: Read `customers/README.md` for detailed documentation
2. **Schema**: Study `customers/schema.json` to understand field types
3. **Form Logic**: Review `customers/form.js` for event handlers
4. **List Features**: Explore `customers/list.js` for customization
5. **Experiment**: Modify and test different features

## Next Steps

After understanding this sample:

1. Create your own collections following this pattern
2. Customize form events for your business logic
3. Add RPC functions for complex operations
4. Implement event hooks for background processing
5. Create virtual collections for read-only data
6. Add child collections (parent-child relationships)

## Support Files

- **config.json**: Module metadata
- **en.json**: Locale translations for fields and values

## Tips

- Always validate user input in `_onBeforeSave`
- Use `frm.set_value()` to update form fields programmatically
- Throw errors in `_onBeforeSave` to prevent saving
- Use `loader: false` for background API calls
- Filter records in bulk operations before processing
- Provide user feedback with toasts/alerts
- Use conditional visibility for better UX

## Additional Resources

See CAPPS documentation at `/docs/` for:
- CAPPS Architecture
- REST API Reference
- RPC API Reference
- Form.js API Guide
- List.js API Guide
- Schema Configuration Guide
