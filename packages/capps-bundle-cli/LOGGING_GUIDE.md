# CAPPS Bundle CLI - Logging Guide

## Overview

The capps-bundle CLI has a centralized **Logger system** for consistent, colored output across all commands including the new Tailwind CSS integration.

---

## Where Logs Are Printed

### **Primary Output: Console (Terminal)**

✅ All logs are printed to **stdout/stderr** in the terminal/console where you run the command

```bash
$ capps-bundle tailwind build
[Tailwind] ℹ Starting CAPPS application file scan for: capps-guinea-pig
[Tailwind] → Found 145 files to scan
[Tailwind] ℹ Loading existing CSS bundles...
[Tailwind] ✓ Build Complete!
```

**No file logging** - Logs are console-only by design

---

## Logger Implementation

### Logger Class (`src/lib/Logger.js`)

```javascript
class Logger {
  // Outputs colored text to console
  info(message)      // Blue: ℹ
  success(message)   // Green: ✓
  warn(message)      // Yellow: ⚠
  error(message)     // Red: ✗
  debug(message)     // Gray: →
  section(title)     // Bold Cyan section header
  table(data)        // Formatted table output
  newline(count)     // Add blank lines
}
```

### Log Levels & Colors

| Level | Color | Symbol | When to Use |
|-------|-------|--------|------------|
| `info()` | Blue | ℹ | General information |
| `success()` | Green | ✓ | Operation succeeded |
| `warn()` | Yellow | ⚠ | Warning, might be wrong |
| `error()` | Red | ✗ | Operation failed |
| `debug()` | Gray | → | Detailed debugging (--debug only) |
| `section()` | Bold Cyan | = | Highlight major sections |

---

## Tailwind Logger Integration

### TailwindBuilder (`src/tailwind/TailwindBuilder.js`)

**Logger initialized in constructor:**
```javascript
constructor(options = {}) {
  // Initialize logger with [Tailwind] prefix
  this.logger = new Logger({
    prefix: chalk.cyan('[Tailwind]'),
    debug: options.verbose || tailwindConfig.verboseLogging
  });
}
```

**Logging throughout the builder:**
```javascript
// Scan start
this.logger.info(`Starting CAPPS application file scan for: ${this.appName}`);

// Debug info
this.logger.debug(`Found ${allFiles.length} files to scan`);

// Warnings
this.logger.warn(`Error scanning pattern ${pattern}: ${error.message}`);

// Success
this.logger.success('Build Complete!');

// Errors
this.logger.error(`Build failed: ${error.message}`);
```

### TailwindCommandHandler (`src/commands/TailwindCommandHandler.js`)

**Uses inherited logger from CLIBase:**
```javascript
class TailwindCommandHandler extends CLIBase {
  async handleBuild(options = {}) {
    // Section header
    this.logger.section('CAPPS Tailwind CSS Generator - Build');

    // Info level
    this.logger.info('Initializing Tailwind CSS generator...');

    // Debug (only with --debug flag)
    this.logger.debug(`Building with options: ${JSON.stringify(options)}`);

    // Success
    this.logger.success('Tailwind CSS generation completed successfully!');

    // Statistics
    this.logger.newline();
    console.log(`  Files scanned: ${result.stats.filesScanned}`);
  }
}
```

---

## Log Output Example

### Full Build Output

```bash
$ capps-bundle tailwind build -v

================================================================================
CAPPS Tailwind CSS Generator - Build
================================================================================

[Tailwind] ℹ Initializing Tailwind CSS generator...
[Tailwind] → Building with options: {...}

[Tailwind] ℹ Starting CAPPS application file scan for: capps-guinea-pig
[Tailwind] → Found 245 files to scan
[Tailwind] → Scanning: public/layout/collection_four_virtual.html
[Tailwind] → Scanning: rest/collection_four_virtual/form.js
[CAPPS Bundle] ℹ Scanned 245 files, found 1,250 unique CSS classes

[Tailwind] ℹ Loading existing CSS bundles...
[Tailwind] ℹ Loaded 850 classes from CAPPS core (/path/to/capps/public/assets/css/build-info.json)

[Tailwind] ℹ Analyzing classes and detecting missing Tailwind utilities...
[Tailwind] ℹ Total classes found: 1,250
[CAPPS Bundle] ✓ Already in CAPPS core: 850
[Tailwind] ⚠ Missing from core: 400

[Tailwind] ℹ Generating CSS using Tailwind CLI for 400 missing classes...
[Tailwind] → Generating CSS for specific classes using Tailwind CSS v4...
[Tailwind] → Processing CSS with Tailwind v4...
[CAPPS Tailwind] Generated CSS size: 45,230 bytes

✅ Build Complete!
──────────────────────────────────────────────────
Files scanned: 245
Classes found: 1,250
Missing classes: 400
CSS files generated: 1
Build time: 2.45s
──────────────────────────────────────────────────

📁 Output: public/assets/css/tailwind-missing.css
```

---

## Controlling Log Verbosity

### Default Behavior
```bash
capps-bundle tailwind build
# Shows: info, success, warn, error (NO debug logs)
```

### Verbose Mode (Show Debug Logs)
```bash
capps-bundle tailwind build -v
# or
capps-bundle tailwind build --verbose
# Shows: info, success, warn, error, debug
```

### Configuration via assets.json
```json
{
  "tailwind": {
    "verboseLogging": true  // Enable debug logs by default
  }
}
```

---

## Logger Prefix System

### Default Prefixes

| Component | Prefix | Color |
|-----------|--------|-------|
| General CLI | `[CAPPS Bundle]` | Cyan |
| Tailwind Builder | `[Tailwind]` | Cyan |
| Tailwind Command Handler | Inherited from parent | Cyan |

### Custom Prefix Example
```javascript
const logger = new Logger({
  prefix: chalk.green('[Custom]'),
  debug: false
});
```

---

## Log Output Locations

### Console Output Streams

| Log Method | Stream | Terminal Output |
|-----------|--------|-----------------|
| `logger.info()` | stdout | Regular output |
| `logger.success()` | stdout | Regular output |
| `logger.warn()` | stderr | Error stream (might be colored) |
| `logger.error()` | stderr | Error stream (might be colored) |
| `logger.debug()` | stdout | Regular output (gray text) |
| `console.log()` | stdout | Regular output (no prefix) |

### Silent Mode (Suppress Output)
```javascript
logger.mute();      // Suppress all output
logger.unmute();    // Show output again
```

---

## Real-World Examples

### Example 1: Basic Build Command
```bash
$ capps-bundle tailwind build

[Tailwind] ℹ Initializing Tailwind CSS generator...
[CAPPS Bundle] ℹ Scanned 200 files, found 980 unique CSS classes
[Tailwind] ℹ Loading existing CSS bundles...
[Tailwind] ✓ Already in CAPPS core: 750
[Tailwind] ⚠ Missing from core: 230
✅ Build Complete!
```

### Example 2: Verbose with Debug Output
```bash
$ capps-bundle tailwind build -v

[Tailwind] ℹ Initializing Tailwind CSS generator...
[Tailwind] → Building with options: {"appPath": "...", ...}
[Tailwind] → CSS discovery mode: production
[Tailwind] → Found CAPPS UI at: D:\credence\Servers\Funds\Apps\ui\capps
[Tailwind] ✓ Build Complete!
```

### Example 3: Error Handling
```bash
$ capps-bundle tailwind build

[Tailwind] ℹ Initializing Tailwind CSS generator...
[Tailwind] ⚠ Could not load app config: ENOENT: no such file...
[CAPPS Bundle] ✗ Tailwind CSS build failed: PostCSS generated empty CSS
```

---

## Logger Features

### Section Headers
```javascript
this.logger.section('CAPPS Tailwind CSS Generator - Build');
```
Output:
```
================================================================================
CAPPS Tailwind CSS Generator - Build
================================================================================
```

### Table Output
```javascript
this.logger.table({
  filesScanned: 245,
  classesFound: 1250,
  missingClasses: 400
});
```

### Debug Conditional
```javascript
// Only logged if -v or --verbose flag used
this.logger.debug('This only shows in verbose mode');
```

---

## Best Practices

### ✅ DO

```javascript
// Use appropriate log levels
this.logger.info('Processing started');      // General info
this.logger.success('Operation completed');  // Success
this.logger.warn('Missing config file');     // Warnings
this.logger.error('Failed to process');      // Errors
this.logger.debug('x = 42');                 // Debug details

// Use section headers for major operations
this.logger.section('Building Application');

// Add spacing
this.logger.newline();
```

### ❌ DON'T

```javascript
// Don't use console.log for main logging
console.log('Operation complete');  // Bad

// Don't log sensitive data
this.logger.info(`Password: ${password}`);  // Bad

// Don't mix console.log with logger
console.log('Start');
this.logger.info('Processing');  // Inconsistent

// Don't log in loops (performance)
for (let i = 0; i < 1000; i++) {
  this.logger.debug(`Processing ${i}`);  // Bad - use batch logging
}
```

---

## Troubleshooting

### Logs Not Appearing
1. Check if logger is initialized: `this.logger = new Logger(...)`
2. Verify log level is appropriate (debug only shows with -v flag)
3. Check if logger is muted: `logger.mute()` was called

### Colored Output Not Showing
1. Terminal might not support colors (try using chalk plugin)
2. Check if terminal is redirected to file (colors disabled)
3. Some CI/CD systems disable colors by default

### Performance Issues
1. Avoid logging in tight loops
2. Use `this.logger.debug()` for verbose logs (only when needed)
3. Batch multiple logs instead of individual calls

---

## Summary

✅ **All logs print to console (stdout/stderr)**
✅ **Centralized Logger class for consistency**
✅ **5 log levels: info, success, warn, error, debug**
✅ **Colored output with symbols for easy scanning**
✅ **Debug logs only show with -v flag**
✅ **Configuration via assets.json**
✅ **No file logging (design choice)**

**Status: Fully integrated and standardized** 🎯
