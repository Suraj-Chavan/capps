/**
 * Time Field Configuration
 * Handles time input fields
 */
import { createBaseHandler, getDisabledState } from './common';

/**
 * Creates a time field configuration
 * @param {string} type - View type ('grid' or 'form')
 * @returns {Function} Time field configuration function
 */
export const timeField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 100, };

        return {
            type: "time",
            description: field.description,
            disabled: getDisabledState(field, id),
            handlers: createBaseHandler(field, this)
        }
    }
} 