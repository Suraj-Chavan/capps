/**
 * BundleAnalyzer - Analyzes bundle sizes and provides optimization recommendations
 *
 * Responsibilities:
 * - Read manifest.json
 * - Calculate bundle sizes
 * - Identify large files
 * - Provide optimization recommendations
 * - Generate analysis report
 */

const path = require('path');
const FileUtils = require('../lib/FileUtils');
const logger = require('../lib/Logger');

class BundleAnalyzer {
  constructor(appDir, outputDir) {
    this.appDir = appDir;
    this.outputDir = outputDir;
    this.manifestPath = path.join(outputDir, 'manifest.json');
    this.manifest = null;
    this.analysis = {
      bundles: {},
      summary: {
        total_size_kb: 0,
        total_files: 0,
        largest_bundle: null,
        largest_file: null,
        warnings: [],
        recommendations: []
      }
    };
  }

  /**
   * Load and analyze manifest
   * @returns {Promise<Object>} Analysis result
   */
  async analyze() {
    try {
      // Check if manifest exists
      if (!FileUtils.fileExists(this.manifestPath)) {
        throw new Error(
          `Manifest not found at ${this.manifestPath}\n\n` +
          'Run: capps-bundle build first to generate manifest'
        );
      }

      // Load manifest
      this.manifest = FileUtils.readJsonFile(this.manifestPath);

      // Analyze each bundle
      this.analyzeBundles();

      // Generate recommendations
      this.generateRecommendations();

      return this.analysis;
    } catch (error) {
      throw new Error(`Failed to analyze bundles: ${error.message}`);
    }
  }

  /**
   * Analyze individual bundles
   * @private
   */
  analyzeBundles() {
    let totalSize = 0;
    let largestBundle = { name: null, size: 0 };
    let largestFile = { name: null, size: 0, bundle: null };

    for (const [bundleName, bundle] of Object.entries(this.manifest.bundles)) {
      const bundleAnalysis = {
        files: [],
        total_size_kb: bundle.total_size_kb,
        file_count: Object.keys(bundle.files).length,
        gzip_estimate_kb: Math.round(bundle.total_size_kb * 0.3) // Rough estimate
      };

      // Analyze files in bundle
      for (const [type, file] of Object.entries(bundle.files)) {
        bundleAnalysis.files.push({
          filename: file.filename,
          type,
          size_kb: file.size_kb,
          gzip_estimate_kb: Math.round(file.size_kb * 0.3)
        });

        // Track largest file
        if (file.size_kb > largestFile.size) {
          largestFile = {
            name: file.filename,
            size: file.size_kb,
            bundle: bundleName
          };
        }
      }

      this.analysis.bundles[bundleName] = bundleAnalysis;
      totalSize += bundle.total_size_kb;

      // Track largest bundle
      if (bundle.total_size_kb > largestBundle.size) {
        largestBundle = {
          name: bundleName,
          size: bundle.total_size_kb
        };
      }
    }

    // Update summary
    this.analysis.summary.total_size_kb = Math.round(totalSize * 100) / 100;
    this.analysis.summary.total_files = this.manifest.metadata.file_count;
    this.analysis.summary.largest_bundle = largestBundle.name
      ? largestBundle
      : null;
    this.analysis.summary.largest_file = largestFile.name ? largestFile : null;
  }

  /**
   * Generate optimization recommendations
   * @private
   */
  generateRecommendations() {
    const totalSize = this.analysis.summary.total_size_kb;
    const bundles = this.analysis.bundles;

    // Check for large bundles
    for (const [name, bundle] of Object.entries(bundles)) {
      if (bundle.total_size_kb > 500) {
        this.analysis.summary.warnings.push(
          `Bundle "${name}" is large (${bundle.total_size_kb} KB). ` +
          `Consider code splitting.`
        );
      }
    }

    // Check for large files
    if (this.analysis.summary.largest_file) {
      const largestFile = this.analysis.summary.largest_file;
      if (largestFile.size > 200) {
        this.analysis.summary.warnings.push(
          `File "${largestFile.name}" is large (${largestFile.size} KB). ` +
          `Consider lazy loading or code splitting.`
        );
      }
    }

    // Generate recommendations
    if (totalSize > 1000) {
      this.analysis.summary.recommendations.push(
        'Total bundle size is large. Consider code splitting or lazy loading.'
      );
    }

    if (Object.keys(bundles).length === 1 && totalSize > 500) {
      this.analysis.summary.recommendations.push(
        'Single large bundle detected. Consider splitting into multiple bundles.'
      );
    }

    // Check gzip size
    const estimatedGzipSize = Math.round(totalSize * 0.3);
    if (estimatedGzipSize > 300) {
      this.analysis.summary.recommendations.push(
        `Gzipped size (~${estimatedGzipSize} KB) is still significant. ` +
        `Ensure proper compression is enabled on your server.`
      );
    }

    // ES module optimization
    this.analysis.summary.recommendations.push(
      'Use minification and tree-shaking to reduce bundle size.'
    );
    this.analysis.summary.recommendations.push(
      'Consider using dynamic imports for better code splitting.'
    );
  }

  /**
   * Print analysis report
   */
  printReport() {
    logger.newline();
    logger.section('Bundle Analysis Report');

    const summary = this.analysis.summary;

    // Summary stats
    console.log('Summary:');
    console.log(`  Total Size:       ${summary.total_size_kb} KB`);
    console.log(`  Estimated Gzip:   ${Math.round(summary.total_size_kb * 0.3)} KB`);
    console.log(`  Total Files:      ${summary.total_files}`);
    console.log('');

    // Bundle breakdown
    console.log('Bundle Breakdown:');
    for (const [name, bundle] of Object.entries(this.analysis.bundles)) {
      const percentage = (
        (bundle.total_size_kb / summary.total_size_kb) * 100
      ).toFixed(1);
      console.log(`  ${name}`);
      console.log(`    Size:           ${bundle.total_size_kb} KB (${percentage}%)`);
      console.log(`    Est. Gzip:      ${bundle.gzip_estimate_kb} KB`);
      console.log(`    Files:          ${bundle.file_count}`);

      // List files
      for (const file of bundle.files) {
        const filePercentage = (
          (file.size_kb / bundle.total_size_kb) * 100
        ).toFixed(1);
        console.log(
          `      - ${file.filename} (${file.size_kb} KB, ${filePercentage}%)`
        );
      }
      console.log('');
    }

    // Warnings
    if (summary.warnings.length > 0) {
      logger.warn(`Found ${summary.warnings.length} warning(s):`);
      for (const warning of summary.warnings) {
        console.log(`  ⚠ ${warning}`);
      }
      console.log('');
    }

    // Recommendations
    if (summary.recommendations.length > 0) {
      logger.info(`Optimization Recommendations (${summary.recommendations.length}):`);
      let count = 1;
      for (const rec of summary.recommendations) {
        console.log(`  ${count}. ${rec}`);
        count++;
      }
      console.log('');
    }

    logger.success('Analysis complete!');
    logger.newline();
  }

  /**
   * Get analysis result
   * @returns {Object}
   */
  getAnalysis() {
    return this.analysis;
  }

  /**
   * Get optimization tips
   * @returns {string[]}
   */
  getRecommendations() {
    return this.analysis.summary.recommendations;
  }

  /**
   * Get warnings
   * @returns {string[]}
   */
  getWarnings() {
    return this.analysis.summary.warnings;
  }
}

module.exports = BundleAnalyzer;
