# Tailwind CSS - cssSource Configuration Guide

## Default Behavior

**TailwindBuilder defaults to `cssSource: 'production'`** unless explicitly configured otherwise.

This means by default:
- TailwindBuilder scans CAPPS framework **dist/css** directory for existing CSS
- Falls back to **public/css** if dist/css doesn't exist
- Users don't need to configure anything for standard production setups

## Configuration

### Auto-Detection (Default - No Configuration Needed)

```bash
$ capps-bundle tailwind build

# Automatically uses 'production' mode
# Scans: dist/css → then public/css
```

### Explicit Configuration (Optional)

If you need to use a different CSS source, edit `assets.json`:

```json
{
  "app_name": "my-capps-app",
  "tailwind": {
    "cappsUIPath": "D:\\credence\\Servers\\Funds\\Apps\\ui\\capps",
    "outputPath": "public/assets/css",
    "cssSource": "development",
    "useScopeWrapper": true,
    "verboseLogging": false
  }
}
```

## CSS Source Modes

### Production Mode (DEFAULT)
- **Path scanned**: `{cappsUIPath}/dist/css` → then `{cappsUIPath}/public/css`
- **Use case**: Standard production builds
- **What it does**: Looks for pre-built/compiled CAPPS framework CSS
- **Example locations**:
  - `D:\credence\Servers\Funds\Apps\ui\capps\dist\css\*.css`
  - `D:\credence\Servers\Funds\Apps\ui\capps\public\css\*.css`

### Development Mode (OPTIONAL)
- **Path scanned**: `{cappsUIPath}/public/css` → then `{cappsUIPath}/src/assets/css`
- **Use case**: When working with source files
- **What it does**: Looks for CAPPS framework source CSS files
- **Configuration**: Set `"cssSource": "development"` in assets.json

## InitWizard Behavior

During `capps-bundle init`:
- Users are **NOT prompted** for cssSource
- cssSource **always defaults to 'production'** in generated config
- Users can **optionally edit assets.json** later if they need development mode

```
Tailwind CSS Configuration (Optional)
✓ CAPPS UI path: D:\credence\Servers\Funds\Apps\ui\capps
✓ Output path: public/assets/css
✓ Scope wrapper: enabled
✓ Verbose logging: disabled
✓ CSS source: production (default - configure in assets.json if needed)
```

## When to Use Each Mode

### Use Production Mode (DEFAULT) When:
- ✅ CAPPS framework is built (has `dist/` directory)
- ✅ You're in a standard development/production environment
- ✅ You want to generate CSS for your app based on compiled core CSS
- ✅ You're not modifying CAPPS framework itself
- ✅ You don't need anything special - just use default!

### Use Development Mode When:
1. **You're developing CAPPS framework itself** and need source CSS
2. **You're testing** with unbuild CAPPS framework files
3. **You specifically have** `src/assets/css/` structure instead of `dist/css`

**Set in assets.json:**
```json
{
  "tailwind": {
    "cssSource": "development"
  }
}
```

Then run:
```bash
capps-bundle tailwind build
```

## Example Workflows

### Standard Production Setup (No Configuration)
```bash
# 1. Initialize your app (just answer yes to Tailwind prompt)
capps-bundle init

# 2. Build Tailwind CSS (automatically uses production mode)
capps-bundle tailwind build

# 3. CSS generated to: public/assets/css/tailwind-missing.css
```

### Custom Development Mode Setup
```bash
# 1. Initialize
capps-bundle init

# 2. Edit assets.json (optional - only if you need development mode)
# Add: "cssSource": "development"

# 3. Build
capps-bundle tailwind build

# 4. CSS generated using development mode paths
```

## Override via CLI

You can also override cssSource via command line (for advanced use):

```bash
# Use development mode temporarily (if TailwindBuilder supports --css-source flag)
capps-bundle tailwind build --css-source development
```

(Note: Currently this is only configurable via assets.json)

## Troubleshooting

### "Could not locate CAPPS UI directory"
- Verify `cappsUIPath` is correct in assets.json
- Check that the path exists on your system
- For production mode: ensure `dist/css/` exists in CAPPS framework
- For development mode: ensure `public/css/` or `src/assets/css/` exists

### CSS not being generated
- Verify you're in production mode (default)
- Check that CAPPS framework has the CSS files in expected location
- Try setting `verboseLogging: true` to see debug output

### Different CSS than expected
- Check which cssSource mode is configured
- Production mode uses `dist/` first, then `public/`
- Development mode uses `public/` first, then `src/assets/css/`

## Code Reference

**Default in TailwindBuilder:**
```javascript
// Line 71 in src/tailwind/TailwindBuilder.js
this.cssSource = tailwindConfig.cssSource || 'production';
```

**CSS source scanning logic:**
```javascript
// Lines 352-380 in src/tailwind/TailwindBuilder.js
if (this.cssSource === 'production') {
  // Scan dist/css first, then public/css
} else {
  // Scan public/css first, then src/assets/css
}
```

## Summary

- **Default**: Production mode ✓
- **User action required**: None (unless you need development mode)
- **For 99% of users**: Just run `capps-bundle init` and `capps-bundle tailwind build`
- **For advanced users**: Edit `assets.json` if you need different CSS source paths