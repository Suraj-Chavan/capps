# Frappe-Style Auto-Discovery Asset Bundling - Framework Integration Guide

## Overview

This document explains how to integrate the Frappe-style auto-discovery bundling system with the CAPPS framework to enable automatic asset loading with cache-busting support.

## Architecture

### What We've Built (Phase 8)

✅ **AssetDiscovery** - Automatically scans public/ folder and generates entry_points
✅ **Auto-Discovery Configuration** - Support for `entry_points: "auto"` in assets.json
✅ **Bundler Integration** - All bundlers (webpack, vite, esbuild) support auto-discovery
✅ **Assets Mapping** - manifest.json creates mapping: source_path → bundled_path

### Example Flow

```
capps-guinea-pig/public/
├── layout/
│   ├── menu.js
│   └── style.scss
└── collection/
    └── bill/form/
        ├── mfx.js
        └── styles.css

                    ↓ (CLI auto-discovery)

entry_points = {
  "layout-menu": "public/layout/menu.js",
  "layout-styles": "public/layout/style.scss",
  "bill-form": "public/collection/bill/form/mfx.js",
  "bill-styles": "public/collection/bill/form/styles.css"
}

                    ↓ (After bundling)

manifest.json = {
  "assets": {
    "public/layout/menu.js": "public/dist/layout-menu-abc123def.js",
    "public/layout/style.scss": "public/dist/layout-styles-xyz789uvw.css",
    "public/collection/bill/form/mfx.js": "public/dist/bill-form-def456ghi.js",
    "public/collection/bill/form/styles.css": "public/dist/bill-styles-jkl789mno.css"
  },
  "bundles": {
    "layout-menu": {...},
    "layout-styles": {...},
    ...
  }
}
```

## Next Phase: Framework Integration

### Goal

Update CAPPS framework to load assets using the manifest mapping instead of hardcoded URLs.

### Current Implementation (Before Integration)

In `src/router/capps.layout.route.js`:

```javascript
// Currently loads hardcoded paths
const getApplicationStyleLoader = function () {
    return function (MODULE_NAME) {
        // Direct URL without cache-busting
        capps.require(`/capps/${MODULE_NAME}/public/layout/style.css`);
    }
};

const getApplicationEntryFileLoader = function () {
    return function (MODULE_NAME) {
        // Direct URL without cache-busting
        capps.require(`/capps/${MODULE_NAME}/public/main.js`);
    }
};
```

### Desired Implementation (After Integration)

```javascript
const getApplicationManifestLoader = function () {
    const CACHE = {};
    return async function (MODULE_NAME) {
        if (CACHE[MODULE_NAME]) return CACHE[MODULE_NAME];

        try {
            // Load manifest.json for the app
            const manifestPath = `/capps/${MODULE_NAME}/public/assets.json`;
            const manifest = await window.capps.require(manifestPath, null, { asModule: true });
            CACHE[MODULE_NAME] = manifest;
            return manifest;
        } catch (error) {
            console.warn(`Failed to load manifest for ${MODULE_NAME}:`, error);
            return null;
        }
    }
};

const getApplicationStyleLoader = function () {
    const CACHE = {};
    const getManifest = getApplicationManifestLoader();

    return async function (MODULE_NAME) {
        if (CACHE[MODULE_NAME]) return;

        try {
            const manifest = await getManifest(MODULE_NAME);

            if (manifest?.assets) {
                // Find and load CSS/SCSS assets
                for (const [sourcePath, bundledPath] of Object.entries(manifest.assets)) {
                    if (sourcePath.endsWith('.scss') || sourcePath.endsWith('.css')) {
                        // Load bundled version with hash for cache-busting
                        await window.capps.require(`/capps/${MODULE_NAME}/${bundledPath}`);
                    }
                }
            } else {
                // Fallback to direct path if no manifest
                await window.capps.require(`/capps/${MODULE_NAME}/public/layout/style.css`);
            }

            CACHE[MODULE_NAME] = true;
        } catch (error) {
            console.warn(`Failed to load styles for ${MODULE_NAME}:`, error);
            CACHE[MODULE_NAME] = true; // Prevent retry
        }
    }
};

const getApplicationEntryFileLoader = function () {
    const CACHE = {};
    const getManifest = getApplicationManifestLoader();

    return async function (MODULE_NAME) {
        if (CACHE[MODULE_NAME]) return;

        try {
            const manifest = await getManifest(MODULE_NAME);

            if (manifest?.assets) {
                // Find and load JavaScript assets
                for (const [sourcePath, bundledPath] of Object.entries(manifest.assets)) {
                    if (sourcePath.endsWith('.js') && sourcePath.includes('layout')) {
                        // Load bundled version with hash for cache-busting
                        await window.capps.require(`/capps/${MODULE_NAME}/${bundledPath}`);
                    }
                }
            } else {
                // Fallback to direct path if no manifest
                await window.capps.require(`/capps/${MODULE_NAME}/public/main.js`);
            }

            CACHE[MODULE_NAME] = true;
        } catch (error) {
            console.warn(`Failed to load entry file for ${MODULE_NAME}:`, error);
            CACHE[MODULE_NAME] = true; // Prevent retry
        }
    }
};

const loadApplicationsAssets = async function (MODULE_NAME) {
    const loadApplicationStyles = getApplicationStyleLoader();
    const loadApplicationMainFile = getApplicationEntryFileLoader();

    // Make async calls
    await loadApplicationStyles(MODULE_NAME);
    await loadApplicationMainFile(MODULE_NAME);

    // Load locale as before
    registerOnetimeRouterEvent(function () {
        const END_POINT = `${MODULE_NAME}/locale/${applanguage || "en"}`;
        loadLanguageAsync(MODULE_NAME + applanguage, END_POINT);
    });
};
```

## Integration Steps

### Step 1: Load Manifest Instead of Hardcoded Paths

**File**: `src/router/capps.layout.route.js`

Replace hardcoded path constants with dynamic manifest loading:

```javascript
// OLD (remove)
export const APPLICATION_STYLE_PATH = `${pathPrefix}/capps/{moduleName}/public/layout/style.css`;
export const APPLICATION_ENTRY_FILE = `${pathPrefix}/capps/{moduleName}/public/main.js`;

// NEW (add)
const MANIFEST_CACHE = new Map();

const loadAppManifest = async (moduleName) => {
    if (MANIFEST_CACHE.has(moduleName)) {
        return MANIFEST_CACHE.get(moduleName);
    }

    try {
        const manifestUrl = `${pathPrefix}/capps/${moduleName}/public/assets.json`;
        const manifest = await window.capps.require(manifestUrl, null, { asModule: true });
        MANIFEST_CACHE.set(moduleName, manifest);
        return manifest;
    } catch (error) {
        console.warn(`Failed to load manifest for ${moduleName}:`, error);
        return null;
    }
};
```

### Step 2: Update Asset Loaders to Use Manifest

```javascript
const getApplicationStyleLoader = function () {
    const CACHE = {};

    return async function (MODULE_NAME) {
        if (CACHE[MODULE_NAME]) return;

        try {
            const manifest = await loadAppManifest(MODULE_NAME);

            if (manifest?.assets) {
                // Load all CSS/SCSS assets from manifest
                for (const [sourcePath, bundledPath] of Object.entries(manifest.assets)) {
                    // Load CSS or SCSS files
                    if (/\.(css|scss)$/.test(sourcePath) &&
                        !sourcePath.includes('collection')) { // Layout styles only
                        const fullPath = `${pathPrefix}/capps/${MODULE_NAME}/${bundledPath}`;
                        await window.capps.require(fullPath);
                    }
                }
            } else {
                // Fallback for apps without manifest
                const fallbackPath = `${pathPrefix}/capps/${MODULE_NAME}/public/layout/style.css`;
                await window.capps.require(fallbackPath);
            }

            CACHE[MODULE_NAME] = true;
        } catch (error) {
            console.error(`Failed to load styles for ${MODULE_NAME}:`, error);
        }
    }
};

const getApplicationEntryFileLoader = function () {
    const CACHE = {};

    return async function (MODULE_NAME) {
        if (CACHE[MODULE_NAME]) return;

        try {
            const manifest = await loadAppManifest(MODULE_NAME);

            if (manifest?.assets) {
                // Load main JS entry point from manifest
                for (const [sourcePath, bundledPath] of Object.entries(manifest.assets)) {
                    // Load app JS (usually public/layout/menu.js or similar)
                    if (sourcePath.endsWith('.js') &&
                        (sourcePath.includes('layout/menu') ||
                         sourcePath.includes('public/main.js'))) {
                        const fullPath = `${pathPrefix}/capps/${MODULE_NAME}/${bundledPath}`;
                        await window.capps.require(fullPath);
                        break; // Only load one main entry
                    }
                }
            } else {
                // Fallback for apps without manifest
                const fallbackPath = `${pathPrefix}/capps/${MODULE_NAME}/public/main.js`;
                await window.capps.require(fallbackPath);
            }

            CACHE[MODULE_NAME] = true;
        } catch (error) {
            console.error(`Failed to load entry file for ${MODULE_NAME}:`, error);
        }
    }
};
```

### Step 3: Update loadApplicationsAssets to Be Async

```javascript
const loadApplicationsAssets = async function (MODULE_NAME) {
    const loadApplicationStyles = getApplicationStyleLoader();
    const loadApplicationMainFile = getApplicationEntryFileLoader();

    // Wait for asset loading
    registerOnetimeRouterEvent(async function () {
        await loadApplicationStyles(MODULE_NAME);
        await loadApplicationMainFile(MODULE_NAME);

        // Load locale
        const END_POINT = `${MODULE_NAME}/locale/${applanguage || "en"}`;
        loadLanguageAsync(MODULE_NAME + applanguage, END_POINT);
    });
};
```

## Benefits After Integration

✅ **Automatic Cache Busting** - Hashed filenames break caches on updates
✅ **Frappe-Like Workflow** - Familiar for Frappe developers
✅ **Per-App Bundling** - Each app controls its own assets
✅ **Smart Asset Loading** - Loads from manifest mapping
✅ **Backward Compatible** - Falls back to direct URLs if no manifest
✅ **Framework Agnostic** - Works with Vue, React, any framework
✅ **No Framework Changes** - capps.require() API unchanged

## Manifest Structure Reference

After building with auto-discovery, manifest.json will look like:

```json
{
  "version": 1,
  "generated": "2025-10-23T12:00:00Z",
  "assets": {
    "public/layout/menu.js": "public/dist/layout-menu-abc123def.js",
    "public/layout/style.scss": "public/dist/layout-styles-xyz789uvw.css",
    "public/collection/bill/form/mfx.js": "public/dist/bill-form-def456ghi.js",
    "public/collection/bill/form/styles.css": "public/dist/bill-styles-jkl789mno.css"
  },
  "bundles": {
    "layout-menu": {
      "files": {
        "js": {
          "filename": "layout-menu-abc123def.js",
          "path": "layout-menu-abc123def.js",
          "size_kb": 42.5,
          "hash": "abc123de"
        }
      },
      "total_size_kb": 42.5
    },
    "layout-styles": {
      "files": {
        "css": {
          "filename": "layout-styles-xyz789uvw.css",
          "path": "layout-styles-xyz789uvw.css",
          "size_kb": 25.3,
          "hash": "xyz789uv"
        }
      },
      "total_size_kb": 25.3
    }
  },
  "metadata": {
    "app_dir": "/capps-guinea-pig",
    "output_dir": "/capps-guinea-pig/public/dist",
    "file_count": 4,
    "total_size_kb": 135.6
  }
}
```

## Testing the Integration

### 1. Test with Manual Entry Points First

```json
{
  "entry_points": {
    "app": "src/index.js",
    "styles": "src/styles/main.scss"
  }
}
```

Build and verify manifest.json is created with "assets" mapping.

### 2. Test with Auto-Discovery

```json
{
  "entry_points": "auto",
  "source_dir": "public",
  "include_patterns": ["**/*.{js,css,scss}"]
}
```

Build and verify assets are discovered and mapped.

### 3. Verify Cache Busting

1. Build app: `npm run bundle:build`
2. Note the hashed filenames in dist/
3. Modify a source file
4. Build again
5. Verify filenames change (different hash)
6. Browser cache automatically invalidated ✓

## Rollback Strategy

If issues occur during framework integration:

1. Comment out manifest loading code
2. Keep fallback paths intact
3. Assets load from direct URLs (no cache busting)
4. No breaking changes to existing apps

## Performance Considerations

- Manifest.json cached per-module (no re-fetching)
- Asset loading is async (non-blocking)
- Single manifest load per app per session
- No additional HTTP requests for production

## Compatibility

### Works With

- ✅ Webpack bundles
- ✅ Vite bundles
- ✅ esbuild bundles
- ✅ Manual entry_points
- ✅ Auto-discovery entry_points
- ✅ Collection-specific assets
- ✅ Layout/theme assets
- ✅ All frameworks (Vue, React, etc.)

### Supported Browsers

- ✅ Modern browsers (ES6+)
- ✅ Internet Explorer 11+ (with polyfills)
- ✅ Mobile browsers

## Troubleshooting

### "Failed to load manifest for MODULE_NAME"

- Check assets.json exists in app's public/ folder
- Verify app builds successfully
- Check manifest.json was created in dist/

### "Assets not loading"

- Check bundled files exist in public/dist/
- Verify manifest.json has "assets" mapping
- Check browser console for 404s

### "Cache not busting"

- Verify hash_bundles: true in assets.json
- Check filenames have 8-char hash suffix
- Clear browser cache
- Verify new build creates different hashes

## Summary

The Frappe-style auto-discovery bundling system is complete with:

✅ Phase 8 (Complete) - AssetDiscovery, auto-config, bundler integration, manifest mapping
⏳ Phase 9 (Pending) - Framework integration in capps.layout.route.js

Once Phase 9 is complete, CAPPS apps will have:
- Automatic asset discovery (no manual configuration)
- Content-based cache busting (hashed filenames)
- Per-app bundling control
- Frappe-like workflow
- Zero framework configuration changes needed

---

For implementation details, refer to the code comments in the respective classes.
For questions, check the project documentation or code examples.
