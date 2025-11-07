/**
 * Field configurations mapping
 * Each field type maps to its import and configuration
 */
const FIELD_CONFIGS = {
    'button': {
        import: () => import(/* webpackChunkName: "button-field" */ './formFields/ButtonField').then(m => m.buttonField)
    },
    'textfield': {
        import: () => import(/* webpackChunkName: "text-field" */ './formFields/TextField').then(m => m.textField)
    },
    'checkbox': {
        import: () => import(/* webpackChunkName: "checkbox-field" */ './formFields/CheckboxField').then(m => m.checkboxField)
    },
    'radio': {
        import: () => import(/* webpackChunkName: "radio-field" */ './formFields/RadioField').then(m => m.radioField)
    },
    'switch': {
        import: () => import(/* webpackChunkName: "switch-field" */ './formFields/SwitchField').then(m => m.switchField)
    },
    'textarea': {
        import: () => import(/* webpackChunkName: "textarea-field" */ './formFields/TextareaField').then(m => m.textareaField)
    },
    'select': {
        import: () => import(/* webpackChunkName: "select-field" */ './formFields/SelectField').then(m => m.selectField)
    },
    'int': {
        import: () => import(/* webpackChunkName: "number-field" */ './formFields/NumberField').then(m => m.numberField),
        inputType: 'number'
    },
    'float': {
        import: () => import(/* webpackChunkName: "number-field" */ './formFields/NumberField').then(m => m.numberField),
        inputType: 'numericOnly'
    },
    'alphanumeric': {
        import: () => import(/* webpackChunkName: "number-field" */ './formFields/NumberField').then(m => m.numberField),
        inputType: 'numericOnly'
    },
    'date': {
        import: () => import(/* webpackChunkName: "date-field" */ './formFields/DateField').then(m => m.dateField)
    },
    'time': {
        import: () => import(/* webpackChunkName: "time-field" */ './formFields/TimeField').then(m => m.timeField)
    },
    'datetime': {
        import: () => import(/* webpackChunkName: "datetime-field" */ './formFields/DatetimeField').then(m => m.datetimeField)
    },
    'table': {
        import: () => import(/* webpackChunkName: "table-field" */ './formFields/TableField').then(m => m.tableField)
    },
    'file': {
        import: () => import(/* webpackChunkName: "file-field" */ './formFields/FileField').then(m => m.fileField)
    },
    'email_address': {
        import: () => import(/* webpackChunkName: "email-field" */ './formFields/EmailField').then(m => m.emailField)
    },
    'hyperlink': {
        import: () => import(/* webpackChunkName: "hyperlink-field" */ './formFields/HyperlinkField').then(m => m.hyperlinkField)
    },
    'html': {
        import: () => import(/* webpackChunkName: "html-field" */ './formFields/HtmlField').then(m => m.htmlField)
    },
    'ratings': {
        import: () => import(/* webpackChunkName: "ratings-field" */ './formFields/RatingsField').then(m => m.ratingsField)
    },
    'password': {
        import: () => import(/* webpackChunkName: "password-field" */ './formFields/PasswordField').then(m => m.passwordField)
    },
    'rich_text_editor': {
        import: () => import(/* webpackChunkName: "rich_text_editor" */ './formFields/RichTextEditorField.js').then(m => m.richTextEditorField)
    }
};

/**
 * Returns field type bindings with dynamic imports
 * @param {Object} payload - Configuration payload
 * @param {string} [payload.type='grid'] - View type (grid/form)
 * @returns {Object} Field type bindings map
 */
export default function getFieldTypeBindings(payload) {
    const type = payload?.type || "grid";
    const cache = {};

    return new Proxy({}, {
        get: (target, fieldType) => {
            return async (field, additionalArgs = {}) => {
                if (!FIELD_CONFIGS[fieldType]) return null;

                try {
                    if (!cache[fieldType]) {
                        const fieldConfig = await FIELD_CONFIGS[fieldType].import();
                        cache[fieldType] = fieldConfig;
                    }

                    const config = FIELD_CONFIGS[fieldType];
                    return config.inputType 
                        ? cache[fieldType](type, config.inputType)(field, additionalArgs)
                        : cache[fieldType](type)(field, additionalArgs);
                } catch (error) {
                    console.error(`Error loading ${fieldType} configuration:`, error);
                    return null;
                }
            };
        }
    });
}