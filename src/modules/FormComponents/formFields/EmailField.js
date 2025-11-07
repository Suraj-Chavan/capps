/**
 * Email Field Configuration
 * Handles email input fields
 */
import { createBaseHandler, getDisabledState } from './common';

/**
 * Creates an email field configuration
 * @param {string} type - View type ('grid' or 'form')
 * @returns {Function} Email field configuration function
 */
export const emailField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 100, };

        field.rules = field.rules || {};
        return {
            type: "email",
            disabled: getDisabledState(field, id),
            description: field.description,
            handlers: createBaseHandler(field, this),
            rules: Object.assign(field.rules, { email: true }),
        }
    }
} 