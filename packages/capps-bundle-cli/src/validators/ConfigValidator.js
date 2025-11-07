/**
 * ConfigValidator - Validates assets.json configuration
 *
 * Responsibilities:
 * - Validate JSON schema
 * - Check required fields
 * - Validate entry points exist
 * - Validate bundler names
 * - Check for circular dependencies
 * - Validate load contexts
 */

const path = require('path');
const FileUtils = require('../lib/FileUtils');
const logger = require('../lib/Logger');

class ConfigValidator {
  constructor(appDir, config) {
    this.appDir = appDir;
    this.config = config;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Run all validations
   * @returns {Object} Validation result { valid, errors, warnings }
   */
  validate() {
    this.errors = [];
    this.warnings = [];

    // Run all validation checks
    this.validateRequiredFields();
    this.validateBundlerName();
    this.validateBuildConfig();
    this.validateEntryPoints();
    this.validateLoadContexts();

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      errorCount: this.errors.length,
      warningCount: this.warnings.length
    };
  }

  /**
   * Validate required top-level fields
   * @private
   */
  validateRequiredFields() {
    const required = ['app_name', 'build'];

    for (const field of required) {
      if (!this.config[field]) {
        this.errors.push(`Required field missing: ${field}`);
      }
    }

    // bundler is now optional - will be auto-detected if not specified
  }

  /**
   * Validate bundler name is supported (if specified)
   * @private
   */
  validateBundlerName() {
    if (!this.config.bundler) {
      // Bundler is optional - will be auto-detected
      return;
    }

    const supportedBundlers = ['webpack', 'vite', 'esbuild'];
    const bundler = this.config.bundler.toLowerCase();

    if (!supportedBundlers.includes(bundler)) {
      this.errors.push(
        `Invalid bundler: "${this.config.bundler}". ` +
        `Supported: ${supportedBundlers.join(', ')}`
      );
    }
  }

  /**
   * Validate build configuration
   * @private
   */
  validateBuildConfig() {
    if (!this.config.build) {
      this.errors.push('build configuration is required');
      return;
    }

    const build = this.config.build;

    // Check entry_points
    if (!build.entry_points) {
      this.errors.push('build.entry_points is required');
      return;
    }

    // entry_points can be either "auto" (string) or object
    if (typeof build.entry_points === 'string') {
      // Auto-discovery mode
      if (build.entry_points !== 'auto') {
        this.errors.push(
          `Invalid entry_points value: "${build.entry_points}". ` +
          `When using string, must be "auto" for auto-discovery`
        );
      }

      // Validate auto-discovery options
      const sourceDir = build.source_dir || 'public';
      const sourcePath = path.join(this.appDir, sourceDir);
      if (!FileUtils.dirExists(sourcePath)) {
        this.errors.push(
          `Auto-discovery source directory not found: ${sourceDir}\n  Full path: ${sourcePath}`
        );
      }
    } else if (typeof build.entry_points === 'object' && !Array.isArray(build.entry_points)) {
      // Manual entry_points object
      if (Object.keys(build.entry_points).length === 0) {
        this.errors.push('build.entry_points cannot be empty');
      }
    } else {
      this.errors.push(
        'build.entry_points must be either "auto" (string) or an object mapping names to file paths'
      );
      return;
    }

    // Check output_dir
    if (build.output_dir && typeof build.output_dir !== 'string') {
      this.errors.push('build.output_dir must be a string');
    }

    // Check source_dir (for auto-discovery)
    if (build.source_dir && typeof build.source_dir !== 'string') {
      this.errors.push('build.source_dir must be a string');
    }

    // Check include_patterns
    if (build.include_patterns && !Array.isArray(build.include_patterns)) {
      this.errors.push('build.include_patterns must be an array');
    }

    // Check exclude_patterns
    if (build.exclude_patterns && !Array.isArray(build.exclude_patterns)) {
      this.errors.push('build.exclude_patterns must be an array');
    }

    // Check hash_bundles
    if (build.hash_bundles !== undefined && typeof build.hash_bundles !== 'boolean') {
      this.errors.push('build.hash_bundles must be a boolean');
    }

    // Check minify
    if (build.minify !== undefined && typeof build.minify !== 'boolean') {
      this.errors.push('build.minify must be a boolean');
    }
  }

  /**
   * Validate all entry points exist
   * Skipped for "auto" entry_points (they will be discovered during build)
   * @private
   */
  validateEntryPoints() {
    if (!this.config.build?.entry_points) return;

    const entryPoints = this.config.build.entry_points;

    // Skip validation for "auto" discovery mode
    if (typeof entryPoints === 'string' && entryPoints === 'auto') {
      return;
    }

    // Validate manual entry points
    for (const [name, filePath] of Object.entries(entryPoints)) {
      // Validate name is string
      if (typeof name !== 'string') {
        this.errors.push(`Entry point name must be string, got: ${typeof name}`);
        continue;
      }

      // Validate path is string
      if (typeof filePath !== 'string') {
        this.errors.push(
          `Entry point "${name}" path must be string, got: ${typeof filePath}`
        );
        continue;
      }

      // Check if file exists
      const fullPath = path.resolve(this.appDir, filePath);
      if (!FileUtils.fileExists(fullPath)) {
        this.errors.push(
          `Entry point file not found: ${filePath}\n  Full path: ${fullPath}`
        );
      }
    }
  }

  /**
   * Validate load contexts
   * @private
   */
  validateLoadContexts() {
    if (!this.config.load_contexts) {
      this.warnings.push('load_contexts not defined (optional)');
      return;
    }

    if (!Array.isArray(this.config.load_contexts)) {
      this.errors.push('load_contexts must be an array');
      return;
    }

    for (let i = 0; i < this.config.load_contexts.length; i++) {
      const context = this.config.load_contexts[i];

      // Check required fields
      if (!context.context) {
        this.errors.push(`load_contexts[${i}]: context field is required`);
      }

      if (!context.bundles) {
        this.errors.push(`load_contexts[${i}]: bundles field is required`);
      } else if (!Array.isArray(context.bundles)) {
        this.errors.push(`load_contexts[${i}]: bundles must be an array`);
      }

      if (!context.load_type) {
        this.warnings.push(`load_contexts[${i}]: load_type not specified (default: on-demand)`);
      } else if (!['always', 'on-demand', 'lazy'].includes(context.load_type)) {
        this.errors.push(
          `load_contexts[${i}]: invalid load_type "${context.load_type}". ` +
          `Valid: always, on-demand, lazy`
        );
      }
    }
  }

  /**
   * Get validation errors
   * @returns {string[]} Array of error messages
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get validation warnings
   * @returns {string[]} Array of warning messages
   */
  getWarnings() {
    return this.warnings;
  }

  /**
   * Print validation report
   */
  printReport() {
    const result = this.validate();

    if (result.valid) {
      logger.success('Configuration validation passed!');
      if (result.warningCount > 0) {
        logger.newline();
        logger.warn(`Found ${result.warningCount} warning(s):`);
        for (const warning of result.warnings) {
          console.log(`  ⚠ ${warning}`);
        }
      }
    } else {
      logger.error(`Configuration validation failed with ${result.errorCount} error(s):`);
      logger.newline();
      for (const error of result.errors) {
        console.log(`  ✗ ${error}`);
      }

      if (result.warningCount > 0) {
        logger.newline();
        logger.warn(`Also found ${result.warningCount} warning(s):`);
        for (const warning of result.warnings) {
          console.log(`  ⚠ ${warning}`);
        }
      }
    }

    return result;
  }
}

module.exports = ConfigValidator;
