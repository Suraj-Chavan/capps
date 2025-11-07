import { LIST_JS_RESERVED_KEYS } from '@/Framework/constants/listJs.js';

export default function ({
    features,
    // fieldName,
}) {
    const columnRowColorize = features[LIST_JS_RESERVED_KEYS.COLUMN_ROW_COLORIZE];
    if(columnRowColorize !== null) return columnRowColorize;
    return {};
}