import { extend } from 'vee-validate';

export default function () {
    const _this = this;
    const [field, $el] = arguments;

    return {
        $el: $el || (_this.$refs?.form?.$refs['form_element_' + (field.key || field.name)] || [])[0]?.$el,
        set_value(fieldName, value) {
            setTimeout(() => _this.updateFormData(fieldName, value), 0);
        },
        clear_dropdown_options(fieldName) {
            setTimeout(() => _this.clearDropdownOptions(fieldName), 0);
        },
        set_dropdown_options(fieldName, options) {
            setTimeout(() => _this.setDropdownOptions(fieldName, options), 0);
        },
        set_field_enabled(fieldName) {
            setTimeout(() => _this.setFieldEnabled(fieldName), 0);
        },
        set_field_disabled(fieldName) {
            setTimeout(() => _this.setFieldDisabled(fieldName), 0);
        },
        make_field_visible(fieldName) {
            setTimeout(() => _this.makeFieldVisible(fieldName), 0);
        },
        make_field_invisible(fieldName) {
            setTimeout(() => _this.makeFieldInvisible(fieldName), 0);
        },
        manage_validation_rule(fieldName, validationRules) {
            validationRules = validationRules || {};
            Object.entries(validationRules).forEach(([key, value]) => {
                if(typeof value === 'boolean') return;
                extend(key, value);
                validationRules[key] = true;
            });
            setTimeout(() => _this.manageValidationRule(fieldName, validationRules), 0);
        },
        set_query(fieldName, query) {
            setTimeout(() => _this.setQuery(fieldName, query), 0);
        },
        set_suggestions(fieldName, suggestions) {
            _this.setSuggestions(fieldName, suggestions);
        },
        set_commands(fieldName, commands) {
            _this.setCommands(fieldName, commands);
        },
        open_child_collection(childCollectionRef, action = "add", recordData = null) {
            setTimeout(() => {
                if (typeof _this.openChildCollection === 'function') {
                    _this.openChildCollection(childCollectionRef, action, recordData);
                } else {
                    console.error('openChildCollection method not available. Make sure child-collection-mixin is imported.');
                }
            }, 0);
        },
        hide_child_collection(childCollectionRef) {
            setTimeout(() => {
                try {
                    // Create unique style id for this collection
                    const styleId = `capps-hide-child-collection-${childCollectionRef}`;
                    
                    // Remove existing style if present
                    const existingStyle = document.getElementById(styleId);
                    if (existingStyle) {
                        existingStyle.remove();
                    }
                    
                    // Create new style element to hide the child collection
                    const style = document.createElement('style');
                    style.id = styleId;
                    style.textContent = `
                        .child-collection-grid--${childCollectionRef} {
                            display: none !important;
                        }
                    `;
                    
                    // Append to head
                    document.head.appendChild(style);
                    
                    console.log(`Child collection "${childCollectionRef}" has been hidden`);
                } catch (error) {
                    console.error('Error hiding child collection:', error);
                }
            }, 0);
        },
        show_child_collection(childCollectionRef) {
            setTimeout(() => {
                try {
                    // Remove the style that hides the collection
                    const styleId = `capps-hide-child-collection-${childCollectionRef}`;
                    const existingStyle = document.getElementById(styleId);
                    if (existingStyle) {
                        existingStyle.remove();
                        console.log(`Child collection "${childCollectionRef}" has been shown`);
                    } else {
                        console.warn(`No hidden style found for child collection "${childCollectionRef}"`);
                    }
                } catch (error) {
                    console.error('Error showing child collection:', error);
                }
            }, 0);
        },
        save() {
            setTimeout(() => {
                // Check if current component (_this) has structureSubmit method (main form)
                if (typeof _this.structureSubmit === 'function') {
                    // We're in the main form, call its structureSubmit directly
                    _this.structureSubmit();
                    return;
                }
                
                // We're in a child collection form, traverse up to find the main InputForm component
                let rootFormComponent = _this;
                while (rootFormComponent.$parent) {
                    rootFormComponent = rootFormComponent.$parent;
                    if (typeof rootFormComponent.structureSubmit === 'function') {
                        // Found the main InputForm component
                        rootFormComponent.structureSubmit();
                        return;
                    }
                }
                
                console.error('structureSubmit method not found. Make sure this is called from a form context.');
            }, 0);
        },
        add_custom_button(label, callback, group = null, options = {}) {
            setTimeout(() => {
                // Find the root InputForm component
                let rootFormComponent = _this;
                while (rootFormComponent.$parent && !rootFormComponent.addCustomButton) {
                    rootFormComponent = rootFormComponent.$parent;
                }
                
                if (typeof rootFormComponent.addCustomButton === 'function') {
                    const buttonConfig = {
                        key: options.key || `custom_btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        label: label,
                        handler: callback,
                        group: group,
                        icon: options.icon,
                        class: options.class || 'capps-btn-secondary',
                        show: options.show || (() => true),
                        type: options.type || 'button',
                        _isDynamic: true
                    };
                    rootFormComponent.addCustomButton(buttonConfig);
                    return buttonConfig.key;
                } else {
                    console.error('addCustomButton method not found. Make sure this is called from a form context.');
                }
            }, 0);
        },
        remove_custom_button(label, group = null) {
            setTimeout(() => {
                let rootFormComponent = _this;
                while (rootFormComponent.$parent && !rootFormComponent.removeCustomButton) {
                    rootFormComponent = rootFormComponent.$parent;
                }
                
                if (typeof rootFormComponent.removeCustomButton === 'function') {
                    rootFormComponent.removeCustomButton(label, group);
                } else {
                    console.error('removeCustomButton method not found. Make sure this is called from a form context.');
                }
            }, 0);
        },
        clear_custom_buttons(group = null) {
            setTimeout(() => {
                let rootFormComponent = _this;
                while (rootFormComponent.$parent && !rootFormComponent.clearCustomButtons) {
                    rootFormComponent = rootFormComponent.$parent;
                }
                
                if (typeof rootFormComponent.clearCustomButtons === 'function') {
                    rootFormComponent.clearCustomButtons(group);
                } else {
                    console.error('clearCustomButtons method not found. Make sure this is called from a form context.');
                }
            }, 0);
        },
        change_custom_button_type(label, buttonType, group = null) {
            setTimeout(() => {
                let rootFormComponent = _this;
                while (rootFormComponent.$parent && !rootFormComponent.changeCustomButtonType) {
                    rootFormComponent = rootFormComponent.$parent;
                }
                
                if (typeof rootFormComponent.changeCustomButtonType === 'function') {
                    return rootFormComponent.changeCustomButtonType(label, buttonType, group);
                } else {
                    console.error('changeCustomButtonType method not found. Make sure this is called from a form context.');
                    return false;
                }
            }, 0);
        },
        show_custom_button(label, group = null) {
            setTimeout(() => {
                let rootFormComponent = _this;
                while (rootFormComponent.$parent && !rootFormComponent.showCustomButton) {
                    rootFormComponent = rootFormComponent.$parent;
                }
                
                if (typeof rootFormComponent.showCustomButton === 'function') {
                    return rootFormComponent.showCustomButton(label, group);
                } else {
                    console.error('showCustomButton method not found. Make sure this is called from a form context.');
                    return false;
                }
            }, 0);
        }
    }
}