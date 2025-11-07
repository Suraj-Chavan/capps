# CAPPS Database DDL Templates

This document provides ready-to-use DDL templates for creating CAPPS collection tables and audit tables in Oracle and MySQL databases.

## Oracle DDL Templates

### Main Collection Table Template

```sql
-- =============================================================================
-- CAPPS Collection Table Template - Oracle
-- Replace {SCHEMA}, {TABLE_NAME}, and field definitions as needed
-- =============================================================================

-- Create main collection table
CREATE TABLE "{SCHEMA}"."{TABLE_NAME}" 
(
    -- Primary key with sequence
    "ID" NUMBER DEFAULT "{SCHEMA}"."{TABLE_NAME}_IDSEQ"."NEXTVAL",
    
    -- Business columns (customize based on your schema.json)
    "TEXT_FIELD" VARCHAR2(255 BYTE),
    "CHECKBOX_FIELD" VARCHAR2(1 BYTE),
    "RADIO_FIELD" VARCHAR2(50 BYTE),
    "SWITCH_FIELD" VARCHAR2(1 BYTE),
    "TEXTAREA_FIELD" VARCHAR2(4000 BYTE),
    "INTEGER_FIELD" NUMBER,
    "FLOAT_FIELD" NUMBER,
    "EMAIL_FIELD" VARCHAR2(255 BYTE),
    "DATE_FIELD" DATE,
    "TIME_FIELD" VARCHAR2(8 BYTE),
    "DATE_TIME_FIELD" DATE,
    "SELECT_FIELD" VARCHAR2(255 BYTE),
    "PASSWORD_FIELD" VARCHAR2(255 BYTE),
    "RATINGS_FIELD" NUMBER,
    "RICH_TEXT_EDITOR_FIELD" CLOB,
    "FILE_FIELD" BLOB,
    
    -- CAPPS Framework required columns
    "CREATED_ON" DATE,
    "CREATED_BY" VARCHAR2(50 BYTE),
    "UPDATED_ON" DATE,
    "UPDATED_BY" VARCHAR2(50 BYTE),
    "FILE_ID" NUMBER
) 
SEGMENT CREATION DEFERRED 
PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
NOCOMPRESS LOGGING
TABLESPACE "{SCHEMA}"
-- CLOB configuration
LOB ("RICH_TEXT_EDITOR_FIELD") STORE AS SECUREFILE (
    TABLESPACE "{SCHEMA}" 
    ENABLE STORAGE IN ROW 
    CHUNK 8192
    CACHE LOGGING  
    NOCOMPRESS  
    KEEP_DUPLICATES 
)
-- BLOB configuration for file fields
LOB ("FILE_FIELD") STORE AS SECUREFILE (
    TABLESPACE "{SCHEMA}" 
    ENABLE STORAGE IN ROW 
    CHUNK 8192
    NOCACHE LOGGING  
    NOCOMPRESS  
    KEEP_DUPLICATES 
);

-- Primary key constraint
ALTER TABLE "{SCHEMA}"."{TABLE_NAME}" 
ADD CONSTRAINT "PK_{TABLE_NAME}_ID" PRIMARY KEY ("ID")
USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 
COMPUTE STATISTICS 
TABLESPACE "{SCHEMA}" ENABLE;

-- Create sequence for auto-increment ID
CREATE SEQUENCE "{SCHEMA}"."{TABLE_NAME}_IDSEQ" 
INCREMENT BY 1 
START WITH 1 
NOCACHE 
NOCYCLE;

-- Performance indexes
CREATE INDEX "IDX_{TABLE_NAME}_CREATED_ON" ON "{SCHEMA}"."{TABLE_NAME}" ("CREATED_ON");
CREATE INDEX "IDX_{TABLE_NAME}_UPDATED_ON" ON "{SCHEMA}"."{TABLE_NAME}" ("UPDATED_ON");
CREATE INDEX "IDX_{TABLE_NAME}_CREATED_BY" ON "{SCHEMA}"."{TABLE_NAME}" ("CREATED_BY");

-- Add business-specific indexes as needed
-- CREATE INDEX "IDX_{TABLE_NAME}_STATUS" ON "{SCHEMA}"."{TABLE_NAME}" ("STATUS_FIELD");
-- CREATE INDEX "IDX_{TABLE_NAME}_TYPE" ON "{SCHEMA}"."{TABLE_NAME}" ("TYPE_FIELD");
```

### Oracle Audit Table Template

```sql
-- =============================================================================
-- CAPPS Audit Table Template - Oracle  
-- Replace {SCHEMA}, {TABLE_NAME} to match your main table
-- =============================================================================

-- Create audit table (copy all columns from main table + audit columns)
CREATE TABLE "{SCHEMA}"."{TABLE_NAME}_AUDIT" 
(
    -- All original table columns (copied exactly)
    "ID" NUMBER,
    "TEXT_FIELD" VARCHAR2(255 BYTE),
    "CHECKBOX_FIELD" VARCHAR2(1 BYTE),
    "RADIO_FIELD" VARCHAR2(50 BYTE),
    "SWITCH_FIELD" VARCHAR2(1 BYTE),
    "TEXTAREA_FIELD" VARCHAR2(4000 BYTE),
    "INTEGER_FIELD" NUMBER,
    "FLOAT_FIELD" NUMBER,
    "EMAIL_FIELD" VARCHAR2(255 BYTE),
    "DATE_FIELD" DATE,
    "TIME_FIELD" VARCHAR2(8 BYTE),
    "DATE_TIME_FIELD" DATE,
    "SELECT_FIELD" VARCHAR2(255 BYTE),
    "PASSWORD_FIELD" VARCHAR2(255 BYTE),
    "RATINGS_FIELD" NUMBER,
    "RICH_TEXT_EDITOR_FIELD" CLOB,
    "FILE_FIELD" BLOB,
    "CREATED_ON" DATE,
    "CREATED_BY" VARCHAR2(50 BYTE),
    "UPDATED_ON" DATE,
    "UPDATED_BY" VARCHAR2(50 BYTE),
    "FILE_ID" NUMBER,
    
    -- Additional audit columns
    "SYS_AUDITREASON" VARCHAR2(255 BYTE),
    "SYS_USERID" VARCHAR2(50 BYTE),
    "SYS_AUDITDATE" DATE,
    "SYS_OPERATION" VARCHAR2(10 BYTE),
    "SYS_AUDITID" NUMBER DEFAULT "{SCHEMA}"."{TABLE_NAME}_AUDIT_SEQ"."NEXTVAL"
) 
SEGMENT CREATION DEFERRED 
PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
NOCOMPRESS LOGGING
TABLESPACE "{SCHEMA}"
-- CLOB configuration (if main table has CLOB fields)
LOB ("RICH_TEXT_EDITOR_FIELD") STORE AS SECUREFILE (
    TABLESPACE "{SCHEMA}" 
    ENABLE STORAGE IN ROW 
    CHUNK 8192
    CACHE LOGGING  
    NOCOMPRESS  
    KEEP_DUPLICATES 
)
-- BLOB configuration (if main table has BLOB fields)
LOB ("FILE_FIELD") STORE AS SECUREFILE (
    TABLESPACE "{SCHEMA}" 
    ENABLE STORAGE IN ROW 
    CHUNK 8192
    NOCACHE LOGGING  
    NOCOMPRESS  
    KEEP_DUPLICATES 
);

-- Primary key for audit table
ALTER TABLE "{SCHEMA}"."{TABLE_NAME}_AUDIT" 
ADD CONSTRAINT "PK_{TABLE_NAME}_AUDIT" PRIMARY KEY ("SYS_AUDITID")
USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 
COMPUTE STATISTICS 
TABLESPACE "{SCHEMA}" ENABLE;

-- Sequence for audit ID
CREATE SEQUENCE "{SCHEMA}"."{TABLE_NAME}_AUDIT_SEQ" 
INCREMENT BY 1 
START WITH 1 
NOCACHE 
NOCYCLE;

-- Essential audit indexes
CREATE INDEX "IDX_{TABLE_NAME}_AUDIT_DATE" ON "{SCHEMA}"."{TABLE_NAME}_AUDIT" ("SYS_AUDITDATE");
CREATE INDEX "IDX_{TABLE_NAME}_AUDIT_USER" ON "{SCHEMA}"."{TABLE_NAME}_AUDIT" ("SYS_USERID");
CREATE INDEX "IDX_{TABLE_NAME}_AUDIT_OP" ON "{SCHEMA}"."{TABLE_NAME}_AUDIT" ("SYS_OPERATION");
CREATE INDEX "IDX_{TABLE_NAME}_AUDIT_ORIG_ID" ON "{SCHEMA}"."{TABLE_NAME}_AUDIT" ("ID");

-- Composite indexes for better performance
CREATE INDEX "IDX_{TABLE_NAME}_AUDIT_ID_DATE" ON "{SCHEMA}"."{TABLE_NAME}_AUDIT" ("ID", "SYS_AUDITDATE");
CREATE INDEX "IDX_{TABLE_NAME}_AUDIT_USER_DATE" ON "{SCHEMA}"."{TABLE_NAME}_AUDIT" ("SYS_USERID", "SYS_AUDITDATE");
```

## MySQL DDL Templates

### Main Collection Table Template

```sql
-- =============================================================================
-- CAPPS Collection Table Template - MySQL
-- Replace {table_name} and field definitions as needed
-- =============================================================================

-- Create main collection table
CREATE TABLE `{table_name}` (
    -- Primary key with auto-increment
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    
    -- Business columns (customize based on your schema.json)
    `TEXT_FIELD` VARCHAR(255),
    `CHECKBOX_FIELD` VARCHAR(1),
    `RADIO_FIELD` VARCHAR(50),
    `SWITCH_FIELD` VARCHAR(1),
    `TEXTAREA_FIELD` TEXT,
    `INTEGER_FIELD` INT,
    `FLOAT_FIELD` DECIMAL(10,2),
    `EMAIL_FIELD` VARCHAR(255),
    `DATE_FIELD` DATE,
    `TIME_FIELD` TIME,
    `DATE_TIME_FIELD` DATETIME,
    `SELECT_FIELD` VARCHAR(255),
    `PASSWORD_FIELD` VARCHAR(255),
    `RATINGS_FIELD` TINYINT,
    `RICH_TEXT_EDITOR_FIELD` TEXT,
    `FILE_FIELD` LONGBLOB,
    
    -- CAPPS Framework required columns
    `CREATED_ON` DATETIME,
    `CREATED_BY` VARCHAR(50),
    `UPDATED_ON` DATETIME,
    `UPDATED_BY` VARCHAR(50),
    `FILE_ID` BIGINT,
    
    -- Constraints and indexes
    PRIMARY KEY (`ID`),
    INDEX `IDX_CREATED_ON` (`CREATED_ON`),
    INDEX `IDX_UPDATED_ON` (`UPDATED_ON`),
    INDEX `IDX_CREATED_BY` (`CREATED_BY`)
    
    -- Add business-specific indexes as needed
    -- INDEX `IDX_STATUS` (`STATUS_FIELD`),
    -- INDEX `IDX_TYPE` (`TYPE_FIELD`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### MySQL Audit Table Template

```sql
-- =============================================================================
-- CAPPS Audit Table Template - MySQL
-- Replace {table_name} to match your main table
-- =============================================================================

-- Create audit table (copy all columns from main table + audit columns)
CREATE TABLE `{table_name}_audit` (
    -- All original table columns (copied exactly from main table)
    `ID` BIGINT,
    `TEXT_FIELD` VARCHAR(255),
    `CHECKBOX_FIELD` VARCHAR(1),
    `RADIO_FIELD` VARCHAR(50),
    `SWITCH_FIELD` VARCHAR(1),
    `TEXTAREA_FIELD` TEXT,
    `INTEGER_FIELD` INT,
    `FLOAT_FIELD` DECIMAL(10,2),
    `EMAIL_FIELD` VARCHAR(255),
    `DATE_FIELD` DATE,
    `TIME_FIELD` TIME,
    `DATE_TIME_FIELD` DATETIME,
    `SELECT_FIELD` VARCHAR(255),
    `PASSWORD_FIELD` VARCHAR(255),
    `RATINGS_FIELD` TINYINT,
    `RICH_TEXT_EDITOR_FIELD` TEXT,
    `FILE_FIELD` LONGBLOB,
    `CREATED_ON` DATETIME,
    `CREATED_BY` VARCHAR(50),
    `UPDATED_ON` DATETIME,
    `UPDATED_BY` VARCHAR(50),
    `FILE_ID` BIGINT,
    
    -- Additional audit columns
    `SYS_AUDITREASON` VARCHAR(255),
    `SYS_USERID` VARCHAR(50),
    `SYS_AUDITDATE` DATETIME,
    `SYS_OPERATION` VARCHAR(10),
    `SYS_AUDITID` BIGINT NOT NULL AUTO_INCREMENT,
    
    -- Constraints and indexes
    PRIMARY KEY (`SYS_AUDITID`),
    INDEX `IDX_AUDIT_DATE` (`SYS_AUDITDATE`),
    INDEX `IDX_AUDIT_USER` (`SYS_USERID`),
    INDEX `IDX_AUDIT_OP` (`SYS_OPERATION`),
    INDEX `IDX_AUDIT_ORIG_ID` (`ID`),
    INDEX `IDX_AUDIT_ID_DATE` (`ID`, `SYS_AUDITDATE`),
    INDEX `IDX_AUDIT_USER_DATE` (`SYS_USERID`, `SYS_AUDITDATE`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Framework Collections DDL

### Oracle Framework Collections

```sql
-- =============================================================================
-- CAPPS Framework Collections - Oracle
-- =============================================================================

-- 1. Static Master Collection
CREATE TABLE "CAPPS"."RSA_STATIC_MASTER" (
    "ID" NUMBER DEFAULT "CAPPS"."RSA_STATIC_MASTER_IDSEQ"."NEXTVAL",
    "CODE" VARCHAR2(50 BYTE),
    "DESCR" VARCHAR2(255 BYTE),
    "CATEGORY" VARCHAR2(50 BYTE),
    "SUB_CATEGORY" VARCHAR2(50 BYTE),
    "SORT_ORDER" NUMBER,
    "ACTIVE" VARCHAR2(1 BYTE),
    "PARENT_ID" NUMBER,
    "CREATED_ON" DATE,
    "CREATED_BY" VARCHAR2(50 BYTE),
    "UPDATED_ON" DATE,
    "UPDATED_BY" VARCHAR2(50 BYTE),
    "FILE_ID" NUMBER
);

-- 2. Attachments Collection  
CREATE TABLE "CAPPS"."RSA_ATTACHMENTS" (
    "ID" NUMBER DEFAULT "CAPPS"."RSA_ATTACHMENTS_IDSEQ"."NEXTVAL",
    "FILE_NAME" VARCHAR2(255 BYTE),
    "FILE_DATA" BLOB,
    "FILE_SIZE" NUMBER,
    "MIME_TYPE" VARCHAR2(100 BYTE),
    "PARENT_ID" NUMBER,
    "PARENT_COLLECTION" VARCHAR2(50 BYTE),
    "CREATED_ON" DATE,
    "CREATED_BY" VARCHAR2(50 BYTE),
    "UPDATED_ON" DATE,
    "UPDATED_BY" VARCHAR2(50 BYTE),
    "FILE_ID" NUMBER
);

-- 3. File Interface Collection
CREATE TABLE "CAPPS"."RSA_FILE_INTERFACE" (
    "ID" NUMBER DEFAULT "CAPPS"."RSA_FILE_INTERFACE_IDSEQ"."NEXTVAL",
    "OPERATION_TYPE" VARCHAR2(10 BYTE),
    "FILE_PATH" VARCHAR2(500 BYTE),
    "COLLECTION_NAME" VARCHAR2(50 BYTE),
    "STATUS" VARCHAR2(20 BYTE),
    "RECORDS_PROCESSED" NUMBER,
    "ERROR_DETAILS" VARCHAR2(4000 BYTE),
    "CREATED_ON" DATE,
    "CREATED_BY" VARCHAR2(50 BYTE),
    "UPDATED_ON" DATE,
    "UPDATED_BY" VARCHAR2(50 BYTE),
    "FILE_ID" NUMBER
);

-- 4. File Exceptions Collection
CREATE TABLE "CAPPS"."RSA_FILE_EXCEPTIONS" (
    "ID" NUMBER DEFAULT "CAPPS"."RSA_FILE_EXCEPTIONS_IDSEQ"."NEXTVAL",
    "FILE_NAME" VARCHAR2(255 BYTE),
    "ERROR_MESSAGE" VARCHAR2(4000 BYTE),
    "ERROR_CODE" VARCHAR2(50 BYTE),
    "COLLECTION_NAME" VARCHAR2(50 BYTE),
    "USER_ID" VARCHAR2(50 BYTE),
    "EXCEPTION_TIME" DATE,
    "CREATED_ON" DATE,
    "CREATED_BY" VARCHAR2(50 BYTE),
    "UPDATED_ON" DATE,
    "UPDATED_BY" VARCHAR2(50 BYTE),
    "FILE_ID" NUMBER
);

-- 5. Process Progress Collection
CREATE TABLE "CAPPS"."RSA_PROCESS_PROGRESS" (
    "ID" NUMBER DEFAULT "CAPPS"."RSA_PROCESS_PROGRESS_IDSEQ"."NEXTVAL",
    "PROCESS_NAME" VARCHAR2(100 BYTE),
    "STATUS" VARCHAR2(20 BYTE),
    "PROGRESS_PERCENTAGE" NUMBER,
    "CURRENT_STEP" VARCHAR2(255 BYTE),
    "TOTAL_STEPS" NUMBER,
    "START_TIME" DATE,
    "END_TIME" DATE,
    "USER_ID" VARCHAR2(50 BYTE),
    "CREATED_ON" DATE,
    "CREATED_BY" VARCHAR2(50 BYTE),
    "UPDATED_ON" DATE,
    "UPDATED_BY" VARCHAR2(50 BYTE),
    "FILE_ID" NUMBER
);

-- 6. Process Progress Details Collection
CREATE TABLE "CAPPS"."RSA_PROCESS_PROGRESS_DETAILS" (
    "ID" NUMBER DEFAULT "CAPPS"."RSA_PROCESS_PROGRESS_DETAILS_IDSEQ"."NEXTVAL",
    "PROCESS_ID" NUMBER,
    "STEP_NUMBER" NUMBER,
    "STEP_NAME" VARCHAR2(100 BYTE),
    "STATUS" VARCHAR2(20 BYTE),
    "MESSAGE" VARCHAR2(4000 BYTE),
    "START_TIME" DATE,
    "END_TIME" DATE,
    "ERROR_DETAILS" VARCHAR2(4000 BYTE),
    "CREATED_ON" DATE,
    "CREATED_BY" VARCHAR2(50 BYTE),
    "UPDATED_ON" DATE,
    "UPDATED_BY" VARCHAR2(50 BYTE),
    "FILE_ID" NUMBER
);
```

### MySQL Framework Collections

```sql
-- =============================================================================
-- CAPPS Framework Collections - MySQL
-- =============================================================================

-- 1. Static Master Collection
CREATE TABLE `rsa_static_master` (
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    `CODE` VARCHAR(50),
    `DESCR` VARCHAR(255),
    `CATEGORY` VARCHAR(50),
    `SUB_CATEGORY` VARCHAR(50),
    `SORT_ORDER` INT,
    `ACTIVE` VARCHAR(1),
    `PARENT_ID` BIGINT,
    `CREATED_ON` DATETIME,
    `CREATED_BY` VARCHAR(50),
    `UPDATED_ON` DATETIME,
    `UPDATED_BY` VARCHAR(50),
    `FILE_ID` BIGINT,
    PRIMARY KEY (`ID`),
    INDEX `IDX_CODE` (`CODE`),
    INDEX `IDX_CATEGORY` (`CATEGORY`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Attachments Collection
CREATE TABLE `rsa_attachments` (
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    `FILE_NAME` VARCHAR(255),
    `FILE_DATA` LONGBLOB,
    `FILE_SIZE` BIGINT,
    `MIME_TYPE` VARCHAR(100),
    `PARENT_ID` BIGINT,
    `PARENT_COLLECTION` VARCHAR(50),
    `CREATED_ON` DATETIME,
    `CREATED_BY` VARCHAR(50),
    `UPDATED_ON` DATETIME,
    `UPDATED_BY` VARCHAR(50),
    `FILE_ID` BIGINT,
    PRIMARY KEY (`ID`),
    INDEX `IDX_PARENT` (`PARENT_ID`, `PARENT_COLLECTION`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. File Interface Collection
CREATE TABLE `rsa_file_interface` (
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    `OPERATION_TYPE` VARCHAR(10),
    `FILE_PATH` VARCHAR(500),
    `COLLECTION_NAME` VARCHAR(50),
    `STATUS` VARCHAR(20),
    `RECORDS_PROCESSED` INT,
    `ERROR_DETAILS` TEXT,
    `CREATED_ON` DATETIME,
    `CREATED_BY` VARCHAR(50),
    `UPDATED_ON` DATETIME,
    `UPDATED_BY` VARCHAR(50),
    `FILE_ID` BIGINT,
    PRIMARY KEY (`ID`),
    INDEX `IDX_STATUS` (`STATUS`),
    INDEX `IDX_OPERATION` (`OPERATION_TYPE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. File Exceptions Collection
CREATE TABLE `rsa_file_exceptions` (
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    `FILE_NAME` VARCHAR(255),
    `ERROR_MESSAGE` TEXT,
    `ERROR_CODE` VARCHAR(50),
    `COLLECTION_NAME` VARCHAR(50),
    `USER_ID` VARCHAR(50),
    `EXCEPTION_TIME` DATETIME,
    `CREATED_ON` DATETIME,
    `CREATED_BY` VARCHAR(50),
    `UPDATED_ON` DATETIME,
    `UPDATED_BY` VARCHAR(50),
    `FILE_ID` BIGINT,
    PRIMARY KEY (`ID`),
    INDEX `IDX_EXCEPTION_TIME` (`EXCEPTION_TIME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Process Progress Collection
CREATE TABLE `rsa_process_progress` (
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    `PROCESS_NAME` VARCHAR(100),
    `STATUS` VARCHAR(20),
    `PROGRESS_PERCENTAGE` INT,
    `CURRENT_STEP` VARCHAR(255),
    `TOTAL_STEPS` INT,
    `START_TIME` DATETIME,
    `END_TIME` DATETIME,
    `USER_ID` VARCHAR(50),
    `CREATED_ON` DATETIME,
    `CREATED_BY` VARCHAR(50),
    `UPDATED_ON` DATETIME,
    `UPDATED_BY` VARCHAR(50),
    `FILE_ID` BIGINT,
    PRIMARY KEY (`ID`),
    INDEX `IDX_STATUS` (`STATUS`),
    INDEX `IDX_USER_ID` (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Process Progress Details Collection
CREATE TABLE `rsa_process_progress_details` (
    `ID` BIGINT NOT NULL AUTO_INCREMENT,
    `PROCESS_ID` BIGINT,
    `STEP_NUMBER` INT,
    `STEP_NAME` VARCHAR(100),
    `STATUS` VARCHAR(20),
    `MESSAGE` TEXT,
    `START_TIME` DATETIME,
    `END_TIME` DATETIME,
    `ERROR_DETAILS` TEXT,
    `CREATED_ON` DATETIME,
    `CREATED_BY` VARCHAR(50),
    `UPDATED_ON` DATETIME,
    `UPDATED_BY` VARCHAR(50),
    `FILE_ID` BIGINT,
    PRIMARY KEY (`ID`),
    INDEX `IDX_PROCESS_ID` (`PROCESS_ID`),
    FOREIGN KEY (`PROCESS_ID`) REFERENCES `rsa_process_progress`(`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Usage Instructions

### For New Collections

1. **Copy the appropriate template** (Oracle or MySQL)
2. **Replace placeholders**:
   - `{SCHEMA}` / `{TABLE_NAME}` (Oracle) or `{table_name}` (MySQL)
   - Add/remove business columns based on your schema.json
3. **Create the main table first**, then the audit table
4. **Add custom indexes** for frequently queried fields
5. **Set up proper constraints** (foreign keys, unique constraints)

### Field Type Guidelines

- **Text fields**: Use appropriate VARCHAR sizes (255 for most cases)
- **Checkbox/Switch**: Use VARCHAR(1) for Y/N values  
- **Large text**: Use CLOB (Oracle) or TEXT (MySQL)
- **Files**: Use BLOB (Oracle) or LONGBLOB (MySQL)
- **Numbers**: Use NUMBER (Oracle) or appropriate INT/DECIMAL types (MySQL)
- **Dates**: Use DATE (Oracle) or DATETIME (MySQL) for timestamps

### Best Practices

1. **Always create both main and audit tables**
2. **Use consistent naming conventions**
3. **Add appropriate indexes for performance**
4. **Include all framework required columns**
5. **Test with sample data before production deployment**
6. **Create sequences (Oracle) before creating tables**
7. **Set proper character sets and collations**
8. **Use appropriate storage engines (InnoDB for MySQL)**

These templates provide a solid foundation for CAPPS database setup with proper structure, indexing, and audit capabilities.