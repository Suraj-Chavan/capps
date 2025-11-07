import { LIST_JS_RESERVED_KEYS } from '@/Framework/constants/listJs.js';

export default function (columns, features, fieldsConfig) {
    // Cache for sequence values
    const sequenceMap = new Map();

    // Calculate sequence for each column once
    columns.forEach(column => {
        // Priority 1: Check in columnSequence
        const sequenceIndex = features[LIST_JS_RESERVED_KEYS.COLUMN_SEQUENCE]?.indexOf(column.key);
        if (sequenceIndex !== -1 && sequenceIndex !== undefined) {
            sequenceMap.set(column.key, sequenceIndex);
            return;
        }

        // Priority 2: Check field_order_no
        const fieldOrderNo = fieldsConfig[column.key]?.field_order_no;
        if (fieldOrderNo !== undefined) {
            sequenceMap.set(column.key, 
                fieldOrderNo + (features[LIST_JS_RESERVED_KEYS.COLUMN_SEQUENCE]?.length || 0) * 1000
            );
            return;
        }

        // Priority 3: Default to max
        sequenceMap.set(column.key, Number.MAX_SAFE_INTEGER);
    });

    // Return sort function that uses cached values
    return (a, b) => sequenceMap.get(a.key) - sequenceMap.get(b.key);
}