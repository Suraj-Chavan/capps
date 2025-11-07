/**
 * CappsBundleCLI - Main CLI class
 *
 * Orchestrates all CLI operations:
 * - Command parsing and routing
 * - App directory detection
 * - Error handling
 */

const path = require('path');
const CLIBase = require('./lib/CLIBase');
const logger = require('./lib/Logger');
const FileUtils = require('./lib/FileUtils');
const BundlerFactory = require('./bundlers/BundlerFactory');
const ConfigValidator = require('./validators/ConfigValidator');
const ManifestGenerator = require('./generators/ManifestGenerator');
const PackageManager = require('./managers/PackageManager');
const BundleAnalyzer = require('./analyzers/BundleAnalyzer');
const InitWizard = require('./wizards/InitWizard');
const TailwindCommandHandler = require('./commands/TailwindCommandHandler');

class CappsBundleCLI extends CLIBase {
  constructor(options = {}) {
    super(options);
    this.command = null;
    this.args = [];
  }

  /**
   * Main entry point for CLI
   * Parses arguments and routes to appropriate handler
   * @param {string[]} argv - Command line arguments (process.argv.slice(2))
   */
  async run(argv = []) {
    try {
      // Parse command and arguments
      this.command = argv[0] || 'help';
      this.args = argv.slice(1);

      // Check for global flags
      if (this.args.includes('--debug')) {
        this.logger.enableDebug();
      }

      this.logger.debug(`Command: ${this.command}`);
      this.logger.debug(`Arguments: ${JSON.stringify(this.args)}`);

      // Route to appropriate command handler
      switch (this.command.toLowerCase()) {
        case 'build':
          await this.handleBuild();
          break;

        case 'watch':
          await this.handleWatch();
          break;

        case 'analyze':
          await this.handleAnalyze();
          break;

        case 'validate':
          await this.handleValidate();
          break;

        case 'add-pkg':
        case 'addpkg':
          await this.handleAddPackage();
          break;

        case 'remove-pkg':
        case 'removepkg':
          await this.handleRemovePackage();
          break;

        case 'list-pkg':
        case 'listpkg':
          await this.handleListPackages();
          break;

        case 'update-pkg':
        case 'updatepkg':
          await this.handleUpdatePackages();
          break;

        case 'init':
          await this.handleInit();
          break;

        case 'clean':
          await this.handleClean();
          break;

        case 'tailwind':
          await this.handleTailwind();
          break;

        case 'help':
          this.displayHelp();
          break;

        case 'version':
          this.displayVersion();
          break;

        default:
          this.logger.error(`Unknown command: ${this.command}`);
          this.displayHelp();
          process.exit(1);
      }

      this.logger.newline();
    } catch (error) {
      this.handleError(error, '');
      process.exit(1);
    }
  }

  /**
   * Handle build command
   * @private
   */
  async handleBuild() {
    this.logger.section('CAPPS Asset Bundler - Build');

    try {
      // Check if development mode
      const isDev = this.args.includes('--dev');
      const mode = isDev ? 'development' : 'production';

      this.logger.info(`Building in ${mode} mode...`);

      // Validate app structure
      await this.validateAppStructure();

      // Load configuration
      await this.loadConfig();

      // Show app info
      this.showInfo();

      // Get bundler from configuration (defaults to Vite if not specified)
      const bundlerName = this.config.bundler;

      // Create bundler instance
      const bundler = BundlerFactory.createBundler(
        bundlerName,
        this.appDir,
        this.config,
        { debug: this.logger.debugMode }
      );

      // Run bundler build
      await bundler.build(mode);

      // Generate manifest.json (Phase 3)
      const outputDir = bundler.getOutputDir();

      // Get resolved entry_points (with auto-discovery if applicable)
      const entryPoints = await bundler.resolveEntryPoints();

      // Get bundle priority from config (if configured)
      const bundlePriority = this.config.build?.bundle_priority || [];

      const manifestGenerator = new ManifestGenerator(
        this.appDir,
        outputDir,
        entryPoints,
        bundlePriority
      );

      this.logger.newline();
      this.logger.info('Generating manifest...');
      await manifestGenerator.generate();
      await manifestGenerator.write();
      manifestGenerator.printSummary();

      this.logger.success('Build completed successfully!');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle watch command
   * @private
   */
  async handleWatch() {
    this.logger.section('CAPPS Asset Bundler - Watch Mode');

    try {
      this.logger.info('Watch mode selected');

      // Validate app structure
      await this.validateAppStructure();

      // Load configuration
      await this.loadConfig();

      this.showInfo();

      // Get bundler from configuration (auto-detected if not specified)
      const bundlerName = this.config.bundler;

      // Validate bundler name
      if (!BundlerFactory.isValidBundler(bundlerName)) {
        throw new Error(
          `Invalid bundler: "${bundlerName}"\n\n` +
          `Supported bundlers: ${BundlerFactory.getSupportedBundlers().join(', ')}`
        );
      }

      // Create bundler instance
      const bundler = BundlerFactory.createBundler(
        bundlerName,
        this.appDir,
        this.config,
        { debug: this.logger.debugMode }
      );

      // Run bundler watch
      await bundler.watch();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle analyze command
   * @private
   */
  async handleAnalyze() {
    this.logger.section('CAPPS Asset Bundler - Analyze');

    try {
      // Validate app structure
      await this.validateAppStructure();

      // Load configuration
      await this.loadConfig();

      // Get output directory using bundler (defaults to Vite if not specified)
      const bundlerName = this.config.bundler;

      // Create temporary bundler instance just to get output dir
      const bundler = BundlerFactory.createBundler(
        bundlerName,
        this.appDir,
        this.config
      );
      const outputDir = bundler.getOutputDir();

      // Analyze bundles (Phase 5)
      this.logger.newline();
      this.logger.info('Analyzing bundle sizes...');

      const analyzer = new BundleAnalyzer(this.appDir, outputDir);
      await analyzer.analyze();
      analyzer.printReport();

      this.logger.success('Analysis complete!');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle validate command
   * @private
   */
  async handleValidate() {
    this.logger.section('CAPPS Asset Bundler - Validate');

    try {
      this.logger.info('Validating configuration...');

      // Validate app structure
      await this.validateAppStructure();

      // Load config
      await this.loadConfig();

      this.showInfo();

      // Validate configuration (Phase 3)
      this.logger.newline();
      this.logger.info('Running configuration validation...');

      const validator = new ConfigValidator(this.appDir, this.config);
      const result = validator.printReport();

      if (result.valid) {
        this.logger.success('All validations passed!');
      } else {
        throw new Error('Configuration validation failed');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle add-pkg command
   * @private
   */
  async handleAddPackage() {
    this.logger.section('CAPPS Package Manager - Add Package');

    try {
      const packageSpec = this.args[0];
      if (!packageSpec) {
        throw new Error(
          'Package name required\n\n' +
          'Usage: capps-bundle add-pkg <package>\n\n' +
          'Examples:\n' +
          '  capps-bundle add-pkg lodash\n' +
          '  capps-bundle add-pkg axios@1.4.0\n' +
          '  capps-bundle add-pkg @vue/composition-api@1.7.0'
        );
      }

      const packageManager = new PackageManager(this.appDir);
      await packageManager.addPackage(packageSpec);

      this.logger.newline();
      this.logger.info('Packages directory: ' + packageManager.getPackagesDir());
      this.logger.success('Package installed successfully!');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle remove-pkg command
   * @private
   */
  async handleRemovePackage() {
    this.logger.section('CAPPS Package Manager - Remove Package');

    try {
      const packageName = this.args[0];
      if (!packageName) {
        throw new Error(
          'Package name required\n\n' +
          'Usage: capps-bundle remove-pkg <package>\n\n' +
          'Examples:\n' +
          '  capps-bundle remove-pkg lodash\n' +
          '  capps-bundle remove-pkg axios'
        );
      }

      const packageManager = new PackageManager(this.appDir);
      await packageManager.removePackage(packageName);

      this.logger.newline();
      this.logger.success('Package removed successfully!');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle list-pkg command
   * @private
   */
  async handleListPackages() {
    this.logger.section('CAPPS Package Manager - List Packages');

    try {
      const packageManager = new PackageManager(this.appDir);

      if (!packageManager.exists()) {
        this.logger.warn('No packages directory found');
        this.logger.info('Run: capps-bundle add-pkg <package> to install packages');
        return;
      }

      const packages = packageManager.listPackages();

      if (Object.keys(packages).length === 0) {
        this.logger.info('No packages installed');
      } else {
        this.logger.success(`Total: ${Object.keys(packages).length} package(s) installed`);
      }

      this.logger.newline();
      this.logger.info('Packages directory: ' + packageManager.getPackagesDir());
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle update-pkg command
   * @private
   */
  async handleUpdatePackages() {
    this.logger.section('CAPPS Package Manager - Update Packages');

    try {
      const packageManager = new PackageManager(this.appDir);

      if (!packageManager.exists()) {
        this.logger.warn('No packages directory found');
        this.logger.info('Run: capps-bundle add-pkg <package> to install packages');
        return;
      }

      // If specific packages provided, update only those
      if (this.args.length > 0) {
        await packageManager.updatePackages(this.args);
      } else {
        // Update all packages
        await packageManager.updatePackages();
      }

      this.logger.newline();
      this.logger.success('Packages updated successfully!');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle init command
   * @private
   */
  async handleInit() {
    try {
      // Run initialization wizard (Phase 7)
      const wizard = new InitWizard(this.appDir);
      await wizard.run();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle clean command
   * @private
   */
  async handleClean() {
    this.logger.section('CAPPS Asset Bundler - Clean');

    try {
      // Validate app structure
      await this.validateAppStructure();

      // Load configuration
      await this.loadConfig();

      // Get bundler to determine output directory (defaults to Vite if not specified)
      const bundlerName = this.config.bundler;

      const bundler = BundlerFactory.createBundler(
        bundlerName,
        this.appDir,
        this.config
      );
      const outputDir = bundler.getOutputDir();

      // Check if dist directory exists
      if (!FileUtils.dirExists(outputDir)) {
        this.logger.warn(`Dist directory not found: ${outputDir}`);
        this.logger.info('Nothing to clean');
        return;
      }

      // Delete dist directory
      this.logger.info(`Removing: ${outputDir}`);
      FileUtils.deleteDir(outputDir);

      this.logger.success('Cleaned dist directory');
      this.logger.newline();
      this.logger.info('Removed files:');
      console.log(`  - ${outputDir}`);
      console.log(`  - All bundled assets`);
      console.log(`  - manifest.json`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle tailwind command
   * Routes to tailwind build or analyze subcommands
   * @private
   */
  async handleTailwind() {
    const tailwindHandler = new TailwindCommandHandler({ appDir: this.appDir });

    // Parse tailwind subcommand
    const subcommand = this.args[0];
    const subcommandArgs = this.args.slice(1);

    // Parse options from subcommand args
    const options = {};
    for (let i = 0; i < subcommandArgs.length; i++) {
      const arg = subcommandArgs[i];
      if (arg === '-a' || arg === '--app') {
        options.app = subcommandArgs[++i];
      } else if (arg === '-o' || arg === '--output') {
        options.output = subcommandArgs[++i];
      } else if (arg === '-c' || arg === '--config') {
        options.config = subcommandArgs[++i];
      } else if (arg === '-e' || arg === '--existing') {
        options.existing = subcommandArgs[++i];
      } else if (arg === '-d' || arg === '--dev-server') {
        options.devServer = subcommandArgs[++i];
      } else if (arg === '-v' || arg === '--verbose') {
        options.verbose = true;
      } else if (arg === '--help') {
        tailwindHandler.displayHelp();
        return;
      }
    }

    try {
      switch ((subcommand || 'help').toLowerCase()) {
        case 'build':
          await tailwindHandler.handleBuild(options);
          break;

        case 'analyze':
          await tailwindHandler.handleAnalyze(options);
          break;

        case 'help':
          tailwindHandler.displayHelp();
          break;

        default:
          this.logger.error(`Unknown tailwind subcommand: ${subcommand}`);
          tailwindHandler.displayHelp();
          process.exit(1);
      }
    } catch (error) {
      this.handleError(error, 'Tailwind command failed:');
      process.exit(1);
    }
  }
}

module.exports = CappsBundleCLI;
