/**
 * FileUtils - File system operations utility
 *
 * Handles:
 * - Path resolution (app dir, config file paths)
 * - File reading/writing with error handling
 * - Directory creation and validation
 * - JSON file operations
 */

const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const logger = require('./Logger');

class FileUtils {
  /**
   * Resolve path relative to app directory
   * @param {string} appDir - Application directory
   * @param {string} filePath - Path to resolve
   * @returns {string} Absolute path
   */
  static resolvePath(appDir, filePath) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.resolve(appDir, filePath);
  }

  /**
   * Get path to assets.json
   * @param {string} appDir - Application directory
   * @returns {string} Path to assets.json
   */
  static getAssetsJsonPath(appDir) {
    return FileUtils.resolvePath(appDir, 'public/assets.json');
  }

  /**
   * Get path to public directory
   * @param {string} appDir - Application directory
   * @returns {string} Path to public directory
   */
  static getPublicDir(appDir) {
    return FileUtils.resolvePath(appDir, 'public');
  }

  /**
   * Get path to dist directory
   * @param {string} appDir - Application directory
   * @returns {string} Path to dist directory
   */
  static getDistDir(appDir) {
    return FileUtils.resolvePath(appDir, 'public/dist');
  }

  /**
   * Get path to packages directory
   * @param {string} appDir - Application directory
   * @returns {string} Path to packages directory
   */
  static getPackagesDir(appDir) {
    return FileUtils.resolvePath(appDir, 'public/packages');
  }

  /**
   * Read JSON file
   * @param {string} filePath - Path to JSON file
   * @returns {Object} Parsed JSON object
   * @throws {Error} If file doesn't exist or JSON is invalid
   */
  static readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Write JSON file
   * @param {string} filePath - Path to write
   * @param {Object} data - Object to write as JSON
   * @param {Object} options - Write options
   * @returns {Promise<void>}
   */
  static async writeJsonFile(filePath, data, options = {}) {
    const dirPath = path.dirname(filePath);

    try {
      // Create directory if it doesn't exist
      await fsExtra.ensureDir(dirPath);

      // Write file
      const content = JSON.stringify(data, null, options.indent || 2);
      await fs.promises.writeFile(filePath, content, 'utf-8');

      logger.debug(`Wrote JSON file: ${filePath}`);
    } catch (error) {
      throw new Error(`Failed to write JSON file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Read text file
   * @param {string} filePath - Path to file
   * @returns {string} File content
   */
  static readFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Write text file
   * @param {string} filePath - Path to write
   * @param {string} content - Content to write
   * @returns {Promise<void>}
   */
  static async writeFile(filePath, content) {
    const dirPath = path.dirname(filePath);

    try {
      await fsExtra.ensureDir(dirPath);
      await fs.promises.writeFile(filePath, content, 'utf-8');
      logger.debug(`Wrote file: ${filePath}`);
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   * @param {string} filePath - Path to check
   * @returns {boolean}
   */
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Check if directory exists
   * @param {string} dirPath - Path to check
   * @returns {boolean}
   */
  static dirExists(dirPath) {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  }

  /**
   * Create directory
   * @param {string} dirPath - Path to create
   * @returns {Promise<void>}
   */
  static async createDir(dirPath) {
    try {
      await fsExtra.ensureDir(dirPath);
      logger.debug(`Created directory: ${dirPath}`);
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Delete directory recursively
   * @param {string} dirPath - Path to delete
   * @returns {Promise<void>}
   */
  static async deleteDir(dirPath) {
    if (!FileUtils.dirExists(dirPath)) {
      return;
    }

    try {
      await fsExtra.remove(dirPath);
      logger.debug(`Deleted directory: ${dirPath}`);
    } catch (error) {
      throw new Error(`Failed to delete directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * List files in directory
   * @param {string} dirPath - Directory path
   * @param {string} pattern - Optional file pattern (e.g., '*.js')
   * @returns {string[]} Array of file names
   */
  static listFiles(dirPath, pattern = null) {
    if (!FileUtils.dirExists(dirPath)) {
      return [];
    }

    try {
      const files = fs.readdirSync(dirPath);

      if (pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return files.filter(f => regex.test(f));
      }

      return files;
    } catch (error) {
      throw new Error(`Failed to list files in ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Get file size in KB
   * @param {string} filePath - File path
   * @returns {number} Size in KB (rounded to 2 decimal places)
   */
  static getFileSizeKb(filePath) {
    if (!FileUtils.fileExists(filePath)) {
      return 0;
    }

    try {
      const stats = fs.statSync(filePath);
      // Return number, not string - toFixed() returns string so we parseFloat it
      return parseFloat((stats.size / 1024).toFixed(2));
    } catch (error) {
      return 0;
    }
  }

  /**
   * Copy file
   * @param {string} source - Source file path
   * @param {string} destination - Destination file path
   * @returns {Promise<void>}
   */
  static async copyFile(source, destination) {
    try {
      const destDir = path.dirname(destination);
      await fsExtra.ensureDir(destDir);
      await fsExtra.copy(source, destination);
      logger.debug(`Copied file: ${source} → ${destination}`);
    } catch (error) {
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  /**
   * Get relative path
   * @param {string} from - From path
   * @param {string} to - To path
   * @returns {string} Relative path
   */
  static getRelativePath(from, to) {
    return path.relative(from, to);
  }
}

module.exports = FileUtils;
