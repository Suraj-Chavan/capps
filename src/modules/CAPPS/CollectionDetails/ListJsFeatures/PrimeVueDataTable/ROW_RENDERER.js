import { LIST_JS_RESERVED_KEYS } from '@/Framework/constants/listJs.js';

export default (features) => {
    const rowColorize = features[LIST_JS_RESERVED_KEYS.ROW_RENDERER];
    // If no rowColorize, return default empty function
    if (!rowColorize) {
        return () => ({});
    }
    // If rowColorize is function, return as is
    if (typeof rowColorize === 'function') {
        return function (row) {
            // Calling rowColorize with the first row object
            return rowColorize(row || {});
        };
    }

    // If rowColorize is object, convert to function
    if (typeof rowColorize === 'object' && rowColorize !== null) {
        return () => rowColorize;
    }

    // Default case
    return () => ({});
}