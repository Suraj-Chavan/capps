# Sample Customer Collection

This is a comprehensive sample collection demonstrating CAPPS framework features.

## Files Included

### 1. schema.json
Comprehensive schema demonstrating:
- **Field Types**: textfield, textarea, email_address, select, date, datetime, float, checkbox, ratings
- **Layout Elements**: section_break, column_break
- **Field Properties**: required, unique, readonly, hidden, maxlength, default values
- **List Configuration**: in_list_view, in_standard_filter, in_quick_filter
- **Amount Fields**: is_amount, precision for currency formatting
- **Audit Fields**: CREATED_BY, CREATED_ON, UPDATED_BY, UPDATED_ON

### 2. form.js
Form event handlers demonstrating:

#### Lifecycle Events:
- `_onLoadEvent`: Initialize form on load
- `_onBeforeSave`: Validate before saving (throw error to prevent save)
- `_afterFormSubmit`: Post-save operations

#### Field Change Events:
- `CUSTOMER_TYPE`: Dynamic field visibility/values based on selection
- `IS_VIP`: Auto-adjust credit limit for VIP customers
- `EMAIL`: Real-time validation and duplicate checking
- `COUNTRY`: Contextual help messages

#### Custom Buttons:
- `buttonList`: Custom form actions with conditional visibility

#### Utilities:
- `_formUtilities`: Reusable helper functions

### 3. list.js
List view customization demonstrating:

#### Column Formatters:
- `STATUS`: Color-coded status badges with icons
- `CUSTOMER_TYPE`: Icons based on type
- `IS_VIP`: VIP badge display
- `CREDIT_LIMIT`: Currency formatting with Indian locale
- `EMAIL`: Clickable mailto links

#### Bulk Actions (buttonList):
- **Activate Customers**: Bulk status update with filtering
- **Deactivate Customers**: Bulk deactivation
- **Export VIP Customers**: Filtered data export

#### Row Actions (buttonColumns):
- **Send Email**: Per-row email action (conditional visibility)
- **Quick View**: Modal with customer details
- **Toggle VIP**: Individual VIP status toggle

#### Advanced Features:
- `before_render`: Pre-process list data
- `rowRenderer`: Custom CSS classes per row
- `columnRowColorize`: Conditional column styling

## Database Table Structure

Create this table to use the collection:

\`\`\`sql
CREATE TABLE CUSTOMERS (
    ID NUMBER PRIMARY KEY,
    CUSTOMER_NAME VARCHAR2(100) NOT NULL,
    EMAIL VARCHAR2(100) UNIQUE NOT NULL,
    PHONE VARCHAR2(20),
    CUSTOMER_TYPE VARCHAR2(20) DEFAULT 'INDIVIDUAL',
    STATUS VARCHAR2(20) DEFAULT 'PENDING',
    REGISTRATION_DATE DATE DEFAULT SYSDATE,
    CREDIT_LIMIT NUMBER(15,2) DEFAULT 0,
    IS_VIP NUMBER(1) DEFAULT 0,
    ADDRESS VARCHAR2(500),
    CITY VARCHAR2(50),
    STATE VARCHAR2(50),
    COUNTRY VARCHAR2(2) DEFAULT 'IN',
    POSTAL_CODE VARCHAR2(10),
    NOTES VARCHAR2(1000),
    RATING NUMBER(1) DEFAULT 3,
    CREATED_BY VARCHAR2(50),
    CREATED_ON TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY VARCHAR2(50),
    UPDATED_ON TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-increment sequence for ID
CREATE SEQUENCE CUSTOMERS_SEQ START WITH 1 INCREMENT BY 1;

-- Trigger for auto-increment
CREATE OR REPLACE TRIGGER CUSTOMERS_ID_TRIGGER
BEFORE INSERT ON CUSTOMERS
FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT CUSTOMERS_SEQ.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/
\`\`\`

## MySQL Version:

\`\`\`sql
CREATE TABLE CUSTOMERS (
    ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    CUSTOMER_NAME VARCHAR(100) NOT NULL,
    EMAIL VARCHAR(100) UNIQUE NOT NULL,
    PHONE VARCHAR(20),
    CUSTOMER_TYPE VARCHAR(20) DEFAULT 'INDIVIDUAL',
    STATUS VARCHAR(20) DEFAULT 'PENDING',
    REGISTRATION_DATE DATE DEFAULT (CURRENT_DATE),
    CREDIT_LIMIT DECIMAL(15,2) DEFAULT 0,
    IS_VIP TINYINT(1) DEFAULT 0,
    ADDRESS VARCHAR(500),
    CITY VARCHAR(50),
    STATE VARCHAR(50),
    COUNTRY VARCHAR(2) DEFAULT 'IN',
    POSTAL_CODE VARCHAR(10),
    NOTES VARCHAR(1000),
    RATING TINYINT DEFAULT 3,
    CREATED_BY VARCHAR(50),
    CREATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY VARCHAR(50),
    UPDATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

## Usage

1. Copy this entire \`sample_app\` directory to your CAPPS application's collection directory
2. Create the database table using the SQL above
3. Access the collection at: \`/collection/sample_app/customers\`

## Key Learning Points

1. **Schema Design**: How to structure fields with proper types and validations
2. **Form Events**: Lifecycle hooks for validation and data manipulation
3. **Field Dependencies**: Dynamic form behavior based on field values
4. **List Customization**: Rich data presentation with formatters
5. **Bulk Operations**: Multiple record updates efficiently
6. **Row Actions**: Context-specific actions per record
7. **User Feedback**: Proper use of alerts, toasts, and confirms
8. **API Integration**: REST API calls for CRUD operations
9. **Error Handling**: Try-catch blocks and user-friendly error messages
10. **Code Organization**: Clean separation of concerns

## Extending This Sample

You can extend this sample by:
- Adding child collections (table fieldtype)
- Creating RPC functions for complex business logic
- Adding event hooks for background processing
- Implementing linked select fields
- Adding file upload functionality
- Creating custom card view templates
