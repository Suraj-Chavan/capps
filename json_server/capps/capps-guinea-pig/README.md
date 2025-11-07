# CAPPS Guinea Pig Application

This is the CAPPS Guinea Pig application for testing and development purposes.

## Directory Structure

```
capps-guinea-pig/
├── config.json                          # Application configuration
├── en.json                             # Locale translations
├── README.md                           # This file
└── rest/
    └── collection/
        └── vr_user_master/             # Virtual user master collection
            └── schema.json             # User virtual collection schema
```

## Collections

### vr_user_master (Virtual Collection)

A virtual collection that provides user data for mention/tagging features.

**Data Source**: `IWZ_USER_MASTER` table
**Fields**:
- `USER_ID` - Unique user identifier
- `USER_NAME` - Display name for user

**SQL Query**:
```sql
select USER_ID, USER_NAME from IWZ_USER_MASTER
```

**Usage in Comments**:
The CommentSection component uses this collection to provide autocomplete when users type `@` to mention other users.

## How to Use

### Accessing the Virtual Collection

The collection is available at:
```
/capps/capps-guinea-pig/vr_user_master
```

### API Access

```javascript
// Fetch all users
const users = await capps.rest['capps-guinea-pig'].vr_user_master.read();

// Search users by name
const users = await capps.rest['capps-guinea-pig'].vr_user_master.read({
  filter: [
    { field: "USER_NAME", value: "%john%", asgn: "like" }
  ],
  limit: 10
});
```

### Database Requirements

Ensure the `IWZ_USER_MASTER` table exists in your database with at least these columns:
- `USER_ID` - VARCHAR/VARCHAR2
- `USER_NAME` - VARCHAR/VARCHAR2

**Oracle Example**:
```sql
CREATE TABLE IWZ_USER_MASTER (
    USER_ID VARCHAR2(50) PRIMARY KEY,
    USER_NAME VARCHAR2(100) NOT NULL,
    EMAIL VARCHAR2(100),
    ACTIVE_STATUS VARCHAR2(20) DEFAULT 'ACTIVE',
    CREATED_ON DATE DEFAULT SYSDATE
);
```

**MySQL Example**:
```sql
CREATE TABLE IWZ_USER_MASTER (
    USER_ID VARCHAR(50) PRIMARY KEY,
    USER_NAME VARCHAR(100) NOT NULL,
    EMAIL VARCHAR(100),
    ACTIVE_STATUS VARCHAR(20) DEFAULT 'ACTIVE',
    CREATED_ON DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Adding More Collections

To add additional collections to this application:

1. Create collection directory:
   ```bash
   mkdir -p rest/collection/{collection_name}
   ```

2. Create schema file:
   ```bash
   touch rest/collection/{collection_name}/schema.json
   ```

3. Optionally add event handlers:
   ```bash
   touch rest/collection/{collection_name}/form.js
   touch rest/collection/{collection_name}/list.js
   ```

4. Update `en.json` with locale translations for the new collection

## Notes

- This is a virtual collection (read-only)
- No form.js or list.js files are needed for basic virtual collections
- The collection is primarily used by the CommentSection mention feature
- Ensure the source table `IWZ_USER_MASTER` exists in your database
