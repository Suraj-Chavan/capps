import { createBaseHandler, getDisabledState } from './common';

export const radioField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 100, };

        return {
            type: "radio_options",
            enum: field.enum || [],
            disabled: getDisabledState(field, id),
            description: field.description,
            handlers: createBaseHandler(field, this),
        }
    }
} 