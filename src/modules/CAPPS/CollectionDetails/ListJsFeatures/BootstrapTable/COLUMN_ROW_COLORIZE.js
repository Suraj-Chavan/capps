import { LIST_JS_RESERVED_KEYS } from '@/Framework/constants/listJs.js';

export default function ({
    features,
    fieldName,
    fieldConfig
}) {
    const columnRowColorize = features[LIST_JS_RESERVED_KEYS.COLUMN_ROW_COLORIZE]?.[fieldName];
    if(typeof columnRowColorize === 'function') {
        fieldConfig.tdAttr = function() {
            return columnRowColorize(arguments?.[2] || {});
        } 
    }
}