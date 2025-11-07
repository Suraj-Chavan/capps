/**
 * DateTime Field Configuration
 * Handles combined date and time input
 */
import { createBaseHandler, getDisabledState } from './common';

/**
 * Creates a datetime field configuration
 * @param {string} type - View type ('grid' or 'form')
 * @returns {Function} DateTime field configuration function
 */
export const datetimeField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 280, };

        return {
            type: "datetime",
            description: field.description,
            disabled: getDisabledState(field, id),
            handlers: createBaseHandler(field, this)
        }
    }
} 