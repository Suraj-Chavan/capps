
const path = window.location.pathname;
const cappsPathIndex = path.indexOf("/capps/");
const pathPrefix = cappsPathIndex > 0 ? path.substring(0, cappsPathIndex) : "";



export const MENU_JSON_BASE_PATH = `${pathPrefix}/capps/{moduleName}/public/layout/`;

export const VIEW_LOG_BASE_PATH = `${pathPrefix}/capps/dist/index.html#/{moduleName}/doc/process_progress/view_record/{recordId}`;

export const VIEW_EXCEPTION_LOG_BASE_PATH = `${pathPrefix}/capps/dist/index.html#/{moduleName}/doc/file_interface/view_record/{recordId}`;

export const FORM_ASSET_PATH = `${pathPrefix}/capps/{moduleName}/public/collection/{collection}/form/index.html`;

export const MODULE_ASSET_PATH = `${pathPrefix}/capps/{moduleName}/public/collection/{collection}/modules/{moduleType}/index.html`;

export const APPLICATION_STYLE_PATH = `${pathPrefix}/capps/{moduleName}/public/layout/style.css`;

export const PREFIX_FORM_REFERENCE_PATH = `${pathPrefix}/capps/`;

export const APPLICATION_ENTRY_FILE = `${pathPrefix}/capps/{moduleName}/public/main.js`;

// Phase 9: Manifest-based asset loading for bundled assets
export const APPLICATION_PUBLIC_PATH = `${pathPrefix}/capps/{moduleName}/public`;

// Manifest is stored in public root directory, separate from bundled assets
export const APPLICATION_MANIFEST_PATH = `${pathPrefix}/capps/{moduleName}/public/manifest.json`;