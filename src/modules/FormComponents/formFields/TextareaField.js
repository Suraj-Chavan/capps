import { createBaseHandler, getDisabledState } from './common';

export const textareaField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 500, };

        return {
            type: field.expression_builder === 1 ? "data-expression"
                : field.command_palette === 1 ? "command-palette"
                : "textarea",
            disabled: getDisabledState(field, id),
            rows: field.rows || "1",
            maxlength: field.maxlength,
            description: field.description,
            "max-rows": field["max-rows"] || "1",
            handlers: createBaseHandler(field, this)
        }
    }
} 