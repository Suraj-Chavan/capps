/**
 * WebpackBundler - Webpack 5 implementation
 *
 * Handles:
 * - Building with Webpack using CLI-managed configuration
 * - Watch mode
 * - Error handling
 *
 * Note: Webpack config is managed by CLI, not created in app directory
 */

const path = require('path');
const { execSync } = require('child_process');
const Bundler = require('./Bundler');

class WebpackBundler extends Bundler {
  constructor(appDir, config, options = {}) {
    super(appDir, config, options);
    this.bundlerName = 'Webpack';
  }

  /**
   * Check if webpack config exists (CLI-managed, always true)
   */
  hasConfig() {
    // Config is managed by CLI, not in app directory
    return true;
  }

  /**
   * Get webpack config path (not used - CLI manages config)
   */
  getConfigPath() {
    return path.join(this.appDir, 'webpack.config.js');
  }

  /**
   * Check if Webpack is installed
   */
  isBundlerInstalled() {
    try {
      require.resolve('webpack');
      require.resolve('webpack-cli');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get Webpack installation command
   */
  getInstallCommand() {
    return 'npm install webpack webpack-cli --save-dev';
  }

  /**
   * Generate default webpack.config.js (not used - CLI manages config)
   */
  async generateDefaultConfig() {
    // This method is not used - CLI manages webpack configuration
    // Webpack builds directly via CLI using sensible defaults
    return null;
  }

  /**
   * Build with Webpack using CLI-managed config
   */
  async build(mode = 'production') {
    try {
      this.logBuildStart(mode);

      // Validate Webpack is installed
      await this.validatePrerequisites();

      this.logBundlerInfo();

      // Resolve entry points (with auto-discovery if needed)
      const entryPoints = await this.resolveEntryPoints();
      if (Object.keys(entryPoints).length === 0) {
        throw new Error(
          'No entry points defined in assets.json (build.entry_points is empty)'
        );
      }

      // Build entry points string for webpack CLI
      const outputDir = path.relative(this.appDir, this.getOutputDir());
      const hashBundles = this.shouldHashBundles();
      const minify = this.shouldMinify(mode);

      // Get path to webpack-cli binary from CLI's node_modules
      // Use package.json bin field to find the correct binary
      const webpackCliPackageDir = path.dirname(require.resolve('webpack-cli/package.json'));
      const webpackCliPackageJson = require(path.join(webpackCliPackageDir, 'package.json'));
      const webpackCliBinPath = webpackCliPackageJson.bin['webpack-cli'] || webpackCliPackageJson.bin;
      const webpackCliBinary = path.join(webpackCliPackageDir, webpackCliBinPath);

      // Construct webpack CLI command
      const entryArgs = Object.entries(entryPoints)
        .map(([name, file]) => `${name}=${path.resolve(this.appDir, file)}`)
        .join(' ');

      const command = [
        `node "${webpackCliBinary}"`,
        entryArgs,
        `--output-path ${outputDir}`,
        `--mode ${mode}`,
        `--output-filename ${hashBundles ? '[name]-[contenthash:8].js' : '[name].js'}`,
        minify ? '' : '--optimize=false',
        '--target web'
      ]
        .filter(arg => arg)
        .join(' ');

      this.logger.debug(`Running: ${command}`);
      this.logger.info('Note: CLI manages Webpack configuration');

      execSync(command, {
        cwd: this.appDir,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: mode }
      });

      this.logBuildSuccess(mode);
    } catch (error) {
      if (error.status !== undefined) {
        throw new Error(`Webpack build failed with exit code ${error.status}`);
      }
      throw error;
    }
  }

  /**
   * Watch mode with Webpack using CLI-managed config
   */
  async watch() {
    try {
      this.logger.info('Starting Webpack watch mode...');

      // Validate Webpack is installed
      await this.validatePrerequisites();

      // Resolve entry points (with auto-discovery if needed)
      const entryPoints = await this.resolveEntryPoints();
      if (Object.keys(entryPoints).length === 0) {
        throw new Error(
          'No entry points defined in assets.json (build.entry_points is empty)'
        );
      }

      this.logBundlerInfo();

      const outputDir = path.relative(this.appDir, this.getOutputDir());

      // Get path to webpack-cli binary from CLI's node_modules
      // Use package.json bin field to find the correct binary
      const webpackCliPackageDir = path.dirname(require.resolve('webpack-cli/package.json'));
      const webpackCliPackageJson = require(path.join(webpackCliPackageDir, 'package.json'));
      const webpackCliBinPath = webpackCliPackageJson.bin['webpack-cli'] || webpackCliPackageJson.bin;
      const webpackCliBinary = path.join(webpackCliPackageDir, webpackCliBinPath);

      // Construct webpack CLI command for watch mode
      const entryArgs = Object.entries(entryPoints)
        .map(([name, file]) => `${name}=${path.resolve(this.appDir, file)}`)
        .join(' ');

      const command = [
        `node "${webpackCliBinary}"`,
        entryArgs,
        `--output-path ${outputDir}`,
        '--mode development',
        '--watch',
        '--target web'
      ]
        .join(' ');

      this.logger.info('Watching for changes... (Press Ctrl+C to stop)');
      this.logger.newline();

      execSync(command, {
        cwd: this.appDir,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'development' }
      });
    } catch (error) {
      if (error.signal === 'SIGINT') {
        this.logger.info('Watch mode stopped');
        return;
      }
      throw error;
    }
  }
}

module.exports = WebpackBundler;
