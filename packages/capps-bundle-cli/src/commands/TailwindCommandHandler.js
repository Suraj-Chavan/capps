/**
 * TailwindCommandHandler - Handles tailwind build and analyze commands
 *
 * Provides:
 * - tailwind build: Generate missing Tailwind CSS
 * - tailwind analyze: Analyze app without generating CSS
 */

const path = require('path');
const CLIBase = require('../lib/CLIBase');
const TailwindBuilder = require('../tailwind/TailwindBuilder');

class TailwindCommandHandler extends CLIBase {
  constructor(options = {}) {
    super(options);
  }

  /**
   * Handle tailwind build command
   * Scans app and generates missing Tailwind CSS
   */
  async handleBuild(options = {}) {
    this.logger.section('CAPPS Tailwind CSS Generator - Build');

    try {
      this.logger.info('Initializing Tailwind CSS generator...');

      // Load app config if available
      let appConfig = {};
      try {
        await this.loadConfig();
        appConfig = this.config;
      } catch (error) {
        this.logger.warn(`Could not load app config: ${error.message}`);
      }

      // Prepare builder options
      const builderOptions = {
        appPath: options.app ? path.resolve(options.app) : this.appDir,
        outputPath: options.output ? path.resolve(options.output) : undefined,
        configPath: options.config ? path.resolve(options.config) : undefined,
        existingCSSPath: options.existing ? path.resolve(options.existing) : undefined,
        devServerUrl: options.devServer,
        verbose: options.verbose || false,
        config: appConfig
      };

      this.logger.debug(`Building with options: ${JSON.stringify(builderOptions, null, 2)}`);

      // Create builder and run build
      const builder = new TailwindBuilder(builderOptions);
      const result = await builder.build();

      this.logger.newline();
      this.logger.success('Tailwind CSS generation completed successfully!');

      // Print statistics
      this.logger.newline();
      this.logger.info('Build Statistics:');
      console.log(`  Files scanned:       ${result.stats.filesScanned}`);
      console.log(`  Classes found:       ${result.stats.classesFound}`);
      console.log(`  Missing classes:     ${result.stats.missingClasses}`);
      console.log(`  CSS files generated: ${result.stats.cssFilesGenerated}`);

      return result;
    } catch (error) {
      this.logger.newline();
      this.logger.error(`Tailwind CSS build failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle tailwind analyze command
   * Analyzes app without generating CSS
   */
  async handleAnalyze(options = {}) {
    this.logger.section('CAPPS Tailwind CSS Generator - Analyze');

    try {
      this.logger.info('Initializing Tailwind CSS analyzer...');

      // Load app config if available
      let appConfig = {};
      try {
        await this.loadConfig();
        appConfig = this.config;
      } catch (error) {
        this.logger.warn(`Could not load app config: ${error.message}`);
      }

      // Prepare analyzer options
      const analyzerOptions = {
        appPath: options.app ? path.resolve(options.app) : this.appDir,
        devServerUrl: options.devServer,
        verbose: options.verbose || false,
        config: appConfig
      };

      this.logger.debug(`Analyzing with options: ${JSON.stringify(analyzerOptions, null, 2)}`);

      // Create analyzer and run analysis
      const analyzer = new TailwindBuilder(analyzerOptions);
      const result = await analyzer.analyze();

      this.logger.newline();
      this.logger.success('Analysis Complete!');
      this.logger.newline();
      this.logger.info('Analysis Statistics:');
      console.log(`  Files scanned:      ${result.stats.filesScanned}`);
      console.log(`  Total classes:      ${result.stats.classesFound}`);
      console.log(`  Existing classes:   ${result.stats.existingClasses}`);
      console.log(`  Missing classes:    ${result.stats.missingClasses}`);

      // Show missing classes if verbose
      if (options.verbose && result.missingClasses.length > 0) {
        this.logger.newline();
        this.logger.info('Missing Tailwind Classes:');
        const displayCount = Math.min(50, result.missingClasses.length);
        result.missingClasses.slice(0, displayCount).forEach(cls => {
          console.log(`  - ${cls}`);
        });
        if (result.missingClasses.length > displayCount) {
          console.log(`  ... and ${result.missingClasses.length - displayCount} more`);
        }
      }

      return result;
    } catch (error) {
      this.logger.newline();
      this.logger.error(`Tailwind CSS analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Display tailwind-specific help
   */
  displayHelp() {
    this.logger.newline();
    console.log('CAPPS Tailwind CSS Commands');
    console.log('');
    console.log('Usage: capps-bundle tailwind [subcommand] [options]');
    console.log('');
    console.log('Subcommands:');
    console.log('  build               Build and generate missing Tailwind CSS');
    console.log('  analyze             Analyze app without generating CSS');
    console.log('');
    console.log('Options:');
    console.log('  -a, --app <path>           Path to CAPPS application');
    console.log('  -o, --output <path>        Output directory for generated CSS');
    console.log('  -c, --config <path>        Path to tailwind.config.js');
    console.log('  -e, --existing <path>      Path to existing CSS files');
    console.log('  -d, --dev-server <url>     Dev server URL for API calls');
    console.log('  -v, --verbose              Enable verbose logging');
    console.log('  --debug                    Enable debug logging');
    console.log('');
    console.log('Examples:');
    console.log('  capps-bundle tailwind build');
    console.log('  capps-bundle tailwind build -a /path/to/app');
    console.log('  capps-bundle tailwind build -v');
    console.log('  capps-bundle tailwind analyze');
    console.log('  capps-bundle tailwind analyze -v');
    console.log('');
  }
}

module.exports = TailwindCommandHandler;
