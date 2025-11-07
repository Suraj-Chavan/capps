/**
 * CAPPS Loader API
 * Provides asset loading functionality for dynamic content loading
 *
 * Usage:
 * capps.loader.loadManifestAssets('moduleName')
 * capps.loader.loadAppIncludeFiles('moduleName')
 * capps.loader.loadAssetsForCurrentModule() - for page-builder iframe
 * capps.loader.transpileJSX(code) - for template JSX transpilation
 * capps.loader.clearAssetCache()
 */

import { loadManifestAssets, loadAppIncludeFiles, clearAssetCache } from "../../Asset Loader/AssetLoader.js";
import { moduleContext } from "../../Router/moduleContext.js";
import { transpileJSX } from "./JSXTranspiler.js";

export const loader = {
    /**
     * Load bundled assets from manifest
     * @param {string} moduleName - Module name to load assets for
     * @returns {Promise<boolean>} true if manifest found and loaded, false otherwise
     */
    loadManifestAssets: async (moduleName) => {
        return await loadManifestAssets(moduleName);
    },

    /**
     * Load app include files (JS and CSS) from assets.json configuration
     * @param {string} moduleName - Module name to load includes for
     * @returns {Promise<void>}
     */
    loadAppIncludeFiles: async (moduleName) => {
        return await loadAppIncludeFiles(moduleName);
    },

    /**
     * Load all assets for current module
     * Used by page-builder iframe to load assets without needing moduleName
     * Auto-detects module from multiple sources (context, URL params, hash route)
     * Loads both manifest assets and app_include_js files
     * @returns {Promise<void>}
     */
    loadAssetsForCurrentModule: async (moduleName = null) => {

        // Strategy 1: Get from module context (if parent set it)
        moduleName = moduleName || moduleContext.getCurrentModule();

        // Strategy 2: Get from URL query parameters
        if (!moduleName && typeof window !== 'undefined') {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                moduleName = urlParams.get('moduleName') || urlParams.get('module');
            } catch (e) {
                console.debug('[Loader] Could not parse URL search params:', e);
            }
        }

        // Strategy 3: Get from hash route query parameters
        if (!moduleName && typeof window !== 'undefined' && window.location.hash) {
            try {
                const hashParts = window.location.hash.split('?');
                if (hashParts.length > 1) {
                    const hashParams = new URLSearchParams(hashParts[1]);
                    moduleName = hashParams.get('moduleName') || hashParams.get('module');
                }
            } catch (e) {
                console.debug('[Loader] Could not parse hash route params:', e);
            }
        }

        // If module name not found, do nothing
        if (!moduleName) {
            console.debug('[Loader] No module context found. Skipping asset loading.');
            return;
        }

        console.debug(`[Loader] Loading assets for module: ${moduleName}`);

        // Load both manifest assets and app_include_js files
        const manifestLoaded = await loadManifestAssets(moduleName);
        await loadAppIncludeFiles(moduleName);
    },

    /**
     * Transpile JSX code to JavaScript
     * Used by page-builder templates to transpile inline JSX before execution
     * @param {string} code - JSX code to transpile
     * @returns {string} - Transpiled JavaScript code
     * @throws {Error} - If transpilation fails or Babel is not available
     */
    transpileJSX: (code) => {
        return transpileJSX(code);
    },

    /**
     * Clear asset loading cache
     * @returns {void}
     */
    clearAssetCache: () => {
        clearAssetCache();
    }
};