/**
 * EsbuildBundler - esbuild implementation
 *
 * Handles:
 * - Building with esbuild using CLI-managed configuration
 * - Watch mode
 * - Error handling
 *
 * Note: esbuild is CLI-driven, no config file needed
 * Configuration is managed by the CLI via command-line options
 */

const path = require('path');
const { execSync } = require('child_process');
const Bundler = require('./Bundler');

class EsbuildBundler extends Bundler {
  constructor(appDir, config, options = {}) {
    super(appDir, config, options);
    this.bundlerName = 'esbuild';
  }

  /**
   * esbuild doesn't need a config file (CLI-managed)
   */
  hasConfig() {
    // Config is managed by CLI, not in app directory
    return true;
  }

  /**
   * Get esbuild config path (not used - CLI manages config)
   */
  getConfigPath() {
    return path.join(this.appDir, 'esbuild.config.js');
  }

  /**
   * Check if esbuild is installed
   */
  isBundlerInstalled() {
    try {
      require.resolve('esbuild');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get esbuild installation command
   */
  getInstallCommand() {
    return 'npm install esbuild --save-dev';
  }

  /**
   * Generate default esbuild.config.js (not used - CLI manages config)
   */
  async generateDefaultConfig() {
    // This method is not used - CLI manages esbuild configuration
    // esbuild is CLI-driven with no config file needed
    return null;
  }

  /**
   * Build with esbuild using CLI-managed config
   */
  async build(mode = 'production') {
    try {
      this.logBuildStart(mode);

      // Validate esbuild is installed
      await this.validatePrerequisites();

      this.logBundlerInfo();

      // Resolve entry points (with auto-discovery if needed)
      const entryPoints = await this.resolveEntryPoints();
      const outputDir = this.getOutputDir();

      if (Object.keys(entryPoints).length === 0) {
        throw new Error(
          'No entry points defined in assets.json (build.entry_points is empty)'
        );
      }

      // Get path to esbuild binary from CLI's node_modules
      // Use package.json bin field to find the correct binary
      const esbuildPackageDir = path.dirname(require.resolve('esbuild/package.json'));
      const esbuildPackageJson = require(path.join(esbuildPackageDir, 'package.json'));
      const esbuildBinPath = esbuildPackageJson.bin.esbuild || esbuildPackageJson.bin;
      const esbuildBinary = path.join(esbuildPackageDir, esbuildBinPath);

      // Build esbuild CLI command
      const entries = Object.values(entryPoints)
        .map(file => path.resolve(this.appDir, file))
        .join(' ');

      const isDev = mode === 'development';
      const minify = this.shouldMinify(mode);
      const outdir = path.relative(this.appDir, outputDir);

      const command = [
        `node "${esbuildBinary}"`,
        entries,
        '--bundle',
        '--platform=browser',
        '--format=umd',
        `--outdir=${outdir}`,
        '--external:vue',
        minify ? '' : '--no-minify',
        isDev ? '--sourcemap=inline' : '--sourcemap'
      ]
        .filter(arg => arg)
        .join(' ');

      this.logger.debug(`Running: ${command}`);
      this.logger.info('Note: CLI manages esbuild configuration');

      execSync(command, {
        cwd: this.appDir,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: mode }
      });

      this.logBuildSuccess(mode);
    } catch (error) {
      if (error.status !== undefined) {
        throw new Error(`esbuild build failed with exit code ${error.status}`);
      }
      throw error;
    }
  }

  /**
   * Watch mode with esbuild using CLI-managed config
   */
  async watch() {
    try {
      this.logger.info('Starting esbuild watch mode...');

      // Validate esbuild is installed
      await this.validatePrerequisites();

      // Resolve entry points (with auto-discovery if needed)
      const entryPoints = await this.resolveEntryPoints();
      const outputDir = this.getOutputDir();

      if (Object.keys(entryPoints).length === 0) {
        throw new Error(
          'No entry points defined in assets.json (build.entry_points is empty)'
        );
      }

      this.logBundlerInfo();

      // Get path to esbuild binary from CLI's node_modules
      // Use package.json bin field to find the correct binary
      const esbuildPackageDir = path.dirname(require.resolve('esbuild/package.json'));
      const esbuildPackageJson = require(path.join(esbuildPackageDir, 'package.json'));
      const esbuildBinPath = esbuildPackageJson.bin.esbuild || esbuildPackageJson.bin;
      const esbuildBinary = path.join(esbuildPackageDir, esbuildBinPath);

      // Build esbuild CLI command with watch
      const entries = Object.values(entryPoints)
        .map(file => path.resolve(this.appDir, file))
        .join(' ');

      const outdir = path.relative(this.appDir, outputDir);

      const command = [
        `node "${esbuildBinary}"`,
        entries,
        '--bundle',
        '--platform=browser',
        '--format=umd',
        `--outdir=${outdir}`,
        '--external:vue',
        '--sourcemap=inline',
        '--watch'
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

module.exports = EsbuildBundler;
