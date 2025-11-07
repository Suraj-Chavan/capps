import cappsFormUtilityAPIs from "../cappsFormUtilityAPIs";

/**
 * Creates a base event handler for form fields
 * @param {Object} field - Field configuration object
 * @param {Object} _this - Component context
 * @param {string} eventType - Type of event to handle (default: 'change')
 * @returns {Function} Handler function configuration
 */
export const createBaseHandler = (field, _this, eventType = 'change') => {
    return function(fn) {
        const _this = this;
        return {
            [eventType]: function() {
                const _arguments = arguments;
                _this.$nextTick(function () {
                    fn && fn(cappsFormUtilityAPIs.call(_this, field), { params: _arguments });
                });
            }
        }
    }
};

/**
 * Determines if a field should be disabled based on its properties
 * @param {Object} field - Field configuration object
 * @param {string|null} id - Field ID
 * @returns {boolean} Whether the field should be disabled
 */
export const getDisabledState = (field, id) => {
    return (!!field.readonly || !!field.iskey || !!field.disabled) 
        ? true 
        : (id != null && id != "") ? !!field.restrict_modify : false;
}; 