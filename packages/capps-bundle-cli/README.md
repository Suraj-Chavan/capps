# CAPPS Bundle CLI

A modern asset bundler for CAPPS applications with automatic asset discovery, code splitting, and manifest-based asset loading.

## Features

- ✅ **Automatic Asset Discovery** - Auto-discover entry points from `public/` folder
- ✅ **Manifest-Based Loading** - Generate manifest.json for framework asset loading
- ✅ **Code Splitting** - Split large bundles into smaller chunks (planned)
- ✅ **Lazy Loading** - Load bundles on-demand (planned)
- ✅ **App Include Files** - Load vendor libraries and custom files
- ✅ **Babel Configuration** - Pre-configure Babel for JSX transpilation
- ✅ **Watch Mode** - Auto-rebuild on file changes
- ✅ **Cache Busting** - Content-based hashing for better caching
- ✅ **Source Maps** - Debug your bundles with source maps
- ✅ **Production Ready** - Minification and optimization

## Quick Start

### Initialize Your App

```bash
npm run bundle:init
```

This interactive wizard will:
1. Set app name from folder
2. Configure auto-discovery mode
3. Set output directory (default: `public/dist`)
4. Configure bundling patterns
5. Create `assets.json` configuration

### Build Your Bundles

```bash
# Production build
npm run bundle:build

# Development build (with sourcemaps)
npm run bundle:build --dev

# Watch mode - auto-rebuild on changes
npm run bundle:watch
```

### Analyze Bundles

```bash
npm run bundle:analyze
```

### Validate Configuration

```bash
npm run bundle:validate
```

## Directory Structure

After setup, your app will have:

```
your-app/
├── public/
│   ├── assets.json              ← Configuration file
│   ├── manifest.json            ← Generated asset metadata
│   ├── dist/                    ← Bundled output (configured)
│   │   ├── app-abc123.js
│   │   ├── app-entry-def456.js
│   │   └── style-ghi789.css
│   ├── layout/
│   │   ├── menu.js
│   │   └── style.scss
│   ├── vendor/
│   │   ├── react.min.js
│   │   └── babel.min.js
│   └── ... other assets
├── public/assets.json           ← Configuration
└── package.json
```

## Configuration (assets.json)

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
    "exclude_patterns": ["dist/**", "collection/**", "vendor/**", "layout/*.js"]
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

## Commands Reference

### Initialize

```bash
npm run bundle:init
```

Sets up bundling configuration for your app. Safe to run multiple times - preserves custom settings.

### Build

```bash
npm run bundle:build
```

Production build with minification and hashing.

**Options:**
- `--dev` - Development build (no minification, inline sourcemaps)

### Watch

```bash
npm run bundle:watch
```

Automatically rebuild on file changes. Perfect for development.

### Analyze

```bash
npm run bundle:analyze
```

Analyze bundle composition and dependencies.

### Validate

```bash
npm run bundle:validate
```

Validate your assets.json configuration.

### Clean

```bash
npm run bundle:clean
```

Remove bundled output and manifest.

## Asset Configuration Details

### Auto-Discovery Mode

When `entry_points` is set to `"auto"`:

```json
{
  "build": {
    "entry_points": "auto",
    "source_dir": "public",
    "include_patterns": ["**/*.{js,css,scss}"],
    "exclude_patterns": ["dist/**", "vendor/**"]
  }
}
```

### App Include Files

Load vendor libraries without bundling:

```json
{
  "app_include_js": [
    "vendor/react.production.min.js",
    "vendor/react-dom.production.min.js",
    "vendor/babel.min.js"
  ],
  "app_include_css": [
    "assets/css/bootstrap.min.css"
  ]
}
```

### Babel Configuration

Pre-configure Babel for JSX transpilation:

```json
{
  "babel_config": {
    "enabled": true,
    "presets": [
      ["@babel/preset-react", { "runtime": "automatic" }]
    ],
    "plugins": []
  }
}
```

## Common Workflows

### Setup New App

```bash
# 1. Initialize
npm run bundle:init

# 2. First build
npm run bundle:build

# 3. Start developing
npm run bundle:watch
```

### Add Vendor Libraries

Edit `assets.json` and add to `app_include_js`:

```json
{
  "app_include_js": [
    "vendor/react.production.min.js"
  ]
}
```

Then rebuild:
```bash
npm run bundle:build
```

### Enable Babel for JSX

Edit `assets.json`:

```json
{
  "babel_config": {
    "enabled": true,
    "presets": ["@babel/preset-react"]
  }
}
```

Then rebuild:
```bash
npm run bundle:build
```

## Troubleshooting

### Manifest not found error

**Solution:** Run `npm run bundle:init` to create assets.json

### Entry points not discovered

**Check:**
- Files match `include_patterns`
- Files don't match `exclude_patterns`
- `source_dir` path is correct

### Babel not transpiling JSX

**Solution:**
1. Enable babel_config in assets.json
2. Ensure `vendor/babel.min.js` is in app_include_js
3. Use `type="text/jsx"` in script tags

### Large bundle sizes

**Solutions:**
1. Run `npm run bundle:analyze`
2. Use dynamic imports for features
3. Move vendor code to app_include_js
4. Exclude unnecessary patterns

## Performance Tips

1. **Use Auto-Discovery** - No manual entry point management
2. **Exclude Vendor Folders** - They shouldn't be bundled
3. **Use app_include_js** - For UMD libraries and Babel
4. **Enable Caching** - Browser caches hashed bundles longer
5. **Use Watch Mode** - Faster development iteration

## Version History

### v1.0.0 (Current)
- ✅ Auto asset discovery
- ✅ Manifest-based loading
- ✅ App include files
- ✅ Babel configuration
- ✅ Watch mode

### Planned Features
- 🚀 Code splitting
- 🚀 Lazy loading
- 📊 Enhanced bundle analysis
- 🔗 Module federation

## License

Part of the CAPPS Framework
