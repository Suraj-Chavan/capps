# CAPPS RPC API Reference

The CAPPS framework provides a comprehensive RPC (Remote Procedure Call) system that allows you to create and call custom business logic functions through plugins. RPC functions enable complex business operations, external integrations, and custom data processing that extends beyond standard CRUD operations.

## RPC Route Structure

All CAPPS RPC calls follow this pattern:
```
/RPC/{appname}/plugins/{plugin_name}/{function_name}
```

Where:
- `{appname}` is your application name
- `{plugin_name}` is the plugin file name (without .js extension)
- `{function_name}` is the exported function name from the plugin

## JavaScript RPC API

### Basic RPC Call Pattern

```javascript
capps.rpc.<<APP_NAME>>.<<PLUGIN_NAME>>.<<FUNCTION_NAME>>({
    // Function parameters as object
    param1: value1,
    param2: value2
    // ...additional parameters
})
```

**Returns:** Promise that resolves to the function's result

## Step-by-Step Example

Let's create a complete example showing how to create a plugin and call it via RPC.

### Step 1: Create Plugin File

Create a file in your application's plugins directory:

**File Location:** `myapp/plugins/Calculator.js`

```javascript
// myapp/plugins/Calculator.js

const dbutil = require('@frameworks-and-tools/dbutils')(config, global.db_conn_pool, global.logger);

/**
 * Simple addition function
 * @param {Object} data - Input parameters: {num1: number, num2: number}
 * @param {Object} session - User session object
 * @returns {Promise<Object>} - Result with sum
 */
async function addNumbers(data, session) {
    try {
        const { num1, num2 } = data;
        
        // Validate inputs
        if (typeof num1 !== 'number' || typeof num2 !== 'number') {
            return {
                status: 'validation_error',
                errors: ['Both num1 and num2 must be numbers'],
                error_code: 'INVALID_INPUT'
            };
        }
        
        const result = num1 + num2;
        
        return {
            status: 'success',
            data: {
                num1: num1,
                num2: num2,
                sum: result,
                operation: 'addition'
            },
            message: `Successfully added ${num1} + ${num2} = ${result}`
        };
        
    } catch (error) {
        global.logger.error(`Error in addNumbers: ${error.message}`);
        return {
            status: 'error',
            message: error.message,
            error_code: 'CALCULATION_ERROR'
        };
    }
}

/**
 * Get user's calculation history from database
 * @param {Object} data - Input parameters: {userId: string}
 * @param {Object} session - User session object
 * @returns {Promise<Object>} - User's calculation history
 */
async function getCalculationHistory(data, session) {
    try {
        const { userId } = data;
        
        const sql = `
            SELECT calculation_id, num1, num2, result, operation, created_at 
            FROM user_calculations 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC 
            LIMIT 10
        `;
        
        const history = await dbutil.execSQL(sql, { user_id: userId });
        
        return {
            status: 'success',
            data: {
                user_id: userId,
                calculations: history,
                total_calculations: history.length
            },
            message: 'Calculation history retrieved successfully'
        };
        
    } catch (error) {
        global.logger.error(`Error in getCalculationHistory: ${error.message}`);
        return {
            status: 'error',
            message: 'Failed to retrieve calculation history',
            error_code: 'HISTORY_RETRIEVAL_ERROR'
        };
    }
}

// Export functions to make them available via RPC
module.exports = {
    addNumbers,
    getCalculationHistory
};
```

### Step 2: Call Plugin Functions via RPC

Now you can call these functions from anywhere in your CAPPS application:

#### In Form Events (form.js)

```javascript
// myapp/rest/collection/math_operations/form.js

capps.ui.math_operations.form = {
    async CALCULATE_BUTTON(frm) {
        // Get values from form fields
        const num1 = current_form.NUMBER_1;
        const num2 = current_form.NUMBER_2;
        
        // Call the Calculator plugin's addNumbers function
        const result = await capps.rpc.myapp.Calculator.addNumbers({
            num1: parseFloat(num1),
            num2: parseFloat(num2)
        });
        
        if (result.status === 'success') {
            // Update form with result
            frm.set_value('RESULT', result.data.sum);
            frm.set_value('OPERATION_DETAILS', result.message);
            
            capps.ui.toast({
                message: result.message,
                type: 'success'
            });
        } else if (result.status === 'validation_error') {
            capps.ui.alert({
                title: 'Validation Error',
                message: result.errors.join('\n'),
                variant: 'warning'
            });
        } else {
            capps.ui.alert({
                title: 'Calculation Error',
                message: result.message,
                variant: 'danger'
            });
        }
    },
    
    async _onLoadEvent(frm) {
        // Load user's calculation history when form opens
        const userId = config.getSessionStorage().user_id();
        
        const historyResult = await capps.rpc.myapp.Calculator.getCalculationHistory({
            userId: userId
        });
        
        if (historyResult.status === 'success') {
            console.log('User calculation history:', historyResult.data.calculations);
            
            // Show history in a modal or populate a field
            if (historyResult.data.calculations.length > 0) {
                const lastCalculation = historyResult.data.calculations[0];
                frm.set_value('LAST_RESULT', lastCalculation.result);
            }
        }
    }
};
```

#### In List Actions (list.js)

```javascript
// myapp/rest/collection/math_operations/list.js

capps.ui.math_operations.list = {
    buttonList: [
        {
            key: 'bulk_calculate',
            label: 'Bulk Calculate',
            icon: 'pi pi-calculator',
            show: () => true,
            handler: async (list) => {
                const selectedRecords = list.selectedRecords;
                
                if (!selectedRecords.length) {
                    return capps.ui.alert({
                        message: 'Please select records to calculate',
                        variant: 'warning'
                    });
                }
                
                const results = [];
                
                // Process each selected record
                for (const record of selectedRecords) {
                    const calcResult = await capps.rpc.myapp.Calculator.addNumbers({
                        num1: record.NUMBER_1,
                        num2: record.NUMBER_2
                    });
                    
                    results.push({
                        record_id: record.ID,
                        calculation: calcResult
                    });
                }
                
                const successful = results.filter(r => r.calculation.status === 'success').length;
                
                capps.ui.toast({
                    message: `Bulk calculation completed: ${successful}/${results.length} successful`,
                    type: 'success'
                });
            }
        }
    ]
};
```

#### Direct API Call in Custom Code

```javascript
// Anywhere in your application code
async function performCalculation() {
    try {
        // Simple calculation
        const simpleResult = await capps.rpc.myapp.Calculator.addNumbers({
            num1: 25,
            num2: 17
        });
        
        console.log('Calculation result:', simpleResult);
        // Output: { status: 'success', data: { num1: 25, num2: 17, sum: 42, operation: 'addition' }, message: '...' }
        
        // Get user history
        const historyResult = await capps.rpc.myapp.Calculator.getCalculationHistory({
            userId: 'USER123'
        });
        
        console.log('User history:', historyResult.data.calculations);
        
    } catch (error) {
        console.error('RPC call failed:', error);
    }
}
```

### Step 3: Understanding the Connection

The connection between plugin file and RPC call:

```
Plugin File Path:    myapp/plugins/Calculator.js
                            ↓
RPC Call Pattern:    capps.rpc.myapp.Calculator.addNumbers()
                              ↑      ↑         ↑
                           app   plugin   function
                          name    name      name
```

**Key Points:**
1. **App Name**: `myapp` (your application folder name)
2. **Plugin Name**: `Calculator` (filename without .js extension)  
3. **Function Name**: `addNumbers` (exported function from the plugin)
4. **Parameters**: Object passed to the function as first parameter
5. **Session**: Automatically provided by CAPPS as second parameter

### More Example RPC Calls

```javascript
// Example calls matching real plugin functions

// From credbooks app, FUNDS plugin, isValidAmountExpression function
const validationResult = await capps.rpc.credbooks.FUNDS.isValidAmountExpression({
    amount: 1000,
    currency: "USD"
});

// From myapp, Calculator plugin, addNumbers function  
const mathResult = await capps.rpc.myapp.Calculator.addNumbers({
    num1: 10,
    num2: 5
});

// From hrms app, EmployeeManager plugin, validateEmployee function
const employeeValidation = await capps.rpc.hrms.EmployeeManager.validateEmployee({
    employeeId: "EMP001",
    validationType: "PROMOTION"
});
```

## Plugin Function Structure

### Basic Plugin Function

```javascript
// plugins/MyPlugin.js

const dbutil = require('@frameworks-and-tools/dbutils')(config, global.db_conn_pool, global.logger);

/**
 * Basic RPC function example
 * @param {Object} data - Input parameters from RPC call
 * @param {Object} session - User session with database connection and user info
 * @returns {Promise<Object>} - Result object with status and data
 */
async function simpleFunction(data, session) {
    try {
        const { inputValue } = data;
        
        // Perform business logic
        const result = inputValue * 2;
        
        return {
            status: 'success',
            data: {
                original: inputValue,
                doubled: result
            }
        };
    } catch (error) {
        global.logger.error(`Error in simpleFunction: ${error.message}`);
        return {
            status: 'error',
            message: error.message,
            error_code: 'SIMPLE_FUNCTION_ERROR'
        };
    }
}

module.exports = {
    simpleFunction
};
```

### Advanced Plugin Function with Database Operations

```javascript
// plugins/BusinessLogic.js

const dbutil = require('@frameworks-and-tools/dbutils')(config, global.db_conn_pool, global.logger);

/**
 * Process business transaction with database operations
 * @param {Object} data - Transaction data
 * @param {Object} session - User session
 * @returns {Promise<Object>} - Processing result
 */
async function processTransaction(data, session) {
    const { transactionId, amount, type, accountId } = data;
    
    try {
        // Start database transaction
        const connection = session.db_connection;
        await connection.execute('BEGIN');
        
        try {
            // Validate transaction
            const validation = await validateTransaction(data, session);
            if (validation.status !== 'success') {
                await connection.execute('ROLLBACK');
                return validation;
            }
            
            // Update account balance
            const updateBalanceSQL = `
                UPDATE accounts 
                SET balance = balance + :amount, 
                    last_updated = CURRENT_TIMESTAMP,
                    updated_by = :user_id
                WHERE account_id = :account_id
            `;
            
            await dbutil.execSQL(updateBalanceSQL, {
                amount: type === 'DEBIT' ? -amount : amount,
                account_id: accountId,
                user_id: session.user.user_id
            }, connection);
            
            // Log transaction
            const logSQL = `
                INSERT INTO transaction_log (
                    transaction_id, account_id, amount, 
                    transaction_type, created_by, created_at
                ) VALUES (
                    :transaction_id, :account_id, :amount, 
                    :transaction_type, :user_id, CURRENT_TIMESTAMP
                )
            `;
            
            await dbutil.execSQL(logSQL, {
                transaction_id: transactionId,
                account_id: accountId,
                amount: amount,
                transaction_type: type,
                user_id: session.user.user_id
            }, connection);
            
            // Commit transaction
            await connection.execute('COMMIT');
            
            return {
                status: 'success',
                data: {
                    transaction_id: transactionId,
                    processed_amount: amount,
                    transaction_type: type,
                    processed_at: new Date().toISOString()
                },
                message: 'Transaction processed successfully'
            };
            
        } catch (error) {
            await connection.execute('ROLLBACK');
            throw error;
        }
        
    } catch (error) {
        global.logger.error(`Transaction processing error: ${error.message}`, {
            transaction_id: transactionId,
            user_id: session.user.user_id,
            error_stack: error.stack
        });
        
        return {
            status: 'error',
            message: 'Transaction processing failed',
            error_code: 'TRANSACTION_PROCESSING_ERROR',
            details: {
                transaction_id: transactionId,
                error_type: error.name
            }
        };
    }
}

/**
 * Validate transaction data and business rules
 * @param {Object} data - Transaction data
 * @param {Object} session - User session
 * @returns {Promise<Object>} - Validation result
 */
async function validateTransaction(data, session) {
    const { amount, accountId, type } = data;
    
    // Validate amount
    if (!amount || amount <= 0) {
        return {
            status: 'validation_error',
            errors: ['Amount must be greater than zero'],
            error_code: 'INVALID_AMOUNT'
        };
    }
    
    // Check account exists and get current balance
    const accountSQL = `
        SELECT account_id, balance, status, account_type 
        FROM accounts 
        WHERE account_id = :account_id
    `;
    
    const accountResult = await dbutil.execSQL(accountSQL, { account_id: accountId });
    
    if (!accountResult || accountResult.length === 0) {
        return {
            status: 'validation_error',
            errors: ['Account not found'],
            error_code: 'ACCOUNT_NOT_FOUND'
        };
    }
    
    const account = accountResult[0];
    
    // Check account status
    if (account.status !== 'ACTIVE') {
        return {
            status: 'validation_error',
            errors: ['Account is not active'],
            error_code: 'ACCOUNT_INACTIVE'
        };
    }
    
    // Check sufficient balance for debit transactions
    if (type === 'DEBIT' && account.balance < amount) {
        return {
            status: 'validation_error',
            errors: ['Insufficient balance'],
            error_code: 'INSUFFICIENT_BALANCE',
            details: {
                available_balance: account.balance,
                requested_amount: amount
            }
        };
    }
    
    return {
        status: 'success',
        data: {
            account: account,
            validation_passed: true
        }
    };
}

module.exports = {
    processTransaction,
    validateTransaction
};
```

## RPC Response Format

All RPC functions should return a standardized response format:

### Success Response
```json
{
    "status": "success",
    "data": {
        // Function-specific result data
    },
    "message": "Optional success message",
    "metadata": {
        // Optional metadata like processing time, record counts, etc.
    }
}
```

### Error Response
```json
{
    "status": "error",
    "message": "Human-readable error message",
    "error_code": "SPECIFIC_ERROR_CODE",
    "details": {
        // Additional error context
    }
}
```

### Validation Error Response
```json
{
    "status": "validation_error",
    "errors": [
        "Field-specific error message 1",
        "Field-specific error message 2"
    ],
    "error_code": "VALIDATION_FAILED",
    "details": {
        // Validation-specific details
    }
}
```

## Direct REST API Calls

You can also call RPC functions directly using REST endpoints:

### POST Request Format
```http
POST /RPC/{appname}/plugins/{plugin_name}/{function_name}
Content-Type: application/json
Authorization: Bearer your-auth-token

{
    "param1": "value1",
    "param2": "value2"
}
```

### Example REST Call
```bash
curl -X POST \
  'https://your-server/RPC/myapp/plugins/BusinessLogic/processTransaction' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-token' \
  -d '{
    "transactionId": "TXN123",
    "amount": 5000,
    "type": "CREDIT",
    "accountId": "ACC001"
  }'
```

## RPC Usage in Forms

### Form Event Handler with RPC

```javascript
// In form.js
capps.ui.collection_name.form = {
    async _onBeforeSave(frm) {
        // Validate using RPC function
        const validationResult = await capps.rpc.myapp.ValidationPlugin.validateRecord({
            recordData: current_form,
            validationType: 'BEFORE_SAVE'
        });
        
        if (validationResult.status === 'validation_error') {
            // Show validation errors
            capps.ui.alert({
                title: 'Validation Error',
                message: validationResult.errors.join('\n'),
                variant: 'danger'
            });
            throw new Error('Validation failed');
        }
        
        // Process business logic if validation passes
        if (validationResult.status === 'success') {
            const processingResult = await capps.rpc.myapp.BusinessPlugin.processFormData({
                formData: current_form,
                userId: config.getSessionStorage().user_id()
            });
            
            if (processingResult.status === 'success') {
                // Update form with processed data
                Object.entries(processingResult.data.updatedFields).forEach(([field, value]) => {
                    frm.set_value(field, value);
                });
                
                capps.ui.toast({
                    message: 'Data processed successfully',
                    type: 'success'
                });
            }
        }
    },
    
    async CALCULATE_BUTTON(frm) {
        // Field event handler using RPC
        const calculationResult = await capps.rpc.myapp.CalculationPlugin.performCalculation({
            input1: current_form.INPUT_FIELD_1,
            input2: current_form.INPUT_FIELD_2,
            operation: current_form.OPERATION_TYPE
        });
        
        if (calculationResult.status === 'success') {
            frm.set_value('RESULT_FIELD', calculationResult.data.result);
            frm.set_value('CALCULATION_DETAILS', calculationResult.data.details);
        } else {
            capps.ui.alert({
                message: calculationResult.message,
                variant: 'danger'
            });
        }
    }
}
```

## RPC Usage in Lists

### List Action with RPC Processing

```javascript
// In list.js
capps.ui.collection_name.list = {
    buttonList: [
        {
            key: 'bulk_process',
            label: 'Bulk Process',
            icon: 'pi pi-cog',
            show: () => true,
            handler: async (list) => {
                const selectedRecords = list.selectedRecords;
                
                if (!selectedRecords.length) {
                    return capps.ui.alert({
                        message: 'Please select records to process',
                        variant: 'warning'
                    });
                }
                
                // Call RPC function for bulk processing
                const result = await capps.rpc.myapp.BulkProcessor.processBatchRecords({
                    records: selectedRecords.map(record => ({
                        id: record.ID,
                        data: record
                    })),
                    processType: 'BATCH_UPDATE',
                    userId: config.getSessionStorage().user_id()
                });
                
                if (result.status === 'success') {
                    capps.ui.toast({
                        message: `Successfully processed ${result.data.processed_count} records`,
                        type: 'success'
                    });
                    
                    // Refresh list view
                    capps.ui.refresh();
                } else {
                    capps.ui.alert({
                        title: 'Batch Processing Error',
                        message: result.message,
                        variant: 'danger'
                    });
                }
            }
        }
    ],
    
    buttonColumns: [
        {
            key: 'calculate_risk',
            label: 'Calculate Risk',
            icon: 'pi pi-calculator',
            show: (row) => row.STATUS === 'PENDING',
            handler: async (row, context) => {
                // Individual row processing via RPC
                const riskResult = await capps.rpc.myapp.RiskCalculator.calculateRiskScore({
                    recordId: row.ID,
                    recordData: row,
                    calculationType: 'STANDARD'
                });
                
                if (riskResult.status === 'success') {
                    capps.ui.open_modal({
                        title: 'Risk Assessment Result',
                        content: `
                            <div class="p-3">
                                <h5>Risk Score: ${riskResult.data.riskScore}</h5>
                                <p>Risk Level: <strong>${riskResult.data.riskLevel}</strong></p>
                                <p>Assessment Date: ${riskResult.data.assessmentDate}</p>
                                <hr>
                                <h6>Risk Factors:</h6>
                                <ul>
                                    ${riskResult.data.riskFactors.map(factor => 
                                        `<li>${factor.factor}: ${factor.score} (${factor.weight}%)</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        `,
                        size: 'lg'
                    });
                } else {
                    capps.ui.alert({
                        message: riskResult.message,
                        variant: 'danger'
                    });
                }
            }
        }
    ]
}
```

## Advanced RPC Patterns

### RPC with File Processing

```javascript
// plugins/FileProcessor.js

async function processUploadedFile(data, session) {
    const { fileInfo, processingOptions } = data;
    
    try {
        // Read file content
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(config.uploadPath, fileInfo.filename);
        
        if (!fs.existsSync(filePath)) {
            return {
                status: 'error',
                message: 'File not found',
                error_code: 'FILE_NOT_FOUND'
            };
        }
        
        // Process based on file type
        let processedData;
        
        if (fileInfo.mimetype === 'text/csv') {
            processedData = await processCSVFile(filePath, processingOptions);
        } else if (fileInfo.mimetype === 'application/json') {
            processedData = await processJSONFile(filePath, processingOptions);
        } else {
            return {
                status: 'error',
                message: 'Unsupported file type',
                error_code: 'UNSUPPORTED_FILE_TYPE'
            };
        }
        
        // Store processed data
        await storeProcessedData(processedData, session);
        
        return {
            status: 'success',
            data: {
                file_name: fileInfo.originalname,
                records_processed: processedData.length,
                processing_time: Date.now() - startTime,
                processing_summary: generateProcessingSummary(processedData)
            },
            message: 'File processed successfully'
        };
        
    } catch (error) {
        global.logger.error(`File processing error: ${error.message}`);
        return {
            status: 'error',
            message: 'File processing failed',
            error_code: 'FILE_PROCESSING_ERROR'
        };
    }
}

module.exports = {
    processUploadedFile
};
```

### RPC with External API Integration

```javascript
// plugins/ExternalIntegration.js

const axios = require('axios');

async function syncWithExternalSystem(data, session) {
    const { syncType, recordIds, externalSystemConfig } = data;
    
    try {
        const results = [];
        
        for (const recordId of recordIds) {
            // Get record data
            const recordData = await getRecordData(recordId, session);
            
            // Transform data for external system
            const transformedData = transformDataForExternal(recordData, externalSystemConfig);
            
            // Send to external system
            const externalResponse = await axios.post(
                externalSystemConfig.endpoint,
                transformedData,
                {
                    headers: {
                        'Authorization': `Bearer ${externalSystemConfig.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
            
            // Update local record with external system response
            if (externalResponse.status === 200) {
                await updateRecordWithExternalData(recordId, externalResponse.data, session);
                results.push({
                    record_id: recordId,
                    status: 'success',
                    external_id: externalResponse.data.id
                });
            } else {
                results.push({
                    record_id: recordId,
                    status: 'error',
                    error: 'External system rejected data'
                });
            }
        }
        
        const successCount = results.filter(r => r.status === 'success').length;
        const errorCount = results.filter(r => r.status === 'error').length;
        
        return {
            status: successCount > 0 ? 'success' : 'error',
            data: {
                total_records: recordIds.length,
                successful_syncs: successCount,
                failed_syncs: errorCount,
                sync_results: results
            },
            message: `Sync completed: ${successCount} successful, ${errorCount} failed`
        };
        
    } catch (error) {
        global.logger.error(`External sync error: ${error.message}`);
        return {
            status: 'error',
            message: 'External system synchronization failed',
            error_code: 'EXTERNAL_SYNC_ERROR'
        };
    }
}

module.exports = {
    syncWithExternalSystem
};
```

## Error Handling Best Practices

### Comprehensive Error Handling

```javascript
async function robustRPCFunction(data, session) {
    const startTime = Date.now();
    
    try {
        // Input validation
        const validation = validateInput(data);
        if (!validation.valid) {
            return {
                status: 'validation_error',
                errors: validation.errors,
                error_code: 'INPUT_VALIDATION_FAILED'
            };
        }
        
        // Business logic
        const result = await processBusinessLogic(data, session);
        
        // Success response with metadata
        return {
            status: 'success',
            data: result,
            metadata: {
                processing_time_ms: Date.now() - startTime,
                function_name: 'robustRPCFunction',
                processed_at: new Date().toISOString()
            }
        };
        
    } catch (error) {
        // Log error with context
        global.logger.error(`RPC function error: ${error.message}`, {
            function_name: 'robustRPCFunction',
            input_data: data,
            user_id: session?.user?.user_id,
            error_stack: error.stack,
            processing_time_ms: Date.now() - startTime
        });
        
        // Return structured error response
        return {
            status: 'error',
            message: 'Function execution failed',
            error_code: 'RPC_EXECUTION_ERROR',
            details: {
                error_type: error.name,
                timestamp: new Date().toISOString()
            }
        };
    }
}
```

## RPC Integration with CAPPS Framework

### Event Hooks Integration

```javascript
// In event hooks
const hookResult = await global.capps.myapp.plugins.EventProcessor.processHookEvent({
    eventType: 'AFTER_CREATE',
    collectionName: 'orders',
    recordData: recordData,
    userId: session.user.user_id
});
```

### Controller Integration

```javascript
// In collection controllers
app.post('/custom-endpoint', async (req, res) => {
    const rpcResult = await global.capps.myapp.plugins.CustomLogic.processCustomRequest({
        requestData: req.body,
        userId: req.session.user.user_id
    });
    
    res.json(rpcResult);
});
```

## Performance Considerations

### Caching RPC Results

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minute cache

async function cachedRPCFunction(data, session) {
    const cacheKey = `rpc_result_${JSON.stringify(data)}`;
    
    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return {
            ...cachedResult,
            metadata: {
                ...cachedResult.metadata,
                from_cache: true
            }
        };
    }
    
    // Process if not in cache
    const result = await expensiveProcessing(data, session);
    
    // Cache successful results
    if (result.status === 'success') {
        cache.set(cacheKey, result);
    }
    
    return result;
}
```

## Security Considerations

### Input Sanitization and Validation

```javascript
const joi = require('joi');

const inputSchema = joi.object({
    amount: joi.number().positive().required(),
    accountId: joi.string().alphanum().length(10).required(),
    type: joi.string().valid('CREDIT', 'DEBIT').required()
});

async function secureRPCFunction(data, session) {
    // Validate input schema
    const { error, value } = inputSchema.validate(data);
    if (error) {
        return {
            status: 'validation_error',
            errors: error.details.map(detail => detail.message),
            error_code: 'SCHEMA_VALIDATION_FAILED'
        };
    }
    
    // Check user permissions
    const hasPermission = await checkUserPermission(session.user.user_id, 'TRANSACTION_PROCESS');
    if (!hasPermission) {
        return {
            status: 'error',
            message: 'Insufficient permissions',
            error_code: 'PERMISSION_DENIED'
        };
    }
    
    // Process with validated data
    return await processWithValidatedData(value, session);
}
```

The RPC system provides powerful extensibility for CAPPS applications, enabling complex business logic, external integrations, and custom data processing while maintaining clean separation between framework functionality and application-specific operations.