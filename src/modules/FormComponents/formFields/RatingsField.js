/**
 * Hyperlink Field Configuration
 * Handles hyperlink input fields
 */
import { createBaseHandler, getDisabledState } from './common';

/**
 * Creates a hyperlink field configuration
 * @param {string} type - View type ('grid' or 'form')
 * @returns {Function} Hyperlink field configuration function
 */
export const ratingsField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 150, };

        return {
            ...field,
            type: "ratings",
            stars: field.stars || 5,
            readonly: field.readonly === 1,
            showValue: field.clearable == null ? true : field.clearable,
            size: field.size || 26,
            clearable: field.clearable == null ? true : field.clearable,
            increment: field.increment || 0.5,
            inline: field.inline || true,
            padding: field.spacing || 15,
            description: field.description,
            disabled: getDisabledState(field, id),
            handlers: createBaseHandler(field, this)
        }
    }
} 