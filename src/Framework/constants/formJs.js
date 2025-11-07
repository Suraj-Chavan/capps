/**
 * Reserved keys for Form JS API
 * These keys are used for form features and should not be used for custom field event handlers
 */
export const FORM_JS_RESERVED_KEYS = {
    /** Button list for custom form actions */
    BUTTON_LIST: 'buttonList',
    
    /** Form lifecycle events */
    ON_LOAD_EVENT: '_onLoadEvent',
    ON_BEFORE_SAVE: '_onBeforeSave',
    AFTER_FORM_SUBMIT: '_afterFormSubmit',
    
    /** Form utilities and helpers */
    FORM_UTILITIES: '_formUtilities',
};

Object.freeze(FORM_JS_RESERVED_KEYS); 