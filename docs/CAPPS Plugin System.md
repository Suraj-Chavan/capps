# CAPPS Plugin System

The CAPPS Plugin System provides a mechanism for extending framework functionality through external JavaScript modules that contain custom business logic, database utilities, and RPC (Remote Procedure Call) functions.

## Overview

Plugins in CAPPS allow you to:
- Create reusable business logic functions
- Implement custom database operations
- Expose RPC endpoints for external integrations
- Share functionality across multiple applications
- Maintain separation of concerns between core framework and custom logic

## Architecture

### Plugin Structure
```
<APP_NAME>/
  plugins/
    <PLUGIN_NAME>.js    # Plugin implementation file
    README.md          # Plugin documentation (optional)
```

### Plugin Loading
- Plugins are automatically discovered and loaded from the `plugins/` directory
- Each `.js` file in the plugins directory becomes a loadable plugin module
- Functions exported from plugin files are accessible via the CAPPS RPC system

## Plugin Implementation

### Basic Plugin Structure

```javascript
// plugins/MyPlugin.js

// Database utility access (standard CAPPS pattern)
const dbutil = require('@frameworks-and-tools/dbutils')(config, global.db_conn_pool, global.logger);

/**
 * Example plugin function that retrieves display data
 * @param {Object} data - Input data from the caller
 * @param {Object} session - User session object containing user info and database connection
 * @returns {Promise<Array>} Array of database results
 */
async function getDisplayData(data, session) {
    try {
        // Example database query
        const sql = `SELECT column1, column2, column3 FROM my_table WHERE condition = :param`;
        const bindParams = { param: data.inputValue };
        
        const results = await dbutil.execSQL(sql, bindParams);
        
        return {
            status: 'success',
            data: results
        };
    } catch (error) {
        global.logger.error(`Plugin error in getDisplayData: ${error.message}`);
        return {
            status: 'error',
            message: error.message
        };
    }
}

/**
 * Example business logic function
 * @param {Object} data - Business data to process
 * @param {Object} session - Session context
 * @returns {Promise<Object>} Processing result
 */
async function processBusinessLogic(data, session) {
    const { amount, currency, entityId } = data;
    
    try {
        // Custom business validation
        if (amount <= 0) {
            return {
                status: 'validation_error',
                errors: ['Amount must be greater than zero']
            };
        }
        
        // Database operations
        const conversionRate = await getConversionRate(currency, session);
        const convertedAmount = amount * conversionRate;
        
        // Log business operation
        await logBusinessTransaction({
            entity_id: entityId,
            original_amount: amount,
            converted_amount: convertedAmount,
            currency: currency,
            user_id: session.user.user_id
        }, session);
        
        return {
            status: 'success',
            converted_amount: convertedAmount,
            conversion_rate: conversionRate
        };
    } catch (error) {
        global.logger.error(`Business logic error: ${error.message}`);
        return {
            status: 'error',
            message: 'Business processing failed'
        };
    }
}

// Helper function (not exposed as RPC)
async function getConversionRate(currency, session) {
    const sql = `SELECT rate FROM currency_rates WHERE currency_code = :currency AND active = 1`;
    const result = await dbutil.execSQL(sql, { currency });
    return result.length > 0 ? result[0].rate : 1.0;
}

// Helper function for logging
async function logBusinessTransaction(data, session) {
    const sql = `
        INSERT INTO business_transaction_log 
        (entity_id, original_amount, converted_amount, currency, user_id, created_date)
        VALUES (:entity_id, :original_amount, :converted_amount, :currency, :user_id, SYSDATE)
    `;
    await dbutil.execSQL(sql, data);
}

// Export functions to make them available as RPC endpoints
module.exports = {
    getDisplayData,
    processBusinessLogic
};
```

### Real-World Example (PIG.js)

The Guinea Pig application demonstrates a simple plugin implementation:

```javascript
// plugins/PIG.js - Simple demonstration plugin
const dbutil = require('@frameworks-and-tools/dbutils')(config, global.db_conn_pool, global.logger);

/**
 * Sample function that returns mock display data
 * @param {Object} data - Input parameters
 * @param {Object} session - User session context
 * @returns {Promise<Array>} Mock data for display
 */
async function getDisplayData(data, session) {
    // Example: Return mock data from database
    const display_data = await dbutil.execSQL(`SELECT 87 column_1, 99 column_2 FROM dual`, []);
    return display_data;
}

module.exports.getDisplayData = getDisplayData;
```

## Plugin Usage

### Calling Plugin Functions

#### From Frontend JavaScript
```javascript
// In form.js or other frontend code
const result = await capps.rest.myapp.plugins.MyPlugin.getDisplayData({
    inputValue: 'sample_parameter'
});

if (result.status === 'success') {
    console.log('Plugin data:', result.data);
} else {
    console.error('Plugin error:', result.message);
}
```

#### From Event Hooks
```javascript
// In event-hooks/some_hook/controller.js
const pluginResult = await global.capps.myapp.plugins.MyPlugin.processBusinessLogic({
    amount: 1000,
    currency: 'USD',
    entityId: 'ENT001'
}, session);

if (pluginResult.status === 'success') {
    // Use the processed result
    const convertedAmount = pluginResult.converted_amount;
}
```

#### From Collection Controllers
```javascript
// In rest/collection/my_collection/controller.js
class MyController extends ServiceAdapter {
    async beforeCreate(data, userObj) {
        // Call plugin for business validation
        const validationResult = await global.capps.myapp.plugins.MyPlugin.processBusinessLogic(
            data,
            { user: userObj }
        );
        
        if (validationResult.status === 'validation_error') {
            return { 
                status: 'unsuccess', 
                error: validationResult.errors 
            };
        }
        
        return { status: 'success' };
    }
}
```

## Advanced Plugin Patterns

### Database Transaction Management

```javascript
// plugins/TransactionPlugin.js
async function processWithTransaction(data, session) {
    let connection = null;
    
    try {
        connection = await dbutil.getOConnection();
        await connection.execute('BEGIN', [], { autoCommit: false });
        
        // Perform multiple database operations
        await connection.execute(
            'INSERT INTO table1 (col1, col2) VALUES (:val1, :val2)',
            { val1: data.value1, val2: data.value2 },
            { autoCommit: false }
        );
        
        await connection.execute(
            'UPDATE table2 SET status = :status WHERE id = :id',
            { status: 'PROCESSED', id: data.recordId },
            { autoCommit: false }
        );
        
        // Commit transaction
        await connection.commit();
        
        return { status: 'success', message: 'Transaction completed' };
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        global.logger.error(`Transaction failed: ${error.message}`);
        return { status: 'error', message: 'Transaction failed' };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = { processWithTransaction };
```

### Complex Business Logic Plugin

```javascript
// plugins/FinancialPlugin.js
const crypto = require('crypto');

/**
 * Calculate complex financial metrics
 * @param {Object} data - Financial data
 * @param {Object} session - User session
 * @returns {Promise<Object>} Calculated metrics
 */
async function calculateFinancialMetrics(data, session) {
    const { portfolioId, startDate, endDate } = data;
    
    try {
        // Get portfolio data
        const portfolioData = await getPortfolioData(portfolioId, startDate, endDate);
        
        // Calculate various metrics
        const metrics = {
            totalValue: calculateTotalValue(portfolioData),
            roi: calculateROI(portfolioData),
            volatility: calculateVolatility(portfolioData),
            sharpeRatio: calculateSharpeRatio(portfolioData),
            maxDrawdown: calculateMaxDrawdown(portfolioData)
        };
        
        // Store calculation results
        await storeCalculationResults(portfolioId, metrics, session);
        
        return {
            status: 'success',
            metrics: metrics,
            calculationId: generateCalculationId()
        };
    } catch (error) {
        global.logger.error(`Financial calculation error: ${error.message}`);
        return { status: 'error', message: error.message };
    }
}

async function getPortfolioData(portfolioId, startDate, endDate) {
    const sql = `
        SELECT security_id, quantity, price, transaction_date
        FROM portfolio_transactions 
        WHERE portfolio_id = :portfolioId 
        AND transaction_date BETWEEN :startDate AND :endDate
        ORDER BY transaction_date
    `;
    return await dbutil.execSQL(sql, { portfolioId, startDate, endDate });
}

function calculateTotalValue(data) {
    return data.reduce((total, item) => total + (item.quantity * item.price), 0);
}

function calculateROI(data) {
    // Complex ROI calculation logic
    const initialValue = data[0]?.quantity * data[0]?.price || 0;
    const finalValue = data[data.length - 1]?.quantity * data[data.length - 1]?.price || 0;
    return initialValue > 0 ? ((finalValue - initialValue) / initialValue) * 100 : 0;
}

function calculateVolatility(data) {
    // Volatility calculation implementation
    const returns = calculateReturns(data);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    return Math.sqrt(variance * 252); // Annualized
}

function calculateSharpeRatio(data) {
    // Sharpe ratio calculation
    const returns = calculateReturns(data);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = calculateVolatility(data);
    const riskFreeRate = 0.02; // 2% risk-free rate
    return volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0;
}

function calculateMaxDrawdown(data) {
    // Maximum drawdown calculation
    let maxDrawdown = 0;
    let peak = data[0]?.quantity * data[0]?.price || 0;
    
    for (let item of data) {
        const currentValue = item.quantity * item.price;
        peak = Math.max(peak, currentValue);
        const drawdown = (peak - currentValue) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown * 100; // Return as percentage
}

function calculateReturns(data) {
    const returns = [];
    for (let i = 1; i < data.length; i++) {
        const prevValue = data[i-1].quantity * data[i-1].price;
        const currValue = data[i].quantity * data[i].price;
        if (prevValue > 0) {
            returns.push((currValue - prevValue) / prevValue);
        }
    }
    return returns;
}

async function storeCalculationResults(portfolioId, metrics, session) {
    const sql = `
        INSERT INTO financial_calculations 
        (portfolio_id, total_value, roi, volatility, sharpe_ratio, max_drawdown, 
         calculated_by, calculation_date)
        VALUES (:portfolioId, :totalValue, :roi, :volatility, :sharpeRatio, 
                :maxDrawdown, :userId, SYSDATE)
    `;
    
    await dbutil.execSQL(sql, {
        portfolioId,
        totalValue: metrics.totalValue,
        roi: metrics.roi,
        volatility: metrics.volatility,
        sharpeRatio: metrics.sharpeRatio,
        maxDrawdown: metrics.maxDrawdown,
        userId: session.user.user_id
    });
}

function generateCalculationId() {
    return `CALC_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

module.exports = {
    calculateFinancialMetrics
};
```

### External API Integration Plugin

```javascript
// plugins/ExternalAPIPlugin.js
const axios = require('axios');

/**
 * Integrate with external payment gateway
 * @param {Object} data - Payment data
 * @param {Object} session - User session
 * @returns {Promise<Object>} Payment result
 */
async function processPayment(data, session) {
    const { amount, currency, paymentMethodId, customerId } = data;
    
    try {
        // Validate payment data
        const validation = validatePaymentData(data);
        if (!validation.valid) {
            return { status: 'validation_error', errors: validation.errors };
        }
        
        // Log payment initiation
        const paymentLogId = await logPaymentAttempt(data, session);
        
        // Call external payment API
        const paymentResult = await callPaymentGateway({
            amount,
            currency,
            payment_method_id: paymentMethodId,
            customer_id: customerId,
            metadata: {
                app_name: 'capps',
                user_id: session.user.user_id,
                log_id: paymentLogId
            }
        });
        
        // Update payment log with result
        await updatePaymentLog(paymentLogId, paymentResult, session);
        
        if (paymentResult.status === 'succeeded') {
            // Create local payment record
            await createPaymentRecord({
                external_payment_id: paymentResult.id,
                amount,
                currency,
                customer_id: customerId,
                status: 'COMPLETED',
                payment_date: new Date(),
                user_id: session.user.user_id
            });
            
            return {
                status: 'success',
                payment_id: paymentResult.id,
                amount_charged: paymentResult.amount_received,
                transaction_fee: paymentResult.fee
            };
        } else {
            return {
                status: 'payment_failed',
                error_code: paymentResult.failure_code,
                error_message: paymentResult.failure_message
            };
        }
    } catch (error) {
        global.logger.error(`Payment processing error: ${error.message}`);
        return { status: 'error', message: 'Payment processing failed' };
    }
}

function validatePaymentData(data) {
    const errors = [];
    
    if (!data.amount || data.amount <= 0) {
        errors.push('Amount must be greater than zero');
    }
    
    if (!data.currency || !['USD', 'EUR', 'GBP'].includes(data.currency)) {
        errors.push('Invalid or unsupported currency');
    }
    
    if (!data.paymentMethodId) {
        errors.push('Payment method ID is required');
    }
    
    if (!data.customerId) {
        errors.push('Customer ID is required');
    }
    
    return { valid: errors.length === 0, errors };
}

async function logPaymentAttempt(data, session) {
    const sql = `
        INSERT INTO payment_logs 
        (amount, currency, customer_id, payment_method_id, status, 
         initiated_by, initiated_date)
        VALUES (:amount, :currency, :customerId, :paymentMethodId, 'INITIATED', 
                :userId, SYSDATE)
    `;
    
    const result = await dbutil.execSQL(sql, {
        amount: data.amount,
        currency: data.currency,
        customerId: data.customerId,
        paymentMethodId: data.paymentMethodId,
        userId: session.user.user_id
    });
    
    return result.insertId || result.rowid;
}

async function callPaymentGateway(paymentData) {
    const response = await axios.post('https://api.stripe.com/v1/payment_intents', paymentData, {
        headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
    });
    
    return response.data;
}

async function updatePaymentLog(logId, paymentResult, session) {
    const sql = `
        UPDATE payment_logs 
        SET external_payment_id = :externalId, 
            status = :status,
            response_data = :responseData,
            updated_date = SYSDATE
        WHERE id = :logId
    `;
    
    await dbutil.execSQL(sql, {
        externalId: paymentResult.id,
        status: paymentResult.status.toUpperCase(),
        responseData: JSON.stringify(paymentResult),
        logId
    });
}

async function createPaymentRecord(paymentData) {
    const sql = `
        INSERT INTO payments 
        (external_payment_id, amount, currency, customer_id, status, 
         payment_date, created_by)
        VALUES (:external_payment_id, :amount, :currency, :customer_id, 
                :status, :payment_date, :user_id)
    `;
    
    await dbutil.execSQL(sql, paymentData);
}

module.exports = {
    processPayment
};
```

## Plugin Configuration

### Environment Configuration
```javascript
// In app config or environment variables
const pluginConfig = {
    enabled: true,
    timeout: 30000,        // 30 second timeout for plugin calls
    max_retries: 3,        // Maximum retry attempts
    cache_enabled: false,  // Enable/disable plugin result caching
    debug_mode: false      // Enable detailed plugin logging
};
```

### Plugin Dependencies
```javascript
// At the top of plugin file
const requiredDependencies = [
    '@frameworks-and-tools/dbutils',
    'axios',
    'crypto',
    'moment'
];

// Verify dependencies
requiredDependencies.forEach(dep => {
    try {
        require(dep);
    } catch (error) {
        global.logger.error(`Plugin dependency ${dep} not found: ${error.message}`);
        throw new Error(`Missing plugin dependency: ${dep}`);
    }
});
```

## Best Practices

### Error Handling
```javascript
async function robustPluginFunction(data, session) {
    try {
        // Validate input
        if (!data || typeof data !== 'object') {
            return { status: 'invalid_input', message: 'Data parameter is required' };
        }
        
        // Main logic with detailed error handling
        const result = await performBusinessLogic(data, session);
        return result;
        
    } catch (error) {
        // Log error with context
        global.logger.error(`Plugin error in robustPluginFunction: ${error.message}`, {
            data: JSON.stringify(data),
            user: session?.user?.user_id,
            stack: error.stack
        });
        
        return { 
            status: 'error', 
            message: 'Plugin execution failed',
            error_code: 'PLUGIN_EXECUTION_ERROR'
        };
    }
}
```

### Input Validation
```javascript
function validateInput(data, requiredFields) {
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!data.hasOwnProperty(field) || data[field] === null || data[field] === undefined) {
            errors.push(`${field} is required`);
        }
    });
    
    return { valid: errors.length === 0, errors };
}
```

### Performance Optimization
```javascript
// Use connection pooling efficiently
async function efficientDatabasePlugin(data, session) {
    // Reuse existing session connection if available
    const connection = session.db || await dbutil.getOConnection();
    let shouldCloseConnection = !session.db;
    
    try {
        const results = await connection.execute('SELECT * FROM large_table WHERE id = :id', 
                                               { id: data.id });
        return { status: 'success', data: results.rows };
    } finally {
        if (shouldCloseConnection && connection) {
            await connection.close();
        }
    }
}
```

## Testing Plugins

### Unit Testing
```javascript
// test/plugins/MyPlugin.test.js
const MyPlugin = require('../../plugins/MyPlugin');

describe('MyPlugin', () => {
    it('should return valid data for getDisplayData', async () => {
        const mockData = { inputValue: 'test' };
        const mockSession = { user: { user_id: 1 } };
        
        const result = await MyPlugin.getDisplayData(mockData, mockSession);
        
        expect(result.status).toBe('success');
        expect(result.data).toBeDefined();
    });
});
```

## Integration with CAPPS Framework

Plugins integrate seamlessly with the CAPPS framework architecture:

- **Collection Controllers**: Call plugins for business validation and processing
- **Event Hooks**: Use plugins for complex background processing
- **Frontend Forms**: Access plugin functions via REST API calls
- **Process Progress**: Plugins can utilize the progress tracking system
- **Database Utilities**: Standard CAPPS database patterns work within plugins

---

The Plugin System provides powerful extensibility for CAPPS applications while maintaining clean separation between framework functionality and custom business logic.