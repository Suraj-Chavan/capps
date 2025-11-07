/**
 * PackageManager - Manages NPM packages in public/packages directory
 *
 * Responsibilities:
 * - Create public/packages/package.json
 * - Install packages via npm
 * - Uninstall packages
 * - List installed packages
 * - Update packages
 * - Manage package.json entries
 */

const path = require('path');
const { execSync } = require('child_process');
const FileUtils = require('../lib/FileUtils');
const logger = require('../lib/Logger');

class PackageManager {
  constructor(appDir) {
    this.appDir = appDir;
    this.packagesDir = path.join(appDir, 'public', 'packages');
    this.packageJsonPath = path.join(this.packagesDir, 'package.json');
  }

  /**
   * Initialize packages directory and package.json
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Create packages directory if it doesn't exist
      if (!FileUtils.dirExists(this.packagesDir)) {
        FileUtils.createDir(this.packagesDir);
        logger.info(`Created packages directory: ${this.packagesDir}`);
      }

      // Create package.json if it doesn't exist
      if (!FileUtils.fileExists(this.packageJsonPath)) {
        const packageJson = {
          name: 'packages',
          version: '1.0.0',
          description: 'NPM packages for CAPPS app',
          private: true,
          dependencies: {}
        };

        await FileUtils.writeFile(
          this.packageJsonPath,
          JSON.stringify(packageJson, null, 2)
        );
        logger.success(`Created package.json: ${this.packageJsonPath}`);
      }
    } catch (error) {
      throw new Error(`Failed to initialize packages directory: ${error.message}`);
    }
  }

  /**
   * Get package.json content
   * @returns {Object} Parsed package.json
   */
  getPackageJson() {
    if (!FileUtils.fileExists(this.packageJsonPath)) {
      throw new Error(`package.json not found at ${this.packageJsonPath}`);
    }

    return FileUtils.readJsonFile(this.packageJsonPath);
  }

  /**
   * Save package.json
   * @private
   */
  async savePackageJson(packageJson) {
    await FileUtils.writeFile(
      this.packageJsonPath,
      JSON.stringify(packageJson, null, 2)
    );
  }

  /**
   * Add a package
   * @param {string} packageSpec - Package name or name@version
   * @returns {Promise<void>}
   */
  async addPackage(packageSpec) {
    try {
      if (!packageSpec) {
        throw new Error('Package name required');
      }

      // Ensure initialized
      await this.initialize();

      logger.info(`Adding package: ${packageSpec}`);

      // Install package using npm
      const command = `npm install ${packageSpec}`;
      logger.debug(`Running: ${command}`);

      execSync(command, {
        cwd: this.packagesDir,
        stdio: 'inherit'
      });

      logger.success(`Package added: ${packageSpec}`);
    } catch (error) {
      throw new Error(`Failed to add package: ${error.message}`);
    }
  }

  /**
   * Remove a package
   * @param {string} packageName - Package name (without version)
   * @returns {Promise<void>}
   */
  async removePackage(packageName) {
    try {
      if (!packageName) {
        throw new Error('Package name required');
      }

      // Ensure initialized
      await this.initialize();

      logger.info(`Removing package: ${packageName}`);

      // Uninstall package using npm
      const command = `npm uninstall ${packageName}`;
      logger.debug(`Running: ${command}`);

      execSync(command, {
        cwd: this.packagesDir,
        stdio: 'inherit'
      });

      logger.success(`Package removed: ${packageName}`);
    } catch (error) {
      throw new Error(`Failed to remove package: ${error.message}`);
    }
  }

  /**
   * List installed packages
   * @returns {Object} Installed packages with versions
   */
  listPackages() {
    try {
      const packageJson = this.getPackageJson();
      const dependencies = packageJson.dependencies || {};

      if (Object.keys(dependencies).length === 0) {
        logger.info('No packages installed');
        return {};
      }

      logger.newline();
      logger.info('Installed Packages:');
      logger.newline();

      for (const [name, version] of Object.entries(dependencies)) {
        console.log(`  ${name}@${version}`);
      }

      logger.newline();
      return dependencies;
    } catch (error) {
      throw new Error(`Failed to list packages: ${error.message}`);
    }
  }

  /**
   * Update all packages or specific packages
   * @param {string[]} packageNames - Optional specific packages to update
   * @returns {Promise<void>}
   */
  async updatePackages(packageNames = null) {
    try {
      // Ensure initialized
      await this.initialize();

      if (packageNames && packageNames.length > 0) {
        logger.info(`Updating packages: ${packageNames.join(', ')}`);
        const command = `npm update ${packageNames.join(' ')}`;
        logger.debug(`Running: ${command}`);

        execSync(command, {
          cwd: this.packagesDir,
          stdio: 'inherit'
        });

        logger.success(`Packages updated: ${packageNames.join(', ')}`);
      } else {
        logger.info('Updating all packages');
        const command = 'npm update';
        logger.debug(`Running: ${command}`);

        execSync(command, {
          cwd: this.packagesDir,
          stdio: 'inherit'
        });

        logger.success('All packages updated');
      }
    } catch (error) {
      throw new Error(`Failed to update packages: ${error.message}`);
    }
  }

  /**
   * Get packages directory path
   * @returns {string}
   */
  getPackagesDir() {
    return this.packagesDir;
  }

  /**
   * Get package.json path
   * @returns {string}
   */
  getPackageJsonPath() {
    return this.packageJsonPath;
  }

  /**
   * Check if packages directory exists
   * @returns {boolean}
   */
  exists() {
    return FileUtils.dirExists(this.packagesDir) &&
           FileUtils.fileExists(this.packageJsonPath);
  }
}

module.exports = PackageManager;
