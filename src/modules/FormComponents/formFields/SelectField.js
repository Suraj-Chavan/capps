import { isPlainObject } from "@credenceanalytics/utilities";
import { createBaseHandler, getDisabledState } from './common';
import { wrapFilterInFunction } from '../utils/filterUtils';

/**
 * Creates a select field configuration
 * @param {string} type - Type of view ('grid' or 'form')
 * @returns {Function} Field configuration function
 */
export const selectField = (type) => {
    return function () {
        const [field, { id, moduleName }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 150, };

        let obj = createBasicSelect(field, id, this);

        if (isPlainObject(obj.linked_to)) {
            obj = createRemoteSelect(obj, moduleName);
        }
        return obj;
    }
}

/**
 * Creates configuration for basic select field
 * @param {Object} field - Field properties
 * @param {string} id - Field ID
 * @param {Object} context - Component context
 * @returns {Object} Basic select configuration
 */
function createBasicSelect(field, id, context) {
    // Transform enum array to convert underscores to spaces
    const transformedEnum = (field.enum || []).map(value => {
        let label = value;
        if (typeof label === 'string') {
            label = label.replace(/_/g, ' ');
        }
        return {
            name: label,
            "ds-code": value
        };
    });

    return {
        ...field,
        description: field.description,
        type: "select",
        multiple: !!field.multiple,
        disabled: getDisabledState(field, id),
        static: true,
        ds: transformedEnum,
        reducer: (a) => {  
            if(typeof a !== 'object' || a === null) return a;
            return a['ds-code'];
        },
        handlers: createBaseHandler(field, context, 'input')
    };
}

/**
 * Creates configuration for remote select field
 * @param {Object} obj - Basic select configuration
 * @param {string} moduleName - Name of the module
 * @returns {Object} Remote select configuration
 */
function createRemoteSelect(obj, moduleName) {
    const REMOTE_SELECT = obj.linked_to;
    const REMOTE_URL = `${moduleName}/${REMOTE_SELECT.ref || 'invalid_collection'}/read`;
    
    delete obj.linked_to;
    delete obj.reducer;
    
    return {
        ...obj,
        type: "remote-select",
        subLabelLiterals: REMOTE_SELECT.sub_labels || "",
        multiple: !!obj.multiple,
        dsCode: REMOTE_SELECT.key,
        dsName: REMOTE_SELECT.display_name,
        url: REMOTE_URL,
        filter: createFilter(REMOTE_SELECT),
        isRemoteRead: false
    }
}

/**
 * Creates filter function for remote select
 * @param {Object} REMOTE_SELECT - Remote select configuration
 * @returns {Function} Filter function
 */
function createFilter(REMOTE_SELECT) {
    // Always convert to function
    return wrapFilterInFunction(REMOTE_SELECT.filter);
}