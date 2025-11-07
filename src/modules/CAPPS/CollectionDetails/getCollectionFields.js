// import featureRowRenderer from './ListJsFeatures/BootstrapTable/ROW_RENDERER';
// import featureColumnRowColorize from './ListJsFeatures/BootstrapTable/COLUMN_ROW_COLORIZE';
// import featureFormatters from "./ListJsFeatures/BootstrapTable/FORMATTERS";
import featureRowRenderer from './ListJsFeatures/PrimeVueDataTable/ROW_RENDERER';
import featureColumnRowColorize from './ListJsFeatures/PrimeVueDataTable/COLUMN_ROW_COLORIZE';
import featureFormatters from "./ListJsFeatures/PrimeVueDataTable/FORMATTERS";
import featureGetColumnSequence from "./ListJsFeatures/BootstrapTable/COLUMN_SEQUENCE";
import BEFORE_RENDER, { notifyListOnload } from "./ListJsFeatures/BootstrapTable/BEFORE_RENDER";
import FILTER_SCREEN_FORM_CONTROLS from "@/modules/FormElementMapping/FilterScreenElementMapping.js";
import getFieldTypeBindings from "@/modules/FormComponents/AddUpdateFormElementMapping.js";
import { processListJsConfig } from "@/Framework/JS API/LIST";
import {
    hasOwn,
} from "@credenceanalytics/utilities";

export const INVALID_COLUMNS_REGEX = /^(SECTIONBREAK|COLUMNBREAK)\d$/;

// Field types that should never be filterable
const NON_FILTERABLE_FIELD_TYPES = [
    "html",
    "button", 
    "section_break",
    "column_break",
    "file"
];

// Field type to filter configuration mapping
const FILTER_CONFIG_BY_FIELDTYPE = {
    "textfield": {
        operators: ["like", "eq", "noteq", "in"],
        component: "TextFilter",
        defaultOperator: "like"
    },
    "textarea": {
        operators: ["like", "eq", "noteq"],
        component: "TextFilter", 
        defaultOperator: "like"
    },
    "select": {
        operators: ["eq", "noteq", "in"],
        component: "SelectFilter",
        defaultOperator: "eq"
    },
    "date": {
        operators: ["eq", "noteq", "gteq", "lteq", "between"],
        component: "DateFilter",
        defaultOperator: "eq"
    },
    "datetime": {
        operators: ["eq", "noteq", "gteq", "lteq", "between"],
        component: "DateTimeFilter",
        defaultOperator: "eq"
    },
    "float": {
        operators: ["eq", "noteq", "gteq", "lteq", "between"],
        component: "NumberFilter",
        defaultOperator: "eq"
    },
    "int": {
        operators: ["eq", "noteq", "gteq", "lteq", "between"],
        component: "NumberFilter",
        defaultOperator: "eq"
    },
    "check": {
        operators: ["eq"],
        component: "BooleanFilter",
        defaultOperator: "eq"
    }
};

// Helper functions for filter configuration
function isFieldTypeFilterable(fieldtype) {
    return !NON_FILTERABLE_FIELD_TYPES.includes(fieldtype);
}

function getFilterOperators(fieldtype) {
    return FILTER_CONFIG_BY_FIELDTYPE[fieldtype]?.operators || ["eq", "noteq"];
}

function getFilterComponent(fieldtype) {
    return FILTER_CONFIG_BY_FIELDTYPE[fieldtype]?.component || "TextFilter";
}

function getDefaultFilterOperator(fieldtype) {
    return FILTER_CONFIG_BY_FIELDTYPE[fieldtype]?.defaultOperator || "eq";
}

const SYSTEM_FIELDS = {
    CREATED_ON: {
        "fieldtype": "datetime",
        "maxlength": null,
        "readonly": 1,
        "default": "CURRENT_DATE",
        "hidden": 1,
    },
    CREATED_BY: {
        "fieldtype": "textfield",
        "maxlength": 50,
        "required": 0,
        "default": "",
        "hidden": 1,
    },
    UPDATED_ON: {
        "fieldtype": "datetime",
        "maxlength": null,
        "readonly": 1,
        "default": "CURRENT_DATE",
        "hidden": 1,
    },
    UPDATED_BY: {
        "fieldtype": "textfield",
        "maxlength": 50,
        "required": 0,
        "default": "",
        "hidden": 1,
    },
};


export async function getCollectionDetails({
    componentReference,
    collectionSchema,
    fieldVisibilityCondition,
    sortable,
    locale,
    childTableSchema,
    moduleName,
    collection
}) {
    const listJs = await processListJsConfig({ moduleName, collectionName: collection });
    const features = listJs?.features || {};
    const actions = listJs?.actions || {};
    const FIELD_TYPE_BINDINGS = getFieldTypeBindings({ type: "grid" });
    const returnObj = {
        actions: [],
        columnLists: [],
        filterColumnLists: {},
        quickFilterColumnLists: {},
        sortField: "",
        sortOrder: "",
        rowAttr: () => ({}),
        notifyListOnload,
        dataTableScrollHeight: "calc(100vh - 190px)",
        formatters: {},
        rowHeaderTemplateRenderer: null,
        rowFooterTemplateRenderer: null,
        listJsActions: actions,
        buttonList: features.buttonList || [],
        buttonColumns: features.buttonColumns || [],
    };

    BEFORE_RENDER({ features, collection });

    const FIELDS = collectionSchema && collectionSchema.FIELDS;
    locale = locale || {};

    const fields = { ...FIELDS };

    
    Object.entries(SYSTEM_FIELDS).forEach(([fieldName, currentField]) => {
        hasOwn(fields, fieldName) || (fields[fieldName] = currentField);
        if(childTableSchema) {
            delete fields[fieldName];
        }
    });

    returnObj.actions = (collectionSchema && collectionSchema.ACTIONS) || [];
    returnObj.sortField = (collectionSchema && collectionSchema.SORT_FIELD) || "";
    returnObj.sortOrder = ((collectionSchema && collectionSchema.SORT_ORDER) || "") === "ASC";
    returnObj.dataTableScrollHeight = (collectionSchema && collectionSchema.DATA_TABLE_SCROLL_HEIGHT) || "calc(100vh - 190px)";

    // Helper function for async reduce
    const reduceAsync = async (arr, callback, initialValue) => {
        let accumulator = initialValue;
        for (const item of arr) {
            accumulator = await callback(accumulator, item);
        }
        return accumulator;
    };

    // Main code with async/await
    const processFields = async (entries, /* initialState */) => {
        return await reduceAsync(entries, async (acc, [fieldName, currentField]) => {
            // Skip conditions for visibility function
            if (typeof fieldVisibilityCondition === "function" && fieldVisibilityCondition(currentField, fieldName)) {
                return acc;
            }

            // Skip truly invalid fields (but allow in_list_view=0 fields for filter processing)
            if (
                INVALID_COLUMNS_REGEX.test(fieldName) ||
                ["table", "button", "column_break", "section_break", "html"].includes(currentField.fieldtype)
            ) {
                return acc;
            }

            // Process field configuration for all valid fields (needed for both columns and filters)
            const label = (locale && hasOwn(locale, fieldName)
              ? locale[fieldName] : (currentField["label"] || fieldName.replace(/_/g, " "))
            ) || currentField["label"];

            let fieldConfig = {};
            if (FIELD_TYPE_BINDINGS[currentField.fieldtype]) {
                // Await the dynamic import
                fieldConfig = await FIELD_TYPE_BINDINGS[currentField.fieldtype](currentField);
            }

            // Handle standard filter fields (process regardless of in_list_view)
            if (currentField.in_standard_filter || currentField.in_quick_filter) {
                let obj = {
                    label,
                    handlers: {},
                    ...(
                        FILTER_SCREEN_FORM_CONTROLS[currentField.fieldtype] && 
                        await FILTER_SCREEN_FORM_CONTROLS[currentField.fieldtype](currentField, { moduleName, collection })
                    ),
                };
                if(!FILTER_SCREEN_FORM_CONTROLS[currentField.fieldtype]) {
                    obj = {
                        ...obj,
                        ...await FILTER_SCREEN_FORM_CONTROLS["textfield"](currentField, { moduleName, collection }),
                    }
                }
                obj.name = fieldName;
                currentField.in_standard_filter && (acc.filterEL[fieldName] = obj); 
                currentField.in_quick_filter && (acc.quickFilterColumnLists[fieldName] = obj);

                console.log("Quick filter added for:", fieldName, obj);
            }

            // Only process for column list if field should be visible in list view
            if (typeof fieldVisibilityCondition !== "function" && currentField.in_list_view == 0) {
                return acc;
            }

            returnObj.tbodyTrAttr = featureRowRenderer(features);
            returnObj.columnRowColorize = featureColumnRowColorize({ features, fieldName, fieldConfig });

            const GRID_COLUMNS = {
                key: fieldName,
                sortable: hasOwn(currentField, "sortable") 
                    ? currentField.sortable == 1 : 
                    (sortable == null || sortable) ? true : false,
                // Enable filtering by default unless explicitly disabled or field type is non-filterable
                filter: hasOwn(currentField, "column_filterable") 
                    ? currentField.column_filterable == 1 
                    : isFieldTypeFilterable(currentField.fieldtype),
                // Add filter configuration based on field type
                filterable: hasOwn(currentField, "column_filterable") 
                    ? currentField.column_filterable == 1 
                    : isFieldTypeFilterable(currentField.fieldtype),
                filterOperators: getFilterOperators(currentField.fieldtype),
                filterComponent: getFilterComponent(currentField.fieldtype),
                defaultFilterOperator: getDefaultFilterOperator(currentField.fieldtype),
                fieldtype: currentField.fieldtype,
                label,
                stickyColumn: currentField.sticky_column == 1,
                ...fieldConfig,
            };

            // Special handling for amount and date fields
            if (currentField.is_amount || ["date", "datetime"].includes(currentField.fieldtype)) {
                GRID_COLUMNS.class = "text-right";
                if (currentField.is_amount) {
                    GRID_COLUMNS.formatter = (value) => componentReference.$convertCommaString(value);
                }

                returnObj.formatters = Object.assign(returnObj.formatters, { [fieldName]: GRID_COLUMNS.formatter })
            }

            returnObj.formatters = Object.assign(returnObj.formatters || {}, featureFormatters({ features, fieldName, fieldConfig: GRID_COLUMNS }));

            // Add to COLUMN_LIST
            acc.COLUMN_LIST.push(GRID_COLUMNS);
            // Handle linked fields for select type
            if (!childTableSchema && currentField.fieldtype === "select" && 
                currentField.linked_to && currentField.linked_to.fetch_field) {
                Object.entries(currentField.linked_to.fetch_field)
                    .forEach(([linkedFieldName]) => {
                        fields[linkedFieldName] = {
                            type: "string",
                            fetch_from: true,
                        };
                        
                        acc.COLUMN_LIST.push({
                            key: linkedFieldName,
                            sortable: (sortable == null || sortable) ? true : false,
                            label: (
                                locale && 
                                hasOwn(locale, linkedFieldName) && 
                                locale[linkedFieldName]
                            ) || ("" + (linkedFieldName || "")).replace(/_/g, ' '),
                        });
                    });
            }

            return acc;
        }, {
            COLUMN_LIST: returnObj.columnLists,
            filterEL: returnObj.filterColumnLists,
            quickFilterColumnLists: returnObj.quickFilterColumnLists,
        });
    };

    await processFields(Object.entries(fields), {
        COLUMN_LIST: returnObj.columnLists,
        filterEL: returnObj.filterColumnLists,
        quickFilterColumnLists: returnObj.quickFilterColumnLists,
    });

    // Extract row header and footer templates from LIST JS features
    returnObj.rowHeaderTemplateRenderer = features.rowHeaderTemplateRenderer || null;
    returnObj.rowFooterTemplateRenderer = features.rowFooterTemplateRenderer || null;

    // Process buttonColumns with grouping logic - PRESERVE ORIGINAL ORDER
    const buttonColumns = features.buttonColumns || [];

    // Track which groups have been added to avoid duplicates
    const addedGroups = new Set();
    // Store all buttons by group name for later retrieval
    const buttonsByGroup = {};

    // Process buttons sequentially in their original definition order
    buttonColumns.forEach(btn => {
        if (btn.group) {
            // Store button in its group
            if (!buttonsByGroup[btn.group]) {
                buttonsByGroup[btn.group] = [];
            }
            buttonsByGroup[btn.group].push(btn);

            // Add group column only on first encounter of this group
            if (!addedGroups.has(btn.group)) {
                addedGroups.add(btn.group);
                const groupKey = `button-group-${btn.group}`;

                // Avoid duplicate keys
                if (!returnObj.columnLists.some(col => col.key === groupKey)) {
                    // Get the first button for default group icon/label (user can override)
                    const firstButton = btn;

                    returnObj.columnLists.push({
                        key: groupKey,
                        type: 'button-group',
                        group: btn.group,
                        label: firstButton.group_label !== undefined ? firstButton.group_label : btn.group,
                        icon: firstButton.group_icon || 'pi pi-ellipsis-v',
                        buttons: buttonsByGroup[btn.group], // Will contain all buttons in this group
                        sortable: false,
                        filterable: false,
                        column_header: firstButton.group_header || btn.group
                    });
                }
            }
        } else {
            // Add ungrouped button immediately as individual column
            if (!returnObj.columnLists.some(col => col.key === btn.key)) {
                returnObj.columnLists.push({
                    key: btn.key,
                    ...btn,
                    label: btn.label || " ",
                    type: 'button',
                });
            }
        }
    });

    // Sort based on sequence
    returnObj.columnLists = returnObj.columnLists.sort(
        featureGetColumnSequence(returnObj.columnLists, features, fields)
    );

    return returnObj
}


export async function getFormFields({ fields, forEachField, moduleName, collection, id, fieldVisibilityCondition, collectionSchema }) {
    const FIELD_TYPE_BINDINGS = getFieldTypeBindings({ type: "form" });
    const sections = [];
    let currentSection = { rows: [] };
    let currentRow = { columns: [] };
    const ALL_FIELDS = fields || {};
    const FIELDS_CHAIN_INDEX = {};
    
    // Extract label_direction from schema, default to 'top-bottom'
    const labelDirection = collectionSchema?.label_direction || 'top-bottom';

    // First create ordered fields array
    const orderedFields = Object.entries(ALL_FIELDS)
        .reduce((previousOccurrence, [fieldName, currentField]) => {
            const GRID_COLUMNS = { key: fieldName, ...currentField };
            const field_order_no = currentField.field_order_no !== undefined ? currentField.field_order_no : Number.MAX_SAFE_INTEGER;
            
            let pos = previousOccurrence.findIndex(col => 
                (ALL_FIELDS[col.key].field_order_no !== undefined ? ALL_FIELDS[col.key].field_order_no : Number.MAX_SAFE_INTEGER) > field_order_no
            );
            
            if (pos === -1) { 
                pos = previousOccurrence.length; 
            }
            
            previousOccurrence.splice(pos, 0, GRID_COLUMNS);
            return previousOccurrence;
        }, []);

    // Process fields sequentially
    for (const field of orderedFields) {
        // Skip hidden fields
        if ((typeof fieldVisibilityCondition === "function" && fieldVisibilityCondition(field, field.key)) || field.hidden == 1) {
            continue;
        }

        // Get field configuration
        let fieldConfig = {};
        if (FIELD_TYPE_BINDINGS[field.fieldtype]) {
            try {
                fieldConfig = await FIELD_TYPE_BINDINGS[field.fieldtype](field, { moduleName, collection, id });
            } catch (error) {
                console.error(`Error loading configuration for field ${field.key}:`, error);
            }
        }

        // Merge field with its configuration
        const processedField = {
            ...field,
            ...fieldConfig,
            labelDirection, // Add label direction to each field
        };

        processedField.rules = Object.assign(processedField.rules || {}, {
            "required": field.required == 1 ? true : false,
            ...(field.maxlength ? { "max": field.maxlength } : {}),
        });

        // Handle different field types
        if (processedField.fieldtype === "section_break" || processedField.fieldtype === "table") {
            // Add current row and section
            if (currentRow.columns.length > 0) {
                currentSection.rows.push(currentRow);
            }
            if (currentSection.rows.length > 0) {
                sections.push(currentSection);
            }

            // Start new section and row
            currentSection = { rows: [] };
            currentRow = { columns: [] };
            currentRow.sectionLabel = processedField.label;

            if (processedField.fieldtype === "table") {
                delete currentRow.sectionLabel;
                currentRow.columns.push({ ...processedField });
                currentRow.table_configurations = currentRow.columns[currentRow.columns.length - 1];
                
                const chainIndex = `${sections.length}-rows-${currentSection.rows.length}-columns-${currentRow.columns.length - 1}`;
                FIELDS_CHAIN_INDEX[processedField.key] = chainIndex;
                
                if (typeof forEachField === "function") {
                    forEachField(currentRow.table_configurations);
                }
            }
        } 
        else if (processedField.fieldtype === "column_break") {
            currentSection.rows.push(currentRow);
            currentRow = { columns: [] };
        } 
        else {
            currentRow.columns.push({ ...processedField });
            const chainIndex = `${sections.length}-rows-${currentSection.rows.length}-columns-${currentRow.columns.length - 1}`; 
            FIELDS_CHAIN_INDEX[processedField.key] = chainIndex;
            
            if (typeof forEachField === "function") {
                forEachField(currentRow.columns[currentRow.columns.length - 1]);
            }
        }
    }

    // Add remaining rows and sections
    if (currentRow.columns.length > 0) {
        currentSection.rows.push(currentRow);
    }
    if (currentSection.rows.length > 0) {
        sections.push(currentSection);
    }

    return {
        sections,
        FIELDS_CHAIN_INDEX,
        labelDirection
    };
}