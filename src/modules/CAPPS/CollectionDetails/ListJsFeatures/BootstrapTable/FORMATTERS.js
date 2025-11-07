import { LIST_JS_RESERVED_KEYS } from '@/Framework/constants/listJs.js';

export default function ({
    features,
    fieldName,
    fieldConfig
}) {
    if(!features[LIST_JS_RESERVED_KEYS.FORMATTERS]?.[fieldName]) return;
    fieldConfig.formatter =  function() {
        return features[LIST_JS_RESERVED_KEYS.FORMATTERS][fieldName](...arguments);
    }
}