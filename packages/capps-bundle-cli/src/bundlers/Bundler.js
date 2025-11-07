/**
 * Bundler - Abstract base class for all bundler implementations
 *
 * Defines the interface that all bundler implementations (Webpack, Vite, esbuild) must follow
 * Strategy pattern - different bundler strategies implement this interface
 */

const CLIBase = require('../lib/CLIBase');

class Bundler extends CLIBase {
  constructor(appDir, config, options = {}) {
    super({ appDir, ...options });
    this.config = config;
    this.bundlerName = null; // Override in subclasses
    this.distDir = this.fileUtils.getDistDir(appDir);
    this.publicDir = this.fileUtils.getPublicDir(appDir);
  }

  /**
   * Build bundles (production or development)
   * @abstract
   * @param {string} mode - 'production' or 'development'
   * @returns {Promise<void>}
   * @throws {Error} If build fails
   */
  async build(mode = 'production') {
    throw new Error('build() method must be implemented in subclass');
  }

  /**
   * Watch mode - auto-rebuild on file changes
   * @abstract
   * @returns {Promise<void>}
   * @throws {Error} If watch fails
   */
  async watch() {
    throw new Error('watch() method must be implemented in subclass');
  }

  /**
   * Check if bundler config file exists
   * @abstract
   * @returns {boolean}
   */
  hasConfig() {
    throw new Error('hasConfig() method must be implemented in subclass');
  }

  /**
   * Get bundler config file path
   * @abstract
   * @returns {string}
   */
  getConfigPath() {
    throw new Error('getConfigPath() method must be implemented in subclass');
  }

  /**
   * Generate default bundler config
   * @abstract
   * @returns {Promise<string>} Generated config content
   */
  async generateDefaultConfig() {
    throw new Error('generateDefaultConfig() method must be implemented in subclass');
  }

  /**
   * Check if bundler is installed
   * @abstract
   * @returns {boolean}
   */
  isBundlerInstalled() {
    throw new Error('isBundlerInstalled() method must be implemented in subclass');
  }

  /**
   * Get bundler installation command
   * @abstract
   * @returns {string}
   */
  getInstallCommand() {
    throw new Error('getInstallCommand() method must be implemented in subclass');
  }

  /**
   * Get entry points from config (returns raw config)
   * Use resolveEntryPoints() to get actual entry points with auto-discovery
   * @protected
   * @returns {Object|string} Entry points mapping or "auto" string
   */
  getEntryPoints() {
    return this.config.build?.entry_points || {};
  }

  /**
   * Resolve entry points with auto-discovery support
   * If entry_points is "auto", discovers files from public folder
   * Otherwise returns the configured entry_points
   * @protected
   * @async
   * @returns {Promise<Object>} Resolved entry points mapping
   * @throws {Error} If auto-discovery fails
   */
  async resolveEntryPoints() {
    const entryPoints = this.getEntryPoints();

    // If entry_points is "auto", discover them
    if (typeof entryPoints === 'string' && entryPoints === 'auto') {
      const AssetDiscovery = require('../discoverers/AssetDiscovery');

      const discoveryOptions = {
        source_dir: this.config.build?.source_dir || 'public',
        include_patterns: this.config.build?.include_patterns,
        exclude_patterns: this.config.build?.exclude_patterns
      };

      const discovery = new AssetDiscovery(this.appDir, discoveryOptions);
      const result = await discovery.discover();

      if (result.found === 0) {
        throw new Error(
          `Auto-discovery: No assets found in ${discoveryOptions.source_dir}/\n` +
          `Patterns: ${discoveryOptions.include_patterns.join(', ')}`
        );
      }

      discovery.logDiscovery(this.logger);
      return result.entryPoints;
    }

    // Return configured entry points
    return entryPoints;
  }

  /**
   * Get output directory
   * @protected
   * @returns {string}
   */
  getOutputDir() {
    return this.fileUtils.resolvePath(
      this.appDir,
      this.config.build?.output_dir || 'public/dist/'
    );
  }

  /**
   * Should bundles be hashed?
   * @protected
   * @returns {boolean}
   */
  shouldHashBundles() {
    return this.config.build?.hash_bundles !== false;
  }

  /**
   * Should minify bundles?
   * @protected
   * @returns {boolean}
   */
  shouldMinify(mode) {
    if (mode === 'development') {
      return false;
    }
    return this.config.build?.minify !== false;
  }

  /**
   * Validate bundler prerequisites
   * @protected
   * @returns {Promise<void>}
   * @throws {Error} If validation fails
   */
  async validatePrerequisites() {
    if (!this.isBundlerInstalled()) {
      const installCmd = this.getInstallCommand();
      throw new Error(
        `${this.bundlerName} is not installed.\n\n` +
        `Install it with:\n  ${installCmd}\n\n` +
        `Or add it to your package.json devDependencies.`
      );
    }
  }

  /**
   * Log build start
   * @protected
   */
  logBuildStart(mode) {
    this.logger.info(`Starting ${this.bundlerName} build (${mode} mode)...`);
  }

  /**
   * Log build success
   * @protected
   */
  logBuildSuccess(mode) {
    this.logger.success(`${this.bundlerName} build completed successfully!`);
  }

  /**
   * Log bundler info
   * @protected
   */
  logBundlerInfo() {
    this.logger.info(`Using bundler: ${this.bundlerName}`);
    this.logger.debug(`Config: ${this.getConfigPath()}`);
    this.logger.debug(`Output: ${this.getOutputDir()}`);
  }
}

module.exports = Bundler;
