/**
 * Number Field Configuration
 * Handles numeric input fields (int, float, alphanumeric)
 */
import { createBaseHandler, getDisabledState } from './common';

/**
 * Creates a number field configuration
 * @param {string} type - View type ('grid' or 'form')
 * @param {string} inputType - Type of number input ('number' or 'numericOnly')
 * @returns {Function} Number field configuration function
 */
export const numberField = (type, inputType) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 120, };

        return {
            type: inputType,
            disabled: getDisabledState(field, id),
            description: field.description,
            handlers: createBaseHandler(field, this)
        }
    }
} 