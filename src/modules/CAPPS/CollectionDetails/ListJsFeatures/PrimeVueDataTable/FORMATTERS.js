import { LIST_JS_RESERVED_KEYS } from '@/Framework/constants/listJs.js';

export default function ({
    features,
    // fieldName,
    // fieldConfig
}) {
    if(features[LIST_JS_RESERVED_KEYS.FORMATTERS] != null) return features[LIST_JS_RESERVED_KEYS.FORMATTERS];
    return {};
}