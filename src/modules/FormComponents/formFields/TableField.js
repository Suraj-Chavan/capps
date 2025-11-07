/**
 * Table Field Configuration
 * Handles table/grid view configurations
 */
import { createBaseHandler } from './common';

/**
 * Creates a table field configuration
 * @param {string} type - View type ('grid' or 'form')
 * @returns {Function} Table field configuration function
 */
export const tableField = (type) => {
    return function () {
        const [field, { moduleName, collection }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 100 };

        const ref = "" + field.ref;
        
        return {
            collection: ref || "",
            applicationName: moduleName || "",
            tableLabel: field.label,
            parentField: field["parent.field"],
            parentAppName: moduleName,
            description: field.description,
            parentCollection: collection,
            disabled: field.disabled === 1,
            handlers: createBaseHandler(field, this)
        }
    }
} 