#!/usr/bin/env node

/**
 * CAPPS Bundle CLI - Executable Entry Point
 *
 * This is the entry point for the capps-bundle command
 * Usage: capps-bundle [command] [options]
 */

const CappsBundleCLI = require('../src/CappsBundleCLI');

// Create CLI instance and run
const cli = new CappsBundleCLI({
  appDir: process.cwd(),
  debug: process.env.DEBUG === 'capps:*' || process.env.DEBUG === '*'
});

// Run with command line arguments (skip node and script name)
cli.run(process.argv.slice(2)).catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
