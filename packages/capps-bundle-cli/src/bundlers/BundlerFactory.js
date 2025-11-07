/**
 * BundlerFactory - Factory for creating bundler instances
 *
 * Provides a single point for instantiating Vite bundler.
 * Vite is the primary/recommended bundler for CAPPS applications.
 */

const ViteBundler = require('./ViteBundler');

class BundlerFactory {
  /**
   * Get supported bundler names
   * @returns {string[]} Array of supported bundler names
   */
  static getSupportedBundlers() {
    return ['vite'];
  }

  /**
   * Create a bundler instance
   * @param {string} bundlerName - Name of bundler (vite)
   * @param {string} appDir - Application directory path
   * @param {Object} config - Application configuration (from assets.json)
   * @param {Object} options - Additional options
   * @returns {Bundler} Vite bundler instance
   * @throws {Error} If bundler name is not 'vite'
   */
  static createBundler(bundlerName, appDir, config, options = {}) {
    const name = bundlerName.toLowerCase().trim();

    if (name === 'vite' || !name) {
      return new ViteBundler(appDir, config, options);
    }

    throw new Error(
      `Unsupported bundler: "${bundlerName}"\n\n` +
      `Only 'vite' is supported. Update assets.json and set bundler to 'vite'.`
    );
  }

  /**
   * Validate bundler name
   * @param {string} bundlerName - Bundler name to validate
   * @returns {boolean} True if valid
   */
  static isValidBundler(bundlerName) {
    return this.getSupportedBundlers().includes(bundlerName.toLowerCase());
  }
}

module.exports = BundlerFactory;
