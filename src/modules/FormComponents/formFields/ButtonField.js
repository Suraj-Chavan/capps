import { createBaseHandler, getDisabledState } from './common';

/**
 * Creates a button field configuration
 * @param {string} type - Type of view ('grid' or 'form')
 * @returns {Function} Button field configuration function
 */
export const buttonField = (type) => {
    return function () {
        // Form view configuration
        const [field, { id }] = arguments;
        // Grid view configuration
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 100, };

        return {
            type: "button",
            description: field.description,
            disabled: getDisabledState(field, id),
            handlers: createBaseHandler(field, this, 'click')
        }
    }
} 