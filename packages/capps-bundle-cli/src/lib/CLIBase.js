/**
 * CLIBase - Abstract base class for all CLI operations
 *
 * Provides:
 * - Common logging setup
 * - Error handling
 * - Path resolution
 * - Configuration loading
 * - File operations
 *
 * All commands and operations should extend this class
 */

const logger = require('./Logger');
const FileUtils = require('./FileUtils');
const path = require('path');

class CLIBase {
  constructor(options = {}) {
    this.appDir = options.appDir || process.cwd();
    this.cliDir = options.cliDir || path.dirname(__dirname);
    this.logger = logger;
    this.fileUtils = FileUtils;
    this.config = null;

    // Debug logging
    if (options.debug) {
      this.logger.enableDebug();
    }

    this.logger.debug(`App directory: ${this.appDir}`);
    this.logger.debug(`CLI directory: ${this.cliDir}`);
  }

  /**
   * Validate app structure
   * Checks if required directories and files exist
   * @throws {Error} If app structure is invalid
   */
  async validateAppStructure() {
    this.logger.info('Validating app structure...');

    // Check public directory exists
    const publicDir = FileUtils.getPublicDir(this.appDir);
    if (!FileUtils.dirExists(publicDir)) {
      throw new Error(
        `public/ directory not found at ${publicDir}\n\n` +
        'CAPPS apps must have a public/ directory.\n' +
        'Run: npm run bundle:init'
      );
    }

    this.logger.debug('✓ public/ directory exists');

    // Check assets.json exists
    const assetsJsonPath = FileUtils.getAssetsJsonPath(this.appDir);
    if (!FileUtils.fileExists(assetsJsonPath)) {
      throw new Error(
        `assets.json not found at ${assetsJsonPath}\n\n` +
        'Create it with: npm run bundle:init'
      );
    }

    this.logger.debug('✓ assets.json exists');
    this.logger.success('App structure is valid');
  }

  /**
   * Load and validate assets.json
   * @returns {Object} Parsed assets.json
   * @throws {Error} If loading or validation fails
   */
  async loadConfig() {
    this.logger.info('Loading configuration...');

    try {
      const assetsJsonPath = FileUtils.getAssetsJsonPath(this.appDir);
      this.config = FileUtils.readJsonFile(assetsJsonPath);

      // Validate required fields
      if (!this.config.app_name) {
        throw new Error('app_name not specified in assets.json');
      }

      if (!this.config.build || !this.config.build.entry_points) {
        throw new Error('build.entry_points not specified in assets.json');
      }

      // Default to Vite if bundler not specified in assets.json
      if (!this.config.bundler) {
        this.config.bundler = 'vite';
        this.logger.debug('Using default bundler: vite');
      }

      this.logger.success('Configuration loaded');
      this.logger.debug(`App: ${this.config.app_name}`);
      this.logger.debug(`Bundler: ${this.config.bundler}`);
      this.logger.debug(`Entry points: ${Object.keys(this.config.build.entry_points).length}`);

      return this.config;
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  /**
   * Show app info
   */
  showInfo() {
    if (!this.config) return;

    this.logger.newline();
    this.logger.info('App Configuration:');
    console.log(`  Name:        ${this.config.app_name}`);
    console.log(`  Version:     ${this.config.version || 'not specified'}`);
    if (this.config.bundler) {
      console.log(`  Bundler:     ${this.config.bundler}`);
    }
    console.log(
      `  Entry Points: ${Object.keys(this.config.build?.entry_points || {}).length}`
    );
    console.log(`  Output:      ${this.config.build?.output_dir || 'public/dist/'}`);
    this.logger.newline();
  }

  /**
   * Handle error with helpful context
   * @param {Error} error - Error object
   * @param {string} context - Context string
   */
  handleError(error, context = '') {
    this.logger.newline();
    this.logger.error(`${context} ${error.message}`);

    // Provide additional context for common errors
    if (error.message.includes('ENOENT')) {
      this.logger.newline();
      this.logger.info('💡 Hint: File not found. Check your entry points in assets.json');
    } else if (error.message.includes('assets.json')) {
      this.logger.newline();
      this.logger.info('💡 Hint: Run npm run bundle:init to create assets.json');
    } else if (error.message.includes('bundler')) {
      this.logger.newline();
      this.logger.info('💡 Hint: Install the bundler dependencies:');
      this.logger.info('   npm install webpack webpack-cli --save-dev');
    }

    this.logger.newline();
    this.logger.warn('For more help, run: npm run bundle:help');
    this.logger.newline();
  }

  /**
   * Display help message
   */
  displayHelp() {
    this.logger.newline();
    console.log('Usage: capps-bundle [command] [options]');
    console.log('');
    console.log('Commands:');
    console.log('  build              Production build');
    console.log('  build --dev        Development build');
    console.log('  watch              Watch mode (auto-rebuild)');
    console.log('  analyze            Analyze bundle sizes');
    console.log('  validate           Validate configuration');
    console.log('  tailwind           Tailwind CSS generator');
    console.log('    build            Generate missing Tailwind CSS');
    console.log('    analyze          Analyze app for Tailwind classes');
    console.log('  add-pkg <pkg>      Install npm package');
    console.log('  remove-pkg <pkg>   Uninstall npm package');
    console.log('  list-pkg           List installed packages');
    console.log('  update-pkg         Update all packages');
    console.log('  init               Initialize app configuration');
    console.log('  clean              Clean dist directory');
    console.log('  help               Show this help');
    console.log('  version            Show version');
    console.log('');
    console.log('Options:');
    console.log('  --debug            Enable debug logging');
    console.log('  --help             Show help');
    console.log('  --version          Show version');
    console.log('');
    console.log('Examples:');
    console.log('  capps-bundle build');
    console.log('  capps-bundle build --dev');
    console.log('  capps-bundle watch');
    console.log('  capps-bundle tailwind build');
    console.log('  capps-bundle tailwind analyze');
    console.log('  capps-bundle add-pkg lodash');
    console.log('');
    console.log('For more help on tailwind commands:');
    console.log('  capps-bundle tailwind --help');
    console.log('');
  }

  /**
   * Display version
   */
  displayVersion() {
    try {
      const packageJson = FileUtils.readJsonFile(
        path.join(this.cliDir, '..', 'package.json')
      );
      console.log(`capps-bundle version ${packageJson.version}`);
    } catch (error) {
      // Fallback version
      console.log('capps-bundle version 1.0.0');
    }
  }
}

module.exports = CLIBase;
