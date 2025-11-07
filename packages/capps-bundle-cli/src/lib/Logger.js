/**
 * Logger - Centralized logging utility
 *
 * Provides colored console output with consistent formatting
 * Used throughout CLI for transparency and debugging
 */

let chalk;
try {
  chalk = require('chalk');
} catch (e) {
  // Fallback if chalk not available
  chalk = {
    blue: (str) => str,
    green: (str) => str,
    yellow: (str) => str,
    red: (str) => str,
    gray: (str) => str,
    cyan: (str) => str,
    bold: { cyan: (str) => str }
  };
}

class Logger {
  constructor(options = {}) {
    this.prefix = options.prefix || '[CAPPS Bundle]';
    this.debugMode = options.debug || false;
    this.silent = options.silent || false;
  }

  /**
   * Info level - general information (blue)
   */
  info(message, ...args) {
    if (this.silent) return;
    console.log(chalk.blue(`${this.prefix} ℹ ${message}`), ...args);
  }

  /**
   * Success level - operation succeeded (green)
   */
  success(message, ...args) {
    if (this.silent) return;
    console.log(chalk.green(`${this.prefix} ✓ ${message}`), ...args);
  }

  /**
   * Warning level - something might be wrong (yellow)
   */
  warn(message, ...args) {
    if (this.silent) return;
    console.warn(chalk.yellow(`${this.prefix} ⚠ ${message}`), ...args);
  }

  /**
   * Error level - operation failed (red)
   */
  error(message, ...args) {
    if (this.silent) return;
    console.error(chalk.red(`${this.prefix} ✗ ${message}`), ...args);
  }

  /**
   * Debug level - detailed info for debugging (gray)
   * Only shown if debug flag is enabled
   */
  debug(message, ...args) {
    if (!this.debugMode || this.silent) return;
    console.log(chalk.gray(`${this.prefix} → ${message}`), ...args);
  }

  /**
   * Section header - visually separate sections (bold cyan)
   */
  section(title) {
    if (this.silent) return;
    console.log('\n' + chalk.bold.cyan(`${'='.repeat(80)}`));
    console.log(chalk.bold.cyan(`${title}`));
    console.log(chalk.bold.cyan(`${'='.repeat(80)}\n`));
  }

  /**
   * Table format - display data in table
   */
  table(data) {
    if (this.silent) return;
    console.table(data);
  }

  /**
   * New line for spacing
   */
  newline(count = 1) {
    for (let i = 0; i < count; i++) {
      console.log('');
    }
  }

  /**
   * Enable debug mode
   */
  enableDebug() {
    this.debugMode = true;
  }

  /**
   * Disable silent mode to show logs
   */
  unmute() {
    this.silent = false;
  }

  /**
   * Enable silent mode to suppress logs
   */
  mute() {
    this.silent = true;
  }
}

// Create singleton instance
const loggerInstance = new Logger({
  prefix: chalk.cyan('[CAPPS Bundle]'),
  debug: process.env.DEBUG === 'capps:*' || process.env.DEBUG === '*'
});

// Export singleton instance as default
module.exports = loggerInstance;

// Also export class for custom instances
module.exports.Logger = Logger;
