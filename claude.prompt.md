
Can you document following workflows in detail and add link in the README.md file?

1. Info about CAPPs API route e.g. <https://127.0.0.1/NREST/{appname}/{collectionname}/read>
    - If collection is created CAPPs provides some standard APIs the collection to perform CRUD operations on it. Following are the example of CRUD API of a collections in a app.
        1. Read Collection Data

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

        2. Read collection record based on primary key ID

            ```javascript
                capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.read[<< ID >>]()
            ```

        3. Update Record

            ```javascript
                // Note: If collection has multipart field then all keys will be sent in formData with multipart formData.set(<<field>>, value) else in json wrapped inside data object
                capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.update[<<ID>>]({ 
                    data: {
                        [field: string]: any  // Field-value pairs to update
                    }
                })
            ```

        4. Create Record

            ```javascript
                // Note: If collection has multipart field then all keys will be sent in formData with multipart formData.set(<<field>>, value) else in json wrapped inside data object
                capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.create({ 
                    data: {
                        [field: string]: any  // Field-value pairs for new record
                    }
                })
            ```

        5. Delete Record

            ```javascript
                capps.rest.<<APP_NAME>>.<<COLLECTION_NAME>>.delete[<<ID>>]()
            ```

2. I also want to document database script preparation guide
    - DATA_MODEL in schema json is the table name in database
    - FIELDS in  schema.json is the column names in database
    - Some field in schema.json should have a corresponding column in the database table with the same name
    - The data types in schema.json should match the database field types attributes:
            textfield -> VARCHAR2
            checkbox -> VARCHAR2
            radio -> VARCHAR2
            switch -> VARCHAR2
            textarea -> VARCHAR2
            int	-> NUMBER
            float -> NUMBER
            email_address -> VARCHAR2
            date -> DATE
            time -> DATE
            datetime -> DATE
            select -> VARCHAR2
            file -> BLOB
            password -> VARCHAR2
            ratings	 -> NUMBER
            rich_text_editor -> VARCHAR2
    - These are CAPPS framework level columns (ID, CREATED_BY, CREATED_ON, UPDATED_BY, UPDATED_ON), table must have these columns
    - Sample of database script for a collection_one collection with all business columns and framework level columns:
   ```sql 
        CREATE TABLE "SBIL_DEV_NEW"."RSA_COLLECTION_ONE" 
            (	"ID" NUMBER DEFAULT "SBIL_DEV_NEW"."RSA_COLLECTION_ONE_IDSEQ"."NEXTVAL", 
            "TEXT_FIELD" VARCHAR2(50 BYTE), 
            "CHECKBOX_FIELD" VARCHAR2(50 BYTE), 
            "RADIO_FIELD" VARCHAR2(50 BYTE), 
            "RADIO_FIELD2" VARCHAR2(50 BYTE), 
            "SWITCH_FIELD" VARCHAR2(50 BYTE), 
            "TEXTAREA_FIELD" VARCHAR2(50 BYTE), 
            "EXPRESSION_TEXTAREA_FIELD" VARCHAR2(50 BYTE), 
            "COMMAND_PALLATE_TEXTAREA_FIELD" VARCHAR2(50 BYTE), 
            "INTEGER_FIELD" NUMBER, 
            "FLOAT_FIELD" NUMBER, 
            "EMAIL_FIELD" VARCHAR2(50 BYTE), 
            "DATE_FIELD" DATE, 
            "TIME_FIELD" VARCHAR2(50 BYTE), 
            "DATE_TIME_FIELD" DATE, 
            "SELECT_FIELD" VARCHAR2(50 BYTE), 
            "REMOTE_SELECT_FIELD" VARCHAR2(50 BYTE), 
            "FILE_FIELD" BLOB, 
            "PASSWORD_FIELD" VARCHAR2(50 BYTE), 
            "RATINGS_FIELD" NUMBER, 
            "RICH_TEXT_EDITOR_FIELD" VARCHAR2(50 BYTE), 
            "CREATED_ON" DATE, 
            "CREATED_BY" VARCHAR2(20 BYTE), 
            "UPDATED_ON" DATE, 
            "UPDATED_BY" VARCHAR2(20 BYTE), 
            "FILE_ID" NUMBER
        ) SEGMENT CREATION DEFERRED 
        PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
        NOCOMPRESS LOGGING
        TABLESPACE "SBIL_DEV_NEW" 
        LOB ("FILE_FIELD") STORE AS SECUREFILE (
        TABLESPACE "SBIL_DEV_NEW" ENABLE STORAGE IN ROW CHUNK 8192
        NOCACHE LOGGING  NOCOMPRESS  KEEP_DUPLICATES ) ;
        ALTER TABLE "SBIL_DEV_NEW"."RSA_COLLECTION_ONE" ADD CONSTRAINT "PK_RSA_COLLECTION_ONE_ID" PRIMARY KEY ("ID")
        USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
        TABLESPACE "SBIL_DEV_NEW"  ENABLE;
        CREATE SEQUENCE "SBIL_DEV_NEW"."RSA_COLLECTION_ONE_IDSEQ" 
            INCREMENT BY 1 
            START WITH 1 
            NOCACHE 
            NOCYCLE;
    ```
    - All business columns should not have NOT NULL or DEFAULT constraints

3. There are some framework level collections which must there in the apps created using capps, collections like attachments, file_exceptions, file_interface, process_progress, process_progress_details, static_master
    - I also want this documented each collection usage within framework.
