# CAPPS CLI - User Guide & Quick Start

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Commands Reference](#commands-reference)
4. [Configuration (assets.json)](#configuration-assetsjson)
5. [Bundler Selection](#bundler-selection)
6. [Package Management](#package-management)
7. [Common Workflows](#common-workflows)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Quick Start

### 1-Minute Setup

```bash
# Navigate to your app
cd capps-guinea-pig

# Initialize bundle configuration (one time)
npm run bundle:init

# Build assets
npm run bundle

# Done! Check public/dist/
```

---

## Installation

### For Existing Apps

If you already have an app (like capps-guinea-pig):

1. **Create `public/assets.json`** - Declare your assets
2. **Update `package.json`** - Add build scripts
3. **Run build** - Generate bundles

### For New Apps

```bash
# Create app structure
mkdir my-app
cd my-app

# Initialize
npm init -y
npm run bundle:init

# Follow interactive prompts
```

---

## Commands Reference

### Build Commands

#### `npm run bundle` - Production Build

```bash
npm run bundle
```

**What it does:**
- Bundles all assets for production
- Minifies CSS and JavaScript
- Generates content-based hashes (cache busting)
- Creates `manifest.json`

**Output:**
```
public/dist/
├── layout-abc123.js      (hashed filename)
├── layout-abc123.css
├── form-xyz789.js
├── form-xyz789.css
└── manifest.json
```

#### `npm run bundle:dev` - Development Build

```bash
npm run bundle:dev
```

**What it does:**
- Bundles for development
- NO minification (faster, easier to debug)
- Generates source maps
- Hashes still applied

**When to use:**
- While developing
- Before testing locally

#### `npm run bundle:watch` - Watch Mode

```bash
npm run bundle:watch
```

**What it does:**
- Watches source files for changes
- Auto-rebuilds on every change
- Shows build status
- Continues running until you press Ctrl+C

**When to use:**
- During active development
- When you want instant feedback

**Example output:**
```
[Watch] Watching for changes...
[Watch] Files changed: public/src/layout.scss
[Watch] Rebuilding...
[Watch] ✓ Build complete (1.2s)
[Watch] Waiting for changes...
```

#### `npm run bundle:serve` - Development Server (Future)

```bash
npm run bundle:serve
```

**Coming in Phase 7**
- Auto-reload browser on change
- Hot Module Replacement (HMR)
- Live feedback while coding

---

### Analysis Commands

#### `npm run bundle:analyze` - Analyze Bundle Sizes

```bash
npm run bundle:analyze
```

**Output:**
```
Bundle Sizes:
  layout.js                    125.50 KB  (large)
  bill-form.js                 45.23 KB   (good)
  layout.css                   12.10 KB   (good)

Total: 186.33 KB

Recommendations:
⚠ layout.js is large (>100KB) - consider code splitting
✓ CSS files are optimized
```

#### `npm run bundle:validate` - Validate Configuration

```bash
npm run bundle:validate
```

**Checks:**
- ✓ assets.json exists and is valid JSON
- ✓ All entry points exist
- ✓ No circular dependencies
- ✓ Valid bundler name
- ✓ Output directory accessible

**When to use:**
- After updating assets.json
- If builds are failing
- Troubleshooting configuration issues

---

### Package Management

#### `npm run bundle:add-pkg <package>` - Install Package

```bash
# Install single package
npm run bundle:add-pkg lodash

# Install specific version
npm run bundle:add-pkg axios@1.6.0

# Install latest
npm run bundle:add-pkg moment@latest
```

**What it does:**
1. Creates `public/packages/package.json` if missing
2. Adds package to dependencies
3. Runs `npm install` in `public/packages/`
4. Updates your app's config

**After install:**
```
public/packages/
├── package.json
├── package-lock.json
└── node_modules/
    ├── lodash/
    ├── axios/
    └── ...
```

#### `npm run bundle:remove-pkg <package>` - Uninstall Package

```bash
npm run bundle:remove-pkg lodash
```

**What it does:**
1. Removes from `public/packages/package.json`
2. Runs uninstall
3. Cleans node_modules
4. Updates config

#### `npm run bundle:list-pkg` - List Installed Packages

```bash
npm run bundle:list-pkg
```

**Output:**
```
Installed Packages:
  lodash       ^4.17.21
  axios        ^1.6.0
  moment       ^2.29.4

Total: 3 packages
```

#### `npm run bundle:update-pkg` - Update All Packages

```bash
npm run bundle:update-pkg
```

**What it does:**
- Updates all packages to latest compatible versions
- Respects semver constraints in package.json
- Updates lock file

---

### Utility Commands

#### `npm run bundle:clean` - Clean Build Directory

```bash
npm run bundle:clean
```

**Removes:**
- `public/dist/` directory
- All bundled files
- manifest.json

**When to use:**
- Full rebuild from scratch
- Cleanup before production build
- Troubleshooting stale builds

#### `npm run bundle:init` - Initialize App (Interactive)

```bash
npm run bundle:init
```

**Interactive setup wizard:**
```
? App name: capps-guinea-pig
? Bundler choice: (1) Webpack (2) Vite (3) esbuild
? Create example assets? (Y/n)
? Auto-add npm scripts? (Y/n)

Creating...
✓ Created public/assets.json
✓ Created webpack.config.js
✓ Updated package.json scripts
✓ Ready to build!
```

#### `npm run bundle:help` - Show Help

```bash
npm run bundle:help
```

**Or use:**
```bash
npm run bundle -- --help
```

#### `npm run bundle:version` - Show Version

```bash
npm run bundle:version
```

---

## Configuration (assets.json)

### Location

```
your-app/public/assets.json
```

### Basic Structure

```json
{
  "app_name": "capps-guinea-pig",
  "version": "1.0.0",
  "bundler": "webpack",
  "assets": {
    "asset-name": { ... }
  },
  "packages": { ... },
  "build": { ... }
}
```

### Asset Definition

```json
{
  "assets": {
    "app-layout": {
      "description": "Application layout and theme",
      "bundles": {
        "css": "layout.css",
        "js": "layout.js"
      },
      "load_in": ["app"],
      "dependencies": [],
      "preload": true
    }
  }
}
```

**Fields:**
- `description` - What this asset does
- `bundles.css` - CSS bundle filename
- `bundles.js` - JS bundle filename
- `load_in` - When to load (see Load Contexts below)
- `dependencies` - Other assets this depends on
- `preload` - Load immediately or lazy load

### Load Contexts

Where assets are loaded:

| Context | When | Example |
|---------|------|---------|
| `app` | App initialization (always) | Global styles, core JS |
| `collection:name` | When accessing collection | `collection:bill` |
| `page:name` | When viewing page | `page:dashboard` |
| `form:name` | When opening form | `form:invoice` |
| `list:name` | When viewing list | `list:users` |

**Example:**
```json
{
  "bill-form": {
    "load_in": ["form:bill", "collection:bill"]
  }
}
```

### Bundler Configuration

```json
{
  "build": {
    "bundler": "webpack",
    "entry_points": {
      "layout": "public/src/layout/index.js",
      "bill-form": "public/src/forms/bill/index.js"
    },
    "output_dir": "public/dist/",
    "hash_bundles": true,
    "minify": true
  }
}
```

**Fields:**
- `bundler` - Which bundler to use (webpack/vite/esbuild)
- `entry_points` - Source files to bundle
- `output_dir` - Where to put bundles
- `hash_bundles` - Add content hash to filenames (cache busting)
- `minify` - Minify output (production only)

### Complete Example

```json
{
  "app_name": "capps-guinea-pig",
  "version": "1.0.0",
  "bundler": "webpack",

  "assets": {
    "app-layout": {
      "description": "Application layout styles",
      "bundles": {
        "css": "layout.css",
        "js": "layout.js"
      },
      "load_in": ["app"],
      "dependencies": [],
      "preload": true
    },

    "bill-form": {
      "description": "Bill form bundle",
      "bundles": {
        "css": "bill-form.css",
        "js": "bill-form.js"
      },
      "load_in": ["form:bill", "collection:bill"],
      "dependencies": ["app-layout"],
      "preload": false
    }
  },

  "packages": {
    "lodash": "^4.17.21",
    "axios": "^1.6.0"
  },

  "build": {
    "bundler": "webpack",
    "entry_points": {
      "layout": "public/src/layout/index.js",
      "bill-form": "public/src/forms/bill/index.js"
    },
    "output_dir": "public/dist/",
    "hash_bundles": true,
    "minify": true
  }
}
```

---

## Bundler Selection

### How to Choose

#### Webpack

**Best for:**
- Large, complex apps
- Need for sophisticated configuration
- Team familiar with Webpack
- Lots of loaders/plugins needed

**Setup:**
```bash
npm run bundle:init
# Choose: Webpack

# Auto-generates webpack.config.js
npm run bundle
```

#### Vite

**Best for:**
- Fast development
- Modern projects
- Want instant HMR
- Smaller bundle sizes

**Setup:**
```bash
npm run bundle:init
# Choose: Vite

npm run bundle
```

#### esbuild

**Best for:**
- Speed (fastest)
- Simple projects
- Minimal configuration
- Fast CI/CD builds

**Setup:**
```bash
npm run bundle:init
# Choose: esbuild

npm run bundle
```

### Switching Bundlers

To switch from Webpack to Vite:

```bash
# 1. Update assets.json
{
  "bundler": "vite"  # ← Change this
}

# 2. Remove old config
rm webpack.config.js

# 3. Build (generates new config)
npm run bundle
```

---

## Package Management

### Adding Packages

```bash
# Add lodash
npm run bundle:add-pkg lodash

# Specify version
npm run bundle:add-pkg moment@2.29.4

# Add multiple at once
npm run bundle:add-pkg lodash axios moment
```

### Viewing Installed Packages

```bash
npm run bundle:list-pkg
```

### Using Installed Packages in Your Code

```javascript
// In your source files
import _ from 'lodash';
import axios from 'axios';

export function myFunction() {
  const data = _.map([1, 2, 3], x => x * 2);
  axios.get('/api/data').then(res => console.log(res));
}
```

The bundler automatically includes packages in your bundles.

### Updating Packages

```bash
# Update all to latest compatible versions
npm run bundle:update-pkg

# Check what would be updated
npm run bundle:list-pkg
```

### Removing Packages

```bash
# Remove lodash
npm run bundle:remove-pkg lodash
```

---

## Common Workflows

### Workflow 1: Day-to-Day Development

```bash
# Morning: Start watch mode
npm run bundle:watch

# Edit your files
# Files are auto-rebuilt on save

# Evening: Stop with Ctrl+C
```

### Workflow 2: Release to Production

```bash
# 1. Validate configuration
npm run bundle:validate

# 2. Production build
npm run bundle

# 3. Analyze sizes
npm run bundle:analyze

# 4. If sizes are good, commit
git add public/dist/manifest.json
git commit -m "Update asset bundles for production"

# 5. Deploy
npm run deploy
```

### Workflow 3: Adding New Feature with Styles

```bash
# 1. Create new form component
mkdir public/src/forms/invoice
touch public/src/forms/invoice/index.js
touch public/src/forms/invoice/styles.scss

# 2. Add to assets.json
{
  "invoice-form": {
    "bundles": {
      "css": "invoice-form.css",
      "js": "invoice-form.js"
    },
    "load_in": ["form:invoice"],
    "dependencies": ["app-layout"]
  }
}

# 3. Add entry point
{
  "build": {
    "entry_points": {
      "invoice-form": "public/src/forms/invoice/index.js"
    }
  }
}

# 4. Start watching
npm run bundle:watch

# 5. Edit files, auto-rebuilds on save
# Edit public/src/forms/invoice/index.js
# Watch sees change, rebuilds in 1-2 seconds
```

### Workflow 4: Adding NPM Dependencies

```bash
# 1. Add package
npm run bundle:add-pkg axios

# 2. Use in your code
// public/src/api/client.js
import axios from 'axios';
export const client = axios.create({ ... });

# 3. Watch rebuilds automatically
npm run bundle:watch

# 4. Test the integration
```

### Workflow 5: Debugging Build Issues

```bash
# 1. Validate configuration
npm run bundle:validate

# If validation passes, the issue is in bundler config

# 2. Check bundler config exists
ls webpack.config.js  # or vite.config.js

# 3. Try clean build
npm run bundle:clean
npm run bundle

# 4. Check source files exist
ls public/src/...

# 5. Check entry points in assets.json match file paths

# 6. Read error message carefully
# Look for "Entry point not found" or "Module not found"
```

---

## Troubleshooting

### Problem: "assets.json not found"

**Solution:**
```bash
npm run bundle:init
```

### Problem: "Entry point not found"

**Check:**
```bash
# 1. Verify file exists
ls public/src/layout/index.js

# 2. Check assets.json entry_points path
cat public/assets.json | grep entry_points

# 3. Make sure path is relative to app root
# ✓ "public/src/layout/index.js"  (correct)
# ✗ "src/layout/index.js"         (wrong, missing public/)
```

### Problem: "Bundle size too large"

**Check:**
```bash
# See what's in the bundle
npm run bundle:analyze

# If package is too large:
npm run bundle:remove-pkg large-package

# Or, if unavoidable, suppress warning
```

### Problem: "Bundler not found"

**Solution:**
```bash
# Install bundler dependencies
npm install webpack webpack-cli --save-dev

# Or for Vite:
npm install vite --save-dev
```

### Problem: "No files in public/dist/ after build"

**Check:**
```bash
# 1. Check build succeeded
npm run bundle  # Look for errors

# 2. Check output directory
ls public/dist/

# 3. Check entry points have source files
ls public/src/layout/index.js
```

### Problem: "Manifest.json not created"

**Solution:**
```bash
# The bundler ran but manifest wasn't created
# This usually means the build failed silently

# Re-run with more verbose output
npm run bundle:validate  # Check config first
npm run bundle          # Check for errors
```

### Problem: "Changes not detected in watch mode"

**Solution:**
```bash
# 1. Make sure watch is running
# Should see "Watching for changes..." message

# 2. Try Ctrl+C and restart
npm run bundle:watch

# 3. Some editors have issues with watch
# Try touching the file:
touch public/src/layout/index.js
```

---

## FAQ

### Q: Do I need to commit public/dist/?

**A:** No! Add it to .gitignore:
```bash
echo "public/dist/" >> .gitignore
echo "public/packages/node_modules" >> .gitignore
```

Bundles are generated at build time, not stored in Git.

### Q: Should I commit public/packages/node_modules?

**A:** No! Add to .gitignore:
```bash
echo "public/packages/node_modules" >> .gitignore
```

Commit `public/packages/package-lock.json` for reproducible installs.

### Q: How do I update the framework CLI?

**A:** The CLI is in the CAPPS framework. When you pull the latest:
```bash
git pull origin main
# Your apps automatically use the new CLI
```

No action needed on your apps.

### Q: Can I use CSS frameworks?

**A:** Yes! Add them as packages:
```bash
npm run bundle:add-pkg bootstrap
npm run bundle:add-pkg tailwindcss
```

Then import in your code:
```javascript
import 'bootstrap/dist/css/bootstrap.css';
```

### Q: How do I use Vue components?

**A:** If using Webpack or Vite with Vue support:
```javascript
// public/src/layout/index.js
import MyComponent from './MyComponent.vue';

export default {
  components: { MyComponent }
};
```

The bundler automatically handles `.vue` files.

### Q: How do I add TypeScript support?

**A:** Install TypeScript, then:
```bash
# Add to entry points
{
  "entry_points": {
    "main": "public/src/index.ts"  # .ts extension
  }
}
```

Bundler auto-detects and handles TypeScript.

### Q: Why are bundles so large?

**A:** Check with:
```bash
npm run bundle:analyze
```

Common reasons:
- Including large libraries
- Not minifying (use `npm run bundle`, not `:dev`)
- Duplicate code in multiple bundles
- Heavy node_modules packages

### Q: Can I split bundles by feature?

**A:** Yes! Define separate assets:
```json
{
  "assets": {
    "core": { ... },
    "bill-feature": { ... },
    "invoice-feature": { ... }
  }
}
```

Load specific features in specific contexts.

### Q: How do I debug bundled code?

**A:** Source maps are auto-generated:
```bash
npm run bundle:dev
```

Then in browser DevTools, you'll see original source files.

### Q: What if I need custom bundler config?

**A:** After init, the bundler config file is generated:
```bash
# Edit it directly
nano webpack.config.js

# Or Vite:
nano vite.config.js
```

The CLI won't overwrite existing configs.

### Q: How do I deploy bundles?

**A:** The CAPPS framework asset loader handles it:
```javascript
// Framework automatically loads from manifest
window.cappsAssetManager.loadAssetsForContext(
  'capps-guinea-pig',
  { collection: 'bill' }
);
```

Just commit `public/dist/manifest.json`.

---

## Getting Help

1. **Check documentation** - This guide covers most scenarios
2. **Run validation** - `npm run bundle:validate` shows config issues
3. **Check logs** - Build output explains what went wrong
4. **Ask team** - Someone else probably hit the same issue
5. **Developer Guide** - Read `docs/CLI_DEVELOPER_GUIDE.md` for internals

---

**Last Updated:** 2025-10-22
**Version:** 1.0.0
