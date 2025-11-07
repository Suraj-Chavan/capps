/**
 * InitWizard - Interactive setup wizard for CAPPS app bundling
 *
 * Responsibilities:
 * - Interactive prompt for configuration
 * - Create assets.json
 * - Create bundler-specific config
 * - Update package.json with scripts
 */

const path = require('path');
const inquirer = require('inquirer');
const FileUtils = require('../lib/FileUtils');
const logger = require('../lib/Logger');

class InitWizard {
  constructor(appDir) {
    this.appDir = appDir;
    this.config = {};
  }

  /**
   * Run the initialization wizard
   * @returns {Promise<Object>} Generated configuration
   */
  async run() {
    try {
      logger.newline();
      logger.section('CAPPS Bundle - Interactive Setup Wizard');

      // Check if assets.json already exists
      await this.checkExistingAssetsJson();

      // Step 1: Use folder name as app name (automatic)
      this.setAppNameFromFolder();

      // Step 2: Set discovery mode to auto with public folder (hardcoded)
      this.setAutoDiscoveryMode();

      // Step 4: Ask for output directory
      await this.askOutputDir();

      // Step 5: Ask if user wants to customize file patterns
      await this.askCustomPatterns();

      // Step 6: Set production options (hardcoded for production)
      this.setProductionOptions();

      // Step 7: Ask for Tailwind CSS configuration
      await this.askTailwindConfig();

      // Create assets.json
      await this.createAssetsJson();

      // Create bundler config
      await this.createBundlerConfig();

      // Update package.json scripts
      await this.updatePackageJsonScripts();

      logger.newline();
      logger.success('Setup complete!');
      logger.newline();
      this.printNextSteps();

      return this.config;
    } catch (error) {
      throw new Error(`Setup wizard failed: ${error.message}`);
    }
  }

  /**
   * Check if assets.json already exists and inform user about merge behavior
   * @private
   */
  async checkExistingAssetsJson() {
    const assetsJsonPath = FileUtils.getAssetsJsonPath(this.appDir);
    if (FileUtils.fileExists(assetsJsonPath)) {
      logger.info(`ℹ️  assets.json already exists at: ${assetsJsonPath}`);
      logger.info(`Running init will UPDATE your configuration intelligently:`);
      logger.info(`✓ Preserves custom app_include_js (React, Babel, vendor files)`);
      logger.info(`✓ Preserves custom app_include_css entries`);
      logger.info(`✓ Preserves babel_config and load_contexts`);
      logger.info(`✓ Preserves tailwind configuration`);
      logger.info(`✓ Updates only bundler settings and build configuration`);
      logger.newline();

      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Do you want to continue and merge configuration?',
          default: true
        }
      ]);

      if (!answers.proceed) {
        logger.info('Setup cancelled. Your existing assets.json was not modified.');
        process.exit(0);
      }

      logger.newline();
    }
  }

  /**
   * Set app name from folder name (automatic)
   * @private
   */
  setAppNameFromFolder() {
    this.config.app_name = path.basename(this.appDir);
    logger.info(`App name: ${this.config.app_name} (from folder name)`);
    logger.debug(`App name: ${this.config.app_name}`);
  }

  /**
   * Set auto-discovery mode with public folder (hardcoded)
   * @private
   */
  setAutoDiscoveryMode() {
    this.config.discovery_mode = 'auto';
    this.config.source_dir = 'public';
    this.config.include_patterns = ['**/*.{js,css,scss}'];
    this.config.exclude_patterns = ['dist/**', 'collection/**', 'vendor/**', 'layout/*.js', 'layout/**/*.js', '*.json'];

    logger.info(`Asset discovery: Auto-scan public/ folder`);
    logger.debug(`Discovery mode: ${this.config.discovery_mode}`);
    logger.debug(`Source dir: ${this.config.source_dir}`);
  }

  /**
   * Ask if user wants to customize file patterns
   * @private
   */
  async askCustomPatterns() {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'custom_patterns',
        message: 'Do you want to change which files get bundled?',
        default: false
      }
    ]);

    if (answers.custom_patterns) {
      const patternAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'include_patterns',
          message: 'Which file types to bundle? (comma-separated)',
          default: '**/*.{js,css,scss}',
          validate: (input) => {
            if (!input.trim()) {
              return 'Please specify file types to include';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'exclude_patterns',
          message: 'Which folders/files to skip? (comma-separated)',
          default: 'dist/**,collection/**,vendor/**,layout/*.js,layout/**/*.js,*.json',
          validate: (input) => {
            if (!input.trim()) {
              return 'Please specify folders/files to exclude';
            }
            return true;
          }
        }
      ]);

      // Parse comma-separated patterns into arrays
      this.config.include_patterns = patternAnswers.include_patterns
        .split(',')
        .map(p => p.trim());
      this.config.exclude_patterns = patternAnswers.exclude_patterns
        .split(',')
        .map(p => p.trim());

      logger.debug(`Include patterns: ${this.config.include_patterns.join(', ')}`);
      logger.debug(`Exclude patterns: ${this.config.exclude_patterns.join(', ')}`);
    }
  }

  /**
   * Ask for output directory
   * @private
   */
  async askOutputDir() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'output_dir',
        message: 'Output directory for bundles',
        default: 'public/dist/'
      }
    ]);

    this.config.output_dir = answers.output_dir;
    logger.debug(`Output dir: ${this.config.output_dir}`);
  }

  /**
   * Set production options (hardcoded for production builds)
   * @private
   */
  setProductionOptions() {
    this.config.hash_bundles = true;
    this.config.minify = true;
    logger.info(`Production options: Hash bundles ✓ | Minify ✓`);
    logger.debug(`Hash bundles: ${this.config.hash_bundles}`);
    logger.debug(`Minify: ${this.config.minify}`);
  }

  /**
   * Ask for Tailwind CSS configuration
   * @private
   */
  async askTailwindConfig() {
    logger.newline();
    logger.section('Tailwind CSS Configuration (Optional)');

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enableTailwind',
        message: 'Do you want to enable Tailwind CSS generation for this app?',
        default: false
      },
      {
        type: 'input',
        name: 'cappsUIPath',
        message: 'CAPPS framework location (file path or dev server URL):',
        default: '/path/to/capps or https://127.0.0.1:8080',
        when: (ans) => ans.enableTailwind,
        validate: (input) => {
          if (!input.trim()) {
            return 'Please specify CAPPS path (e.g., D:\\capps or https://localhost:8080)';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'tailwindOutputPath',
        message: 'Output directory for generated Tailwind CSS:',
        default: 'public/assets/css',
        when: (ans) => ans.enableTailwind
      },
      {
        type: 'confirm',
        name: 'useScopeWrapper',
        message: 'Wrap generated CSS in .tw-scope (for Bootstrap compatibility)?',
        default: true,
        when: (ans) => ans.enableTailwind
      },
      {
        type: 'confirm',
        name: 'verboseLogging',
        message: 'Enable verbose logging for Tailwind operations?',
        default: false,
        when: (ans) => ans.enableTailwind
      }
    ]);

    // Only add tailwind config if user enabled it
    if (answers.enableTailwind) {
      this.config.tailwind = {
        cappsUIPath: answers.cappsUIPath,
        outputPath: answers.tailwindOutputPath,
        useScopeWrapper: answers.useScopeWrapper,
        verboseLogging: answers.verboseLogging
      };

      logger.newline();
      logger.success('Tailwind CSS configuration:');
      logger.info(`  CAPPS UI path: ${answers.cappsUIPath}`);
      logger.info(`  Output path: ${answers.tailwindOutputPath}`);
      logger.info(`  Scope wrapper: ${answers.useScopeWrapper ? 'enabled' : 'disabled'}`);
      logger.info(`  Verbose logging: ${answers.verboseLogging ? 'enabled' : 'disabled'}`);
      logger.info(`  CSS source: production (default - configure in assets.json if needed)`);
    } else {
      logger.info('Tailwind CSS generation: disabled');
      logger.info('You can enable it later by running: capps-bundle init');
    }
  }

  /**
   * Create or merge assets.json
   * If assets.json exists, merge new config with existing to preserve custom entries
   * @private
   */
  async createAssetsJson() {
    const buildConfig = {
      output_dir: this.config.output_dir,
      hash_bundles: this.config.hash_bundles,
      minify: this.config.minify
    };

    // Add entry_points based on discovery mode
    if (this.config.discovery_mode === 'auto') {
      buildConfig.entry_points = 'auto';
      buildConfig.source_dir = this.config.source_dir;
      buildConfig.include_patterns = this.config.include_patterns;
      buildConfig.exclude_patterns = this.config.exclude_patterns;
    } else {
      buildConfig.entry_points = this.config.entry_points;
    }

    const newAssetsJson = {
      app_name: this.config.app_name,
      version: '1.0.0',
      description: `${this.config.app_name} - CAPPS app`,
      build: buildConfig,
      load_contexts: [
        {
          context: 'app',
          bundles: this.config.discovery_mode === 'auto' ? ['public'] : ['app'],
          load_type: 'always'
        }
      ],
      app_include_js: [],
      app_include_css: []
    };

    // Add tailwind configuration if enabled
    // Note: Generated tailwind-missing.css will be auto-loaded via manifest.json
    if (this.config.tailwind) {
      newAssetsJson.tailwind = this.config.tailwind;
    }

    const assetsJsonPath = FileUtils.getAssetsJsonPath(this.appDir);

    // If assets.json exists, merge with existing configuration
    let finalAssetsJson = newAssetsJson;
    if (FileUtils.fileExists(assetsJsonPath)) {
      try {
        const existingJson = FileUtils.readJsonFile(assetsJsonPath);
        finalAssetsJson = this.mergeAssetsJson(existingJson, newAssetsJson);
        logger.info('Merging configuration with existing assets.json...');
      } catch (error) {
        logger.warn(`Could not read existing assets.json: ${error.message}`);
        logger.info('Creating new assets.json');
      }
    }

    const content = JSON.stringify(finalAssetsJson, null, 2);
    await FileUtils.writeFile(assetsJsonPath, content);

    logger.success(`${FileUtils.fileExists(assetsJsonPath) ? 'Updated' : 'Created'} assets.json: ${assetsJsonPath}`);
  }

  /**
   * Intelligently merge existing assets.json with new configuration
   * Preserves custom entries like app_include_js, app_include_css, and load_contexts
   * @private
   * @param {Object} existing - Existing assets.json content
   * @param {Object} newConfig - New configuration from init wizard
   * @returns {Object} Merged configuration
   */
  mergeAssetsJson(existing, newConfig) {
    // Start with new config as base
    const merged = { ...newConfig };

    // Preserve existing app_include_js (user-added dependencies)
    if (existing.app_include_js && Array.isArray(existing.app_include_js) && existing.app_include_js.length > 0) {
      merged.app_include_js = existing.app_include_js;
      logger.debug(`Preserved ${existing.app_include_js.length} app_include_js entries`);
    }

    // Preserve existing app_include_css (user-added stylesheets)
    if (existing.app_include_css && Array.isArray(existing.app_include_css) && existing.app_include_css.length > 0) {
      merged.app_include_css = existing.app_include_css;
      logger.debug(`Preserved ${existing.app_include_css.length} app_include_css entries`);
    }

    // Merge load_contexts: keep new default but add any custom ones
    if (existing.load_contexts && Array.isArray(existing.load_contexts)) {
      const existingContexts = existing.load_contexts;
      const newContexts = merged.load_contexts;

      // Find custom contexts (those not in the new config)
      const customContexts = existingContexts.filter(
        ctx => !newContexts.some(nc => nc.context === ctx.context)
      );

      // Merge: new contexts + custom contexts
      if (customContexts.length > 0) {
        merged.load_contexts = [...newContexts, ...customContexts];
        logger.debug(`Merged load_contexts: ${newContexts.length} standard + ${customContexts.length} custom`);
      }
    }

    // Preserve babel_config if it exists
    if (existing.babel_config) {
      merged.babel_config = existing.babel_config;
      logger.debug('Preserved babel_config');
    }

    // Preserve tailwind configuration if it exists and wasn't explicitly updated
    if (existing.tailwind && !newConfig.tailwind) {
      merged.tailwind = existing.tailwind;
      logger.debug('Preserved existing tailwind configuration');
    }

    // Note: Tailwind CSS is auto-loaded via manifest.json, not through app_include_css
    // The bundler includes tailwind-missing.css in the manifest for automatic loading

    // Preserve any other custom top-level properties (for extensibility)
    const preservedKeys = ['app_include_js', 'app_include_css', 'load_contexts', 'babel_config', 'tailwind'];
    const customKeys = Object.keys(existing).filter(
      key => !Object.prototype.hasOwnProperty.call(merged, key) && !preservedKeys.includes(key)
    );

    if (customKeys.length > 0) {
      customKeys.forEach(key => {
        merged[key] = existing[key];
      });
      logger.debug(`Preserved custom properties: ${customKeys.join(', ')}`);
    }

    return merged;
  }

  /**
   * Create bundler-specific config (not used - CLI manages config)
   * @private
   */
  async createBundlerConfig() {
    // Bundler configs are managed by the CLI, not created in app directory
    // Apps only need assets.json
    logger.info('Bundler configuration is managed by the CLI');
  }

  /**
   * Update package.json scripts
   * @private
   */
  async updatePackageJsonScripts() {
    const packageJsonPath = path.join(this.appDir, 'package.json');

    if (!FileUtils.fileExists(packageJsonPath)) {
      logger.warn('package.json not found - skipping script updates');
      logger.info('Create package.json manually and add these scripts:');
      console.log('  "bundle:init": "capps-bundle init"');
      console.log('  "bundle:build": "capps-bundle build"');
      console.log('  "bundle:watch": "capps-bundle watch"');
      console.log('  "bundle:analyze": "capps-bundle analyze"');
      console.log('  "bundle:validate": "capps-bundle validate"');
      console.log('  "bundle:clean": "capps-bundle clean"');
      if (this.config.tailwind) {
        console.log('  "tailwind:build": "capps-bundle tailwind build"');
        console.log('  "tailwind:analyze": "capps-bundle tailwind analyze"');
      }
      return;
    }

    try {
      const packageJson = FileUtils.readJsonFile(packageJsonPath);

      // Ensure scripts object exists
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      // Add bundling scripts
      packageJson.scripts['bundle:init'] = 'capps-bundle init';
      packageJson.scripts['bundle:build'] = 'capps-bundle build';
      packageJson.scripts['bundle:watch'] = 'capps-bundle watch';
      packageJson.scripts['bundle:analyze'] = 'capps-bundle analyze';
      packageJson.scripts['bundle:validate'] = 'capps-bundle validate';
      packageJson.scripts['bundle:clean'] = 'capps-bundle clean';

      // Add Tailwind scripts if enabled
      if (this.config.tailwind) {
        packageJson.scripts['tailwind:build'] = 'capps-bundle tailwind build';
        packageJson.scripts['tailwind:analyze'] = 'capps-bundle tailwind analyze';
      }

      // Save updated package.json
      const content = JSON.stringify(packageJson, null, 2);
      await FileUtils.writeFile(packageJsonPath, content);

      logger.success('Updated package.json with bundling scripts');
    } catch (error) {
      logger.warn(`Failed to update package.json: ${error.message}`);
    }
  }

  /**
   * Print next steps
   * @private
   */
  printNextSteps() {
    logger.section('Next Steps');

    if (this.config.discovery_mode === 'auto') {
      console.log('1. Your assets are configured:');
      console.log(`   ✓ Auto-discovery enabled for: ${this.config.source_dir}/`);
      console.log('   ✓ Files matching patterns will be auto-discovered');
      console.log('   ✓ No need to manually list entry points!');
    } else {
      console.log('1. Create your source files:');
      console.log(`   ✓ Main entry point: ${this.config.entry_points.app}`);
      console.log('   ✓ Create other entry points as configured');
    }

    console.log('');
    console.log('2. Build your assets:');
    console.log('   npm run bundle:build     # Production build');
    console.log('   npm run bundle:watch     # Watch mode (auto-rebuild)');

    console.log('');
    console.log('3. Analyze and optimize:');
    console.log('   npm run bundle:analyze   # Analyze bundle sizes');
    console.log('   npm run bundle:validate  # Validate configuration');

    console.log('');
    console.log('4. Or use the CLI directly:');
    console.log('   capps-bundle build       # Production build');
    console.log('   capps-bundle watch       # Watch mode');
    console.log('   capps-bundle analyze     # Analyze bundles');
    console.log('   capps-bundle validate    # Validate config');

    if (this.config.tailwind) {
      console.log('');
      console.log('5. Generate Tailwind CSS:');
      console.log('   capps-bundle tailwind build    # Generate missing Tailwind CSS');
      console.log('   capps-bundle tailwind analyze  # Analyze CSS classes (no generation)');
    }

    console.log('');
    console.log('Important:');
    console.log('✓ Only assets.json is needed in your app');
    console.log('✓ Bundler is built into the CLI');
    console.log('✓ No bundler config files or dependencies needed');

    if (this.config.discovery_mode === 'auto') {
      console.log('✓ Assets in ' + this.config.source_dir + '/ will be auto-bundled');
    }

    if (this.config.tailwind) {
      console.log(`✓ Tailwind CSS will be generated in: ${this.config.tailwind.outputPath}`);
    }

    logger.newline();
  }
}

module.exports = InitWizard;
