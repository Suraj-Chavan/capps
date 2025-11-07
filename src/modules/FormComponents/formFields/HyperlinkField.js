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
export const hyperlinkField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 200, };

        return {
            type: "hyperlink",
            target: field.target || "_blank",
            href: field.href || undefined,
            disabled: getDisabledState(field, id),
            description: field.description,
            handlers: createBaseHandler(field, this),
            rel: field.rel || "opener",
        }
    }
} 