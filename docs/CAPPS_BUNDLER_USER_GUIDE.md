# CAPPS Bundle CLI - User Guide

A complete guide to using the CAPPS Bundler for managing and optimizing your application assets.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [What is the Bundler?](#what-is-the-bundler)
3. [Key Features](#key-features)
4. [Getting Started](#getting-started)
5. [Commands](#commands)
6. [Configuration](#configuration)
7. [Common Workflows](#common-workflows)
8. [Tips & Tricks](#tips--tricks)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Quick Start

Get your app bundled in 2 minutes:

```bash
# 1. Initialize bundling (answer a few questions)
npm run bundle:init

# 2. Build your assets
npm run bundle:build

# 3. Watch for changes during development
npm run bundle:watch
```

That's it! Your app is now bundled and ready.

---

## What is the Bundler?

The CAPPS Bundler is a tool that:

- **Finds your assets** - Automatically discovers JavaScript, CSS, and SCSS files in your app
- **Bundles them** - Combines files into optimized bundles for faster loading
- **Generates metadata** - Creates a manifest so the framework knows where everything is
- **Optimizes performance** - Minifies code, adds cache-busting, generates source maps
- **Watches for changes** - Auto-rebuilds when you edit files during development

### Why Use It?

- **Smaller files** - Minification reduces file size by ~40%
- **Better caching** - Browser caches bundles longer with content hashing
- **Faster loads** - Single entry point loads all bundles efficiently
- **Development speed** - Watch mode auto-rebuilds on changes
- **Organized** - Clear separation of bundles and configuration

---

## Key Features

### 1. Automatic Asset Discovery

The bundler automatically finds files you want to bundle:

```
✅ Finds all JavaScript files in public/
✅ Finds all CSS and SCSS files
✅ Excludes vendor code and build output
✅ Zero manual configuration needed
```

**How it works:**
- You specify patterns to include (e.g., `**/*.js`)
- You specify patterns to exclude (e.g., `vendor/**`)
- Bundler finds all matching files
- Creates entry points automatically

### 2. Manifest-Based Loading

The bundler generates `manifest.json` that tells your framework:
- Where each bundle file is located
- File sizes and hashes
- Which files to load
- When to load them

### 3. Vendor Library Support

Load external libraries (React, Babel, jQuery) without bundling them:

```json
"app_include_js": [
  "vendor/react.production.min.js",
  "vendor/babel.min.js"
]
```

**Benefits:**
- Libraries stay as-is (UMD format)
- Smaller app bundles
- Better version management
- Shared across your apps

### 4. JSX & Babel Support

Automatic JSX transpilation in page-builder templates:

```html
<script type="text/jsx">
  const Component = () => <div>Hello!</div>;
</script>
```

**No extra setup needed** - Just configure Babel in `assets.json`

### 5. Watch Mode for Development

Auto-rebuild when you save files:

```bash
npm run bundle:watch

# Now edit your files - they rebuild automatically!
# Press Ctrl+C to stop
```

### 6. Production Optimization

Automatically when building for production:
- ✅ Minifies JavaScript and CSS
- ✅ Adds content-based hashing (cache busting)
- ✅ Generates source maps for debugging
- ✅ Compresses assets

### 7. Bundle Analysis

See what's in your bundles and optimize:

```bash
npm run bundle:analyze

# Shows:
# - Bundle sizes
# - File breakdown
# - Performance insights
```

---

## Getting Started

### Step 1: Initialize Your App

```bash
npm run bundle:init
```

This interactive wizard:
1. Sets your app name
2. Configures file discovery
3. Sets output directory (default: `public/dist`)
4. Asks about file patterns
5. Creates `assets.json`

**Answer the prompts:**
- **App name?** - Usually folder name
- **Output directory?** - Where bundles go (default: `public/dist`)
- **Change file patterns?** - Usually no (uses smart defaults)

### Step 2: Build Your Bundles

```bash
# Production build
npm run bundle:build

# Development build (with source maps, no minification)
npm run bundle:build --dev
```

**Output:**
```
public/
├── manifest.json          ← Framework loads this
├── dist/
│   ├── app-abc123.js      ← Your bundled code
│   ├── style-def456.css   ← Your bundled styles
│   └── app-entry-xyz789.js ← Main entry point
└── assets.json            ← Your configuration
```

### Step 3: Start Developing

```bash
npm run bundle:watch
```

Now whenever you save a file, bundles rebuild automatically!

---

## Commands

### `npm run bundle:init`

**What it does:** Sets up bundling configuration

**When to use:**
- First time setting up bundling
- Re-running to update configuration
- Starting a new app

**Safe to run multiple times** - Preserves your custom settings

**Example:**
```bash
npm run bundle:init

# Prompts appear, answer them
# Creates or updates public/assets.json
```

---

### `npm run bundle:build`

**What it does:** Builds your bundles for distribution

**Versions:**
```bash
# Production (minified, hashed)
npm run bundle:build

# Development (source maps, no minification)
npm run bundle:build --dev
```

**Output:**
- Bundles in `public/dist/` (or configured directory)
- `public/manifest.json` with metadata
- Ready to deploy

**When to use:**
- Before deploying to production
- Before testing
- When you change configuration

---

### `npm run bundle:watch`

**What it does:** Auto-rebuild when files change

**Perfect for development:**
```bash
npm run bundle:watch

# Now edit files... they rebuild automatically
# Your app reloads with new code
```

**Stop watching:**
```
Press Ctrl+C
```

**Why use it:**
- See changes instantly
- No manual rebuild needed
- Fast feedback loop
- Saves time during development

---

### `npm run bundle:analyze`

**What it does:** Shows bundle composition and sizes

```bash
npm run bundle:analyze
```

**Shows:**
- Total bundle size
- Individual file sizes
- Which modules are in each bundle
- Optimization suggestions

**When to use:**
- Before deploying
- When bundles feel large
- To optimize performance
- To understand bundle content

**Example output:**
```
Bundle Manifest Summary
Total Bundles: 4
Total Files: 15
Total Size: 125.45 KB

Bundles:
  main
    - main-abc123.js (85 KB)
    - style-def456.css (40 KB)
  pages
    - pages-ghi789.js (15 KB)
```

---

### `npm run bundle:validate`

**What it does:** Checks your configuration for errors

```bash
npm run bundle:validate
```

**Validates:**
- Configuration is valid JSON
- All required fields present
- File paths exist
- Patterns are correct
- Entry points can be found

**When errors appear:**
- Configuration has issues
- File paths are wrong
- Patterns need adjustment

**Example output:**
```
✓ Configuration validation passed!
✓ All entry points found
✓ Output directory valid
```

---

### `npm run bundle:clean`

**What it does:** Removes all bundled output

```bash
npm run bundle:clean
```

**Removes:**
- `public/dist/` (or configured output dir)
- `public/manifest.json`
- All bundled files

**Use when:**
- Starting fresh build
- Cleaning up before deployment
- Troubleshooting build issues

---

## Configuration

### The Configuration File: `public/assets.json`

This file tells the bundler how to bundle your app.

### Minimal Configuration

```json
{
  "app_name": "my-app",
  "version": "1.0.0",
  "build": {
    "output_dir": "public/dist",
    "entry_points": "auto",
    "source_dir": "public",
    "include_patterns": ["**/*.{js,css,scss}"],
    "exclude_patterns": ["dist/**", "vendor/**", "collection/**"]
  },
  "load_contexts": [
    {
      "context": "app",
      "bundles": ["public"],
      "load_type": "always"
    }
  ],
  "app_include_js": [],
  "app_include_css": []
}
```

### Key Configuration Options

#### `output_dir`

Where bundled files go:
```json
"output_dir": "public/dist"
```

**Options:**
- `public/dist` - Default location (recommended)
- `public/build` - Alternative location
- Any directory in `public/`

#### `entry_points: "auto"`

Auto-discover entry points (recommended):
```json
"entry_points": "auto",
"source_dir": "public",
"include_patterns": ["**/*.{js,css,scss}"],
"exclude_patterns": ["dist/**", "vendor/**"]
```

**How it works:**
1. Scans `source_dir` for files
2. Includes files matching patterns
3. Excludes files matching patterns
4. Creates bundles automatically

**Pattern examples:**
- `**/*.js` - All JS files
- `pages/**` - Everything in pages/
- `**/*.{css,scss}` - CSS and SCSS

#### `app_include_js`

Load external libraries without bundling:
```json
"app_include_js": [
  "vendor/react.production.min.js",
  "vendor/react-dom.production.min.js",
  "vendor/babel.min.js"
]
```

**When to use:**
- Third-party libraries (React, jQuery, Lodash)
- Babel standalone (for JSX)
- Pre-built UMD files
- Shared vendor code

#### `app_include_css`

Load stylesheets without bundling:
```json
"app_include_css": [
  "assets/css/bootstrap.min.css",
  "assets/css/theme.css"
]
```

**When to use:**
- CSS frameworks
- Global stylesheets
- Third-party styles

#### `babel_config`

Configure Babel for JSX:
```json
"babel_config": {
  "enabled": true,
  "presets": [
    "@babel/preset-env",
    ["@babel/preset-react", { "runtime": "automatic" }]
  ]
}
```

**Use when:**
- Your templates have JSX syntax
- You need modern JavaScript features
- Transpilation is needed

---

## Common Workflows

### Workflow 1: Simple App

**Setup:**
```bash
npm run bundle:init
# Accept defaults
npm run bundle:build
```

**Done!** Your app is bundled.

---

### Workflow 2: Development with Watch Mode

```bash
# One-time setup
npm run bundle:init

# During development
npm run bundle:watch

# Edit your files... they rebuild automatically!
```

---

### Workflow 3: Add React

**In your `public/assets.json`:**
```json
{
  "app_include_js": [
    "vendor/react.production.min.js",
    "vendor/react-dom.production.min.js",
    "vendor/babel.min.js"
  ],
  "babel_config": {
    "enabled": true,
    "presets": ["@babel/preset-react"]
  }
}
```

**Now use JSX:**
```html
<script type="text/jsx">
  function Dashboard() {
    return <div>Welcome to React!</div>;
  }
</script>
```

**Build:**
```bash
npm run bundle:build
```

---

### Workflow 4: Optimize Bundle Sizes

**Check current sizes:**
```bash
npm run bundle:analyze
```

**See what's in bundles** and identify large files.

**Solutions:**
1. Move vendor code to `app_include_js`
2. Exclude test files from bundling
3. Split into multiple bundles (future feature)

---

### Workflow 5: Deploy to Production

**Before deploying:**
```bash
# Build for production
npm run bundle:build

# Analyze sizes
npm run bundle:analyze

# Validate configuration
npm run bundle:validate
```

**Push to server:**
```
- public/manifest.json
- public/dist/ (or configured output_dir)
- public/assets.json
```

**Framework loads:**
1. Reads `manifest.json`
2. Loads bundles from `dist/`
3. App runs!

---

## Tips & Tricks

### Tip 1: Use Watch Mode During Development

```bash
npm run bundle:watch
```

Saves time and keeps code fresh automatically.

### Tip 2: Check Bundle Sizes

```bash
npm run bundle:analyze
```

Keep an eye on bundle sizes as you add features.

### Tip 3: Exclude Test Files

In `assets.json`:
```json
"exclude_patterns": [
  "dist/**",
  "vendor/**",
  "**/*.test.js",    ← Add this
  "**/*.spec.js"     ← And this
]
```

Smaller bundles = faster builds.

### Tip 4: Use app_include_js for Vendor Code

**Good:**
```json
"app_include_js": ["vendor/react.min.js"]
```

**Bad:**
```json
"include_patterns": ["vendor/**"]  // Bundles React!
```

Vendor code should not be bundled.

### Tip 5: Validate After Changes

```bash
npm run bundle:validate
```

Before building, make sure configuration is correct.

### Tip 6: Development vs Production

**Development build** (while coding):
```bash
npm run bundle:build --dev
```
- No minification (faster builds)
- Inline source maps (easier debugging)
- Development focus

**Production build** (before deployment):
```bash
npm run bundle:build
```
- Minified (smaller files)
- Cache-busted (content hashing)
- Optimized

---

## Troubleshooting

### Problem: "manifest.json not found"

**Solution:**
```bash
npm run bundle:init
npm run bundle:build
```

Run init to create configuration, then build.

---

### Problem: Files not being bundled

**Check:**
1. Files match `include_patterns`
2. Files don't match `exclude_patterns`
3. Validate configuration:
   ```bash
   npm run bundle:validate
   ```

**Example fix:**
```json
"include_patterns": ["**/*.js"],      // Include all JS
"exclude_patterns": ["vendor/**"]      // Except vendor
```

---

### Problem: Babel not transpiling JSX

**Checklist:**
1. Enable Babel in `assets.json`:
   ```json
   "babel_config": { "enabled": true }
   ```

2. Load Babel library:
   ```json
   "app_include_js": ["vendor/babel.min.js"]
   ```

3. Use correct script type:
   ```html
   <script type="text/jsx">
     // Your JSX code
   </script>
   ```

---

### Problem: Build is slow

**Solutions:**
1. Check how many files:
   ```bash
   npm run bundle:analyze
   ```

2. Exclude unnecessary patterns:
   ```json
   "exclude_patterns": [
     "**/*.test.js",
     "collection/**"
   ]
   ```

3. Move vendor code to `app_include_js`

---

### Problem: Bundles are too large

**Check sizes:**
```bash
npm run bundle:analyze
```

**Solutions:**
1. Move large libraries to `app_include_js`
2. Exclude files you don't need
3. Check for large data files

---

### Problem: CSS not loading

**Check:**
1. CSS files discovered:
   ```bash
   npm run bundle:analyze
   ```

2. Patterns include CSS:
   ```json
   "include_patterns": ["**/*.{js,css,scss}"]
   ```

3. Not in exclude patterns:
   ```json
   "exclude_patterns": []  // Should not exclude CSS
   ```

---

## FAQ

### Q: Do I need to run init every time?

**A:** No. Run init once to create `assets.json`, then just use:
```bash
npm run bundle:watch   # During development
npm run bundle:build   # Before deploying
```

---

### Q: What if I change patterns in assets.json?

**A:** Changes take effect on next build:
```bash
# Validate changes
npm run bundle:validate

# Rebuild with new patterns
npm run bundle:build
```

---

### Q: Why is my build folder in public/dist/?

**A:** The bundler puts output in `public/dist/` by default. You can change this in `assets.json`:
```json
"output_dir": "public/build"  // Or any other location
```

---

### Q: Can I manually specify which files to bundle?

**A:** Yes! Instead of auto-discovery:
```json
"entry_points": {
  "app": "public/main.js",
  "pages": "public/pages/index.js"
}
```

But auto-discovery is usually better.

---

### Q: Do I need to commit manifest.json?

**A:** No, it's generated. But commit `assets.json` - it's your configuration.

**In .gitignore:**
```
public/dist/
public/manifest.json
```

**In git:**
```
public/assets.json ✓
```

---

### Q: What's the difference between app_include_js and bundled files?

**app_include_js:**
- Files load as-is (UMD format)
- Not processed or minified
- Loaded first
- Good for: React, Babel, jQuery

**Bundled files:**
- Processed and minified
- Tree-shaken
- Combined into chunks
- Good for: Your own code

---

### Q: Is the bundler required?

**A:** No, it's optional. But it:
- Makes files smaller (minification)
- Improves caching (hashing)
- Simplifies asset management
- Enables advanced features (lazy loading)

**Recommended:** Use it in production, optional in development.

---

### Q: Can I use it with my existing app?

**A:** Yes! Just run:
```bash
npm run bundle:init
npm run bundle:build
```

Works with any existing app structure.

---

### Q: What happens if I break something?

**A:** Clean up and rebuild:
```bash
npm run bundle:clean
npm run bundle:init
npm run bundle:build
```

Or restore `assets.json` from git.

---

### Q: Where can I get help?

**Resources:**
1. Run `npm run bundle:validate` to check configuration
2. Run `npm run bundle:build --debug` for detailed logs
3. Check `public/manifest.json` to see what was bundled
4. Review this guide and troubleshooting section

---

## Summary

**The CAPPS Bundler helps you:**

✅ Organize and optimize assets
✅ Reduce file sizes
✅ Improve caching
✅ Develop faster with watch mode
✅ Deploy with confidence

**Get started:**
```bash
npm run bundle:init      # Setup (once)
npm run bundle:watch     # Develop
npm run bundle:build     # Deploy
```

**That's all you need to know!**

---

## Next Steps

1. **Initialize your app:**
   ```bash
   npm run bundle:init
   ```

2. **Start developing:**
   ```bash
   npm run bundle:watch
   ```

3. **Deploy when ready:**
   ```bash
   npm run bundle:build
   ```

**Happy bundling! 🚀**