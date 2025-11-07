/**
 * Asset Loader - Phase 9 Integration (Optimized Single Entry Point)
 * Loads bundled assets from manifest.json with cache busting support
 *
 * Features:
 * - Loads app bundles via single entry point (app-entry.js)
 * - Entry point imports all other bundles internally
 * - Cache-busted filenames (content hash)
 * - Single script tag for optimal performance
 * - Fallback to legacy loading if manifest not found
 * - Error handling and logging
 */

import { interpolate } from "../utility/utility.js";
import { APPLICATION_PUBLIC_PATH, APPLICATION_MANIFEST_PATH } from "../constants/basePaths.js";
import { initializeJSXTranspiler } from "../JS API/Loader/JSXTranspiler.js";

const MANIFEST_CACHE = {};

/**
 * Load bundled assets from app's manifest.json
 * @param {string} MODULE_NAME - App module name
 * @returns {Promise<boolean>} - true if manifest loaded, false if fallback needed
 */
async function loadManifestAssets(MODULE_NAME) {
  if (MANIFEST_CACHE[MODULE_NAME]) {
    return true; // Already loaded
  }

  try {
    // Construct app public path and manifest path using constants
    const appPublicPath = interpolate(APPLICATION_PUBLIC_PATH, { moduleName: MODULE_NAME });
    const manifestPath = interpolate(APPLICATION_MANIFEST_PATH, { moduleName: MODULE_NAME });

    // Add cache-busting query parameter to ensure manifest is always fresh
    // This prevents browser from caching manifest.json and missing new bundles/entry points
    const manifestUrl = `${manifestPath}?t=${Date.now()}`;

    console.debug(`[CAPPS Asset Loader] Attempting to load manifest from: ${manifestUrl}`);
    const response = await fetch(manifestUrl);

    if (!response.ok) {
      console.warn(`[CAPPS Asset Loader] Manifest not found for ${MODULE_NAME} (${response.status}), falling back to legacy loading`);
      return false;
    }

    const manifest = await response.json();
    console.info(`[CAPPS Asset Loader] Manifest loaded for ${MODULE_NAME}`, manifest);

    // Load single entry point that imports all bundles internally
    const entryPoint = manifest.entry_point || 'app-entry.js';
    // Use bundle_dir from manifest if available, otherwise default to 'dist'
    const bundleDir = manifest.metadata?.bundle_dir || 'dist';
    const scriptSrc = `${appPublicPath}/${bundleDir}/${entryPoint}`;

    try {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = scriptSrc;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);

      console.info(`[CAPPS Asset Loader] Loaded entry point: ${entryPoint} from ${scriptSrc}`);
      console.debug(`[CAPPS Asset Loader] Entry point will import ${Object.keys(manifest.bundles || {}).length} bundled assets internally`);
    } catch (error) {
      console.error(`[CAPPS Asset Loader] Error loading entry point ${entryPoint}:`, error);
      throw error;
    }

    MANIFEST_CACHE[MODULE_NAME] = true;
    console.info(`[CAPPS Asset Loader] Successfully initiated asset loading for ${MODULE_NAME}`);
    return true;
  } catch (error) {
    console.error(`[CAPPS Asset Loader] Error loading manifest for ${MODULE_NAME}:`, error);
    return false;
  }
}

/**
 * Load app_include_js and app_include_css from assets.json (hooks-style loading)
 * Loads JS and CSS files directly without bundling - similar to Frappe/ERPNext hooks
 * @param {string} MODULE_NAME - App module name
 * @returns {Promise<void>}
 */
async function loadAppIncludeFiles(MODULE_NAME) {
  try {
    // Construct paths
    const appPublicPath = interpolate(APPLICATION_PUBLIC_PATH, { moduleName: MODULE_NAME });
    const assetsJsonUrl = `${appPublicPath}/assets.json?t=${Date.now()}`;

    console.debug(`[CAPPS Asset Loader] Loading app include files from: ${assetsJsonUrl}`);
    const response = await fetch(assetsJsonUrl);

    if (!response.ok) {
      console.debug(`[CAPPS Asset Loader] No assets.json found for ${MODULE_NAME}`);
      return;
    }

    const assetsConfig = await response.json();
    const appIncludeJs = assetsConfig.app_include_js || [];
    const appIncludeCss = assetsConfig.app_include_css || [];

    // Load CSS files first
    for (const cssFile of appIncludeCss) {
      try {
        const cssUrl = `${appPublicPath}/${cssFile}`;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        console.info(`[CAPPS Asset Loader] Loaded CSS: ${cssFile}`);
      } catch (error) {
        console.error(`[CAPPS Asset Loader] Error loading CSS ${cssFile}:`, error);
      }
    }

    // Load JS files
    for (const jsFile of appIncludeJs) {
      try {
        const jsUrl = `${appPublicPath}/${jsFile}`;
        const script = document.createElement('script');
        script.src = jsUrl;
        script.async = true;
        script.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          script.onload = () => {
            console.info(`[CAPPS Asset Loader] Loaded JS: ${jsFile}`);
            resolve();
          };
          script.onerror = () => reject(new Error(`Failed to load JS: ${jsFile}`));
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error(`[CAPPS Asset Loader] Error loading JS ${jsFile}:`, error);
      }
    }

    console.info(`[CAPPS Asset Loader] Loaded ${appIncludeJs.length} JS files and ${appIncludeCss.length} CSS files for ${MODULE_NAME}`);

    // Initialize automatic JSX transpiler for inline scripts loaded at runtime
    // This enables JSX in page-builder templates and dynamically loaded HTML
    initializeJSXTranspiler();
  } catch (error) {
    console.error(`[CAPPS Asset Loader] Error loading app include files for ${MODULE_NAME}:`, error);
  }
}

/**
 * Clear asset cache (for testing/debugging)
 * @param {string} MODULE_NAME - App module name (optional, clears all if not provided)
 */
function clearAssetCache(MODULE_NAME) {
  if (MODULE_NAME) {
    delete MANIFEST_CACHE[MODULE_NAME];
    console.debug(`[CAPPS Asset Loader] Cleared cache for ${MODULE_NAME}`);
  } else {
    Object.keys(MANIFEST_CACHE).forEach(key => delete MANIFEST_CACHE[key]);
    console.debug(`[CAPPS Asset Loader] Cleared all asset cache`);
  }
}

export {
  loadManifestAssets,
  loadAppIncludeFiles,
  clearAssetCache
};
