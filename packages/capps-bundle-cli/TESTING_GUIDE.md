# CAPPS Bundle CLI - Testing Guide

Complete guide for testing the CAPPS Asset Bundling CLI system.

## Table of Contents

1. [Setup & Installation](#setup--installation)
2. [Quick Start Testing](#quick-start-testing)
3. [Command Testing](#command-testing)
4. [Error Handling Testing](#error-handling-testing)
5. [Integration Testing](#integration-testing)
6. [Full Build Testing](#full-build-testing)

---

## Setup & Installation

### 1. Link CLI Globally (Development)

```bash
# Navigate to CLI package
cd packages/capps-bundle-cli

# Install dependencies
npm install

# Link globally for testing
npm link

# Verify installation
which capps-bundle
capps-bundle version
```

### 2. Create Test App

```bash
# Create test directory
mkdir -p ~/test-capps-app
cd ~/test-capps-app

# Create required structure
mkdir -p public src/styles
touch public/assets.json src/index.js src/styles/main.scss
```

### 3. Create assets.json

```bash
cat > public/assets.json << 'EOF'
{
  "app_name": "test-app",
  "version": "1.0.0",
  "bundler": "vite",
  "build": {
    "entry_points": {
      "app": "src/index.js",
      "styles": "src/styles/main.scss"
    },
    "output_dir": "public/dist/",
    "hash_bundles": true,
    "minify": true
  },
  "load_contexts": [
    {
      "context": "app",
      "bundles": ["app", "styles"],
      "load_type": "always"
    }
  ]
}
EOF
```

### 4. Create Entry Points

```bash
# Create main entry point
cat > src/index.js << 'EOF'
console.log('Test App Bundle');

export const appName = 'test-app';
export const version = '1.0.0';

export default {
  name: appName,
  version
};
EOF

# Create stylesheet
cat > src/styles/main.scss << 'EOF'
// Test Stylesheet
$primary-color: #007bff;

body {
  color: $primary-color;
  font-family: Arial, sans-serif;
}
EOF
```

---

## Quick Start Testing

### Test 1: Verify CLI Installation

```bash
capps-bundle version
# Expected: capps-bundle version 1.0.0

capps-bundle help
# Expected: Shows all available commands
```

### Test 2: Validate Configuration

```bash
cd ~/test-capps-app

capps-bundle validate
# Expected Output:
# ✓ App structure is valid
# ✓ Configuration loaded
# ✓ Configuration validation passed!
```

### Test 3: Check Bundler Detection

```bash
# Should detect Vite from assets.json
capps-bundle validate

# Expected: "Bundler: vite"
```

---

## Command Testing

### Test 4: List Packages Command

```bash
cd ~/test-capps-app

capps-bundle list-pkg
# Expected: No packages directory found (first time)

capps-bundle list-pkg --debug
# Expected: Debug output showing package manager checks
```

### Test 5: Add Package Command

```bash
cd ~/test-capps-app

# This requires npm, so test with dry-run first
# In real scenario:
capps-bundle add-pkg lodash
# Creates: public/packages/package.json
# Installs: lodash dependency

# Verify
capps-bundle list-pkg
# Should show: lodash installed
```

### Test 6: Remove Package Command

```bash
# If lodash was installed:
capps-bundle remove-pkg lodash

# Verify removal
capps-bundle list-pkg
# Should show: No packages installed
```

### Test 7: Clean Command

```bash
cd ~/test-capps-app

# First, build some bundles (see Full Build Testing)
# Then clean:
capps-bundle clean

# Expected:
# ✓ Cleaned dist directory
# ✓ All bundled assets removed
# ✓ manifest.json removed
```

---

## Error Handling Testing

### Test 8: Missing assets.json

```bash
# Create app without assets.json
mkdir -p ~/test-no-config/public
cd ~/test-no-config

capps-bundle validate
# Expected Error: assets.json not found
# With Hint: Run npm run bundle:init to create assets.json
```

### Test 9: Invalid Bundler Name

```bash
# Create assets.json with unsupported bundler
cat > public/assets.json << 'EOF'
{
  "app_name": "test",
  "bundler": "parcel",
  "build": { "entry_points": { "app": "src/index.js" } }
}
EOF

capps-bundle validate
# Expected Error: Invalid bundler: "parcel"
# Shows: Supported bundlers: webpack, vite, esbuild
```

### Test 10: Missing Entry Point File

```bash
# Create assets.json with non-existent entry point
cat > public/assets.json << 'EOF'
{
  "app_name": "test",
  "bundler": "vite",
  "build": {
    "entry_points": {
      "app": "src/nonexistent.js"
    }
  }
}
EOF

capps-bundle validate
# Expected Error: Entry point file not found: src/nonexistent.js
# Shows: Full path to missing file
```

### Test 11: Unknown Command

```bash
capps-bundle foobar
# Expected: Unknown command: foobar
# Shows: Help message
```

### Test 12: Debug Flag

```bash
capps-bundle validate --debug
# Expected: Extra debug output with arrows (→)
# Shows: All internal operations
```

---

## Integration Testing

### Test 13: Complete Flow (Without Bundler Installation)

```bash
cd ~/test-capps-app

# 1. Validate
capps-bundle validate
# ✓ Should pass

# 2. Check packages
capps-bundle list-pkg
# ✓ Should show message

# 3. Clean (should handle missing dist)
capps-bundle clean
# ✓ Should gracefully handle missing dir

# 4. Help
capps-bundle help
# ✓ Should show all commands
```

### Test 14: Test Different Bundlers

```bash
# Test with Webpack
cat > public/assets.json << 'EOF'
{
  "app_name": "webpack-test",
  "bundler": "webpack",
  "build": {
    "entry_points": { "app": "src/index.js" }
  }
}
EOF

capps-bundle validate
# Expected: Bundler: webpack

# Test with esbuild
sed -i 's/"webpack"/"esbuild"/' public/assets.json
capps-bundle validate
# Expected: Bundler: esbuild

# Test with Vite
sed -i 's/"esbuild"/"vite"/' public/assets.json
capps-bundle validate
# Expected: Bundler: vite
```

---

## Full Build Testing

### Test 15: Build with Vite (If Installed)

```bash
cd ~/test-capps-app

# Install Vite first
npm init -y
npm install vite @vitejs/plugin-vue --save-dev

# Run build
capps-bundle build
# Expected:
# ✓ Validating app structure...
# ✓ Loading configuration...
# ✓ Generating vite.config.js...
# ✓ Running Vite build...
# ✓ Generating manifest.json...
# ✓ Build completed successfully!

# Check output
ls -la public/dist/
# Should show bundled files

cat public/dist/manifest.json
# Should show manifest with bundle metadata
```

### Test 16: Build with Webpack (If Installed)

```bash
cd ~/test-capps-app

# Update config to use webpack
sed -i 's/"vite"/"webpack"/' public/assets.json

# Install Webpack
npm install webpack webpack-cli --save-dev

# Run build
capps-bundle build
# Expected: Same as Vite flow, but using Webpack

ls -la public/dist/
# Should show bundled files
```

### Test 17: Watch Mode

```bash
cd ~/test-capps-app

# Start watch mode
capps-bundle watch &
WATCH_PID=$!

# Edit entry point
echo "// Updated" >> src/index.js

# Wait for rebuild (2-3 seconds)
sleep 3

# Check if rebuilt
ls -la public/dist/

# Stop watch
kill $WATCH_PID
```

### Test 18: Analyze Bundles

```bash
cd ~/test-capps-app

# Build first
capps-bundle build

# Analyze
capps-bundle analyze
# Expected Output:
# - Bundle sizes
# - File breakdown
# - Gzip estimates
# - Optimization recommendations
```

---

## Testing Checklist

### Basic Commands
- [ ] `capps-bundle version` works
- [ ] `capps-bundle help` shows all commands
- [ ] `capps-bundle validate` validates correctly
- [ ] `capps-bundle list-pkg` shows packages

### Error Handling
- [ ] Missing assets.json handled
- [ ] Invalid bundler rejected
- [ ] Missing entry point caught
- [ ] Unknown commands rejected
- [ ] Helpful error messages shown

### Configuration
- [ ] Webpack bundler recognized
- [ ] Vite bundler recognized
- [ ] esbuild bundler recognized
- [ ] Entry points validated
- [ ] Output directory configured

### Operations
- [ ] Clean command works
- [ ] Package manager initializes
- [ ] Analyzer works with manifest
- [ ] Debug flag enables verbose output
- [ ] Color output displays correctly

### Integration
- [ ] Can switch bundlers easily
- [ ] Configuration persists
- [ ] File operations work correctly
- [ ] Error recovery works
- [ ] Help system is accessible

---

## Testing with capps-guinea-pig App

The repository includes a test app with pre-configured assets.json:

```bash
# Navigate to test app
cd D:/credence/Servers/Funds/Apps/capps-guinea-pig

# Run CLI commands
capps-bundle validate
capps-bundle list-pkg
capps-bundle help

# Check existing config
cat public/assets.json
```

---

## Automated Testing (Jest)

```bash
# Run unit tests
cd packages/capps-bundle-cli
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Performance Testing

### Test 19: Large Entry Point File

```bash
cd ~/test-capps-app

# Create large entry point
node -e "
const fs = require('fs');
let code = '';
for(let i = 0; i < 1000; i++) {
  code += \`export const func\${i} = () => 'function \${i}';\n\`;
}
fs.writeFileSync('src/large.js', code);
"

# Update assets.json to use large.js
# Run build and measure time
time capps-bundle build
```

### Test 20: Multiple Entry Points

```bash
cat > public/assets.json << 'EOF'
{
  "app_name": "multi-entry",
  "bundler": "vite",
  "build": {
    "entry_points": {
      "app": "src/index.js",
      "styles": "src/styles/main.scss",
      "utils": "src/utils.js",
      "components": "src/components.js"
    }
  }
}
EOF

# Create missing entry points
touch src/utils.js src/components.js

# Build
capps-bundle build

# Analyze
capps-bundle analyze
```

---

## Manual Testing Scenarios

### Scenario 1: New Developer Setup

1. Run `capps-bundle init` to see interactive wizard
2. Answer all prompts
3. Check generated `assets.json`
4. Check generated bundler config
5. Check updated `package.json`

### Scenario 2: Existing Project

1. Have existing assets.json
2. Run `capps-bundle validate`
3. Fix any issues
4. Run `capps-bundle build`
5. Check manifest.json
6. Run `capps-bundle analyze`

### Scenario 3: Package Management

1. Start with no packages
2. `capps-bundle add-pkg lodash`
3. `capps-bundle list-pkg` (verify lodash)
4. `capps-bundle add-pkg axios@1.4.0`
5. `capps-bundle list-pkg` (verify both)
6. `capps-bundle remove-pkg lodash`
7. `capps-bundle list-pkg` (verify only axios)
8. `capps-bundle update-pkg`

### Scenario 4: Build Workflow

1. Create fresh app
2. `capps-bundle init` (guided setup)
3. `npm install` (install bundler)
4. `capps-bundle build`
5. Check `public/dist/` exists
6. Check `manifest.json` created
7. `capps-bundle analyze` (review report)
8. `capps-bundle clean`
9. Verify `public/dist/` removed

---

## Troubleshooting Tests

### If `capps-bundle` not found globally

```bash
# Use direct path
node path/to/bin/capps-bundle.js help

# Or use npm script
npm run bundle:help
```

### If bundler commands not work

```bash
# Test bundler installation
which webpack
which vite
which esbuild

# Install if needed
npm install webpack webpack-cli --save-dev
npm install vite @vitejs/plugin-vue --save-dev
npm install esbuild --save-dev
```

### If file system issues

```bash
# Check permissions
chmod +x packages/capps-bundle-cli/bin/capps-bundle.js

# Check paths are correct
ls -la public/
ls -la src/
```

### If color output not showing

```bash
# Force color output
FORCE_COLOR=1 capps-bundle validate

# Or disable color
NO_COLOR=1 capps-bundle validate
```

---

## Success Criteria

✅ All basic commands execute without errors
✅ Configuration validation catches all issues
✅ Error messages are helpful and actionable
✅ Bundler auto-configuration works
✅ Package management operations succeed
✅ Build generates expected output
✅ Analysis provides recommendations
✅ Interactive wizard guides users
✅ Cleanup removes all artifacts
✅ All bundlers (webpack, vite, esbuild) supported

---

## Next Steps After Testing

1. **If all tests pass**: Ready for production use
2. **Install globally**: `npm install -g @capps/bundle-cli`
3. **Update documentation**: Add to project README
4. **Train team**: Share testing guide with team
5. **Monitor feedback**: Collect user feedback
6. **Iterate**: Improve based on real-world usage

---

## Support Commands

```bash
# Get help
capps-bundle help

# Get version
capps-bundle version

# Enable debug
capps-bundle validate --debug

# Check available bundlers
grep getSupportedBundlers packages/capps-bundle-cli/src/bundlers/BundlerFactory.js
```

---

**Last Updated:** October 2024
**CLI Version:** 1.0.0
**Node Requirements:** >= 14.0.0
