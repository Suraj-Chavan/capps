import { LIST_JS_RESERVED_KEYS } from "../../constants/listJs";
import { loadCappsListJsFile } from "@/Framework/utility/LOAD_CAPPS_FILES/loadCappsJsFile.js";

class ListJsFeatures {
    constructor(listJs = {}) {
        // Use constant keys everywhere
        this._features = {
            [LIST_JS_RESERVED_KEYS.FORMATTERS]: listJs[LIST_JS_RESERVED_KEYS.FORMATTERS] || {},
            [LIST_JS_RESERVED_KEYS.COLUMN_SEQUENCE]: listJs[LIST_JS_RESERVED_KEYS.COLUMN_SEQUENCE] || [],
            [LIST_JS_RESERVED_KEYS.ROW_RENDERER]: listJs[LIST_JS_RESERVED_KEYS.ROW_RENDERER] || (() => ({})),
            [LIST_JS_RESERVED_KEYS.COLUMN_ROW_COLORIZE]: listJs[LIST_JS_RESERVED_KEYS.COLUMN_ROW_COLORIZE] || ({}),
            [LIST_JS_RESERVED_KEYS.BEFORE_RENDER]: listJs[LIST_JS_RESERVED_KEYS.BEFORE_RENDER] || (() => ({})),
            [LIST_JS_RESERVED_KEYS.BUTTON_COLUMNS]: listJs[LIST_JS_RESERVED_KEYS.BUTTON_COLUMNS] || [],
            [LIST_JS_RESERVED_KEYS.BUTTON_LIST]: listJs[LIST_JS_RESERVED_KEYS.BUTTON_LIST] || [],
            [LIST_JS_RESERVED_KEYS.ROW_HEADER_TEMPLATE]: listJs[LIST_JS_RESERVED_KEYS.ROW_HEADER_TEMPLATE] || null,
            [LIST_JS_RESERVED_KEYS.ROW_FOOTER_TEMPLATE]: listJs[LIST_JS_RESERVED_KEYS.ROW_FOOTER_TEMPLATE] || null,
        };
    }

    get [LIST_JS_RESERVED_KEYS.FORMATTERS]() {
        return this._features[LIST_JS_RESERVED_KEYS.FORMATTERS];
    }

    get [LIST_JS_RESERVED_KEYS.COLUMN_SEQUENCE]() {
        return this._features[LIST_JS_RESERVED_KEYS.COLUMN_SEQUENCE];
    }

    get [LIST_JS_RESERVED_KEYS.ROW_RENDERER]() {
        return this._features[LIST_JS_RESERVED_KEYS.ROW_RENDERER];
    }

    get [LIST_JS_RESERVED_KEYS.COLUMN_ROW_COLORIZE]() {
        return this._features[LIST_JS_RESERVED_KEYS.COLUMN_ROW_COLORIZE];
    }

    get [LIST_JS_RESERVED_KEYS.BEFORE_RENDER]() {
        return this._features[LIST_JS_RESERVED_KEYS.BEFORE_RENDER];
    }

    get [LIST_JS_RESERVED_KEYS.BUTTON_COLUMNS]() {
        return this._features[LIST_JS_RESERVED_KEYS.BUTTON_COLUMNS];
    }

    get [LIST_JS_RESERVED_KEYS.BUTTON_LIST]() {
        return this._features[LIST_JS_RESERVED_KEYS.BUTTON_LIST];
    }

    get [LIST_JS_RESERVED_KEYS.ROW_HEADER_TEMPLATE]() {
        return this._features[LIST_JS_RESERVED_KEYS.ROW_HEADER_TEMPLATE];
    }

    get [LIST_JS_RESERVED_KEYS.ROW_FOOTER_TEMPLATE]() {
        return this._features[LIST_JS_RESERVED_KEYS.ROW_FOOTER_TEMPLATE];
    }
}

export async function processListJsConfig({ moduleName, collectionName }) {
    const listJs = await loadCappsListJsFile({ appName: moduleName, collectionName });

    if (!listJs) return {
        actions: {},
        features: new ListJsFeatures()
    };

    // Create features instance - segregation happens in constructor
    const features = new ListJsFeatures(listJs);

    // Get actions (everything that's a function and not a reserved key)
    const actions = Object.entries(listJs)
        .filter(([key, value]) => 
            typeof value === 'function' && 
            !Object.values(LIST_JS_RESERVED_KEYS).includes(key)
        )
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

    return { actions, features };
}
