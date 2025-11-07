# assets.json Configuration Guide

Complete reference for configuring the CAPPS bundler via `public/assets.json`.

## Configuration Basics

Every CAPPS app needs an `assets.json` file in the `public/` directory that tells the bundler:
- Where to find source files
- How to organize them
- How to load them in the framework

## Minimal Configuration

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

## Build Configuration

### entry_points: "auto"

Auto-discover entry points from files:

```json
{
  "build": {
    "entry_points": "auto",
    "source_dir": "public",
    "include_patterns": [
      "**/*.js",
      "**/*.{css,scss}"
    ],
    "exclude_patterns": [
      "dist/**",
      "vendor/**",
      "collection/**",
      "layout/*.js"
    ]
  }
}
```

**How it works:**
- Scans `source_dir` recursively
- Includes files matching patterns
- Excludes files matching patterns
- Creates entry points from file names

**Example:**
- `public/main.js` → entry point "main"
- `public/pages/dashboard.js` → entry point "pages-dashboard"
- `public/styles.css` → entry point "styles"

### entry_points: Manual

Explicitly specify entry points:

```json
{
  "build": {
    "entry_points": {
      "app": "public/main.js",
      "pages": "public/pages/index.js",
      "layout": "public/layout/index.js"
    }
  }
}
```

## Load Contexts

Define which bundles load and when:

```json
{
  "load_contexts": [
    {
      "context": "app",
      "bundles": ["public"],
      "load_type": "always"
    }
  ]
}
```

### Load Types

| Type | When | Use Case |
|------|------|----------|
| `always` | Immediately with app | Core functionality |
| `lazy` | On first use | Optional features |
| `on-demand` | User triggers | Advanced features |

### Multiple Contexts

```json
{
  "load_contexts": [
    {
      "context": "app",
      "bundles": ["public"],
      "load_type": "always"
    },
    {
      "context": "pages",
      "bundles": ["pages"],
      "load_type": "lazy"
    },
    {
      "context": "reports",
      "bundles": ["reports"],
      "load_type": "on-demand"
    }
  ]
}
```

## App Include Files

Load files without bundling them:

```json
{
  "app_include_js": [
    "vendor/react.production.min.js",
    "vendor/react-dom.production.min.js",
    "vendor/babel.min.js"
  ],
  "app_include_css": [
    "assets/css/bootstrap.min.css",
    "assets/css/theme.css"
  ]
}
```

**When to use:**
- UMD/IIFE libraries (can't be bundled)
- Babel standalone (for JSX)
- Large libraries shared across bundles
- Third-party stylesheets

**Benefits:**
- Smaller bundles
- Better caching
- Shared across apps
- Version control

## Babel Configuration

Pre-configure Babel for JSX and modern JavaScript:

```json
{
  "babel_config": {
    "enabled": true,
    "presets": [
      "@babel/preset-env",
      ["@babel/preset-react", {
        "runtime": "automatic"
      }]
    ],
    "plugins": [
      "@babel/plugin-proposal-class-properties"
    ]
  }
}
```

### Presets

```javascript
// Modern JavaScript
"@babel/preset-env"

// React JSX
["@babel/preset-react", { "runtime": "automatic" }]

// TypeScript
"@babel/preset-typescript"
```

### Plugins

```javascript
// Class properties
"@babel/plugin-proposal-class-properties"

// Decorators
["@babel/plugin-proposal-decorators", { "legacy": true }]

// Optional chaining
"@babel/plugin-proposal-optional-chaining"

// Nullish coalescing
"@babel/plugin-proposal-nullish-coalescing-operator"
```

## Pattern Examples

### include_patterns

```json
"include_patterns": [
  "**/*.js",                    // All JS files
  "**/*.css",                   // All CSS files
  "pages/**/*.js",              // Pages only
  "components/**/index.js"      // Component indices
]
```

### exclude_patterns

```json
"exclude_patterns": [
  "dist/**",                    // Build output
  "**/*.test.js",               // Tests
  "**/*.spec.js",               // Specs
  "node_modules/**",            // node_modules
  "vendor/**",                  // Vendor code
  "**/.*"                       // Hidden files
]
```

## Full Example

```json
{
  "app_name": "financial-dashboard",
  "version": "2.1.0",
  "description": "Financial Dashboard for CAPPS",

  "build": {
    "output_dir": "public/dist",
    "entry_points": "auto",
    "source_dir": "public",
    "include_patterns": [
      "**/*.{js,css,scss}",
      "components/**",
      "pages/**"
    ],
    "exclude_patterns": [
      "dist/**",
      "build/**",
      "collection/**",
      "vendor/**",
      "layout/*.js",
      "**/*.test.js",
      "**/*.json"
    ],
    "hash_bundles": true,
    "minify": true
  },

  "load_contexts": [
    {
      "context": "app",
      "bundles": ["public"],
      "load_type": "always"
    },
    {
      "context": "reports",
      "bundles": ["pages"],
      "load_type": "lazy"
    }
  ],

  "app_include_js": [
    "vendor/react.production.min.js",
    "vendor/react-dom.production.min.js",
    "vendor/babel.min.js"
  ],

  "app_include_css": [
    "assets/css/bootstrap.min.css",
    "assets/css/custom-theme.css"
  ],

  "babel_config": {
    "enabled": true,
    "presets": [
      "@babel/preset-env",
      ["@babel/preset-react", { "runtime": "automatic" }]
    ],
    "plugins": [
      "@babel/plugin-proposal-class-properties"
    ]
  }
}
```

## Validation

Check your configuration:

```bash
npm run bundle:validate
```

This verifies:
- All required fields present
- File paths exist
- Patterns are valid
- Entry points discoverable

## Tips & Best Practices

1. **Start with auto-discovery** - Let the bundler find files
2. **Be specific with patterns** - Include only what you need
3. **Exclude vendor code** - Especially large libraries
4. **Use app_include_js** for external libraries
5. **Enable hashing** for production (cache busting)
6. **Keep Babel simple** - Only needed for JSX

## Common Issues

### Entry points not found

Check:
- `source_dir` path is correct
- Files match `include_patterns`
- Files don't match `exclude_patterns`
- Run `npm run bundle:validate`

### Babel not working

Ensure:
- `babel_config.enabled: true`
- React/Babel files in `app_include_js`
- Use `type="text/jsx"` in templates

### Bundles too large

Solutions:
- Exclude unnecessary patterns
- Move to `app_include_js`
- Enable code splitting (coming soon)
- Use dynamic imports

## Next Steps

- [Commands Reference](../README.md#commands-reference)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Best Practices](./BEST_PRACTICES.md)
