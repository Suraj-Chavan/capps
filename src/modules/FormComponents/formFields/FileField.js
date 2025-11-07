/**
 * File Field Configuration
 * Handles file upload input fields
 */
import { createBaseHandler, getDisabledState } from './common';

/**
 * Creates a file field configuration
 * @param {string} type - View type ('grid' or 'form')
 * @returns {Function} File field configuration function
 */
export const fileField = (type) => {
    return function () {
        const [field, { id }] = arguments;

        if (type === "grid") return { 
            width: field.list_column_size != null ? field.list_column_size : 100
        };


        let allowed_file_types = field.allowed_file_types || [];
        allowed_file_types = (Array.isArray(allowed_file_types) && allowed_file_types) || [];
        allowed_file_types = "." + allowed_file_types.join(",.");
        allowed_file_types = allowed_file_types === "." ? "" : allowed_file_types;

        const FILE_FIELD_ATTRIBUTES = {
            type: "filefield",
            ...field,
            disabled: getDisabledState(field, id),
            handlers: createBaseHandler(field, this, 'input'),
            description: field.description,
            accept: allowed_file_types
        }
        if(!allowed_file_types) delete FILE_FIELD_ATTRIBUTES.accept;
        return FILE_FIELD_ATTRIBUTES;
    }
} 