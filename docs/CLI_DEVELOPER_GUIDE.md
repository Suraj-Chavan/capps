# CAPPS CLI - Developer Guide & Architecture

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [Component Structure](#component-structure)
4. [CLI Execution Flow](#cli-execution-flow)
5. [How to Extend](#how-to-extend)
6. [Adding New Bundlers](#adding-new-bundlers)
7. [Adding New Commands](#adding-new-commands)
8. [Configuration Management](#configuration-management)
9. [Error Handling](#error-handling)
10. [Testing Guidelines](#testing-guidelines)

---

## Architecture Overview

### Design Principles

```
┌──────────────────────────────────────────────────┐
│  CAPPS Monorepo (CLI as Package)                 │
│  packages/capps-bundle-cli/                      │
└──────────────┬───────────────────────────────────┘
               │
        ┌──────┴─────────┬──────────────┐
        │                │              │
   capps-guinea-pig  capps-mercury  capps-xxx
   (Webpack)         (Vite)         (esbuild)

   Each app:
   - Has own assets.json
   - Has own public/packages/
   - Has own public/dist/ (build output)
   - References CLI from framework
```

### Key Principles

✅ **Single Responsibility** - Each class does one thing
✅ **Extensibility** - Add bundlers/commands without modifying core
✅ **Error Handling** - Clear, actionable error messages
✅ **Logging** - Transparent operation for debugging
✅ **Configuration-Driven** - assets.json drives behavior
✅ **Framework Lightweight** - Framework doesn't do bundling, only orchestration

---

## Core Concepts

### 1. **App Directory**

The directory where CLI is invoked from (where app's `assets.json` lives).

```javascript
// In capps-bundle.js
this.appDir = process.cwd();
// When user runs: npm run bundle
// appDir = /path/to/capps-guinea-pig
```

### 2. **Framework Directory**

The CAPPS framework directory where CLI code lives.

```javascript
this.cliDir = __dirname;
// = packages/capps-bundle-cli/bin
```

### 3. **assets.json**

Configuration file in each app that declares:
- What assets to bundle
- Which bundler to use
- Entry points and output
- Package dependencies
- Load contexts

```javascript
{
  "app_name": "capps-guinea-pig",
  "bundler": "webpack",
  "assets": { ... },
  "packages": { ... },
  "build": { ... }
}
```

### 4. **Bundler**

Strategy pattern - abstract bundler that different implementations inherit from:
- `WebpackBundler`
- `ViteBundler`
- `EsbuildBundler`

### 5. **Command**

CLI command that performs specific action:
- `BuildCommand` - bundles assets
- `WatchCommand` - watches for changes
- `PackageCommand` - manages npm packages
- etc.

### 6. **Manifest**

JSON mapping of bundle names to hashed filenames:

```json
{
  "layout": "layout-abc123.js",
  "layout-css": "layout-abc123.css",
  "form": "form-xyz789.js"
}
```

---

## Component Structure

### Directory Tree with Responsibilities

```
packages/capps-bundle-cli/
│
├── bin/
│   └── capps-bundle.js                # Entry point, command router
│   ├─ Parses CLI arguments
│   ├─ Determines app directory
│   ├─ Routes to appropriate command
│   └─ Handles global options
│
├── src/
│   ├── index.js                       # Package entry
│   ├── CappsBundleCLI.js              # Main class
│   │
│   ├── lib/
│   │   ├── CLIBase.js                # Abstract base for all operations
│   │   │   ├─ Common logging setup
│   │   │   ├─ Error handling
│   │   │   ├─ Path resolution
│   │   │   └─ File operations
│   │
│   ├── ConfigValidator.js            # Validates assets.json
│   │   ├─ Schema validation
│   │   ├─ Entry point checking
│   │   ├─ Dependency checking
│   │   ├─ Circular dependency detection
│   │   └─ Context validation
│   │
│   ├── ManifestGenerator.js           # Creates manifest.json
│   │   ├─ Reads bundled files
│   │   ├─ Extracts hashes
│   │   ├─ Formats per bundler type
│   │   ├─ Validates manifest
│   │   └─ Writes manifest.json
│   │
│   ├── PackageManager.js              # Manages npm packages
│   │   ├─ Creates public/packages/
│   │   ├─ npm install/uninstall
│   │   ├─ Updates package.json
│   │   ├─ Lists packages
│   │   └─ Updates assets.json
│   │
│   ├── BundleAnalyzer.js              # Analyzes bundles
│   │   ├─ Calculates sizes
│   │   ├─ Identifies large files
│   │   ├─ Generates reports
│   │   └─ Suggests optimizations
│   │
│   ├── Logger.js                      # Centralized logging
│   │   ├─ Info (blue)
│   │   ├─ Success (green)
│   │   ├─ Warning (yellow)
│   │   ├─ Error (red)
│   │   └─ Debug (gray)
│   │
│   ├── FileUtils.js                   # File operations
│   │   ├─ Path resolution
│   │   ├─ File reading/writing
│   │   ├─ Directory creation
│   │   └─ Temp file handling
│   │
│   └── ProcessUtils.js                # Process execution
│       ├─ Run bundler processes
│       ├─ Capture output
│       ├─ Handle signals
│       └─ Error capture
│
├── bundlers/
│   ├── Bundler.js                     # Abstract base class
│   │   ├─ Constructor(appDir, config)
│   │   ├─ async build(mode)
│   │   ├─ async watch()
│   │   ├─ async getManifest()
│   │   └─ Protected helper methods
│   │
│   ├── WebpackBundler.js              # Webpack implementation
│   │   ├─ Generates webpack.config.js if missing
│   │   ├─ Runs webpack CLI
│   │   ├─ Handles webpack output
│   │   └─ Creates manifest from files
│   │
│   ├── ViteBundler.js                 # Vite implementation
│   │   ├─ Generates vite.config.js if missing
│   │   ├─ Runs vite build
│   │   ├─ Transforms vite-manifest.json
│   │   └─ Handles HMR for watch mode
│   │
│   └── EsbuildBundler.js              # esbuild implementation
│       ├─ Generates esbuild config
│       ├─ Runs esbuild
│       ├─ Handles multiple entry points
│       └─ Creates manifest
│
├── commands/
│   ├── BuildCommand.js                # npm run bundle
│   │   ├─ Validates app structure
│   │   ├─ Loads config
│   │   ├─ Selects bundler
│   │   ├─ Runs bundler
│   │   ├─ Generates manifest
│   │   └─ Prints summary
│   │
│   ├── WatchCommand.js                # npm run bundle:watch
│   │   ├─ Watches files
│   │   ├─ Auto-rebuilds
│   │   ├─ Reports changes
│   │   └─ Handles reload
│   │
│   ├── AnalyzeCommand.js              # npm run bundle:analyze
│   │   ├─ Builds bundles
│   │   ├─ Calculates sizes
│   │   ├─ Creates report
│   │   └─ Suggests optimizations
│   │
│   ├── PackageCommand.js              # npm run bundle:add-pkg
│   │   ├─ AddPackage logic
│   │   ├─ RemovePackage logic
│   │   ├─ ListPackages logic
│   │   └─ UpdatePackages logic
│   │
│   ├── ValidateCommand.js             # npm run bundle:validate
│   │   ├─ Validates assets.json
│   │   ├─ Checks dependencies
│   │   ├─ Verifies files
│   │   └─ Reports issues
│   │
│   ├── InitCommand.js                 # npm run bundle:init
│   │   ├─ Interactive setup
│   │   ├─ Creates assets.json
│   │   ├─ Creates configs
│   │   └─ Adds npm scripts
│   │
│   └── CleanCommand.js                # npm run bundle:clean
│       └─ Removes dist directory
│
└── templates/
    ├── assets.json.template           # Default assets config
    ├── webpack.config.template.js     # Webpack template
    ├── vite.config.template.js        # Vite template
    └── esbuild.config.template.js     # esbuild template
```

---

## CLI Execution Flow

### Request Flow Diagram

```
User runs: npm run bundle:watch
    ↓
package.json script:
  "bundle:watch": "node ../../src/CLI/capps-bundle.js watch"
    ↓
capps-bundle.js main entry
    ├─ Parse: process.argv[2] = 'watch'
    ├─ Get appDir: process.cwd() = capps-guinea-pig/
    ├─ Route to: handleWatch(args)
    └─ Execute WatchCommand
        ├─ 1. Validate app structure
        ├─ 2. Load public/assets.json
        ├─ 3. Select bundler (webpack)
        ├─ 4. Create WebpackBundler instance
        ├─ 5. bundler.watch()
        │   ├─ Generate webpack.config.js
        │   ├─ Run: webpack --watch
        │   └─ Watch for changes
        ├─ 6. On file change:
        │   ├─ bundler.build()
        │   ├─ Generate manifest
        │   └─ Report to user
        └─ Done
```

### Detailed Steps for Build Command

```
1. CLI Initialization (capps-bundle.js)
   ├─ Parse arguments: build, --dev, --watch
   ├─ Determine appDir from process.cwd()
   └─ Load framework paths

2. Validation (ConfigValidator)
   ├─ Check public/assets.json exists
   ├─ Validate JSON schema
   ├─ Check entry points exist
   ├─ Check for circular dependencies
   └─ Return config object

3. Bundler Selection
   ├─ Read config.bundler value
   ├─ Create appropriate bundler instance
   │  (WebpackBundler, ViteBundler, or EsbuildBundler)
   └─ Pass config to bundler

4. Build Execution (Bundler.build())
   ├─ Check if bundler config exists
   │  ├─ If webpack.config.js missing:
   │  │  └─ Generate from template
   │  ├─ If vite.config.js missing:
   │  │  └─ Generate from template
   │  └─ If esbuild.config.js missing:
   │     └─ Generate from template
   │
   ├─ Run bundler process
   │  ├─ webpack build [--mode production|development]
   │  ├─ vite build [--dev]
   │  └─ esbuild [--minify]
   │
   ├─ Capture output
   ├─ Parse bundler output
   └─ Check for errors

5. Manifest Generation (ManifestGenerator)
   ├─ Read dist/ directory
   ├─ Handle bundler-specific format
   │  ├─ Webpack: Extract from files
   │  ├─ Vite: Transform vite-manifest.json
   │  └─ esbuild: Extract from files
   ├─ Create bundle name → hash mapping
   ├─ Validate all referenced files exist
   └─ Write public/dist/manifest.json

6. Post-Build (BuildCommand)
   ├─ Print build summary
   ├─ Show bundle sizes
   ├─ Display output location
   ├─ Show any warnings
   └─ Log success message
```

---

## How to Extend

### Adding a Feature Checklist

```
□ Create new file in appropriate directory
□ Extend CLIBase if it's a major operation
□ Add Logger statements for transparency
□ Handle errors with clear messages
□ Add JSDoc comments
□ Update this documentation
□ Test with different bundlers
□ Test with different configs
```

---

## Adding New Bundlers

### Step-by-Step Guide

#### Step 1: Create Bundler Class

**File:** `capps/src/CLI/bundlers/ParcelBundler.js`

```javascript
const Bundler = require('./Bundler');
const { execSync } = require('child_process');

/**
 * Parcel bundler implementation
 * Handles bundling with Parcel v2
 */
class ParcelBundler extends Bundler {
  constructor(appDir, config) {
    super(appDir, config);
    this.bundlerName = 'parcel';
  }

  /**
   * Build bundles with Parcel
   * @param {string} mode - 'production' or 'development'
   * @returns {Promise<void>}
   */
  async build(mode = 'production') {
    this.logger.info(`Building with Parcel (${mode})`);

    try {
      // Check if parcel.config.js exists
      await this.ensureParcelConfig();

      // Get entry points from config
      const entryPoints = this.config.build.entry_points;
      const entries = Object.values(entryPoints).join(' ');

      // Build command
      const args = [
        entries,
        `--dist-dir ${this.distDir}`,
        mode === 'production' ? '--optimize' : '--no-optimize'
      ];

      const command = `parcel ${args.join(' ')}`;

      this.logger.debug(`Running: ${command}`);
      execSync(command, { cwd: this.appDir, stdio: 'inherit' });

      this.logger.success('Parcel build complete');
    } catch (error) {
      throw new Error(`Parcel build failed: ${error.message}`);
    }
  }

  /**
   * Watch mode
   */
  async watch() {
    this.logger.info('Watching with Parcel...');

    try {
      await this.ensureParcelConfig();

      const entryPoints = this.config.build.entry_points;
      const entries = Object.values(entryPoints).join(' ');

      const command = `parcel watch ${entries} --dist-dir ${this.distDir}`;

      execSync(command, { cwd: this.appDir, stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Parcel watch failed: ${error.message}`);
    }
  }

  /**
   * Ensure parcel.config.js exists
   * @private
   */
  async ensureParcelConfig() {
    const configPath = path.join(this.appDir, 'parcel.config.js');

    if (fs.existsSync(configPath)) {
      return;
    }

    this.logger.info('Creating parcel.config.js...');
    const template = this.getParcelConfigTemplate();
    fs.writeFileSync(configPath, template);
  }

  /**
   * Get Parcel config template
   * @private
   */
  getParcelConfigTemplate() {
    return `
module.exports = {
  filePath: __dirname + '/public/dist/',
  cacheDir: '.parcel-cache',
  minify: true,
  scopeHoist: true
};
`;
  }
}

module.exports = ParcelBundler;
```

#### Step 2: Register Bundler in Main CLI

**File:** `capps/src/CLI/capps-bundle.js`

```javascript
// Add to bundler selection logic
const getBundler = (bundlerName, appDir, config) => {
  const bundlerMap = {
    'webpack': () => require('./bundlers/WebpackBundler'),
    'vite': () => require('./bundlers/ViteBundler'),
    'esbuild': () => require('./bundlers/EsbuildBundler'),
    'parcel': () => require('./bundlers/ParcelBundler')  // ← Add this
  };

  const BundlerClass = bundlerMap[bundlerName]?.();
  if (!BundlerClass) {
    throw new Error(`Unknown bundler: ${bundlerName}`);
  }

  return new BundlerClass(appDir, config);
};
```

#### Step 3: Test the Bundler

```bash
# Create test app
mkdir test-parcel-app
cd test-parcel-app

# Create assets.json
cat > public/assets.json <<EOF
{
  "app_name": "test-parcel",
  "bundler": "parcel",
  "build": {
    "entry_points": {
      "main": "public/src/index.js"
    }
  }
}
EOF

# Run build
npm run bundle
```

#### Step 4: Update Documentation

Add section in CLI_DEVELOPER_GUIDE.md:

```markdown
### Parcel Bundler

**Supports:** ES modules, dynamic imports, auto code-splitting
**Best for:** Fast development, modern projects
**Config:** `parcel.config.js` (auto-generated)
```

---

## Adding New Commands

### Step-by-Step Guide

#### Step 1: Create Command Class

**File:** `capps/src/CLI/commands/DeployCommand.js`

```javascript
const CLIBase = require('../lib/CLIBase');

/**
 * Deploy command - Deploy built bundles to CDN
 * Usage: npm run bundle:deploy
 */
class DeployCommand extends CLIBase {
  constructor(appDir) {
    super();
    this.appDir = appDir;
  }

  /**
   * Execute deploy
   * @param {Object} options - Command options
   * @param {boolean} options.prod - Deploy to production CDN
   * @param {string} options.bucket - S3 bucket name
   */
  async execute(options = {}) {
    try {
      this.logger.info('Starting deployment...');

      // Step 1: Load config
      const config = this.loadConfig();
      this.logger.debug(`App: ${config.app_name}`);

      // Step 2: Check if built
      const distDir = path.join(this.appDir, 'public/dist');
      if (!fs.existsSync(distDir)) {
        throw new Error('public/dist/ not found. Run npm run bundle first.');
      }

      // Step 3: Read manifest
      const manifest = JSON.parse(
        fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf-8')
      );

      // Step 4: Upload files
      const cdnUrl = await this.uploadToCDN(distDir, manifest, options);

      // Step 5: Update config
      await this.updateDeploymentConfig(cdnUrl);

      this.logger.success(`Deployed to: ${cdnUrl}`);
    } catch (error) {
      this.logger.error(`Deploy failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload files to CDN
   * @private
   */
  async uploadToCDN(distDir, manifest, options) {
    // Implementation
    const bucket = options.bucket || process.env.CDN_BUCKET;
    const env = options.prod ? 'production' : 'staging';

    // Upload logic...

    return `https://cdn.example.com/${env}/`;
  }

  /**
   * Update deployment config
   * @private
   */
  async updateDeploymentConfig(cdnUrl) {
    // Update assets.json or other config
  }
}

module.exports = DeployCommand;
```

#### Step 2: Register Command in Main CLI

**File:** `capps/src/CLI/capps-bundle.js`

```javascript
const DeployCommand = require('./commands/DeployCommand');

class CappsBundleCLI {
  async run() {
    const command = process.argv[2];
    const args = process.argv.slice(3);

    switch(command) {
      // ... existing commands
      case 'deploy':
        const deployCmd = new DeployCommand(this.appDir);
        await deployCmd.execute({ prod: args.includes('--prod') });
        break;
    }
  }
}
```

#### Step 3: Add NPM Script

**In each app's package.json:**

```json
{
  "scripts": {
    "bundle:deploy": "node ../../src/CLI/capps-bundle.js deploy"
  }
}
```

---

## Configuration Management

### How assets.json is Loaded and Validated

```javascript
// 1. Location detection
const assetsJsonPath = path.join(appDir, 'public/assets.json');

// 2. File reading
const content = fs.readFileSync(assetsJsonPath, 'utf-8');

// 3. JSON parsing
const config = JSON.parse(content);

// 4. Schema validation
validateSchema(config, requiredFields);

// 5. File existence checks
for (const entryPoint of Object.values(config.build.entry_points)) {
  const filePath = path.join(appDir, entryPoint);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Entry point not found: ${entryPoint}`);
  }
}

// 6. Context validation
const validContexts = ['app', 'collection:', 'page:', 'form:', 'list:'];
for (const asset of Object.values(config.assets)) {
  for (const context of asset.load_in) {
    if (!validContexts.some(v => context.startsWith(v))) {
      throw new Error(`Invalid context: ${context}`);
    }
  }
}
```

### Configuration Precedence

```
1. CLI arguments           (highest priority)
   npm run bundle --prod

2. Environment variables
   CAPPS_MODE=production

3. assets.json config
   bundler: "webpack"

4. Default templates      (lowest priority)
   Default webpack.config.js
```

---

## Error Handling

### Error Handling Pattern

```javascript
try {
  // Operation
  await this.bundler.build();
} catch (error) {
  // 1. Log the error
  this.logger.error(`Build failed: ${error.message}`);

  // 2. Provide context
  if (error.code === 'ENOENT') {
    this.logger.info('Hint: File not found. Check your entry points in assets.json');
  }

  // 3. Suggest solution
  this.logger.info('Possible solutions:');
  this.logger.info('  1. Run npm run bundle:validate');
  this.logger.info('  2. Check public/assets.json');
  this.logger.info('  3. Check entry point files exist');

  // 4. Re-throw or exit
  process.exit(1);
}
```

### Error Types

```
ValidationError       - Config/structure validation failed
BuildError           - Bundler execution failed
ManifestError        - Manifest generation failed
PackageError         - Package management failed
FileError            - File I/O error
ProcessError         - Process execution error
ConfigError          - Configuration issue
```

---

## Logging Standards

### Logger Usage

```javascript
// Info - General information
this.logger.info('Building application...');

// Success - Operation succeeded
this.logger.success('Build completed successfully');

// Warning - Something might be wrong
this.logger.warn('Bundle size exceeds 500KB');

// Error - Operation failed
this.logger.error('Build failed: Webpack exited with code 1');

// Debug - Detailed debugging info
this.logger.debug('Webpack config:', config);
```

### Output Formatting

```
Colors:
├─ Info    (blue)    ℹ
├─ Success (green)   ✓
├─ Warning (yellow)  ⚠
├─ Error   (red)     ✗
└─ Debug   (gray)    → (only in debug mode)

Prefix:
[ComponentName] Message

Example:
[BuildCommand] ✓ Webpack build complete
[ManifestGenerator] ℹ Generating manifest for 3 bundles
```

---

## Testing Guidelines

### Test Structure

```
tests/
├── unit/
│   ├── bundlers/
│   │   ├── WebpackBundler.test.js
│   │   ├── ViteBundler.test.js
│   │   └── EsbuildBundler.test.js
│   ├── lib/
│   │   ├── ConfigValidator.test.js
│   │   ├── ManifestGenerator.test.js
│   │   └── PackageManager.test.js
│   └── commands/
│       ├── BuildCommand.test.js
│       └── PackageCommand.test.js
│
└── integration/
    ├── webpack-build.test.js
    ├── vite-build.test.js
    └── package-management.test.js
```

### Test Example

```javascript
describe('WebpackBundler', () => {
  let bundler;
  const mockAppDir = '/tmp/test-app';
  const mockConfig = {
    bundler: 'webpack',
    build: {
      entry_points: { main: 'public/src/index.js' }
    }
  };

  beforeEach(() => {
    bundler = new WebpackBundler(mockAppDir, mockConfig);
  });

  test('should build with production mode', async () => {
    await bundler.build('production');

    const manifest = fs.existsSync(path.join(mockAppDir, 'public/dist/manifest.json'));
    expect(manifest).toBe(true);
  });

  test('should generate correct manifest format', async () => {
    await bundler.build('production');

    const manifest = JSON.parse(
      fs.readFileSync(path.join(mockAppDir, 'public/dist/manifest.json'), 'utf-8')
    );

    expect(manifest).toHaveProperty('main');
    expect(manifest.main).toMatch(/-[a-f0-9]{8}\.js/);
  });
});
```

---

## Common Development Tasks

### Task 1: Add Support for New File Type

```javascript
// In appropriate bundler's config generation
if (config.includes_postcss) {
  webpackConfig.module.rules.push({
    test: /\.css$/,
    use: ['style-loader', 'css-loader', 'postcss-loader']
  });
}
```

### Task 2: Add New CLI Option

```javascript
// In capps-bundle.js command parsing
const options = {
  production: args.includes('--prod') || args.includes('--production'),
  dev: args.includes('--dev'),
  analyze: args.includes('--analyze'),
  // Add new option
  watch: args.includes('--watch')
};
```

### Task 3: Add Validation Rule

```javascript
// In ConfigValidator.js
validateBundlerChoice(config) {
  const validBundlers = ['webpack', 'vite', 'esbuild', 'parcel'];
  if (!validBundlers.includes(config.bundler)) {
    throw new Error(`Invalid bundler: ${config.bundler}`);
  }
}
```

### Task 4: Modify Manifest Format

```javascript
// In ManifestGenerator.js - if you need to add metadata
const manifest = {
  bundles: {
    'layout': 'layout-abc123.js'
  },
  metadata: {          // ← Add this section
    buildTime: new Date().toISOString(),
    bundler: this.bundlerType,
    version: '1.0.0'
  }
};
```

---

## Performance Considerations

### Build Time Optimization

```javascript
// 1. Cache bundler configs
const configCache = new Map();

// 2. Reuse processes
const subprocess = execSync(command, {
  stdio: 'inherit',
  // Avoid spawning new shell
  shell: false
});

// 3. Parallel builds (if needed)
await Promise.all([
  buildCSSBundle(),
  buildJSBundle()
]);
```

### Memory Optimization

```javascript
// 1. Stream large files
const stream = fs.createReadStream(largeFile);
stream.on('data', chunk => {
  // Process chunk
});

// 2. Clean up temp files
fs.rmSync(tempDir, { recursive: true, force: true });

// 3. Limit concurrent operations
const concurrency = 4;
const queue = new PLimit(concurrency);
```

---

## Debugging Tips

### Enable Debug Logging

```bash
# Run with debug flag
DEBUG=capps:* npm run bundle

# Or set environment variable
NODE_DEBUG=capps npm run bundle
```

### Add Debug Statements

```javascript
// Temporary debugging
console.log('[DEBUG] config:', JSON.stringify(config, null, 2));
console.log('[DEBUG] appDir:', this.appDir);
console.log('[DEBUG] distDir:', this.distDir);
```

### Inspect Generated Files

```bash
# Check generated webpack config
cat webpack.config.js | head -50

# Check manifest
cat public/dist/manifest.json | jq .

# List all files in dist
ls -lah public/dist/
```

---

## Best Practices

✅ **Always validate before executing** - Check config before running bundler
✅ **Provide clear error messages** - Users should understand what went wrong
✅ **Log at appropriate levels** - Use info/warn/error correctly
✅ **Handle cleanup** - Always clean up temp files and processes
✅ **Extend base classes** - Don't duplicate code
✅ **Document your changes** - Update this guide when modifying CLI
✅ **Test edge cases** - Test with missing files, invalid configs, etc.
✅ **Keep CLIBase small** - Move specific logic to subclasses
✅ **Use templates** - Don't hard-code configs

---

## References

- [Webpack Documentation](https://webpack.js.org/)
- [Vite Documentation](https://vitejs.dev/)
- [esbuild Documentation](https://esbuild.github.io/)
- [Node.js child_process](https://nodejs.org/api/child_process.html)
- [Chalk - Colored output](https://github.com/chalk/chalk)

---

**Last Updated:** 2025-10-22
**Next Review:** Phase 5 completion
