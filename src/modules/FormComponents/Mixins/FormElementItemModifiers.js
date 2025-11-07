import { getValueFromNestedSource } from "@credenceanalytics/utilities";
import { processFilters, wrapFilterInFunction } from '../utils/filterUtils';
import {
    isPlainObject,
    isPlainArray,
} from "@credenceanalytics/utilities";

export default {
    data() {
        return {
            fieldsIndexLocation: {},
            customValidation: {
				hide: {},
				disabled: {},
				validate: {}
			},
        }
    },
    methods: {
        updateFormData(fieldName, value) {
            this.userFormData = { ...this.userFormData, [fieldName]: value };
        },
        clearDropdownOptions(fieldName) {
            const indexPath = this.fieldsIndexLocation[fieldName];
            if(!indexPath) return;
            const field = getValueFromNestedSource(this.groupedSections, indexPath.split("-"));
            if (!field) return;
            if(field.linked_to) {
                this.$set(field, 'clearOptions', true);
                setTimeout(() => {
                    this.$set(field, 'clearOptions', false);
                }, 1);
                return;
            }
            this.$set(field, 'ds', []);
        },
        setDropdownOptions(fieldName, options) {
            const indexPath = this.fieldsIndexLocation[fieldName];
            if(!indexPath) return;
            const field = getValueFromNestedSource(this.groupedSections, indexPath.split("-"));
            if (!field) return;
            this.$set(field, 'ds', options);
        },
        setFieldEnabled(fieldName) {
            const indexPath = this.fieldsIndexLocation[fieldName];
            if(!indexPath) return;
            const field = getValueFromNestedSource(this.groupedSections, indexPath.split("-"));
            if (!field) return;
            this.$set(field, 'disabled', false);
        },
        setFieldDisabled(fieldName) {
            const indexPath = this.fieldsIndexLocation[fieldName];
            if(!indexPath) return;
            const field = getValueFromNestedSource(this.groupedSections, indexPath.split("-"));
            if (!field) return;
            this.$set(field, 'disabled', true);
        },
        makeFieldVisible(fieldName) {
            Object.assign(this.customValidation.hide, { [fieldName]: true });
            this.customValidation = Object.assign({}, this.customValidation);
        },
        makeFieldInvisible(fieldName) {
            Object.assign(this.customValidation.hide, { [fieldName]: false });
            this.customValidation = Object.assign({}, this.customValidation);
        },
        manageValidationRule(fieldName, validationRules) {
            Object.assign(this.customValidation.validate, { [fieldName]: validationRules });
            this.customValidation = Object.assign({}, this.customValidation);
        },
        setQuery(fieldName, queryConfig) {
            const indexPath = this.fieldsIndexLocation[fieldName];
            if(!indexPath) return;
            
            const field = getValueFromNestedSource(this.groupedSections, indexPath.split("-"));
            if (!field) return;

            // Always ensure filter is a function
            if (!field.filter || typeof field.filter !== 'function') {
                field.filter = wrapFilterInFunction(field.filter || []);
            }

            const originalFilter = field.filter;

            // Handle both formats
            if (isPlainArray(queryConfig)) {
                // Array format
                field.filter = (dynamicQuery = []) => {
                    const baseFilters = originalFilter([]);
                    return [...baseFilters, ...processFilters(queryConfig)];
                };
            } else if (isPlainObject(queryConfig)) {
                // Object format
                if (queryConfig.filter) {
                    field.filter = (dynamicQuery = []) => {
                        const baseFilters = originalFilter([]);
                        return [...baseFilters, ...processFilters(queryConfig.filter)];
                    };
                }
                
                // Handle sort
                if (queryConfig.sort) {
                    field.sort = {
                        dir: (queryConfig.sort.dir || queryConfig.sort.direction || 'ASC').toUpperCase(),
                        field: queryConfig.sort.field
                    };
                }
            }
        },
        setSuggestions(fieldName, suggestions) {
            const indexPath = this.fieldsIndexLocation[fieldName];
            if(!indexPath) return;
            const field = getValueFromNestedSource(this.groupedSections, indexPath.split("-"));
            if (!field) return;
            this.$set(field, 'suggestions', suggestions);
        },
        setCommands(fieldName, commands) {
            const indexPath = this.fieldsIndexLocation[fieldName];
            if(!indexPath) return;
            const field = getValueFromNestedSource(this.groupedSections, indexPath.split("-"));
            if (!field) return;
            this.$set(field, 'commands', commands);
        },
        /**
         * Opens child collection add/modify form
         * @param {string} childCollectionRef - The ref name of the child collection component
         * @param {string} action - The action to perform ("add" or "modify")
         * @param {Object} recordData - Optional record data for modify action
         */
        openChildCollection(childCollectionRef, action = "add", recordData = null) {
            try {
                // Find the child collection component through the form ref hierarchy
                const formComponent = this.$refs.form;
                if (!formComponent) {
                    console.error('Form component reference not found');
                    return;
                }
                
                // Function to search through all child components recursively
                const findChildCollectionInChildren = (component) => {
                    if (!component) return null;
                    
                    // Check direct refs first
                    if (component.$refs && component.$refs[childCollectionRef]) {
                        let refComponent = component.$refs[childCollectionRef];
                        
                        // Handle case where ref returns an array (Vue dynamic refs)
                        if (Array.isArray(refComponent) && refComponent.length > 0) {
                            refComponent = refComponent[0];
                        }
                        
                        if (refComponent && typeof refComponent.openChildCollectionForm === 'function') {
                            return refComponent;
                        }
                    }
                    
                    // Search through children recursively
                    if (component.$children && component.$children.length > 0) {
                        for (let child of component.$children) {
                            const found = findChildCollectionInChildren(child);
                            if (found) return found;
                        }
                    }
                    
                    return null;
                };
                
                // First check if component exists with the ref
                const childCollectionComponent = findChildCollectionInChildren(formComponent);
                
                if (!childCollectionComponent) {
                    console.error(`Child collection component with ref "${childCollectionRef}" not found. This collection may not have any table fieldtype components.`);
                    console.log('Available refs in form component:', Object.keys(formComponent.$refs || {}));
                    return;
                }
                
                // Prepare data for the action
                let formData = null;
                if (action === "modify" && recordData) {
                    formData = {
                        item: recordData,
                        index: null // Index will be determined by the component if needed
                    };
                }
                
                // Call the child collection's openChildCollectionForm method
                childCollectionComponent.openChildCollectionForm(formData);
                
            } catch (error) {
                console.error('Error opening child collection form:', error);
                console.error(error.stack);
            }
        }
    }
}