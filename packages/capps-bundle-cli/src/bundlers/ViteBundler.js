/**
 * ViteBundler - Vite 4 implementation
 *
 * Handles:
 * - Building with Vite using CLI-managed configuration
 * - Watch mode
 * - Error handling
 * - Optional JSX transpilation (via capps.loader.transpileJSX() for templates)
 *
 * Note: Vite config is managed by CLI, not created in app directory
 * Babel is optional: Only needed if the app uses JSX in templates
 * (loaded at runtime via app_include_js, not bundled)
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const Bundler = require('./Bundler');

class ViteBundler extends Bundler {
  constructor(appDir, config, options = {}) {
    super(appDir, config, options);
    this.bundlerName = 'Vite';
  }

  /**
   * Check if vite.config.js exists in CLI package
   */
  hasConfig() {
    // Config is managed by CLI, not in app directory
    // Always return true since CLI provides config
    return true;
  }

  /**
   * Get vite config path (not used - CLI manages config)
   */
  getConfigPath() {
    return path.join(this.appDir, 'vite.config.js');
  }

  /**
   * Check if Vite is installed
   */
  isBundlerInstalled() {
    try {
      require.resolve('vite');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate temporary Vite config
   * @private
   */
  generateViteConfig(entryPoints, outputDir, isDev) {
    const entries = {};
    for (const [name, file] of Object.entries(entryPoints)) {
      // Skip vendor files - they should not be bundled (UMD bundles need to load as-is)
      // Vendor files will be copied to dist separately and added to manifest manually
      if (file.includes('vendor/')) {
        this.logger.debug(`Skipping vendor file from bundling: ${name}`);
        continue;
      }
      // Resolve to absolute path and convert to forward slashes for cross-platform compatibility
      const absolutePath = path.resolve(this.appDir, file).replace(/\\/g, '/');
      entries[name] = absolutePath;
    }

    const minify = this.shouldMinify(isDev ? 'development' : 'production');
    const outDir = path.relative(this.appDir, outputDir).replace(/\\/g, '/');
    const nodeEnv = isDev ? 'development' : 'production';

    // Log entry points for debugging
    this.logger.debug(`Generated entry points: ${JSON.stringify(entries, null, 2)}`);

    // Generate CommonJS config (not ESM) to avoid module resolution issues
    // The config file is temporary and located in the app directory
    // Note: JSX transpilation is now handled at runtime via capps.loader.transpileJSX()
    // for page-builder templates. Babel is optional and only loaded if the app requires it.
    const configContent = `module.exports = {
  publicDir: false,
  build: {
    lib: {
      entry: ${JSON.stringify(entries)},
      formats: ['es']
    },
    outDir: '${outDir}',
    minify: ${minify ? "'terser'" : 'false'},
    sourcemap: ${isDev ? "'inline'" : 'true'},
    target: 'es2015',
    rollupOptions: {
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '${nodeEnv}'
  }
};`;

    const configPath = path.join(this.appDir, 'vite.config.js');
    fs.writeFileSync(configPath, configContent);
    return configPath;
  }

  /**
   * Clean up temporary Vite config
   * @private
   */
  cleanupViteConfig() {
    const configPath = path.join(this.appDir, 'vite.config.js');
    try {
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
    } catch (error) {
      this.logger.warn(`Could not delete temporary vite.config.js: ${error.message}`);
    }
  }

  /**
   * Get Vite installation command
   */
  getInstallCommand() {
    return 'npm install vite --save-dev';
  }

  /**
   * Build with Vite using CLI-managed config
   */
  async build(mode = 'production') {
    let configPath;
    try {
      this.logBuildStart(mode);

      // Validate Vite is installed
      await this.validatePrerequisites();

      this.logBundlerInfo();

      // Resolve entry points (with auto-discovery if needed)
      const entryPoints = await this.resolveEntryPoints();
      if (Object.keys(entryPoints).length === 0) {
        throw new Error(
          'No entry points defined in assets.json (build.entry_points is empty)'
        );
      }

      const isDev = mode === 'development';
      const outputDir = this.getOutputDir();

      // Generate temporary Vite config
      this.logger.debug('Generating temporary Vite configuration...');
      configPath = this.generateViteConfig(entryPoints, outputDir, isDev);

      // Get path to vite binary from CLI's node_modules
      // Use package.json bin field to find the correct binary
      const vitePackageDir = path.dirname(require.resolve('vite/package.json'));
      const vitePackageJson = require(path.join(vitePackageDir, 'package.json'));
      const viteBinPath = vitePackageJson.bin.vite || vitePackageJson.bin;
      const viteBinary = path.join(vitePackageDir, viteBinPath);

      const command = [
        `node "${viteBinary}"`,
        'build',
        `--config "${configPath}"`,
        isDev ? '--mode development' : '--mode production'
      ]
        .filter(arg => arg)
        .join(' ');

      this.logger.debug(`Running: ${command}`);
      this.logger.info('Note: CLI manages Vite configuration');

      execSync(command, {
        cwd: this.appDir,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: mode }
      });

      // Copy vendor files to dist without bundling (UMD bundles must load as-is)
      this.copyVendorFiles(this.appDir, outputDir);

      // Generate Babel configuration bundle if enabled
      await this.generateBabelConfigBundle(this.appDir, outputDir);

      this.logBuildSuccess(mode);
    } catch (error) {
      if (error.status !== undefined) {
        throw new Error(`Vite build failed with exit code ${error.status}`);
      }
      throw error;
    } finally {
      // Clean up temporary config
      if (configPath) {
        this.cleanupViteConfig();
      }
    }
  }

  /**
   * Copy vendor files to output directory without bundling
   * UMD files need to load as-is in the browser
   * Skip files that are configured to load via app_include_js
   * @private
   */
  copyVendorFiles(appDir, outputDir) {
    const vendorDir = path.join(appDir, 'public/vendor');
    if (!this.fileExists(vendorDir)) {
      return; // No vendor directory
    }

    try {
      const fs = require('fs');
      const vendorFiles = fs.readdirSync(vendorDir);

      // Get list of files configured in app_include_js
      const appIncludeJs = this.config.app_include_js || [];
      const appIncludeJsFileNames = new Set(
        appIncludeJs.map(filePath => path.basename(filePath))
      );

      for (const file of vendorFiles) {
        // Skip files that are configured to load via app_include_js
        if (appIncludeJsFileNames.has(file)) {
          this.logger.debug(`Skipping vendor file (configured in app_include_js): ${file}`);
          continue;
        }

        const srcPath = path.join(vendorDir, file);
        const destPath = path.join(outputDir, file);
        fs.copyFileSync(srcPath, destPath);
        this.logger.debug(`Copied vendor file: ${file}`);
      }
    } catch (error) {
      this.logger.warn(`Could not copy vendor files: ${error.message}`);
    }
  }

  /**
   * Generate Babel configuration bundle
   * Creates a JS file that pre-configures Babel with presets/plugins from assets.json
   * @private
   */
  async generateBabelConfigBundle(appDir, outputDir) {
    try {
      const assetsJsonPath = path.join(appDir, 'public/assets.json');

      if (!this.fileExists(assetsJsonPath)) {
        return; // No assets.json
      }

      const fs = require('fs');
      const assetsJson = JSON.parse(fs.readFileSync(assetsJsonPath, 'utf8'));
      const babelConfig = assetsJson.babel_config;

      if (!babelConfig || !babelConfig.enabled) {
        this.logger.debug('Babel configuration not enabled, skipping babel config bundle generation');
        return;
      }

      // Generate Babel configuration bundle content
      const configContent = `
/**
 * Babel Configuration Bundle
 * Auto-generated by CAPPS Bundle CLI
 * Pre-configures Babel with user-specified presets and plugins
 */

(function() {
  if (typeof window.Babel === 'undefined') {
    console.warn('[CAPPS Babel] Babel not loaded. Make sure @babel/standalone is loaded before this script.');
    return;
  }

  // Store original transform
  const originalTransform = window.Babel.transform;

  // Babel configuration from assets.json
  const babelConfig = ${JSON.stringify({
    presets: babelConfig.presets || [],
    plugins: babelConfig.plugins || [],
    sourceType: babelConfig.source_type || 'module'
  })};

  /**
   * Transform code with pre-configured Babel
   * @param {string} code - Source code to transform
   * @param {Object} opts - Additional options (merged with default config)
   * @returns {Object} - Babel transform result
   */
  window.Babel.transformWithConfig = function(code, opts = {}) {
    const finalConfig = {
      ...babelConfig,
      ...opts,
      presets: [...(babelConfig.presets || []), ...(opts.presets || [])],
      plugins: [...(babelConfig.plugins || []), ...(opts.plugins || [])]
    };
    return originalTransform(code, finalConfig);
  };

  // Override default transform to use the pre-configured settings
  window.Babel.transform = function(code, opts = {}) {
    return window.Babel.transformWithConfig(code, opts);
  };

  // Log successful initialization
  console.info('[CAPPS Babel] Initialized with presets:', babelConfig.presets);
  console.info('[CAPPS Babel] Initialized with plugins:', babelConfig.plugins);
  console.info('[CAPPS Babel] JSX/ES6 transpilation ready');

  // Store config for reference
  window.BabelConfig = babelConfig;
})();
`;

      // Write the babel config bundle to dist
      const babelConfigPath = path.join(outputDir, 'babel-config.js');
      fs.writeFileSync(babelConfigPath, configContent.trim());

      this.logger.debug(`Generated Babel configuration bundle: babel-config.js`);
      this.logger.info(`✓ Babel configured with ${babelConfig.presets?.length || 0} presets and ${babelConfig.plugins?.length || 0} plugins`);
    } catch (error) {
      this.logger.warn(`Could not generate Babel config bundle: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   * @private
   */
  fileExists(filePath) {
    const fs = require('fs');
    return fs.existsSync(filePath);
  }

  /**
   * Watch mode with Vite
   */
  async watch() {
    let configPath;
    try {
      this.logger.info('Starting Vite watch mode...');

      // Validate Vite is installed
      await this.validatePrerequisites();

      // Resolve entry points (with auto-discovery if needed)
      const entryPoints = await this.resolveEntryPoints();
      if (Object.keys(entryPoints).length === 0) {
        throw new Error(
          'No entry points defined in assets.json (build.entry_points is empty)'
        );
      }

      this.logBundlerInfo();

      const outputDir = this.getOutputDir();

      // Generate temporary Vite config
      this.logger.debug('Generating temporary Vite configuration...');
      configPath = this.generateViteConfig(entryPoints, outputDir, true);

      // Get path to vite binary from CLI's node_modules
      // Use package.json bin field to find the correct binary
      const vitePackageDir = path.dirname(require.resolve('vite/package.json'));
      const vitePackageJson = require(path.join(vitePackageDir, 'package.json'));
      const viteBinPath = vitePackageJson.bin.vite || vitePackageJson.bin;
      const viteBinary = path.join(vitePackageDir, viteBinPath);

      const command = [
        `node "${viteBinary}"`,
        'build',
        `--config "${configPath}"`,
        '--watch',
        '--mode development'
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
    } finally {
      // Clean up temporary config
      if (configPath) {
        this.cleanupViteConfig();
      }
    }
  }
}

module.exports = ViteBundler;
