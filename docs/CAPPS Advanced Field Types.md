# CAPPS Advanced Field Types Documentation

This document covers advanced field types and configurations available in the CAPPS framework that extend beyond the basic field types.

## Expression Builder Field

The Expression Builder field provides users with an advanced text area that supports formula/expression building with autocomplete suggestions.

### Configuration

```json
{
    "FIELD_NAME": {
        "fieldtype": "textarea",
        "expression_builder": 1,
        "suggestions": ["VARIABLE1", "VARIABLE2", "FUNCTION_NAME"],
        "rows": 3,
        "max-rows": 6
    }
}
```

### Parameters

- **`expression_builder`** (number): Set to `1` to enable expression builder mode
- **`suggestions`** (array): Array of strings that will appear as autocomplete suggestions
- **`rows`** (number): Initial number of rows for the textarea
- **`max-rows`** (number): Maximum number of rows the textarea can expand to

### Features

- **Autocomplete**: As users type, suggestions appear based on the configured suggestion list
- **Formula Support**: Users can build complex expressions and formulas
- **Syntax Highlighting**: Enhanced visual feedback for expression building
- **Auto-expansion**: Textarea automatically expands as content grows

### Example Usage

```json
{
    "CALCULATION_FORMULA": {
        "fieldtype": "textarea",
        "label": "Calculation Formula",
        "expression_builder": 1,
        "suggestions": [
            "AMOUNT",
            "TAX_RATE", 
            "DISCOUNT_PERCENTAGE",
            "SUM()",
            "AVG()",
            "COUNT()",
            "IF()",
            "ROUND()"
        ],
        "rows": 4,
        "max-rows": 8,
        "required": 1
    }
}
```

**User Experience:**
Users can type expressions like `SUM(AMOUNT * (1 - DISCOUNT_PERCENTAGE/100))` with autocomplete assistance.

## Command Palette Field

The Command Palette field provides a textarea with a command palette interface, allowing users to insert predefined commands or actions.

### Configuration

```json
{
    "FIELD_NAME": {
        "fieldtype": "textarea", 
        "command_palette": 1,
        "commands": [
            {
                "value": "Command text to insert",
                "name": "Display name",
                "category": "Category Name",
                "desc": "Command description"
            }
        ],
        "rows": 3,
        "max-rows": 6
    }
}
```

### Parameters

- **`command_palette`** (number): Set to `1` to enable command palette mode
- **`commands`** (array): Array of command objects with the following properties:
  - **`value`** (string): The text that will be inserted when command is selected
  - **`name`** (string): Display name shown in the palette
  - **`category`** (string): Category for grouping commands
  - **`desc`** (string): Description of what the command does

### Features

- **Quick Command Access**: Press `Ctrl+Space` or `/` to open the command palette
- **Categorized Commands**: Commands are organized by categories
- **Search/Filter**: Type to filter commands by name or category
- **Keyboard Navigation**: Navigate commands using arrow keys
- **Command Insertion**: Selected commands are inserted at cursor position

### Example Usage

```json
{
    "ACTION_SCRIPT": {
        "fieldtype": "textarea",
        "label": "Action Script",
        "command_palette": 1,
        "commands": [
            {
                "value": "capps.ui.alert({ message: 'Success!', variant: 'success' });",
                "name": "Show Success Alert",
                "category": "UI Actions",
                "desc": "Display a success message to the user"
            },
            {
                "value": "capps.rest.myapp.collection.read({ filter: [] });",
                "name": "Read Collection Data",
                "category": "Data Operations", 
                "desc": "Fetch data from a collection"
            },
            {
                "value": "if (condition) {\n    // action\n}",
                "name": "If Condition",
                "category": "Logic",
                "desc": "Conditional logic block"
            },
            {
                "value": "for (let item of items) {\n    // process item\n}",
                "name": "For Loop",
                "category": "Logic",
                "desc": "Iterate through items"
            },
            {
                "value": "try {\n    // code\n} catch (error) {\n    console.error(error);\n}",
                "name": "Try-Catch Block",
                "category": "Error Handling",
                "desc": "Error handling wrapper"
            }
        ],
        "rows": 8,
        "max-rows": 20,
        "required": 0
    }
}
```

### Command Palette UI

The command palette appears as a floating dropdown with:
- **Categories** on the left sidebar
- **Commands list** in the main area
- **Command description** at the bottom
- **Search bar** at the top

### Usage Patterns

#### Template Commands
```json
{
    "commands": [
        {
            "value": "{{CUSTOMER_NAME}} - {{ORDER_ID}}",
            "name": "Customer Order Template",
            "category": "Templates",
            "desc": "Insert customer order template"
        }
    ]
}
```

#### Code Snippets
```json
{
    "commands": [
        {
            "value": "const result = await capps.rest.{{APP_NAME}}.{{COLLECTION}}.create({\n    data: {\n        // add fields here\n    }\n});",
            "name": "Create Record",
            "category": "CAPPS API",
            "desc": "Create a new record in a collection"
        }
    ]
}
```

#### SQL Snippets
```json
{
    "commands": [
        {
            "value": "SELECT * FROM {{TABLE_NAME}} WHERE {{CONDITION}}",
            "name": "Basic Select",
            "category": "SQL",
            "desc": "Basic SQL SELECT statement"
        }
    ]
}
```

## Best Practices

### Expression Builder
1. **Meaningful Suggestions**: Include relevant variables, functions, and operators
2. **Contextual Help**: Use suggestions that make sense for the specific use case
3. **Testing**: Always validate expressions before saving
4. **Documentation**: Provide help text explaining available functions

### Command Palette  
1. **Categorization**: Group related commands for better organization
2. **Clear Naming**: Use descriptive command names and descriptions
3. **Common Patterns**: Include frequently used code patterns
4. **Template Placeholders**: Use `{{PLACEHOLDER}}` for values users need to replace

### Performance Considerations
- Both field types are client-side enhanced, so they don't impact server performance
- Large suggestion/command lists may affect initial load time
- Consider lazy loading for extensive command sets

## Integration with Forms

Both field types work seamlessly with CAPPS form validation and submission:

```javascript
// In form.js
capps.ui.my_collection.form = {
    _onBeforeSave: async function(frm) {
        // Validate expression syntax
        const formula = frm.doc.CALCULATION_FORMULA;
        if (formula && !isValidExpression(formula)) {
            capps.ui.alert({
                message: "Invalid expression syntax", 
                variant: "danger"
            });
            return false;
        }
    }
}
```

---

These advanced field types provide powerful user experience enhancements while maintaining the simplicity of the CAPPS framework configuration approach.