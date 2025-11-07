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
export const richTextEditorField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 300, };

        return {
            ...field,
            type: "rich_text_editor",
            description: field.description,
            disabled: getDisabledState(field, id),
            handlers: createBaseHandler(field, this)
        }
    }
} 