/**
 * Text Field Configuration
 * Handles basic text input fields
 */
import { createBaseHandler, getDisabledState } from './common';

/**
 * Creates a text field configuration
 * @param {string} type - View type ('grid' or 'form')
 * @returns {Function} Text field configuration function
 */
export const passwordField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 150, };

        return {
            type: "password",
            disabled: getDisabledState(field, id),
            description: field.description,
            handlers: createBaseHandler(field, this)
        }
    }
} 