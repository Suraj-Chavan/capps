# CAPPS REST API Reference

CAPPS framework automatically generates REST API endpoints for every collection defined in your application. These APIs provide standard CRUD operations and follow consistent patterns.

## API Route Structure

All CAPPS REST APIs follow this pattern:
```
https://127.0.0.1/NREST/{appname}/{collectionname}/{operation}
```

Where:
- `{appname}` is your application name
- `{collectionname}` is the collection name from your schema
- `{operation}` is the CRUD operation (read, create, update, delete)

## Standard CRUD Operations

### 1. Read Collection Data

Retrieve multiple records with filtering, sorting, and pagination options.

**JavaScript API:**
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

**REST Endpoint:**
```http
POST /NREST/{appname}/{collectionname}/read
Content-Type: application/json

{
    "filter": [
        {
            "field": "STATUS",
            "value": "ACTIVE",
            "asgn": "eq"
        }
    ],
    "sort": [
        {
            "field": "CREATED_ON",
            "order": "desc"
        }
    ],
    "limit": 50
}
```

**Filter Operators:**
- `eq` - Equal to
- `neq` - Not equal to
- `gt` - Greater than
- `gte` - Greater than or equal to
- `lt` - Less than
- `lte` - Less than or equal to
- `in` - Value is in array

### 2. Read Single Record by ID

Retrieve a specific record using its primary key.

**JavaScript API:**
```javascript
capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.read[<<ID>>]()
```

**REST Endpoint:**
```http
GET /NREST/{appname}/{collectionname}/read/{id}
```

**Example:**
```javascript
// Retrieve record with ID = 123
capps.rest.myapp.users.read[123]()
```

### 3. Update Record

Update an existing record by ID.

**JavaScript API:**
```javascript
// Note: If collection has multipart field then all keys will be sent in formData 
// with multipart formData.set(<<field>>, value) else in json wrapped inside data object
capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.update[<<ID>>]({ 
    data: {
        [field: string]: any  // Field-value pairs to update
    }
})
```

**REST Endpoint:**
```http
PUT /NREST/{appname}/{collectionname}/update/{id}
Content-Type: application/json

{
    "data": {
        "NAME": "Updated Name",
        "STATUS": "INACTIVE",
        "UPDATED_ON": "2023-12-01T10:00:00Z"
    }
}
```

**For Collections with File Fields:**
```http
PUT /NREST/{appname}/{collectionname}/update/{id}
Content-Type: multipart/form-data

field1=value1
field2=value2
file_field=@/path/to/file.pdf
```

### 4. Create Record

Create a new record in the collection.

**JavaScript API:**
```javascript
// Note: If collection has multipart field then all keys will be sent in formData 
// with multipart formData.set(<<field>>, value) else in json wrapped inside data object
capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.create({ 
    data: {
        [field: string]: any  // Field-value pairs for new record
    }
})
```

**REST Endpoint:**
```http
POST /NREST/{appname}/{collectionname}/create
Content-Type: application/json

{
    "data": {
        "NAME": "New Record",
        "EMAIL": "user@example.com",
        "STATUS": "ACTIVE"
    }
}
```

### 5. Delete Record

Delete a record by ID.

**JavaScript API:**
```javascript
capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.delete[<<ID>>]()
```

**REST Endpoint:**
```http
DELETE /NREST/{appname}/{collectionname}/delete/{id}
```

## Multipart Form Data Handling

When your collection contains file fields (fieldtype: "file"), CAPPS automatically switches to multipart form data for create and update operations.

**File Field Handling:**
```javascript
// For collections with file fields
capps.rest.myapp.documents.create({
    data: {
        TITLE: "Document Title",
        DESCRIPTION: "Document description",
        FILE_FIELD: fileObject, // File object from input[type="file"]
        STATUS: "ACTIVE"
    }
})
```

The framework automatically:
- Detects file fields in the schema
- Uses `FormData` instead of JSON
- Sets appropriate `Content-Type: multipart/form-data`
- Handles file upload and storage

## Response Format

All CAPPS REST APIs return standardized response format:

**Success Response:**
```json
{
    "status": "success",
    "data": [...], // Array of records for read operations
    "message": "Operation completed successfully",
    "count": 25 // Total count for read operations
}
```

**Error Response:**
```json
{
    "status": "error",
    "error": "Error message",
    "code": "ERROR_CODE",
    "details": {
        // Additional error details
    }
}
```

## Authentication

All CAPPS REST APIs require authentication. Include the authentication token in your requests:

**JavaScript (Automatic):**
```javascript
// Authentication is handled automatically by the CAPPS framework
// when using capps.rest.* methods
```

**Direct REST Calls:**
```http
GET /NREST/myapp/users/read
Authorization: Bearer your-auth-token
Cookie: _ticket=your-session-ticket
```

## Advanced Query Examples

### Complex Filtering
```javascript
capps.rest.myapp.orders.read({
    filter: [
        {
            field: "STATUS",
            value: ["PENDING", "PROCESSING"],
            asgn: "in"
        },
        {
            field: "CREATED_ON",
            value: "2023-01-01",
            asgn: "gte"
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
})
```

## Bulk Edit Operations

The bulkedit API enables updating multiple records simultaneously with scope-based conditional validation. The `scope` parameter allows developers to define different validation rules and business logic for different types of bulk operations on the server side.

### Overview

**JavaScript API:**
```javascript
capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.bulkedit({
    scope: string,        // Developer-defined scope for conditional validation
    data: Array<Object>   // Array of records to update
})
```

**REST Endpoint:**
```http
POST /NREST/{appname}/{collectionname}/bulkedit
Content-Type: application/json

{
    "scope": "operation_type",
    "data": [
        { "ID": 1, "field1": "value1" },
        { "ID": 2, "field2": "value2" }
    ]
}
```

### Scope Parameter

The `scope` parameter is a developer-defined value that enables:

1. **Different validation rules** for different bulk operations
2. **Conditional business logic** based on the operation type  
3. **Multiple bulkedit APIs** with specific validation per scope
4. **Server-side operation context** for complex workflows

The developer can use this scope value on the server side to write conditional validation logic for the particular scope, allowing different bulkedit operations to have different validation requirements and business rules.

### Common Scope Examples

#### 1. Status Updates
```javascript
capps.rest.myapp.orders.bulkedit({
    scope: "status_update",
    data: [
        { ID: 1, STATUS: "COMPLETED" },
        { ID: 2, STATUS: "COMPLETED" }, 
        { ID: 3, STATUS: "CANCELLED" }
    ]
})
```

#### 2. Authorization Workflow
```javascript
capps.rest.myapp.transactions.bulkedit({
    scope: "authorize", 
    data: [
        { ID: 101, STATUS: "AUTHORIZED", AUTHORIZED_BY: "user123" },
        { ID: 102, STATUS: "AUTHORIZED", AUTHORIZED_BY: "user123" }
    ]
})
```

#### 3. Batch Approval
```javascript
capps.rest.myapp.invoices.bulkedit({
    scope: "batch_approve",
    data: [
        { ID: 501, APPROVAL_STATUS: "APPROVED", APPROVED_DATE: "2024-01-15" },
        { ID: 502, APPROVAL_STATUS: "APPROVED", APPROVED_DATE: "2024-01-15" }
    ]
})
```

#### 4. Priority Assignment
```javascript
capps.rest.myapp.tasks.bulkedit({
    scope: "priority_assignment",
    data: [
        { ID: 301, PRIORITY: "HIGH", ASSIGNED_TO: "team_lead" },
        { ID: 302, PRIORITY: "MEDIUM", ASSIGNED_TO: "developer1" }
    ]
})
```

### Advanced Scope Usage

#### Conditional Field Requirements Based on Scope
```javascript
// Salary updates require additional approval fields
capps.rest.myapp.employees.bulkedit({
    scope: "salary_update",
    data: [
        { 
            ID: 1, 
            SALARY: 75000, 
            EFFECTIVE_DATE: "2024-02-01",
            APPROVED_BY: "hr_manager" // Required only for salary_update scope
        }
    ]
})

// Contact updates have different validation requirements  
capps.rest.myapp.employees.bulkedit({
    scope: "contact_update",
    data: [
        { 
            ID: 1, 
            EMAIL: "newemail@company.com", 
            PHONE: "+1234567890"
            // APPROVED_BY not required for contact updates
        }
    ]
})
```

#### Multiple Bulk Operations for Same Collection
```javascript
// Different scopes for different business operations on the same collection

// Scope for marking orders as shipped
capps.rest.myapp.orders.bulkedit({
    scope: "mark_shipped",
    data: [
        { ID: 1, STATUS: "SHIPPED", SHIPPED_DATE: "2024-01-15" },
        { ID: 2, STATUS: "SHIPPED", SHIPPED_DATE: "2024-01-15" }
    ]
})

// Scope for canceling orders (different validation rules)
capps.rest.myapp.orders.bulkedit({
    scope: "cancel_orders", 
    data: [
        { ID: 3, STATUS: "CANCELLED", CANCELLATION_REASON: "Customer request" },
        { ID: 4, STATUS: "CANCELLED", CANCELLATION_REASON: "Out of stock" }
    ]
})

// Scope for updating delivery addresses
capps.rest.myapp.orders.bulkedit({
    scope: "update_delivery",
    data: [
        { ID: 5, DELIVERY_ADDRESS: "New Address 1", UPDATED_BY: "customer_service" },
        { ID: 6, DELIVERY_ADDRESS: "New Address 2", UPDATED_BY: "customer_service" }
    ]
})
```

### Error Handling with Scopes

**Scope-Specific Error Response:**
```json
{
    "status": "unsuccess",
    "error": "Authorization failed for scope 'authorize'", 
    "scope": "authorize",
    "details": {
        "failed_records": [
            {
                "ID": 101,
                "error": "User lacks authorization permissions",
                "field": "AUTHORIZED_BY"
            }
        ]
    }
}
```

**Client-Side Error Handling:**
```javascript
const response = await capps.rest.myapp.orders.bulkedit({
    scope: "authorize",
    data: selectedRecords
});

if (response?.status === "unsuccess") {
    console.error(`Bulk ${response.scope} failed:`, response.error);
    
    // Handle scope-specific errors
    if (response.scope === "authorize" && response.details?.failed_records) {
        response.details.failed_records.forEach(record => {
            console.error(`Record ${record.ID}: ${record.error}`);
        });
    }
}
```

### Best Practices

1. **Descriptive Scope Names**: Use clear, descriptive scope names that indicate the operation type
2. **Consistent Scopes**: Use consistent scope naming across your application
3. **Documentation**: Document each scope's purpose and validation rules
4. **Error Handling**: Implement proper error handling for scope-specific failures
5. **User Permissions**: Consider user permissions when choosing appropriate scopes

### Integration with CAPPS UI

The CAPPS UI framework automatically handles bulkedit operations through custom list actions:

```javascript
// In list.js - Custom action with bulkedit
capps.ui.orders.list = {
    BULK_APPROVE: async function (list) {
        const selectedRecords = list.selectedRecords;
        
        if (!selectedRecords.length) {
            return capps.ui.alert({
                message: "Please select at least one record to approve.",
                variant: "danger"
            });
        }
        
        const response = await capps.rest.myapp.orders.bulkedit({
            scope: "batch_approve",
            data: selectedRecords.map(record => ({
                ID: record.ID,
                APPROVAL_STATUS: "APPROVED", 
                APPROVED_DATE: new Date().toISOString()
            }))
        });
        
        if (response?.status === "success") {
            capps.ui.alert({
                message: `${selectedRecords.length} records approved successfully`,
                variant: "success"
            });
            capps.ui.showProcessProgress({
                processName: response.process_id,
            }); // Refresh the list view
        } else {
            capps.ui.alert({
                message: response?.error || "Bulk approval failed",
                variant: "danger"
            });
        }
    }
}
```

## Error Handling

```javascript
try {
    const result = await capps.rest.myapp.users.create({
        data: {
            NAME: "John Doe",
            EMAIL: "john@example.com"
        }
    });
    
    if (result.status === "success") {
        console.log("User created:", result.data);
    } else {
        console.error("Creation failed:", result.error);
    }
} catch (error) {
    console.error("API call failed:", error);
}
```

## Integration with CAPPS UI

The CAPPS UI framework automatically uses these APIs for:
- Form submissions (create/update)
- List view data loading (read)
- Record deletion (delete)
- Remote select field data loading
- Bulk operations from list views

You don't need to manually call these APIs when using standard CAPPS UI components, but they're available for custom integrations and external systems.

## Custom API Extensions

You can extend the standard CRUD APIs by creating custom controller methods in your collection's `controller.js` file:

```javascript
// rest/collection/mycollection/controller.js
module.exports = {
    // Custom API endpoint: POST /NREST/myapp/mycollection/custom_operation
    custom_operation: async (req, res) => {
        // Your custom logic here
        res.json({
            status: "success",
            data: result
        });
    }
}
```

This creates additional endpoints following the pattern:
```
POST /NREST/{appname}/{collectionname}/{custom_method_name}
```