/**
 * Process dynamic values (eval expressions)
 * @param {any} val - Value to process
 * @returns {any} Processed value
 */
export function processValue(val) {
    if (typeof val !== 'string') return val;
    const EVAL_PREFIX = 'eval:';
    if (val.startsWith(EVAL_PREFIX)) {
        try {
            return eval(val.slice(EVAL_PREFIX.length));
        } catch (error) {
            console.warn(`Error evaluating: ${val}`, error);
            return val;
        }
    }
    return val;
}

/**
 * Process array of filters
 * @param {Array} filters - Array of filter objects
 * @returns {Array} Processed filters
 */
export function processFilters(filters = []) {
    if (!Array.isArray(filters)) return [];
    
    return filters.map(item => ({
        ...item,
        value: processValue(item.value)
    }));
}

/**
 * Combine multiple filter arrays
 * @param {...Array} filterArrays - Arrays of filters to combine
 * @returns {Array} Combined filters
 */
export function combineFilters(...filterArrays) {
    return filterArrays
        .flat()
        .filter(Boolean)
        .map(filter => {
            if (!filter || typeof filter !== 'object') return null;
            return {
                ...filter,
                value: processValue(filter.value)
            };
        })
        .filter(Boolean);
}

/**
 * Create filter function for remote select
 * @param {Object} config - Remote select configuration
 * @returns {Function} Filter function
 */
export function createFilterFunction(defaultFilters = []) {
    const processedDefaultFilters = processFilters(defaultFilters);
    
    return (dynamicFilters = []) => {
        const processedDynamicFilters = processFilters(dynamicFilters);
        return combineFilters(processedDefaultFilters, processedDynamicFilters);
    };
}

/**
 * Convert array filters to function or enhance existing filter function
 * @param {Array|Function} filter - Original filter (array or function)
 * @returns {Function} Enhanced filter function
 */
export function wrapFilterInFunction(filter) {
    // If already a function, enhance it
    if (typeof filter === 'function') {
        return (dynamicQuery = []) => {
            const defaultFilters = filter(dynamicQuery);
            return processFilters(defaultFilters);
        };
    }

    // If array or anything else, convert to function
    const defaultFilters = Array.isArray(filter) ? filter : [];
    return (dynamicQuery = []) => {
        return processFilters([...defaultFilters, ...(dynamicQuery || [])]);
    };
} 