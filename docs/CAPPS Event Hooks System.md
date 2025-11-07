# CAPPS Event Hooks System

Event Hooks in CAPPS provide a powerful mechanism for executing custom business logic in response to specific events, such as file uploads, data changes, scheduled tasks, and external system integrations.

## Overview

Event Hooks allow you to:
- Process files and bulk data operations
- Implement custom business workflows
- Integrate with external systems
- Handle background processing
- Implement real-time data transformations
- Create audit trails and logging systems

## Architecture

### Event Hook Structure
```
<APP_NAME>/
  event-hooks/
    <hook_name>/
      controller.js    # Main hook implementation
      README.md       # Hook documentation
```

### Event Flow
1. **Trigger**: Events are triggered by CAPPS framework or external systems
2. **Hook Execution**: Corresponding event hook controller is called
3. **Processing**: Custom business logic is executed
4. **Response**: Results are returned or actions are taken

## File Processing Event Hooks

The most common use case is file processing, demonstrated in the Guinea Pig application:

### Basic File Processing Hook

```javascript
// event-hooks/file_interface/controller.js
const APP_NAME = 'my-app';
const PROCESS_PROGRESS_ENABLE_FOR = ['collection_one', 'collection_two'];

const crypto = require('crypto');
const stream = require('node:stream');
const CSVToJsonParser = require('csvtojson');
const { pipeline: pipelinePromise } = require('node:stream/promises');
const { Readable } = require('stream');

// Database utility setup
const DB_TYPE = (config.mysqldb && config.mysqldb[0]?.alias && "mysql") ||
  (config.oracledb && config.oracledb[0]?.alias && "oracle");
const dbutil = require('@frameworks-and-tools/dbutils')({ ...config, DB_TYPE }, global.db_conn_pool, logger);

const create = async (msg) => {
    let id = msg.data.ID;
    const collectionName = msg.data.MODEL_NAME;
    let session = {};

    try {
        session = {
            user: msg.userObj, 
            db: await dbutil.getOConnection(),
            batch_no: id
        };

        // Get file buffer from database
        const sql = `SELECT FILEOBJECT, FILENAME FROM capps_file_interface WHERE ID = :id`;
        const result = await session.db.execute(sql, { id: id });
        
        let fileStream;
        if (dbutil.getPoolType() === "mysql") {
            const fileBuffer = result.rows[0].FILEOBJECT;
            fileStream = Readable.from(fileBuffer);
        } else {
            fileStream = result.rows[0].FILEOBJECT;
        }

        // Process file through pipeline
        await processFile(fileStream, collectionName, session);

    } catch (error) {
        logger.error(`[${collectionName}] Processing error: ${error.stack}`);
    } finally {
        if (session.db) {
            await session.db.close();
        }
    }
};

module.exports = { create };
```

### Advanced File Processing with Streams

```javascript
async function processFile(fileStream, collectionName, session) {
    const collectionSchema = await global.capps[APP_NAME][collectionName].document;
    
    await pipelinePromise(
        fileStream
            .on('error', (err) => {
                logger.error(`FileStream error: ${err.stack}`);
                throw err;
            }),
        CSVToJsonParser({ 
            flatKeys: false, 
            needEmitAll: false, 
            maxRowLength: 65535, 
            headers: collectionSchema?.UPLOAD_COLUMN_MAP 
        })
            .on('error', (err) => {
                logger.error(`CSV Parser error: ${err.stack}`);
                throw err;
            }),
        mergeRecord(collectionName, session.batch_no, session),
        processRecord(collectionName, session.batch_no, session),
        sinkStream()
    );
    
    // Finalize processing
    await global.capps[APP_NAME][collectionName].upload(null, { ...session, end: true });
}
```

### Parent-Child Record Processing

```javascript
function mergeRecord(collectionName, id, session) {
    let mergedRecord = {};
    let line_no = 0;
    let childKeyName = null;
    let isParentChildUpload = false;
    let parentKeys = null;

    return async function* (source) {
        source.on('header', (header) => {
            // Check if header contains '.' indicating parent-child structure
            isParentChildUpload = header.join().includes('.');
            parentKeys = header.filter(key => !key.includes('.'));
            logger.info(`[${collectionName}] Is Parent-Child upload: ${isParentChildUpload}`);
        });

        for await (const json of source) {
            line_no += 1;

            if (!isParentChildUpload) {
                yield json;
            } else if (line_no === 1) {
                childKeyName = getChildCollectionName(json);
                mergedRecord = { ...json };
                if (childKeyName) {
                    mergedRecord[childKeyName] = [json[childKeyName]];
                }
            } else if (parentKeys.some(key => json[key])) {
                // New parent record detected
                yield mergedRecord;
                mergedRecord = { ...json };
                if (childKeyName) {
                    mergedRecord[childKeyName] = [json[childKeyName]];
                }
            } else {
                // Child record - merge with current parent
                mergedRecord[childKeyName].push(json[childKeyName]);
            }
        }
        
        if (isParentChildUpload) {
            yield mergedRecord;
        }
    };
}

function getChildCollectionName(json) {
    const keys = Object.keys(json);
    return keys.filter(key => typeof json[key] === 'object');
}
```

### Record Processing with Error Handling

```javascript
function processRecord(collectionName, id, session) {
    let line_no = 0;
    let saveResult = {};

    return async function* (source) {
        for await (const json of source) {
            line_no += 1;

            try {
                saveResult = await global.capps[APP_NAME][collectionName].upload(json, session);
                
                if (saveResult.status !== 'success') {
                    // Save error to exceptions table
                    const exceptionData = {
                        PARENT_ID: id,
                        RECORD_NO: line_no,
                        DETAILS: saveResult.error.join(', ')
                    };
                    await global.capps[APP_NAME]["file_exceptions"].create(exceptionData, session);
                }
            } catch (error) {
                logger.error(`[${collectionName}] Record processing error at line ${line_no}: ${error.message}`);
                
                // Log exception
                const exceptionData = {
                    PARENT_ID: id,
                    RECORD_NO: line_no,
                    DETAILS: `Processing error: ${error.message}`
                };
                await global.capps[APP_NAME]["file_exceptions"].create(exceptionData, session);
            }
            
            yield json;
        }
    };
}
```

## Event Hook Types

### 1. File Processing Hooks

#### Configuration
```javascript
// Triggered when files are uploaded to specific collections
const PROCESS_PROGRESS_ENABLE_FOR = ['collection_name'];
```

#### Use Cases
- CSV/Excel data imports
- File validation and transformation
- Bulk data processing
- Document processing

### 2. Data Change Hooks

```javascript
// event-hooks/data_change/controller.js
const beforeCreate = async (msg) => {
    const { collectionName, data, userObj } = msg;
    
    // Pre-creation validation
    if (collectionName === 'orders' && data.amount > 10000) {
        // Require approval for large orders
        data.status = 'PENDING_APPROVAL';
        data.approval_required = true;
    }
    
    return { status: 'success', data };
};

const afterCreate = async (msg) => {
    const { collectionName, data, result, userObj } = msg;
    
    // Post-creation actions
    if (collectionName === 'orders') {
        // Send notification email
        await sendOrderNotification(data, userObj);
        
        // Update inventory
        await updateInventory(data.items);
    }
    
    return { status: 'success' };
};

module.exports = { beforeCreate, afterCreate };
```

### 3. Scheduled Task Hooks

```javascript
// event-hooks/scheduled_tasks/controller.js
const dailyReport = async (msg) => {
    const { date, userObj } = msg;
    
    try {
        // Generate daily reports
        const reportData = await generateDailyReport(date);
        
        // Send to stakeholders
        await emailReport(reportData, userObj);
        
        logger.info(`Daily report generated and sent for ${date}`);
        return { status: 'success', message: 'Report generated successfully' };
    } catch (error) {
        logger.error(`Daily report generation failed: ${error.message}`);
        return { status: 'error', message: error.message };
    }
};

const monthlyCleanup = async (msg) => {
    // Archive old data
    // Clean temporary files
    // Optimize database
};

module.exports = { dailyReport, monthlyCleanup };
```

### 4. Integration Hooks

```javascript
// event-hooks/external_integration/controller.js
const syncToERP = async (msg) => {
    const { action, collectionName, data, userObj } = msg;
    
    try {
        // Map CAPPS data to ERP format
        const erpData = mapToERPFormat(data, collectionName);
        
        // Send to external ERP system
        const response = await callERPAPI(action, erpData);
        
        if (response.success) {
            // Update CAPPS record with ERP reference
            await updateCAPPSRecord(data.id, {
                erp_sync_status: 'SYNCED',
                erp_reference: response.reference,
                last_sync_date: new Date()
            });
        }
        
        return { status: 'success', erpReference: response.reference };
    } catch (error) {
        logger.error(`ERP sync failed: ${error.message}`);
        return { status: 'error', message: error.message };
    }
};

module.exports = { syncToERP };
```

## Stream Processing Utilities

### Sink Stream
```javascript
function sinkStream() {
    let line_no = 0;
    return new stream.Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
            line_no += 1;
            // Final processing or logging
            callback();
        }
    });
}
```

### Transform Streams
```javascript
function transformData(transformRules) {
    return new stream.Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            try {
                const transformed = applyTransformRules(chunk, transformRules);
                this.push(transformed);
                callback();
            } catch (error) {
                callback(error);
            }
        }
    });
}
```

### Validation Stream
```javascript
function validateData(schema) {
    return new stream.Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            try {
                const validation = validateAgainstSchema(chunk, schema);
                if (validation.valid) {
                    this.push(chunk);
                } else {
                    // Emit validation error
                    this.emit('validation-error', {
                        data: chunk,
                        errors: validation.errors
                    });
                }
                callback();
            } catch (error) {
                callback(error);
            }
        }
    });
}
```

## Error Handling and Logging

### Exception Tracking
```javascript
async function logException(parentId, recordNumber, errorDetails, session) {
    const exceptionData = {
        PARENT_ID: parentId,
        RECORD_NO: recordNumber,
        DETAILS: typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails),
        ERROR_TYPE: 'PROCESSING_ERROR',
        TIMESTAMP: new Date(),
        USER_ID: session.user.user_id
    };
    
    await global.capps[APP_NAME]["file_exceptions"].create(exceptionData, session);
}
```

### Comprehensive Error Handling
```javascript
const processWithErrorHandling = async (msg) => {
    let session = null;
    let uploadProcess = null;
    
    try {
        session = await initializeSession(msg);
        uploadProcess = await initializeProgressTracking(msg, session);
        
        await uploadProcess.start();
        
        const result = await processMainLogic(msg, session, uploadProcess);
        
        await uploadProcess.update({ 
            type: 'success', 
            msg: 'Processing completed successfully' 
        });
        
        return result;
        
    } catch (error) {
        logger.error(`Processing failed: ${error.stack}`);
        
        if (uploadProcess) {
            await uploadProcess.update({ 
                type: 'error', 
                msg: `Processing failed: ${error.message}` 
            });
        }
        
        throw error;
        
    } finally {
        if (uploadProcess) {
            await uploadProcess.end();
        }
        
        if (session?.db) {
            await session.db.close();
        }
    }
};
```

## Configuration and Deployment

### Hook Registration
Event hooks are automatically discovered based on directory structure:
```
event-hooks/
  file_processing/
    controller.js
  data_sync/
    controller.js
  scheduled_tasks/
    controller.js
```

### Environment Configuration
```javascript
// In app config
const eventHookConfig = {
    enabled: true,
    timeout: 300000,  // 5 minutes
    retry_attempts: 3,
    parallel_processing: true,
    max_concurrent: 5
};
```

### Hook Dependencies
```javascript
// At the top of controller.js
const requiredDependencies = [
    '@frameworks-and-tools/dbutils',
    'csvtojson',
    'crypto',
    'stream'
];

// Verify dependencies are available
requiredDependencies.forEach(dep => {
    try {
        require(dep);
    } catch (error) {
        logger.error(`Required dependency ${dep} not found: ${error.message}`);
        throw new Error(`Missing dependency: ${dep}`);
    }
});
```

## Best Practices

### Performance Optimization
```javascript
// Use streams for large datasets
await pipelinePromise(
    dataSource,
    batchProcessor(100),  // Process in batches
    parallelProcessor(5), // Parallel processing
    resultCollector()
);

// Batch database operations
const batch = [];
for (const record of records) {
    batch.push(record);
    
    if (batch.length >= 100) {
        await processBatch(batch);
        batch.length = 0; // Clear batch
    }
}
```

### Memory Management
```javascript
// Avoid loading entire files into memory
const fileStream = fs.createReadStream(filePath, { highWaterMark: 16 * 1024 });

// Release resources properly
try {
    await processFile(fileStream);
} finally {
    if (fileStream) {
        fileStream.destroy();
    }
}
```

### Transaction Management
```javascript
// Use database transactions for data consistency
const transaction = await session.db.beginTransaction();

try {
    await processRecords(records, transaction);
    await transaction.commit();
} catch (error) {
    await transaction.rollback();
    throw error;
}
```

### Monitoring and Alerting
```javascript
// Add monitoring hooks
const monitoringHook = {
    start: () => logger.info(`Hook ${hookName} started`),
    end: (duration) => logger.info(`Hook ${hookName} completed in ${duration}ms`),
    error: (error) => logger.error(`Hook ${hookName} failed: ${error.message}`)
};
```

---

Event Hooks provide the backbone for extending CAPPS applications with custom business logic, file processing capabilities, and system integrations while maintaining clean separation of concerns and robust error handling.