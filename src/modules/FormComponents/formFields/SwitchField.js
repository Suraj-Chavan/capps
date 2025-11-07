import { createBaseHandler, getDisabledState } from './common';

export const switchField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 100, };

        return {
            type: "checkbox",
            disabled: getDisabledState(field, id),
            "checked-val": field["checked-value"],
            "unchecked-val": field["unchecked-value"],
            description: field.description,
            switch: true,
            handlers: createBaseHandler(field, this)
        }
    }
} 