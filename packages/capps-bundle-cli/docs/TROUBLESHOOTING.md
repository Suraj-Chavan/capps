# Troubleshooting Guide

Solutions for common CAPPS bundler issues.

## Bundle Generation Issues

### "Manifest not found" Error

**Problem:** Framework can't find `public/manifest.json`

**Solutions:**
1. Run the init wizard:
   ```bash
   npm run bundle:init
   ```
2. Build the bundles:
   ```bash
   npm run bundle:build
   ```
3. Verify files exist:
   ```bash
   ls -la public/manifest.json
   ls -la public/dist/
   ```

### Entry Points Not Discovered

**Problem:** Auto-discovery finds no files

**Check:**
1. Source directory exists:
   ```bash
   ls -la public/
   ```

2. Files match patterns - Check your `assets.json`:
   ```bash
   npm run bundle:validate --debug
   ```

3. Verify patterns:
   - Should include: `**/*.{js,css,scss}`
   - Should exclude: `dist/**`, `vendor/**`

**Example fix:**
```json
{
  "build": {
    "source_dir": "public",
    "include_patterns": ["**/*.{js,css,scss}"],
    "exclude_patterns": ["dist/**", "vendor/**"]
  }
}
```

### Vendor Files Being Bundled

**Problem:** Vendor files are included in bundles

**Solution:** Add to exclude patterns:
```json
{
  "build": {
    "exclude_patterns": [
      "vendor/**",
      "node_modules/**"
    ]
  }
}
```

### Large Bundle Sizes

**Problem:** Bundle files are too large

**Diagnostics:**
```bash
npm run bundle:analyze
```

**Solutions:**
1. Exclude unnecessary patterns:
   ```json
   "exclude_patterns": [
     "**/*.test.js",
     "**/*.spec.js",
     "collection/**"
   ]
   ```

2. Move to `app_include_js`:
   ```json
   "app_include_js": [
     "vendor/react.min.js"
   ]
   ```

3. Use code splitting (future feature)

## Asset Loading Issues

### Babel Not Transpiling JSX

**Problem:** `type="text/jsx"` scripts not transpiling

**Checklist:**
1. Enable Babel in `assets.json`:
   ```json
   {
     "babel_config": {
       "enabled": true,
       "presets": ["@babel/preset-react"]
     }
   }
   ```

2. Add Babel to `app_include_js`:
   ```json
   {
     "app_include_js": [
       "vendor/react.min.js",
       "vendor/babel.min.js"
     ]
   }
   ```

3. Rebuild:
   ```bash
   npm run bundle:build
   ```

4. Check script tags have correct type:
   ```html
   <script type="text/jsx">
     // Your JSX code
   </script>
   ```

### CSS Not Loading

**Problem:** Stylesheets not applied

**Check:**
1. CSS files discovered:
   ```bash
   npm run bundle:build --debug | grep -i css
   ```

2. Files match patterns:
   - Include: `**/*.css`, `**/*.scss`
   - Exclude: check you're not excluding styles

3. Check manifest:
   ```bash
   cat public/manifest.json | grep -A 5 css
   ```

### Script Not Found

**Problem:** Bundle file returns 404

**Solutions:**
1. Verify bundle exists:
   ```bash
   ls -la public/dist/
   ```

2. Check manifest path:
   ```bash
   npm run bundle:validate
   ```

3. Clear cache:
   ```bash
   npm run bundle:clean
   npm run bundle:build
   ```

## Configuration Issues

### Invalid Configuration

**Problem:** Validation errors

**Debug:**
```bash
npm run bundle:validate
```

This shows all configuration problems:
- Missing required fields
- Invalid paths
- Incorrect patterns
- Type mismatches

**Common issues:**
- `entry_points` missing
- `output_dir` doesn't exist (create it first)
- `load_contexts` not an array
- Invalid bundle names

### Patterns Not Working

**Problem:** Include/exclude patterns don't match expected files

**Test patterns:**
```bash
npm run bundle:build --debug
```

Look for "Discovered files" in output.

**Pattern syntax:**
- `**/*.js` - All JS files recursively
- `pages/**` - Everything in pages/
- `*.json` - JSON files in root only
- `!test` - Exclude with !

**Example debugging:**
```json
{
  "include_patterns": [
    "**/*.js"      // Should match
  ],
  "exclude_patterns": [
    "dist/**",     // Exclude dist
    "vendor/**"    // Exclude vendor
  ]
}
```

## Build Issues

### Build Fails with Vite Error

**Problem:** Vite build process fails

**Debug:**
```bash
npm run bundle:build --debug
```

**Common Vite errors:**
1. Module not found - Check entry points exist
2. Invalid syntax - Check for JSX without Babel
3. Out of memory - Build has too many files
   - Increase: `npm --max-old-space-size=4096`

### Circular Dependency Errors

**Problem:** Modules import each other

**Solutions:**
1. Restructure imports - Use intermediate module
2. Move shared code to common module
3. Use lazy imports:
   ```javascript
   const module = await import('./circular.js');
   ```

### Source Map Issues

**Problem:** Debugging doesn't work properly

**Solutions:**
1. Enable source maps in config:
   ```bash
   npm run bundle:build --dev
   ```

2. Check DevTools sources tab

3. Verify source map generation:
   ```bash
   ls -la public/dist/*.map
   ```

## Watch Mode Issues

### Watch Not Detecting Changes

**Problem:** Watch mode doesn't rebuild files

**Solutions:**
1. Stop and restart watch:
   ```bash
   npm run bundle:watch
   # (Press Ctrl+C to stop)
   ```

2. Check file permissions:
   ```bash
   ls -l public/
   ```

3. Verify file changes are valid:
   - Check for syntax errors
   - Ensure file is saved completely

### Watch Crashing

**Problem:** Watch mode exits unexpectedly

**Debug:**
```bash
npm run bundle:watch --debug
```

Check for:
- File permission errors
- Disk space issues
- Memory issues
- Invalid configuration changes

## Performance Issues

### Slow Build Times

**Problem:** Build takes too long

**Optimizations:**
1. Check file count:
   ```bash
   npm run bundle:build --debug | grep "Discovered"
   ```

2. Reduce files being bundled:
   ```json
   "exclude_patterns": [
     "**/*.test.js",
     "**/*.spec.js",
     "node_modules/**"
   ]
   ```

3. Check for large files:
   ```bash
   npm run bundle:analyze
   ```

### High Memory Usage

**Problem:** Build process crashes or is very slow

**Solutions:**
1. Increase Node memory:
   ```bash
   npm --max-old-space-size=4096 run bundle:build
   ```

2. Reduce bundle scope:
   - Exclude test files
   - Exclude node_modules
   - Use manual entry points

3. Split into multiple builds (future feature)

## File Organization Issues

### Files in Wrong Output Directory

**Problem:** Bundles not in expected location

**Check:**
```json
{
  "build": {
    "output_dir": "public/dist"
  }
}
```

**Create directory if missing:**
```bash
mkdir -p public/dist
npm run bundle:build
```

### Asset Paths Incorrect

**Problem:** Bundle can't find assets

**Solutions:**
1. Verify relative paths in code:
   ```javascript
   import './styles.css';  // Relative
   import '/assets/image.png';  // Root
   ```

2. Check `bundle_dir` in manifest:
   ```bash
   cat public/manifest.json | grep bundle_dir
   ```

## Framework Integration Issues

### Framework Can't Load Assets

**Problem:** App doesn't load bundled assets

**Checklist:**
1. Manifest exists and is valid JSON:
   ```bash
   cat public/manifest.json | jq .
   ```

2. Entry point file exists:
   ```bash
   cat public/manifest.json | grep entry_point
   ls -la public/dist/app-entry-*.js
   ```

3. Check browser console for errors

4. Verify manifest path in loader:
   - Should be: `public/manifest.json`
   - Not: `public/dist/manifest.json`

## Getting Help

### Debug Mode

Get detailed logs:
```bash
npm run bundle:build --debug
npm run bundle:validate --debug
npm run bundle:watch --debug
```

### Check Configuration

```bash
npm run bundle:validate
```

### View Bundle Contents

```bash
npm run bundle:analyze
```

### Clean and Rebuild

If things are broken:
```bash
npm run bundle:clean
rm -f public/assets.json  # Optional: start fresh
npm run bundle:init
npm run bundle:build
```

## Still Having Issues?

1. Check logs with `--debug` flag
2. Verify files exist with `ls`
3. Validate config with `validate`
4. Check file patterns with `analyze`
5. Read the main [README](../README.md)
6. Check [CONFIGURATION.md](./CONFIGURATION.md)
