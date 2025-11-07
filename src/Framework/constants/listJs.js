/**
 * Reserved keys for List JS API
 * These keys are used for grid features and should not be used for custom actions
 */
export const LIST_JS_RESERVED_KEYS = {
    /** Column sequence configuration for grid display order */
    COLUMN_SEQUENCE: 'columnSequence',
    
    /** Custom formatters for grid columns */
    FORMATTERS: 'formatters',
    
    /** Custom renderer for grid rows */
    ROW_RENDERER: 'rowRenderer',

    COLUMN_ROW_COLORIZE: 'columnRowColorize',
      // Indicates row coloring based on column values

    BEFORE_RENDER: "before_render",

    BUTTON_COLUMNS: "buttonColumns",

    BUTTON_LIST: "buttonList",

    /** Template content for row group headers */
    ROW_HEADER_TEMPLATE: "rowHeaderTemplateRenderer",
    
    /** Template content for row group footers */
    ROW_FOOTER_TEMPLATE: "rowFooterTemplateRenderer",
};

Object.freeze(LIST_JS_RESERVED_KEYS); 