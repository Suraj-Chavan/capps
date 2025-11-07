/**
 * CAPPS Bundle CLI - Main Package Export
 *
 * This module exports the CLI classes and utilities
 * for programmatic use (if needed by other packages)
 */

const CappsBundleCLI = require('./CappsBundleCLI');
const CLIBase = require('./lib/CLIBase');
const Logger = require('./lib/Logger');
const FileUtils = require('./lib/FileUtils');

// Bundler exports
const Bundler = require('./bundlers/Bundler');
const WebpackBundler = require('./bundlers/WebpackBundler');
const ViteBundler = require('./bundlers/ViteBundler');
const EsbuildBundler = require('./bundlers/EsbuildBundler');
const BundlerFactory = require('./bundlers/BundlerFactory');

// Validator exports
const ConfigValidator = require('./validators/ConfigValidator');

// Generator exports
const ManifestGenerator = require('./generators/ManifestGenerator');

// Manager exports
const PackageManager = require('./managers/PackageManager');

// Analyzer exports
const BundleAnalyzer = require('./analyzers/BundleAnalyzer');

// Wizard exports
const InitWizard = require('./wizards/InitWizard');

// Tailwind exports (migrated from tailwind-utilities-service)
const TailwindBuilder = require('./tailwind/TailwindBuilder');
const TailwindCommandHandler = require('./commands/TailwindCommandHandler');

module.exports = {
  // CLI Classes
  CappsBundleCLI,
  CLIBase,
  Logger,
  FileUtils,

  // Bundler Classes
  Bundler,
  WebpackBundler,
  ViteBundler,
  EsbuildBundler,
  BundlerFactory,

  // Validator Classes
  ConfigValidator,

  // Generator Classes
  ManifestGenerator,

  // Manager Classes
  PackageManager,

  // Analyzer Classes
  BundleAnalyzer,

  // Wizard Classes
  InitWizard,

  // Tailwind Classes
  TailwindBuilder,
  TailwindCommandHandler
};
