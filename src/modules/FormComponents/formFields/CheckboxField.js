import { createBaseHandler, getDisabledState } from './common';

export const checkboxField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 100 };

        return {
            type: "checkbox",
            "checked-val": field["checked-value"] || "1",
            "unchecked-val": field["unchecked-value"] || "0",
            description: field.description,
            disabled: getDisabledState(field, id),
            handlers: createBaseHandler(field, this)
        }
    }
} 