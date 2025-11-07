# CAPPS Process Progress System

The Process Progress system in CAPPS provides real-time tracking and monitoring of long-running background processes, such as file uploads, data imports, bulk operations, and batch processing tasks.

## Overview

The system consists of:
- **Progress Tracking**: Real-time progress updates and status monitoring
- **Error Management**: Detailed error logging and exception handling
- **Notification System**: WebSocket-based real-time notifications
- **UI Components**: Built-in progress bars and status displays
- **Database Schema**: Structured progress and error logging

## Architecture

### Core Components

1. **ProcessProgress Class**: Main class for tracking progress
2. **Database Tables**: `CAPPS_PROCESS_PROGRESS` and `CAPPS_PROCESS_PROGRESS_DETAILS`
3. **WebSocket Integration**: Real-time progress updates
4. **UI Components**: Progress bars and status displays

## Database Schema

### Process Progress Table
```json
{
    "DATA_MODEL": "CAPPS_PROCESS_PROGRESS",
    "NAME": "PROCESS PROGRESS",
    "FIELDS": {
        "ID": {
            "fieldtype": "float",
            "iskey": 1
        },
        "PROCESS_NAME": {
            "fieldtype": "textfield",
            "maxlength": 100,
            "required": 0
        },
        "TOTAL": {
            "fieldtype": "float",
            "description": "Total items to process"
        },
        "SUCCESS": {
            "fieldtype": "float", 
            "description": "Successfully processed items"
        },
        "ERRORS": {
            "fieldtype": "float",
            "description": "Failed/error items"
        },
        "ENDDATE": {
            "fieldtype": "date",
            "description": "Process completion date"
        },
        "PROCESS_DESC": {
            "fieldtype": "textfield",
            "maxlength": 100,
            "description": "Process description"
        }
    }
}
```

### Process Details Table
```json
{
    "DATA_MODEL": "CAPPS_PROCESS_PROGRESS_DETAILS", 
    "NAME": "PROCESS PROGRESS DETAILS",
    "FIELDS": {
        "ID": {
            "fieldtype": "float",
            "iskey": 1
        },
        "PARENT_ID": {
            "fieldtype": "float",
            "required": 1,
            "description": "Reference to CAPPS_PROCESS_PROGRESS.ID"
        },
        "PROCESS_NAME": {
            "fieldtype": "textfield",
            "maxlength": 100,
            "description": "Sub-process or step name"
        },
        "DETAILS": {
            "fieldtype": "textfield", 
            "maxlength": 4000,
            "description": "Detailed progress information or error messages"
        }
    }
}
```

## Implementation

### Basic Usage

```javascript
// In event-hooks or controller
const ProcessProgress = global.capps.core.class.ProcessProgress;

// Initialize progress tracking
const process_id = `Upload_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
const uploadProcess = new ProcessProgress(process_id, session, {
    total: totalItemsCount,
    notify_url: `${config.NGINX_IP || "https://127.0.0.1"}${config.GATEWAY_ROUTES.ncenter}/`,
    app_name: "my-app",
    process_name: 'File Upload',
    process_desc: 'Processing customer data import',
    file_id: fileId,
});

// Start the process
await uploadProcess.start();

// Update progress during processing
uploadProcess.update({ 
    type: 'progress', 
    current: processedCount,
    msg: `Processed ${processedCount} of ${totalItemsCount} records`
});

// Handle errors
uploadProcess.update({ 
    type: 'error', 
    msg: `Error processing record ${recordId}: ${errorMessage}`
});

// Complete the process
uploadProcess.update({ 
    type: 'success', 
    msg: `Processing completed successfully. ${successCount} records processed.`
});
uploadProcess.end();
```

### Advanced Configuration

```javascript
const progressConfig = {
    total: 1000,                    // Total items to process
    notify_url: notificationUrl,    // WebSocket notification endpoint  
    app_name: "my-app",            // Application name
    process_name: "Data Import",    // Process display name
    process_desc: "Importing customer records from CSV", // Description
    file_id: uploadedFileId,       // Optional: Associated file ID
    user_id: session.user.id,      // User who initiated the process
    additional_data: {             // Optional: Custom metadata
        source: "api_upload",
        batch_number: "BATCH_001"
    }
};
```

## Event Hooks Integration

The Process Progress system is commonly used in event hooks for file processing:

```javascript
// In event-hooks/file_interface/controller.js
const APP_NAME = 'my-app';
const PROCESS_PROGRESS_ENABLE_FOR = ['collection_one', 'collection_two'];

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

        // Check if progress tracking is enabled for this collection
        const isProcessProgressEnabled = PROCESS_PROGRESS_ENABLE_FOR.includes(collectionName);
        
        if (isProcessProgressEnabled) {
            const process_id = `Upload_${getUniqueTimestamp()}`;
            uploadProcess = new global.capps.core.class.ProcessProgress(process_id, session, {
                total: 1,
                notify_url: `${config.NGINX_IP}${config.GATEWAY_ROUTES.ncenter}/`,
                app_name: APP_NAME,
                process_name: 'File Upload',
                process_desc: `Processing ${collectionName} data`,
                file_id: id,
            });
            await uploadProcess.start();
        }

        // Process the file...
        await processFileData(session, collectionName, uploadProcess);

        // Success completion
        if (uploadProcess) {
            uploadProcess.update({ 
                type: 'success', 
                msg: `Upload completed successfully for batch ${id}` 
            });
            uploadProcess.end();
        }

    } catch (error) {
        logger.error(`Processing error: ${error.stack}`);
        
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

function getUniqueTimestamp() {
    const now = Date.now();
    const hash = crypto.randomBytes(4).toString('hex');
    return `${now}_${hash}`;
}
```

## Stream Processing with Progress

For large file processing, combine with Node.js streams:

```javascript
async function processFileWithProgress(fileStream, uploadProcess) {
    let processedCount = 0;
    let errorCount = 0;
    
    const processRecord = async function* (source) {
        for await (const record of source) {
            try {
                // Process individual record
                const result = await processRecord(record);
                
                if (result.status === 'success') {
                    processedCount++;
                    
                    // Update progress every 100 records
                    if (processedCount % 100 === 0) {
                        uploadProcess.update({
                            type: 'progress',
                            current: processedCount,
                            msg: `Processed ${processedCount} records`
                        });
                    }
                } else {
                    errorCount++;
                    uploadProcess.update({
                        type: 'error',
                        msg: `Record ${processedCount + errorCount} failed: ${result.error}`
                    });
                }
                
                yield record;
            } catch (error) {
                errorCount++;
                uploadProcess.update({
                    type: 'error',
                    msg: `Processing error at record ${processedCount + errorCount}: ${error.message}`
                });
            }
        }
    };

    // Process using streams
    await pipelinePromise(
        fileStream,
        CSVToJsonParser({...options}),
        processRecord,
        sinkStream()
    );

    return { processedCount, errorCount };
}
```

## Progress Types and Status Updates

### Update Types

```javascript
// Progress update
uploadProcess.update({
    type: 'progress',
    current: currentCount,      // Current progress
    total: totalCount,          // Total items (optional override)
    percentage: 45.5,           // Manual percentage (optional)
    msg: 'Processing records...'
});

// Success update  
uploadProcess.update({
    type: 'success',
    msg: 'Operation completed successfully'
});

// Error update
uploadProcess.update({
    type: 'error', 
    msg: 'Error occurred during processing',
    details: errorDetails       // Optional detailed error info
});

// Warning update
uploadProcess.update({
    type: 'warning',
    msg: 'Some records were skipped due to validation errors'
});

// Info update
uploadProcess.update({
    type: 'info',
    msg: 'Starting validation phase...'
});
```

## UI Integration

### Frontend Progress Display

The progress system automatically integrates with the CAPPS UI to show real-time progress:

```javascript
// The UI automatically displays progress for tracked processes
// Progress bars appear in the notification area
// Real-time updates via WebSocket connections

// Custom progress handling in form.js
capps.ui.my_collection.form = {
    async uploadData() {
        const result = await capps.rest.my_app.file_interface.create({
            data: formData
        });
        
        // Process progress will be automatically tracked and displayed
        // if configured in the event hooks
    }
};
```

### Progress Bar Components

```html
<!-- Progress bars are automatically rendered for active processes -->
<div class="process-progress-container">
    <div class="progress-header">
        <span class="process-name">File Upload</span>
        <span class="progress-percentage">45%</span>
    </div>
    <div class="progress-bar">
        <div class="progress-fill" style="width: 45%"></div>
    </div>
    <div class="progress-message">Processed 450 of 1000 records</div>
</div>
```

## Configuration

### Enable Progress Tracking

```javascript
// In event-hooks controller
const PROCESS_PROGRESS_ENABLE_FOR = [
    'collection_one',
    'collection_two', 
    'bulk_import',
    'data_export'
];
```

### WebSocket Configuration

```javascript
// In app configuration
const progressConfig = {
    notify_url: `${config.NGINX_IP}${config.GATEWAY_ROUTES.ncenter}/`,
    websocket_channel: 'process_progress',
    update_interval: 1000  // Update frequency in milliseconds
};
```

## Best Practices

### Progress Granularity
```javascript
// Good: Update progress at meaningful intervals
if (processedCount % 50 === 0 || processedCount === totalCount) {
    uploadProcess.update({
        type: 'progress',
        current: processedCount,
        msg: `Processed ${processedCount} of ${totalCount}`
    });
}

// Avoid: Updating progress on every single item (performance impact)
```

### Error Handling
```javascript
try {
    // Process items
} catch (error) {
    // Log detailed error
    uploadProcess.update({
        type: 'error',
        msg: `Processing failed at record ${currentRecord}: ${error.message}`,
        details: {
            recordId: currentRecord,
            errorStack: error.stack,
            timestamp: new Date().toISOString()
        }
    });
}
```

### Resource Management
```javascript
// Always clean up resources
finally {
    if (uploadProcess) {
        uploadProcess.end();
    }
    if (connection) {
        await connection.close();
    }
}
```

### User Experience
```javascript
// Provide meaningful progress messages
uploadProcess.update({
    type: 'info',
    msg: 'Validating data format...'
});

uploadProcess.update({
    type: 'progress', 
    current: validatedCount,
    msg: `Validated ${validatedCount} records, processing...`
});
```

## Monitoring and Troubleshooting

### View Progress Status
Navigate to the Process Progress collection in your CAPPS application to view:
- Active and completed processes
- Success/failure rates
- Detailed error logs
- Process duration and performance metrics

### Error Analysis
Check the Process Progress Details table for:
- Specific error messages
- Failed record details
- Processing bottlenecks
- System performance issues

---

The Process Progress system provides comprehensive tracking and monitoring capabilities for any long-running operation in your CAPPS application, ensuring users have visibility into background processes and administrators can monitor system performance.