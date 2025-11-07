# CAPPS File Handling and Bulk Operations

CAPPS provides comprehensive file handling and bulk operations capabilities for uploading, processing, and managing large datasets. This system integrates seamlessly with the Process Progress tracking and Event Hooks architecture.

## Overview

The file handling system supports:
- **File Upload Management**: Secure file uploads with validation
- **Bulk Data Import**: CSV/Excel processing with column mapping
- **Stream Processing**: Memory-efficient processing of large files
- **Error Handling**: Comprehensive error tracking and exception management
- **Progress Tracking**: Real-time progress monitoring
- **Parent-Child Processing**: Complex hierarchical data structures

## Architecture Components

### Core Collections

#### File Interface Collection
Central collection for managing file uploads and processing status.

```json
{
    "DATA_MODEL": "CAPPS_FILE_INTERFACE",
    "NAME": "File Uploads", 
    "ACTIONS": ["CREATE"],
    "FIELDS": {
        "ID": {
            "fieldtype": "float",
            "iskey": 1,
            "in_standard_filter": 1
        },
        "MODEL_NAME": {
            "fieldtype": "select",
            "required": 1,
            "in_standard_filter": 1,
            "enum": ["collection_one", "collection_two", "target_collection"]
        },
        "STATUS": {
            "fieldtype": "textfield",
            "default": "PENDING",
            "in_standard_filter": 1
        },
        "FILEOBJECT": {
            "fieldtype": "file",
            "required": 1,
            "allowed_file_types": ["csv", "xlsx", "txt"],
            "max_file_size_in_mb": 50
        },
        "FILENAME": {
            "fieldtype": "textfield",
            "required": 1,
            "hidden": 1
        },
        "FILETYPE": {
            "fieldtype": "textfield",
            "hidden": 1
        },
        "REMARKS": {
            "fieldtype": "textarea",
            "maxlength": 2000,
            "rows": 3
        },
        "FILE_EXCEPTIONS": {
            "fieldtype": "table",
            "ref": "file_exceptions",
            "parent.field": "PARENT_ID"
        }
    }
}
```

#### File Exceptions Collection
Tracks processing errors and validation failures.

```json
{
    "DATA_MODEL": "CAPPS_FILE_EXCEPTIONS",
    "NAME": "File Processing Exceptions",
    "FIELDS": {
        "ID": {
            "fieldtype": "float", 
            "iskey": 1
        },
        "PARENT_ID": {
            "fieldtype": "float",
            "required": 1
        },
        "RECORD_NO": {
            "fieldtype": "float",
            "label": "Record Number"
        },
        "DETAILS": {
            "fieldtype": "textarea",
            "maxlength": 2000,
            "label": "Error Details"
        },
        "ERROR_TYPE": {
            "fieldtype": "select",
            "enum": ["VALIDATION_ERROR", "PROCESSING_ERROR", "SYSTEM_ERROR"]
        },
        "TIMESTAMP": {
            "fieldtype": "datetime",
            "default": "CURRENT_TIMESTAMP"
        }
    }
}
```

## File Upload Implementation

### Frontend File Upload Handler

```javascript
// In collection form.js
capps.ui.file_interface.form = {
    // Auto-populate filename and type when file is selected
    FILEOBJECT: async function (frm, io) {
        const fileName = (io?.params || [])[0]?.name || "";
        let fileType = fileName.split(".");
        fileType = (fileType[fileType.length - 1] || "").toUpperCase();

        frm.set_value("FILENAME", fileName);
        frm.set_value("FILETYPE", fileType);
        
        // Validate file type
        const allowedTypes = ['CSV', 'XLSX', 'TXT'];
        if (!allowedTypes.includes(fileType)) {
            capps.ui.alert({
                message: `File type ${fileType} not supported. Allowed types: ${allowedTypes.join(', ')}`,
                variant: 'danger'
            });
            frm.set_value("FILEOBJECT", null);
            return;
        }
        
        // Validate file size
        const fileSizeMB = (io?.params[0]?.size || 0) / (1024 * 1024);
        if (fileSizeMB > 50) {
            capps.ui.alert({
                message: `File size ${fileSizeMB.toFixed(2)}MB exceeds limit of 50MB`,
                variant: 'danger'
            });
            frm.set_value("FILEOBJECT", null);
            return;
        }
        
        capps.ui.alert({
            message: `File ${fileName} (${fileSizeMB.toFixed(2)}MB) ready for upload`,
            variant: 'success'
        });
    },

    // Validate before save
    _onBeforeSave: async function(frm) {
        if (!frm.doc.MODEL_NAME) {
            capps.ui.alert({
                message: "Please select target collection",
                variant: "danger"
            });
            return false;
        }
        
        if (!frm.doc.FILEOBJECT) {
            capps.ui.alert({
                message: "Please select a file to upload",
                variant: "danger"
            });
            return false;
        }
        
        return true;
    },

    // Post-save actions
    _onAfterSave: async function(frm) {
        if (frm.doc.ID) {
            capps.ui.alert({
                message: `File upload queued. Processing will begin shortly. Upload ID: ${frm.doc.ID}`,
                variant: 'success'
            });
            
            // Optionally redirect to progress view
            setTimeout(() => {
                window.location.href = `/capps/dist/index.html#/app/doc/process_progress/view/list`;
            }, 2000);
        }
    }
};
```

### Column Mapping Configuration

Target collections specify how CSV columns map to database fields:

```json
{
    "DATA_MODEL": "TARGET_COLLECTION",
    "UPLOAD_COLUMN_MAP": [
        "CUSTOMER_NAME",
        "EMAIL_ADDRESS", 
        "PHONE_NUMBER",
        "REGISTRATION_DATE",
        "STATUS"
    ],
    "FIELDS": {
        "CUSTOMER_NAME": {
            "fieldtype": "textfield",
            "required": 1,
            "maxlength": 100
        },
        "EMAIL_ADDRESS": {
            "fieldtype": "email_address",
            "required": 1
        },
        "PHONE_NUMBER": {
            "fieldtype": "textfield",
            "maxlength": 15
        },
        "REGISTRATION_DATE": {
            "fieldtype": "date",
            "default": "CURRENT_DATE"
        },
        "STATUS": {
            "fieldtype": "select",
            "enum": ["ACTIVE", "INACTIVE"],
            "default": "ACTIVE"
        }
    }
}
```

## Event Hook Processing

### File Processing Event Hook

```javascript
// event-hooks/file_interface/controller.js
const APP_NAME = 'my-app';
const PROCESS_PROGRESS_ENABLE_FOR = ['target_collection', 'customer_data'];

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
    let uploadProcess = null;
    let session = {};

    try {
        session = {
            user: msg.userObj,
            db: await dbutil.getOConnection(),
            batch_no: id
        };

        // Initialize progress tracking if enabled
        const isProcessProgressEnabled = PROCESS_PROGRESS_ENABLE_FOR.includes(collectionName);
        
        if (isProcessProgressEnabled) {
            const process_id = `Upload_${getUniqueTimestamp()}`;
            uploadProcess = new global.capps.core.class.ProcessProgress(process_id, session, {
                total: 1, // Will be updated once we know the record count
                notify_url: `${config.NGINX_IP}${config.GATEWAY_ROUTES.ncenter}/`,
                app_name: APP_NAME,
                process_name: 'File Upload',
                process_desc: `Processing ${collectionName} data import`,
                file_id: id,
            });
            await uploadProcess.start();
        }

        // Update status to processing
        await updateFileInterfaceStatus(id, 'PROCESSING', session);

        // Get file from database
        const fileData = await getFileFromDatabase(id, session);
        if (!fileData) {
            throw new Error('File not found in database');
        }

        // Create file stream
        let fileStream = createFileStream(fileData, dbutil);
        
        // Process the file through pipeline
        const processingResult = await processFileData(
            fileStream, 
            collectionName, 
            id,
            session, 
            uploadProcess
        );

        // Update final status
        if (processingResult.errorCount > 0) {
            await updateFileInterfaceStatus(
                id, 
                `COMPLETED_WITH_ERRORS (${processingResult.errorCount} errors)`, 
                session
            );
        } else {
            await updateFileInterfaceStatus(
                id, 
                `COMPLETED (${processingResult.successCount} records)`, 
                session
            );
        }

        // Complete progress tracking
        if (uploadProcess) {
            uploadProcess.update({
                type: 'success',
                msg: `Upload completed: ${processingResult.successCount} successful, ${processingResult.errorCount} errors`
            });
            uploadProcess.end();
        }

        logger.info(`[${collectionName}] File processing completed: ${processingResult.successCount} successful, ${processingResult.errorCount} errors`);

    } catch (error) {
        logger.error(`[${collectionName}] File processing error: ${error.stack}`);
        
        // Update status to failed
        if (session.db) {
            await updateFileInterfaceStatus(id, `FAILED: ${error.message}`, session);
        }
        
        // Update progress tracking
        if (uploadProcess) {
            uploadProcess.update({
                type: 'error',
                msg: `Upload failed: ${error.message}`
            });
            uploadProcess.end();
        }
    } finally {
        if (session.db) {
            await session.db.close();
        }
    }
};

// Get file data from database
async function getFileFromDatabase(id, session) {
    const sql = `SELECT FILEOBJECT, FILENAME, FILETYPE FROM CAPPS_FILE_INTERFACE WHERE ID = :id`;
    const result = await session.db.execute(sql, { id: id });
    
    if (!result.rows || result.rows.length === 0) {
        throw new Error(`File with ID ${id} not found`);
    }
    
    return result.rows[0];
}

// Create appropriate file stream based on database type
function createFileStream(fileData, dbutil) {
    if (dbutil.getPoolType() === "mysql") {
        const fileBuffer = fileData.FILEOBJECT;
        return Readable.from(fileBuffer);
    } else {
        // Oracle LOB stream
        return fileData.FILEOBJECT;
    }
}

// Main file processing pipeline
async function processFileData(fileStream, collectionName, fileId, session, uploadProcess) {
    const collectionSchema = await global.capps[APP_NAME][collectionName].document;
    
    let totalRecords = 0;
    let successCount = 0;
    let errorCount = 0;

    // Count total records first for progress tracking
    const recordCount = await countRecordsInFile(fileStream, collectionSchema);
    if (uploadProcess) {
        uploadProcess.update({
            type: 'info',
            total: recordCount,
            msg: `Found ${recordCount} records to process`
        });
    }

    // Reset stream for processing
    fileStream = createFileStream(await getFileFromDatabase(fileId, session), dbutil);

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
        mergeRecordsStream(collectionName, fileId, session),
        processRecordsStream(collectionName, fileId, session, uploadProcess, 
            (success, error) => {
                successCount += success;
                errorCount += error;
            }
        ),
        sinkStream()
    );

    // Finalize collection upload
    await global.capps[APP_NAME][collectionName].upload(null, { ...session, end: true });

    return { successCount, errorCount, totalRecords: recordCount };
}

// Count records for progress tracking
async function countRecordsInFile(fileStream, collectionSchema) {
    let count = 0;
    
    await pipelinePromise(
        fileStream,
        CSVToJsonParser({
            headers: collectionSchema?.UPLOAD_COLUMN_MAP
        }),
        new stream.Writable({
            objectMode: true,
            write(chunk, encoding, callback) {
                count++;
                callback();
            }
        })
    );
    
    return count;
}

module.exports = { create };
```

## Advanced Processing Patterns

### Parent-Child Record Processing

```javascript
// Merge records for parent-child relationships
function mergeRecordsStream(collectionName, fileId, session) {
    let mergedRecord = {};
    let line_no = 0;
    let childKeyName = null;
    let isParentChildUpload = false;
    let parentKeys = null;

    return async function* (source) {
        source.on('header', (header) => {
            // Detect parent-child structure by checking for dot notation
            isParentChildUpload = header.join().includes('.');
            parentKeys = header.filter(key => !key.includes('.'));
            
            logger.info(`[${collectionName}] Parent-Child upload detected: ${isParentChildUpload}`);
            logger.info(`[${collectionName}] Parent keys: ${parentKeys.join(', ')}`);
        });

        for await (const json of source) {
            line_no += 1;

            if (!isParentChildUpload) {
                // Simple flat record processing
                yield json;
            } else if (line_no === 1) {
                // First record - establish parent structure
                childKeyName = getChildCollectionName(json);
                mergedRecord = { ...json };
                
                if (childKeyName) {
                    // Initialize child array
                    mergedRecord[childKeyName] = [json[childKeyName]];
                    // Remove child data from parent level
                    delete mergedRecord[childKeyName.split('.')[0]];
                }
            } else if (parentKeys.some(key => json[key] && json[key].trim() !== '')) {
                // New parent record detected
                yield mergedRecord;
                
                // Start new parent record
                mergedRecord = { ...json };
                if (childKeyName) {
                    mergedRecord[childKeyName] = [json[childKeyName]];
                    delete mergedRecord[childKeyName.split('.')[0]];
                }
            } else if (childKeyName && json[childKeyName]) {
                // Child record - add to current parent
                if (!mergedRecord[childKeyName]) {
                    mergedRecord[childKeyName] = [];
                }
                mergedRecord[childKeyName].push(json[childKeyName]);
            }
        }
        
        // Yield final record if parent-child processing
        if (isParentChildUpload && mergedRecord && Object.keys(mergedRecord).length > 0) {
            yield mergedRecord;
        }
    };
}

// Identify child collection name from data structure
function getChildCollectionName(json) {
    const keys = Object.keys(json);
    // Look for keys that contain objects (child records)
    return keys.find(key => 
        typeof json[key] === 'object' && 
        json[key] !== null && 
        !Array.isArray(json[key])
    );
}
```

### Record Processing with Validation

```javascript
function processRecordsStream(collectionName, fileId, session, uploadProcess, callback) {
    let line_no = 0;
    let batchSize = 100;
    let processedInBatch = 0;

    return async function* (source) {
        for await (const json of source) {
            line_no += 1;
            let saveResult = { status: 'error', error: ['Unknown error'] };

            try {
                // Pre-processing validation
                const validation = await validateRecord(json, collectionName);
                if (!validation.valid) {
                    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
                }

                // Data transformation
                const transformedRecord = await transformRecord(json, collectionName);

                // Save record using CAPPS framework
                saveResult = await global.capps[APP_NAME][collectionName].upload(transformedRecord, session);
                
                if (saveResult.status === 'success') {
                    callback(1, 0); // 1 success, 0 errors
                    processedInBatch++;
                } else {
                    callback(0, 1); // 0 success, 1 error
                    throw new Error(saveResult.error ? saveResult.error.join(', ') : 'Save failed');
                }
            } catch (error) {
                callback(0, 1); // 0 success, 1 error
                logger.error(`[${collectionName}] Record processing error at line ${line_no}: ${error.message}`);
                
                // Log exception to file_exceptions table
                const exceptionData = {
                    PARENT_ID: fileId,
                    RECORD_NO: line_no,
                    DETAILS: `Processing error: ${error.message}`,
                    ERROR_TYPE: 'PROCESSING_ERROR',
                    TIMESTAMP: new Date()
                };
                
                try {
                    await global.capps[APP_NAME]["file_exceptions"].create(exceptionData, session);
                } catch (logError) {
                    logger.error(`Failed to log exception: ${logError.message}`);
                }
            }

            // Update progress periodically
            if (uploadProcess && processedInBatch % batchSize === 0) {
                uploadProcess.update({
                    type: 'progress',
                    current: line_no,
                    msg: `Processed ${line_no} records`
                });
            }
            
            yield json;
        }
    };
}

// Record validation
async function validateRecord(record, collectionName) {
    const errors = [];
    const schema = await global.capps[APP_NAME][collectionName].document;
    
    // Check required fields
    Object.entries(schema.FIELDS || {}).forEach(([fieldName, fieldConfig]) => {
        if (fieldConfig.required && (!record[fieldName] || record[fieldName].trim() === '')) {
            errors.push(`${fieldName} is required`);
        }
        
        // Length validation
        if (fieldConfig.maxlength && record[fieldName] && record[fieldName].length > fieldConfig.maxlength) {
            errors.push(`${fieldName} exceeds maximum length of ${fieldConfig.maxlength}`);
        }
        
        // Format validation based on field type
        if (record[fieldName] && record[fieldName].trim() !== '') {
            switch (fieldConfig.fieldtype) {
                case 'email_address':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record[fieldName])) {
                        errors.push(`${fieldName} is not a valid email address`);
                    }
                    break;
                case 'date':
                    if (isNaN(Date.parse(record[fieldName]))) {
                        errors.push(`${fieldName} is not a valid date`);
                    }
                    break;
                case 'float':
                case 'int':
                    if (isNaN(Number(record[fieldName]))) {
                        errors.push(`${fieldName} must be a number`);
                    }
                    break;
            }
        }
    });
    
    return { valid: errors.length === 0, errors };
}

// Data transformation
async function transformRecord(record, collectionName) {
    const transformed = { ...record };
    const schema = await global.capps[APP_NAME][collectionName].document;
    
    // Apply transformations based on field configuration
    Object.entries(schema.FIELDS || {}).forEach(([fieldName, fieldConfig]) => {
        if (transformed[fieldName] !== undefined && transformed[fieldName] !== null) {
            switch (fieldConfig.fieldtype) {
                case 'date':
                    if (transformed[fieldName]) {
                        transformed[fieldName] = new Date(transformed[fieldName]).toISOString().split('T')[0];
                    }
                    break;
                case 'float':
                    if (transformed[fieldName] !== '') {
                        transformed[fieldName] = parseFloat(transformed[fieldName]) || 0;
                    }
                    break;
                case 'int':
                    if (transformed[fieldName] !== '') {
                        transformed[fieldName] = parseInt(transformed[fieldName]) || 0;
                    }
                    break;
                case 'checkbox':
                case 'switch':
                    // Convert various true/false representations
                    const value = transformed[fieldName].toString().toLowerCase();
                    transformed[fieldName] = ['true', '1', 'yes', 'y', 'on'].includes(value) 
                        ? (fieldConfig['checked-value'] || '1')
                        : (fieldConfig['unchecked-value'] || '0');
                    break;
            }
        }
        
        // Apply default values for empty fields
        if ((!transformed[fieldName] || transformed[fieldName] === '') && fieldConfig.default) {
            if (fieldConfig.default === 'CURRENT_DATE') {
                transformed[fieldName] = new Date().toISOString().split('T')[0];
            } else if (fieldConfig.default === 'CURRENT_TIMESTAMP') {
                transformed[fieldName] = new Date().toISOString();
            } else {
                transformed[fieldName] = fieldConfig.default;
            }
        }
    });
    
    return transformed;
}
```

## Status Management

```javascript
// Update file interface status
async function updateFileInterfaceStatus(fileId, status, session) {
    const sql = `UPDATE CAPPS_FILE_INTERFACE SET STATUS = :status, UPDATED_DATE = SYSDATE WHERE ID = :fileId`;
    await session.db.execute(sql, { status, fileId }, { autoCommit: true });
    logger.info(`File ${fileId} status updated to: ${status}`);
}

// Get processing statistics
async function getProcessingStats(fileId, session) {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM CAPPS_FILE_EXCEPTIONS WHERE PARENT_ID = :fileId) as error_count,
            fi.STATUS as file_status,
            fi.FILENAME,
            fi.CREATED_DATE
        FROM CAPPS_FILE_INTERFACE fi 
        WHERE fi.ID = :fileId
    `;
    
    const result = await session.db.execute(sql, { fileId });
    return result.rows[0];
}
```

## Best Practices

### File Size and Performance

```javascript
// Configure appropriate batch sizes based on record complexity
const getBatchSize = (collectionName) => {
    const batchSizes = {
        'simple_collection': 500,
        'complex_collection': 100,
        'transaction_data': 200,
        'default': 250
    };
    return batchSizes[collectionName] || batchSizes.default;
};

// Memory management for large files
const configureStreamOptions = (fileSize) => {
    return {
        highWaterMark: fileSize > 50 * 1024 * 1024 ? 64 * 1024 : 16 * 1024, // 64KB for large files
        objectMode: false
    };
};
```

### Error Recovery

```javascript
// Implement retry logic for transient errors
async function processWithRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries || !isRetryableError(error)) {
                throw error;
            }
            
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

function isRetryableError(error) {
    const retryableErrors = [
        'ECONNRESET',
        'ENOTFOUND',
        'ETIMEDOUT',
        'database connection lost'
    ];
    
    return retryableErrors.some(errorType => 
        error.message.toLowerCase().includes(errorType.toLowerCase())
    );
}
```

### Data Integrity

```javascript
// Transaction management for bulk operations
async function processBatchWithTransaction(records, collectionName, session) {
    const connection = session.db;
    
    try {
        await connection.execute('BEGIN', [], { autoCommit: false });
        
        for (const record of records) {
            await global.capps[APP_NAME][collectionName].upload(record, {
                ...session,
                db: connection
            });
        }
        
        await connection.commit();
        return { success: true, processed: records.length };
        
    } catch (error) {
        await connection.rollback();
        throw error;
    }
}
```

## Monitoring and Reporting

### Processing Reports

```javascript
// Generate processing summary
async function generateProcessingSummary(fileId, session) {
    const sql = `
        SELECT 
            fi.FILENAME,
            fi.MODEL_NAME,
            fi.STATUS,
            fi.CREATED_DATE,
            COUNT(fe.ID) as exception_count,
            pp.TOTAL,
            pp.SUCCESS,
            pp.ERRORS
        FROM CAPPS_FILE_INTERFACE fi
        LEFT JOIN CAPPS_FILE_EXCEPTIONS fe ON fi.ID = fe.PARENT_ID
        LEFT JOIN CAPPS_PROCESS_PROGRESS pp ON pp.FILE_ID = fi.ID
        WHERE fi.ID = :fileId
        GROUP BY fi.FILENAME, fi.MODEL_NAME, fi.STATUS, fi.CREATED_DATE, pp.TOTAL, pp.SUCCESS, pp.ERRORS
    `;
    
    const result = await session.db.execute(sql, { fileId });
    return result.rows[0];
}
```

---

The CAPPS file handling and bulk operations system provides enterprise-grade capabilities for processing large datasets with comprehensive error handling, progress tracking, and data validation, ensuring reliable and scalable data import operations.