/**
 * Date Field Configuration
 * Handles date input with past/future date restrictions
 */
import { createBaseHandler, getDisabledState } from './common';

/**
 * Creates a date field configuration
 * @param {string} type - View type ('grid' or 'form')
 * @returns {Function} Date field configuration function
 */
export const dateField = (type) => {
    return function () {
        const [field, { id }] = arguments;
        if (type === "grid") return { width: field.list_column_size != null ? field.list_column_size : 100, };

        let disablePastNFutureDates = field.disable_future_dates == 1 ? false 
            : field.disable_past_dates == 1 ? true 
            : null;
            
        return {
            type: "date",
            disabled: getDisabledState(field, id),
            description: field.description,
            futureDates: disablePastNFutureDates,
            handlers: createBaseHandler(field, this)
        }
    }
} 