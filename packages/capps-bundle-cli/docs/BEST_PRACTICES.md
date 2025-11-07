# Best Practices for CAPPS Bundler

Guidelines and recommendations for optimal bundler usage.

## Configuration Best Practices

### 1. Use Auto-Discovery Mode

**Good:**
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

**Why:**
- No manual entry point maintenance
- Automatic scaling as app grows
- Less error-prone
- Cleaner configuration

### 2. Be Specific with Exclusions

**Good:**
```json
{
  "exclude_patterns": [
    "dist/**",        // Build output
    "vendor/**",      // External libraries
    "collection/**",  // Collections
    "layout/**",      // Page layouts
    "**/*.test.js",   // Tests
    "**/*.spec.js",   // Specs
    "node_modules/**" // node_modules
  ]
}
```

**Bad:**
```json
{
  "exclude_patterns": []  // Bundles everything!
}
```

**Why:**
- Smaller bundles
- Faster builds
- Less bundling overhead

### 3. Separate Vendor Code

**Good:**
```json
{
  "app_include_js": [
    "vendor/react.production.min.js",
    "vendor/react-dom.production.min.js",
    "vendor/babel.min.js"
  ],
  "exclude_patterns": ["vendor/**"]
}
```

**Bad:**
```json
{
  "include_patterns": ["vendor/**"],  // Bundles Babel!
  "app_include_js": []
}
```

**Why:**
- UMD libraries can't be bundled properly
- Smaller app bundles
- Better caching
- Works across multiple apps

### 4. Always Enable Hashing for Production

**Good:**
```json
{
  "build": {
    "hash_bundles": true,
    "minify": true
  }
}
```

**Why:**
- Browser caches bundles longer
- Automatic cache busting
- Better performance
- Updated when content changes

### 5. Document Your Patterns

**Good:**
```json
{
  "build": {
    "include_patterns": [
      "**/*.js",         // All JavaScript files
      "**/*.scss",       // Sass stylesheets
      "pages/**"         // Page components
    ],
    "exclude_patterns": [
      "dist/**",         // Build output
      "vendor/**",       // Pre-bundled libraries
      "**/*.test.js"     // Test files
    ]
  }
}
```

**Why:**
- Easier to maintain
- Clear intent
- Easier to debug
- Team understanding

## Bundling Strategy

### 1. Single Entry Point (Recommended)

**Configuration:**
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

**Pros:**
- Simple loading
- Predictable performance
- Easy debugging
- Single network request

**Use when:**
- Small to medium apps
- All features always needed
- Simple architecture

### 2. Multiple Entry Points (Modular)

**Configuration:**
```json
{
  "build": {
    "entry_points": {
      "app": "public/main.js",
      "pages": "public/pages/index.js",
      "reports": "public/reports/index.js"
    }
  },
  "load_contexts": [
    {
      "context": "app",
      "bundles": ["app"],
      "load_type": "always"
    },
    {
      "context": "pages",
      "bundles": ["pages"],
      "load_type": "lazy"
    }
  ]
}
```

**Pros:**
- Better organization
- Load what's needed
- Easier to split later
- Feature isolation

**Use when:**
- Large apps
- Distinct feature sets
- Want to optimize loading

### 3. Lazy Loading (Performance)

**Configuration:**
```json
{
  "load_contexts": [
    {
      "context": "app",
      "bundles": ["app"],
      "load_type": "always"
    },
    {
      "context": "advanced",
      "bundles": ["advanced-features"],
      "load_type": "lazy"
    }
  ]
}
```

**Pros:**
- Faster initial load
- Only load when needed
- Better user experience
- Reduces initial bundle size

**Use when:**
- Features used infrequently
- Want faster page load
- Mobile optimized

## Babel Configuration

### 1. Production React Setup

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
  },
  "app_include_js": [
    "vendor/react.production.min.js",
    "vendor/react-dom.production.min.js",
    "vendor/babel.min.js"
  ]
}
```

**Why:**
- Automatic JSX handling
- Modern JavaScript support
- Class properties
- Production-ready

### 2. Minimal Setup

```json
{
  "babel_config": {
    "enabled": true,
    "presets": ["@babel/preset-env"]
  }
}
```

**Use when:**
- No JSX needed
- Just need modern JS support

### 3. Keep It Simple

**Don't:**
```json
{
  "babel_config": {
    "enabled": true,
    "presets": [
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript",
      "@babel/preset-flow"
    ],
    "plugins": [
      "all-possible-babel-plugins"
    ]
  }
}
```

**Why:**
- Only load what you need
- Faster transpilation
- Smaller bundle
- Fewer dependencies

## Development Workflow

### 1. Use Watch Mode

```bash
npm run bundle:watch
```

**Benefits:**
- Auto-rebuild on changes
- Fast feedback loop
- See errors immediately
- Development focus

### 2. Start with --dev Flag

```bash
npm run bundle:build --dev
```

**Reasons:**
- No minification (faster)
- Inline source maps (debugging)
- Full stack traces
- Development focus

### 3. Validate Before Commit

```bash
npm run bundle:validate
```

**Ensures:**
- Configuration is valid
- Entry points exist
- Patterns work correctly
- No broken builds

### 4. Analyze Before Production

```bash
npm run bundle:analyze
```

**Checks:**
- Bundle sizes
- Module breakdown
- Potential optimizations
- Performance metrics

## Production Checklist

Before deploying:

- [ ] Run `npm run bundle:validate`
- [ ] Build with production settings
  ```bash
  npm run bundle:build
  ```
- [ ] Check bundle sizes
  ```bash
  npm run bundle:analyze
  ```
- [ ] Verify manifest exists
  ```bash
  cat public/manifest.json | jq .
  ```
- [ ] Test in staging environment
- [ ] Check browser cache headers
- [ ] Monitor performance metrics
- [ ] Plan for next optimization

## Performance Optimization

### 1. Minimize Bundle Size

**Good practices:**
- Exclude test files
- Exclude build artifacts
- Use `app_include_js` for vendor
- Tree-shake unused code
- Use production build of React

**Check sizes:**
```bash
npm run bundle:analyze
```

### 2. Optimize Caching

**Production configuration:**
```json
{
  "build": {
    "hash_bundles": true,
    "minify": true
  }
}
```

**Browser caches:**
- Hashed files cached indefinitely
- Non-hashed files cached short-term
- Only changed files bust cache

### 3. Lazy Load Features

```json
{
  "load_contexts": [
    {
      "context": "advanced",
      "bundles": ["advanced"],
      "load_type": "lazy"
    }
  ]
}
```

**Benefits:**
- Smaller initial payload
- Load on demand
- Better performance
- Improved UX

### 4. Use Dynamic Imports

```javascript
// Lazy load on demand
const module = await import('./heavy-module.js');
```

## Maintenance Practices

### 1. Keep assets.json Clean

- Remove unused entries
- Update patterns quarterly
- Document why patterns exist
- Review on major updates

### 2. Regular Audits

Monthly:
```bash
npm run bundle:validate
npm run bundle:analyze
```

### 3. Update Dependencies

```bash
npm run bundle:update-pkg
```

### 4. Monitor Build Times

Track:
- Build duration
- Bundle sizes
- Memory usage
- Rebuild time

### 5. Document Changes

When updating bundling:
- Document configuration changes
- Note performance impacts
- Record build time changes
- Update team docs

## Common Patterns

### Dashboard App

```json
{
  "app_name": "dashboard",
  "build": {
    "entry_points": "auto",
    "source_dir": "public",
    "include_patterns": ["**/*.{js,css}"],
    "exclude_patterns": ["dist/**", "vendor/**", "**/*.test.js"],
    "hash_bundles": true,
    "minify": true
  },
  "load_contexts": [
    {
      "context": "app",
      "bundles": ["public"],
      "load_type": "always"
    }
  ],
  "app_include_js": [
    "vendor/react.production.min.js",
    "vendor/react-dom.production.min.js"
  ]
}
```

### Multi-Feature App

```json
{
  "app_name": "crm",
  "build": {
    "entry_points": {
      "core": "public/core/index.js",
      "sales": "public/features/sales/index.js",
      "support": "public/features/support/index.js"
    }
  },
  "load_contexts": [
    {
      "context": "core",
      "bundles": ["core"],
      "load_type": "always"
    },
    {
      "context": "sales",
      "bundles": ["sales"],
      "load_type": "lazy"
    },
    {
      "context": "support",
      "bundles": ["support"],
      "load_type": "lazy"
    }
  ]
}
```

### Admin Panel

```json
{
  "app_name": "admin",
  "build": {
    "entry_points": "auto",
    "exclude_patterns": [
      "dist/**",
      "vendor/**",
      "test/**",
      "*.test.js"
    ]
  },
  "load_contexts": [
    {
      "context": "app",
      "bundles": ["public"],
      "load_type": "always"
    }
  ]
}
```

## Anti-Patterns to Avoid

### ❌ Don't Bundle Everything

```json
"include_patterns": ["**/*"],
"exclude_patterns": []  // Bundles everything!
```

### ❌ Don't Ignore Patterns

```json
"include_patterns": ["**/*"],
"exclude_patterns": ["node_modules/**"]
// Still bundles tests, vendor, build files
```

### ❌ Don't Mix Bundled and Unbundled

```json
"app_include_js": ["react.min.js"],
"include_patterns": ["react/**"]  // Also bundling React!
```

### ❌ Don't Disable Hashing in Production

```json
{
  "hash_bundles": false,  // Bad for caching
  "minify": false         // Bad for performance
}
```

### ❌ Don't Overcomplicate Babel

```json
{
  "babel_config": {
    "presets": [
      // All of these?
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript",
      "@babel/preset-flow"
    ]
  }
}
```

## Summary

**Key Takeaways:**

1. Use auto-discovery mode
2. Separate vendor code
3. Enable hashing for production
4. Use watch mode for development
5. Validate before every build
6. Analyze bundle sizes regularly
7. Keep Babel simple
8. Document your configuration
9. Monitor performance metrics
10. Iterate and optimize

**Follow these practices and your bundling will be smooth, fast, and maintainable!**
