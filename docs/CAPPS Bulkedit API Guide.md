# CAPPS Bulkedit API Guide

The CAPPS Bulkedit API provides powerful bulk operations capabilities with scope-based conditional validation. This guide covers everything you need to know about implementing and using bulkedit operations effectively.

## Table of Contents

1. [Overview](#overview)
2. [Scope-Based Architecture](#scope-based-architecture)
3. [API Reference](#api-reference)
4. [Scope Implementation Patterns](#scope-implementation-patterns)
5. [Client-Side Integration](#client-side-integration)
6. [Error Handling](#error-handling)
7. [Performance Considerations](#performance-considerations)
8. [Security Best Practices](#security-best-practices)
9. [Advanced Use Cases](#advanced-use-cases)
10. [Troubleshooting](#troubleshooting)

## Overview

The CAPPS Bulkedit API enables updating multiple records simultaneously with scope-based conditional validation. Unlike standard update operations that apply the same logic to all records, bulkedit allows developers to define different validation rules and business logic for different types of bulk operations.

### Key Features

- **Scope-based validation**: Different validation rules for different operation types
- **Conditional business logic**: Server-side logic specific to each scope
- **Multiple operation types**: Support for various bulk operations on the same collection
- **Error granularity**: Detailed error reporting for individual records
- **Transaction safety**: Atomic operations with rollback capabilities
- **Performance optimization**: Efficient bulk processing for large datasets

## Scope-Based Architecture

### What is a Scope?

A **scope** is a developer-defined string parameter that identifies the type of bulk operation being performed. It serves as a context identifier that allows the server-side logic to apply appropriate validation rules and business processes.

### Why Use Scopes?

1. **Conditional Validation**: Different operations require different validation rules
2. **Business Logic Separation**: Keep different workflows logically separated
3. **Permission Control**: Different scopes can have different permission requirements
4. **Audit Trail**: Track different types of operations separately
5. **Flexibility**: Easy to add new bulk operation types without changing existing code

### Scope Design Principles

- **Descriptive**: Scope names should clearly indicate the operation type
- **Consistent**: Use consistent naming conventions across your application
- **Granular**: Create specific scopes for distinct business operations
- **Hierarchical**: Consider using naming patterns like `module_operation` for organization

## API Reference

### JavaScript API

```javascript
capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.bulkedit({
    scope: string,        // Required: Operation scope identifier
    data: Array<Object>   // Required: Array of records to update
})
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scope` | string | Yes | Developer-defined operation scope |
| `data` | Array<Object> | Yes | Array of records with updates |

### REST Endpoint

```http
POST /NREST/{appname}/{collectionname}/bulkedit
Content-Type: application/json

{
    "scope": "operation_scope",
    "data": [
        { "ID": 1, "field": "value" },
        { "ID": 2, "field": "value" }
    ]
}
```

### Response Format

**Success Response:**
```json
{
    "status": "success",
    "message": "Bulk operation completed successfully",
    "data": [...],
    "affected_records": 5,
    "scope": "operation_scope"
}
```

**Error Response:**
```json
{
    "status": "unsuccess",
    "error": "Validation failed for scope 'operation_scope'",
    "scope": "operation_scope",
    "details": {
        "failed_records": [
            {
                "ID": 1,
                "error": "Permission denied",
                "field": "STATUS"
            }
        ]
    }
}
```

## Scope Implementation Patterns

### 1. Status Transition Scopes

Use different scopes for different status transitions to enforce proper workflow rules.

```javascript
// Order completion
capps.rest.sales.orders.bulkedit({
    scope: "complete_orders",
    data: [
        { ID: 1, STATUS: "COMPLETED", COMPLETION_DATE: "2024-01-15" },
        { ID: 2, STATUS: "COMPLETED", COMPLETION_DATE: "2024-01-15" }
    ]
})

// Order cancellation (different validation rules)
capps.rest.sales.orders.bulkedit({
    scope: "cancel_orders",
    data: [
        { ID: 3, STATUS: "CANCELLED", CANCELLATION_REASON: "Customer request" },
        { ID: 4, STATUS: "CANCELLED", CANCELLATION_REASON: "Out of stock" }
    ]
})
```

### 2. Approval Workflow Scopes

Different approval levels can have different scopes with specific validation requirements.

```javascript
// Level 1 approval
capps.rest.finance.expenses.bulkedit({
    scope: "level1_approve",
    data: [
        { ID: 101, APPROVAL_L1: "APPROVED", APPROVED_BY_L1: "manager123" }
    ]
})

// Level 2 approval (requires different permissions)
capps.rest.finance.expenses.bulkedit({
    scope: "level2_approve", 
    data: [
        { ID: 101, APPROVAL_L2: "APPROVED", APPROVED_BY_L2: "director456" }
    ]
})
```

### 3. Department/Role-Based Scopes

Different departments might have different validation rules for the same collection.

```javascript
// HR salary updates
capps.rest.company.employees.bulkedit({
    scope: "hr_salary_update",
    data: [
        { 
            ID: 1, 
            SALARY: 75000, 
            EFFECTIVE_DATE: "2024-02-01",
            APPROVED_BY_HR: "hr_manager"
        }
    ]
})

// Admin profile updates
capps.rest.company.employees.bulkedit({
    scope: "admin_profile_update",
    data: [
        { 
            ID: 1, 
            DEPARTMENT: "Engineering",
            LOCATION: "New York",
            UPDATED_BY_ADMIN: "admin_user"
        }
    ]
})
```

### 4. Batch Processing Scopes

For large-scale data processing operations.

```javascript
// Data migration scope
capps.rest.system.records.bulkedit({
    scope: "data_migration",
    data: migrationData
})

// Data cleanup scope
capps.rest.system.records.bulkedit({
    scope: "data_cleanup",
    data: cleanupData
})
```

## Client-Side Integration

### Basic Implementation Pattern

```javascript
// In your list.js file
capps.ui.<<COLLECTION>>.list = {
    CUSTOM_ACTION: async function (list) {
        const selectedRecords = list.selectedRecords;
        
        // 1. Validate selection
        if (!selectedRecords.length) {
            return capps.ui.alert({
                message: "Please select at least one record.",
                variant: "warning"
            });
        }
        
        // 2. Get user confirmation (for critical operations)
        const confirm = await capps.ui.confirm({
            message: `Perform action on ${selectedRecords.length} records?`
        });
        
        if (!confirm) return;
        
        // 3. Execute bulkedit with appropriate scope
        const response = await capps.rest.<<APP>>.<<COLLECTION>>.bulkedit({
            scope: "your_scope_name",
            data: selectedRecords.map(record => ({
                ID: record.ID,
                // Map required fields based on scope
                FIELD: "value"
            }))
        });
        
        // 4. Handle response
        if (response?.status === "success") {
            capps.ui.alert({
                message: `${response.affected_records} records updated successfully`,
                variant: "success"
            });
            capps.ui.showProcessProgress({
                processName: response.process_id,
            }); // Refresh the list view
        } else {
            capps.ui.alert({
                message: response?.error || "Operation failed",
                variant: "danger"
            });
        }
    }
}
```

### Advanced User Input Handling

```javascript
capps.ui.projects.list = {
    BULK_ASSIGN_PRIORITY: async function (list) {
        const selectedRecords = list.selectedRecords;
        
        if (!selectedRecords.length) {
            return capps.ui.alert({
                message: "Please select projects to update priority.",
                variant: "warning"
            });
        }
        
        // Get priority from user
        // Note: capps.ui.select is not available, use confirm for simple selection
        const confirmed = await capps.ui.confirm({
            title: "Set Priority",
            message: "Select priority level for selected projects:",
            options: [
                { value: "CRITICAL", label: "🔴 Critical" },
                { value: "HIGH", label: "🟠 High" },
                { value: "MEDIUM", label: "🟡 Medium" },
                { value: "LOW", label: "🟢 Low" }
            ]
        });
        
        if (!priority) return;
        
        // Get justification for high priority items
        let justification = "";
        if (priority === "CRITICAL" || priority === "HIGH") {
            // Note: capps.ui.prompt is not available, use confirm for simple prompts
        const needsJustification = await capps.ui.confirm({
                title: "Justification Required",
                message: `Please provide justification for ${priority} priority:`,
                multiline: true
            });
            
            if (!justification) return;
        }
        
        const response = await capps.rest.management.projects.bulkedit({
            scope: "priority_assignment",
            data: selectedRecords.map(record => ({
                ID: record.ID,
                PRIORITY: priority,
                PRIORITY_JUSTIFICATION: justification,
                PRIORITY_SET_DATE: new Date().toISOString(),
                PRIORITY_SET_BY: "current_user"
            }))
        });
        
        if (response?.status === "success") {
            capps.ui.alert({
                message: `Priority updated to ${priority} for ${response.affected_records} projects`,
                variant: "success"
            });
            capps.ui.showProcessProgress({
                processName: response.process_id,
            });
        }
    }
}
```

### Progress Tracking for Large Operations

```javascript
capps.ui.inventory.list = {
    BULK_PRICE_UPDATE: async function (list) {
        const selectedRecords = list.selectedRecords;
        
        if (selectedRecords.length > 1000) {
            capps.ui.alert({
                message: "Large bulk operation detected. This may take a while...",
                variant: "info"
            });
            
            // Show progress indicator
            const progressId = capps.ui.showProgress({
                title: "Updating Prices",
                message: `Processing ${selectedRecords.length} records...`
            });
            
            try {
                const response = await capps.rest.inventory.products.bulkedit({
                    scope: "bulk_price_update",
                    data: selectedRecords
                });
                
                capps.ui.hideProgress(progressId);
                
                if (response?.status === "success") {
                    capps.ui.alert({
                        message: `Price updated for ${response.affected_records} products`,
                        variant: "success"
                    });
                    capps.ui.showProcessProgress({
                processName: response.process_id,
            });
                }
            } catch (error) {
                capps.ui.hideProgress(progressId);
                capps.ui.alert({
                    message: "Price update failed: " + error.message,
                    variant: "danger"
                });
            }
        }
    }
}
```

## Error Handling

### Scope-Specific Error Handling

```javascript
const handleBulkeditResponse = (response, scope, recordCount) => {
    if (response?.status === "unsuccess") {
        // Handle scope-specific errors
        switch (scope) {
            case "authorize":
                if (response.error?.includes("permission")) {
                    capps.ui.alert({
                        title: "Authorization Error",
                        message: "You don't have permission to authorize these records",
                        variant: "danger"
                    });
                } else if (response.error?.includes("workflow")) {
                    capps.ui.alert({
                        title: "Workflow Error", 
                        message: "Records are not in the correct state for authorization",
                        variant: "warning"
                    });
                }
                break;
                
            case "batch_approve":
                if (response.details?.failed_records?.length > 0) {
                    const failedCount = response.details.failed_records.length;
                    capps.ui.alert({
                        title: "Partial Failure",
                        message: `${failedCount} of ${recordCount} records failed approval. Check individual record errors.`,
                        variant: "warning"
                    });
                    
                    // Show detailed errors
                    console.table(response.details.failed_records);
                }
                break;
                
            default:
                capps.ui.alert({
                    message: response.error || "Bulk operation failed",
                    variant: "danger"
                });
        }
        return false;
    }
    
    return true; // Success
}

// Usage
const response = await capps.rest.myapp.orders.bulkedit({
    scope: "authorize",
    data: selectedRecords
});

if (handleBulkeditResponse(response, "authorize", selectedRecords.length)) {
    // Handle success
    capps.ui.alert({
        message: `${response.affected_records} records authorized successfully`,
        variant: "success"
    });
    list.refresh();
}
```

### Retry Mechanism

```javascript
const bulkeditWithRetry = async (config, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await capps.rest[config.app][config.collection].bulkedit({
                scope: config.scope,
                data: config.data
            });
            
            if (response?.status === "success") {
                return response;
            } else if (response?.status === "unsuccess") {
                // Don't retry validation errors
                if (response.error?.includes("validation") || 
                    response.error?.includes("permission")) {
                    throw new Error(response.error);
                }
                lastError = new Error(response.error);
            }
        } catch (error) {
            lastError = error;
            
            if (attempt < maxRetries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, attempt) * 1000)
                );
            }
        }
    }
    
    throw lastError;
}
```

## Performance Considerations

### Batch Size Optimization

```javascript
const optimizedBulkedit = async (allRecords, scope, batchSize = 100) => {
    const batches = [];
    
    // Split records into batches
    for (let i = 0; i < allRecords.length; i += batchSize) {
        batches.push(allRecords.slice(i, i + batchSize));
    }
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    // Process batches sequentially to avoid overwhelming the server
    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        try {
            const response = await capps.rest.myapp.collection.bulkedit({
                scope: scope,
                data: batch
            });
            
            if (response?.status === "success") {
                successCount += response.affected_records || batch.length;
                results.push({ 
                    batch: i + 1, 
                    status: "success", 
                    count: response.affected_records 
                });
            } else {
                errorCount += batch.length;
                results.push({ 
                    batch: i + 1, 
                    status: "error", 
                    error: response.error 
                });
            }
            
            // Update progress
            capps.ui.updateProgress(`Processed batch ${i + 1} of ${batches.length}`);
            
        } catch (error) {
            errorCount += batch.length;
            results.push({ 
                batch: i + 1, 
                status: "error", 
                error: error.message 
            });
        }
    }
    
    return {
        total: allRecords.length,
        success: successCount,
        errors: errorCount,
        batches: results
    };
}
```

### Memory Management

```javascript
const processLargeDataset = async (dataGenerator, scope) => {
    const batchSize = 50;
    let batch = [];
    let totalProcessed = 0;
    
    for await (const record of dataGenerator) {
        batch.push(record);
        
        if (batch.length >= batchSize) {
            // Process current batch
            await processBatch(batch, scope);
            totalProcessed += batch.length;
            
            // Clear batch to free memory
            batch = [];
            
            // Optional: Add delay to prevent server overload
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Process remaining records
    if (batch.length > 0) {
        await processBatch(batch, scope);
        totalProcessed += batch.length;
    }
    
    return totalProcessed;
}
```

## Security Best Practices

### Input Validation

```javascript
const validateBulkeditInput = (scope, data) => {
    const validations = {
        "authorize": {
            requiredFields: ["ID"],
            maxRecords: 100,
            allowedRoles: ["AUTHORIZER", "ADMIN"]
        },
        "salary_update": {
            requiredFields: ["ID", "SALARY", "EFFECTIVE_DATE"],
            maxRecords: 10,
            allowedRoles: ["HR_MANAGER", "ADMIN"],
            customValidation: (record) => {
                return record.SALARY > 0 && record.SALARY < 1000000;
            }
        }
    };
    
    const config = validations[scope];
    if (!config) {
        throw new Error(`Invalid scope: ${scope}`);
    }
    
    // Check record count
    if (data.length > config.maxRecords) {
        throw new Error(`Too many records. Maximum allowed: ${config.maxRecords}`);
    }
    
    // Check required fields
    for (const record of data) {
        for (const field of config.requiredFields) {
            if (!record[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // Custom validation
        if (config.customValidation && !config.customValidation(record)) {
            throw new Error(`Validation failed for record ID: ${record.ID}`);
        }
    }
    
    return true;
}
```

### Audit Logging

```javascript
const auditedBulkedit = async (app, collection, scope, data) => {
    // Log operation start
    const auditId = await capps.audit.log({
        action: "BULKEDIT_START",
        scope: scope,
        collection: `${app}.${collection}`,
        recordCount: data.length,
        user: capps.session.currentUser
    });
    
    try {
        const response = await capps.rest[app][collection].bulkedit({
            scope: scope,
            data: data
        });
        
        // Log success
        await capps.audit.log({
            auditId: auditId,
            action: "BULKEDIT_SUCCESS",
            affectedRecords: response.affected_records
        });
        
        return response;
        
    } catch (error) {
        // Log failure
        await capps.audit.log({
            auditId: auditId,
            action: "BULKEDIT_ERROR",
            error: error.message
        });
        
        throw error;
    }
}
```

## Advanced Use Cases

### Conditional Field Updates

```javascript
// Different fields updated based on record state
capps.rest.inventory.products.bulkedit({
    scope: "smart_restock",
    data: selectedRecords.map(record => {
        const baseUpdate = { ID: record.ID };
        
        // Add fields based on current stock level
        if (record.CURRENT_STOCK < record.MIN_STOCK) {
            baseUpdate.REORDER_STATUS = "URGENT";
            baseUpdate.REORDER_QUANTITY = record.MAX_STOCK - record.CURRENT_STOCK;
        } else if (record.CURRENT_STOCK < record.OPTIMAL_STOCK) {
            baseUpdate.REORDER_STATUS = "NORMAL";
            baseUpdate.REORDER_QUANTITY = record.OPTIMAL_STOCK - record.CURRENT_STOCK;
        } else {
            baseUpdate.REORDER_STATUS = "NO_ACTION";
        }
        
        return baseUpdate;
    })
})
```

### Hierarchical Operations

```javascript
// Update parent and child records in sequence
const updateProjectHierarchy = async (parentRecords) => {
    // First update parent projects
    const parentResponse = await capps.rest.pm.projects.bulkedit({
        scope: "parent_status_update",
        data: parentRecords.map(p => ({
            ID: p.ID,
            STATUS: "IN_PROGRESS",
            START_DATE: new Date().toISOString()
        }))
    });
    
    if (parentResponse?.status === "success") {
        // Then update child tasks
        const childTasks = parentRecords.flatMap(p => p.CHILD_TASKS || []);
        
        if (childTasks.length > 0) {
            await capps.rest.pm.tasks.bulkedit({
                scope: "child_activation",
                data: childTasks.map(t => ({
                    ID: t.ID,
                    STATUS: "ACTIVE",
                    PARENT_STATUS: "IN_PROGRESS"
                }))
            });
        }
    }
}
```

### Cross-Collection Updates

```javascript
// Update related records in different collections
const processOrderShipment = async (orderIds) => {
    // Update orders
    const orderResponse = await capps.rest.sales.orders.bulkedit({
        scope: "mark_shipped",
        data: orderIds.map(id => ({
            ID: id,
            STATUS: "SHIPPED",
            SHIP_DATE: new Date().toISOString()
        }))
    });
    
    if (orderResponse?.status === "success") {
        // Update inventory
        const inventoryUpdates = await getInventoryUpdatesForOrders(orderIds);
        
        await capps.rest.inventory.products.bulkedit({
            scope: "shipment_deduction",
            data: inventoryUpdates
        });
        
        // Create shipping notifications
        await capps.rest.notifications.messages.bulkedit({
            scope: "shipping_notifications",
            data: orderIds.map(id => ({
                ORDER_ID: id,
                TYPE: "SHIPPING_CONFIRMATION",
                STATUS: "PENDING"
            }))
        });
    }
}
```

## Troubleshooting

### Common Issues

1. **Scope Not Found**
   - Error: `Invalid scope: 'unknown_scope'`
   - Solution: Verify scope name matches server-side implementation

2. **Permission Denied**
   - Error: `User lacks permission for scope 'restricted_scope'`
   - Solution: Check user roles and scope-specific permissions

3. **Validation Errors**
   - Error: `Required field missing: 'FIELD_NAME'`
   - Solution: Ensure all required fields for the scope are provided

4. **Batch Size Issues**
   - Error: `Too many records in single request`
   - Solution: Implement batch processing with smaller chunks

### Debugging Tips

```javascript
// Enable debug logging for bulkedit operations
const debugBulkedit = async (config) => {
    console.group(`Bulkedit: ${config.scope}`);
    console.log("Records:", config.data.length);
    console.log("Sample data:", config.data.slice(0, 3));
    
    const startTime = performance.now();
    
    try {
        const response = await capps.rest[config.app][config.collection].bulkedit(config);
        
        const endTime = performance.now();
        console.log(`Operation completed in ${endTime - startTime}ms`);
        console.log("Response:", response);
        
        return response;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    } finally {
        console.groupEnd();
    }
}
```

### Testing Scope Behavior

```javascript
// Test different scopes with same data
const testScopes = async (testData) => {
    const scopes = ["test_scope_1", "test_scope_2", "test_scope_3"];
    const results = {};
    
    for (const scope of scopes) {
        try {
            const response = await capps.rest.test.collection.bulkedit({
                scope: scope,
                data: testData
            });
            
            results[scope] = {
                status: response.status,
                message: response.message || response.error,
                affectedRecords: response.affected_records
            };
        } catch (error) {
            results[scope] = {
                status: "error",
                message: error.message
            };
        }
    }
    
    console.table(results);
    return results;
}
```

## Conclusion

The CAPPS Bulkedit API with scope-based conditional validation provides a powerful and flexible way to handle bulk operations. By understanding and properly implementing scopes, developers can create robust bulk operations that maintain data integrity while providing excellent user experience.

Remember to:
- Use descriptive scope names
- Implement proper error handling
- Consider performance implications
- Follow security best practices
- Document your scopes and their requirements

For more information, see:
- [CAPPS REST API Reference](./CAPPS%20REST%20API%20Reference.md)
- [CAPPS APIS Guide](./CAPPS%20APIS.md)
- [CAPPS UI Framework](./CAPPS%20UI%20Framework.md)