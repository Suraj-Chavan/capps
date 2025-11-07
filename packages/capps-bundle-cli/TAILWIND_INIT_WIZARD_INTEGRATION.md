# Tailwind CSS - InitWizard Integration Complete

## Overview
The Tailwind CSS configuration has been fully integrated into the InitWizard, allowing users to configure Tailwind CSS generation during the `capps-bundle init` command setup process.

---

## Files Modified

### 1. `src/wizards/InitWizard.js`
**Changes Made:**
- Added `askTailwindConfig()` method (lines 220-283)
  - Prompts user to enable Tailwind CSS generation
  - Configures output path, CSS source mode, scope wrapper, and verbose logging
  - Only prompts for config if user enables Tailwind

- Updated `run()` method (line 50)
  - Added call to `askTailwindConfig()` as Step 7 of initialization

- Updated `createAssetsJson()` method (lines 324-326)
  - Adds Tailwind config to assets.json when enabled
  - Configuration is optional and only added if user enabled it

- Enhanced `mergeAssetsJson()` method (lines 397-404)
  - Preserves existing tailwind configuration during merge
  - Explicit handling for tailwind config preservation
  - Added 'tailwind' to preservedKeys array for clarity

- Updated `checkExistingAssetsJson()` method (line 84)
  - Added message: "✓ Preserves tailwind configuration"
  - Informs users that existing Tailwind config will be preserved

- Enhanced `updatePackageJsonScripts()` method (lines 445-448, 464-472)
  - Adds `tailwind:build` script: `capps-bundle tailwind build`
  - Adds `tailwind:analyze` script: `capps-bundle tailwind analyze`
  - Only added if Tailwind CSS is enabled
  - Works for both existing and new package.json files

- Updated `printNextSteps()` method (lines 515-524, 532-537)
  - Shows Tailwind commands in "Next Steps" output (Step 5)
  - Displays Tailwind CSS output path in "Important" notes
  - Only shown when Tailwind is enabled

---

## Configuration Flow

### During Initialization (`capps-bundle init`)
```
Step 1: App name (automatic from folder)
Step 2: Discovery mode (auto-scan public/)
Step 3: Output directory
Step 4: Custom file patterns (optional)
Step 5: Production options (hardcoded)
Step 6: Tailwind CSS Configuration (NEW)
        ├─ Enable Tailwind? (Yes/No)
        ├─ Output path (if enabled)
        ├─ CSS source (production/development)
        ├─ Scope wrapper (enabled/disabled)
        └─ Verbose logging (enabled/disabled)
Step 7: Create assets.json
Step 8: Update package.json scripts
Step 9: Print next steps
```

---

## Interactive Prompts

### Prompt 1: Enable Tailwind CSS
```
? Do you want to enable Tailwind CSS generation for this app? (Y/n)
```

### Prompt 2: Output Directory
```
? Output directory for generated Tailwind CSS: (public/assets/css)
```

### Prompt 3: CSS Source Environment
```
? CSS source environment: (Use arrow keys)
❯ Production (dist, then public)
  Development (public, then src)
```

### Prompt 4: Scope Wrapper
```
? Wrap generated CSS in .tw-scope (for Bootstrap compatibility)? (Y/n)
```

### Prompt 5: Verbose Logging
```
? Enable verbose logging for Tailwind operations? (y/N)
```

---

## assets.json Configuration

### With Tailwind Enabled
```json
{
  "app_name": "my-app",
  "version": "1.0.0",
  "build": {
    "output_dir": "public/dist/",
    "hash_bundles": true,
    "minify": true,
    "entry_points": "auto",
    "source_dir": "public",
    "include_patterns": ["**/*.{js,css,scss}"],
    "exclude_patterns": ["dist/**", "collection/**", ...]
  },
  "load_contexts": [...],
  "app_include_js": [],
  "app_include_css": [],
  "tailwind": {
    "outputPath": "public/assets/css",
    "cssSource": "production",
    "useScopeWrapper": true,
    "verboseLogging": false
  }
}
```

### Without Tailwind
Tailwind configuration is not added to assets.json if user disables it. Can be enabled later by running `capps-bundle init` again.

---

## package.json Scripts

When Tailwind is enabled, these scripts are added:

```json
{
  "scripts": {
    "bundle:init": "capps-bundle init",
    "bundle:build": "capps-bundle build",
    "bundle:watch": "capps-bundle watch",
    "bundle:analyze": "capps-bundle analyze",
    "bundle:validate": "capps-bundle validate",
    "bundle:clean": "capps-bundle clean",
    "tailwind:build": "capps-bundle tailwind build",
    "tailwind:analyze": "capps-bundle tailwind analyze"
  }
}
```

---

## Usage Examples

### First Time Setup (with Tailwind)
```bash
$ capps-bundle init

================================================================================
CAPPS Bundle - Interactive Setup Wizard
================================================================================

App name: my-capps-app (from folder name)
Asset discovery: Auto-scan public/ folder

Output directory for bundles: (public/dist/)
Do you want to change which files get bundled? (y/N)

Production options: Hash bundles ✓ | Minify ✓

================================================================================
Tailwind CSS Configuration (Optional)
================================================================================

Do you want to enable Tailwind CSS generation for this app? (Y/n) y
Output directory for generated Tailwind CSS: (public/assets/css)
CSS source environment: (production)
Wrap generated CSS in .tw-scope (for Bootstrap compatibility)? (Y/n) y
Enable verbose logging for Tailwind operations? (y/N)

Tailwind CSS configuration:
  Output path: public/assets/css
  CSS source: production
  Scope wrapper: enabled
  Verbose logging: disabled

Setup complete!

================================================================================
Next Steps
================================================================================

1. Your assets are configured:
   ✓ Auto-discovery enabled for: public/
   ✓ Files matching patterns will be auto-discovered
   ✓ No need to manually list entry points!

2. Build your assets:
   npm run bundle:build     # Production build
   npm run bundle:watch     # Watch mode (auto-rebuild)

3. Analyze and optimize:
   npm run bundle:analyze   # Analyze bundle sizes
   npm run bundle:validate  # Validate configuration

4. Or use the CLI directly:
   capps-bundle build       # Production build
   capps-bundle watch       # Watch mode
   capps-bundle analyze     # Analyze bundles
   capps-bundle validate    # Validate config

5. Generate Tailwind CSS:
   capps-bundle tailwind build    # Generate missing Tailwind CSS
   capps-bundle tailwind analyze  # Analyze CSS classes (no generation)

Important:
✓ Only assets.json is needed in your app
✓ Bundler is built into the CLI
✓ No bundler config files or dependencies needed
✓ Assets in public/ will be auto-bundled
✓ Tailwind CSS will be generated in: public/assets/css
```

### Re-running Init (Existing assets.json)
```bash
$ capps-bundle init

ℹ️  assets.json already exists at: /path/to/app/assets.json
Running init will UPDATE your configuration intelligently:
✓ Preserves custom app_include_js (React, Babel, vendor files)
✓ Preserves custom app_include_css entries
✓ Preserves babel_config and load_contexts
✓ Preserves tailwind configuration
✓ Updates only bundler settings and build configuration

Do you want to continue and merge configuration? (Y/n) y
```

### Using Tailwind Commands
```bash
# Generate missing Tailwind CSS
$ npm run tailwind:build
# or
$ capps-bundle tailwind build

# Analyze CSS classes (no generation)
$ npm run tailwind:analyze
# or
$ capps-bundle tailwind analyze -v
```

---

## Configuration Merge Behavior

### What Gets Preserved
- ✅ **app_include_js** - Custom JavaScript dependencies
- ✅ **app_include_css** - Custom CSS files
- ✅ **load_contexts** - Custom loading contexts
- ✅ **babel_config** - Babel configuration
- ✅ **tailwind** - Tailwind CSS configuration (NEW)
- ✅ Custom properties - Any other user-defined properties

### What Gets Updated
- ℹ️ **build** - Output directory, minification, hashing settings
- ℹ️ **entry_points** - Discovery mode configuration
- ℹ️ **source_dir** - Directory patterns

---

## Feature Completeness

### Tailwind Integration Checklist
- ✅ Interactive configuration during `capps-bundle init`
- ✅ Configuration saved to assets.json under `tailwind` key
- ✅ Configuration preserved during config merges
- ✅ npm scripts generation (tailwind:build, tailwind:analyze)
- ✅ Next steps display Tailwind commands
- ✅ Explicit preservation message in init wizard
- ✅ Manual script instructions for projects without package.json
- ✅ Full Logger integration with colored output
- ✅ `capps-bundle tailwind build` command functional
- ✅ `capps-bundle tailwind analyze` command functional

---

## Related Files
- `src/tailwind/TailwindBuilder.js` - Core Tailwind CSS generation logic
- `src/commands/TailwindCommandHandler.js` - CLI command routing
- `src/CappsBundleCLI.js` - Main CLI with tailwind command handler
- `src/lib/Logger.js` - Centralized logging system
- `TAILWIND_INTEGRATION_VERIFICATION.md` - Service code removal verification
- `LOGGING_GUIDE.md` - Logger implementation documentation

---

## Next Steps for Users

1. **Run initialization** in your CAPPS app:
   ```bash
   capps-bundle init
   ```

2. **Enable Tailwind** when prompted (optional)

3. **Use Tailwind commands** to generate CSS:
   ```bash
   capps-bundle tailwind build
   ```

4. **Verify output** in configured directory:
   ```
   public/assets/css/tailwind-missing.css
   ```

---

## Status
✅ **Complete and Ready for Use**

All InitWizard integration is complete and tested. Users can now configure Tailwind CSS generation directly during the initialization process.