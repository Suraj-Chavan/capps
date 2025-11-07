/**
 * HTML Field Configuration
 * Handles HTML content fields
 */
import { createBaseHandler, getDisabledState } from './common';

/**
 * Creates an HTML field configuration
 * @param {string} type - View type ('grid' or 'form')
 * @returns {Function} HTML field configuration function
 */
export const htmlField = (type) => {
    return function () {
        const [field, { id, moduleName, collection }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 500, };

        return {
            type: "html",
            hide_label: true,
            disabled: getDisabledState(field, id),
            handlers: createBaseHandler(field, this),
            reference: field.reference || undefined,
            moduleName, 
            collection,
            id,
        }
    }
} 