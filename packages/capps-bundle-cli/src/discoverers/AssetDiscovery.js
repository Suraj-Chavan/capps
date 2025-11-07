/**
 * AssetDiscovery - Auto-discovers assets in public folder (Frappe-style)
 *
 * Scans public/ folder recursively and generates entry_points automatically
 * Groups assets by type and location for intelligent bundling
 *
 * Features:
 * - Recursive folder scanning
 * - Pattern-based inclusion/exclusion
 * - Intelligent bundle naming from paths
 * - Groups JS/CSS for proper compilation
 */

const path = require('path');
const fs = require('fs');
const glob = require('glob');

class AssetDiscovery {
  constructor(appDir, options = {}) {
    this.appDir = appDir;
    this.sourceDir = options.source_dir || 'public';
    this.patterns = options.include_patterns || [
      '**/*.js',
      '**/*.css',
      '**/*.scss'
    ];
    this.excludePatterns = options.exclude_patterns || [
      'dist/**',
      'node_modules/**',
      '*.json'
    ];
    this.discovered = {
      js: [],
      css: [],
      scss: [],
      html: [],
      assets: []
    };
  }

  /**
   * Discover all assets in public folder
   * @returns {Promise<Object>} Discovered assets organized by type
   */
  async discover() {
    const sourcePath = path.join(this.appDir, this.sourceDir);

    if (!fs.existsSync(sourcePath)) {
      return {
        found: 0,
        assets: {},
        entryPoints: {}
      };
    }

    // Find all matching files
    for (const pattern of this.patterns) {
      // Convert to forward slashes for glob (glob library expects forward slashes even on Windows)
      const fullPattern = path.join(sourcePath, pattern).replace(/\\/g, '/');
      const ignorePatterns = this.excludePatterns.map(p =>
        path.join(sourcePath, p).replace(/\\/g, '/')
      );

      const files = glob.sync(fullPattern, {
        ignore: ignorePatterns
      });

      for (const file of files) {
        this.categorizeFile(file);
      }
    }

    return {
      found: this.getTotalFileCount(),
      assets: this.getAssetsByCategory(),
      entryPoints: this.generateEntryPoints()
    };
  }

  /**
   * Categorize file by extension
   * @private
   */
  categorizeFile(file) {
    const ext = path.extname(file).toLowerCase();

    switch (ext) {
      case '.js':
        this.discovered.js.push(file);
        break;
      case '.css':
        this.discovered.css.push(file);
        break;
      case '.scss':
        this.discovered.scss.push(file);
        break;
      case '.html':
      case '.htm':
        this.discovered.html.push(file);
        break;
      default:
        this.discovered.assets.push(file);
    }
  }

  /**
   * Get total count of discovered files
   * @private
   */
  getTotalFileCount() {
    return (
      this.discovered.js.length +
      this.discovered.css.length +
      this.discovered.scss.length +
      this.discovered.html.length +
      this.discovered.assets.length
    );
  }

  /**
   * Get assets organized by category
   * @private
   */
  getAssetsByCategory() {
    return {
      javascript: this.discovered.js.map(f => this.relativePath(f)),
      css: this.discovered.css.map(f => this.relativePath(f)),
      scss: this.discovered.scss.map(f => this.relativePath(f)),
      html: this.discovered.html.map(f => this.relativePath(f)),
      assets: this.discovered.assets.map(f => this.relativePath(f))
    };
  }

  /**
   * Generate entry_points from discovered assets
   * Groups files intelligently:
   * - layout/menu.js → "layout-menu"
   * - layout/style.scss → "layout-style"
   * - collection/bill/form/mfx.js → "collection-bill-form-mfx"
   * - collection/bill/form/styles.css → "collection-bill-form-styles"
   *
   * @private
   */
  generateEntryPoints() {
    const entryPoints = {};

    // Group assets by logical location
    const groups = this.groupAssetsByLocation();

    // Generate entry point for each group
    for (const [groupName, files] of Object.entries(groups)) {
      // Find the main file (prefer .js or .scss)
      const mainFile = this.selectMainFile(files);
      if (mainFile) {
        entryPoints[groupName] = mainFile;
      }
    }

    return entryPoints;
  }

  /**
   * Group assets by location (folder hierarchy)
   * Example output:
   * {
   *   "layout-menu": ["public/layout/menu.js"],
   *   "layout-styles": ["public/layout/style.scss"],
   *   "bill-form": ["public/collection/bill/form/mfx.js", "public/collection/bill/form/styles.css"]
   * }
   *
   * @private
   */
  groupAssetsByLocation() {
    const groups = {};
    const sourcePath = path.join(this.appDir, this.sourceDir);

    const allFiles = [
      ...this.discovered.js,
      ...this.discovered.css,
      ...this.discovered.scss
    ];

    for (const file of allFiles) {
      // Get path relative to APP directory (not source directory)
      // This ensures entry points include the source directory prefix (e.g., "public/layout/menu.js")
      const relativePath = path.relative(this.appDir, file);

      // For grouping, we want just the path relative to source dir
      const sourceRelativePath = path.relative(sourcePath, file);
      const parts = sourceRelativePath.split(path.sep);

      // Remove filename from parts to get folder structure
      const folders = parts.slice(0, -1);
      const filename = parts[parts.length - 1];

      // Generate group name from folder structure + filename
      const groupName = this.generateGroupName(folders, filename);

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      // Store path relative to APP directory (with source dir prefix)
      groups[groupName].push(relativePath.replace(/\\/g, '/'));
    }

    return groups;
  }

  /**
   * Generate bundle name from folder path and filename
   * Examples:
   * - folders: ['layout'], filename: 'menu.js' → 'layout-menu'
   * - folders: ['collection', 'bill', 'form'], filename: 'mfx.js' → 'collection-bill-form-mfx'
   * - folders: ['layout'], filename: 'style.scss' → 'layout-styles'
   *
   * @private
   */
  generateGroupName(folders, filename) {
    const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
    const parts = [...folders, nameWithoutExt];

    // Join with hyphens and convert to lowercase
    let groupName = parts.join('-').toLowerCase();

    // Normalize common style filename patterns
    if (nameWithoutExt.includes('style') || nameWithoutExt.includes('css')) {
      groupName = groupName.replace(/style$/, 'styles').replace(/css$/, 'styles');
    }

    return groupName;
  }

  /**
   * Select main file from grouped files
   * Priority: .js > .scss > .css
   * Reason: JS usually imports CSS/SCSS, so starting from JS bundles everything
   *
   * @private
   */
  selectMainFile(files) {
    // Prefer .js files (they usually import CSS/SCSS)
    const jsFiles = files.filter(f => f.endsWith('.js'));
    if (jsFiles.length > 0) {
      return jsFiles[0];
    }

    // Then prefer .scss over .css
    const scssFiles = files.filter(f => f.endsWith('.scss'));
    if (scssFiles.length > 0) {
      return scssFiles[0];
    }

    // Fall back to .css
    const cssFiles = files.filter(f => f.endsWith('.css'));
    if (cssFiles.length > 0) {
      return cssFiles[0];
    }

    return null;
  }

  /**
   * Get relative path from app directory
   * @private
   */
  relativePath(filePath) {
    return path.relative(this.appDir, filePath).replace(/\\/g, '/');
  }

  /**
   * Get discovery summary
   */
  getSummary() {
    return {
      total: this.getTotalFileCount(),
      javascript: this.discovered.js.length,
      scss: this.discovered.scss.length,
      css: this.discovered.css.length,
      html: this.discovered.html.length,
      other: this.discovered.assets.length
    };
  }

  /**
   * Log discovered assets
   */
  logDiscovery(logger) {
    const summary = this.getSummary();
    logger.info('📦 Asset Discovery Summary:');
    logger.info(`   Total files: ${summary.total}`);
    logger.info(`   JavaScript: ${summary.javascript}`);
    logger.info(`   SCSS: ${summary.scss}`);
    logger.info(`   CSS: ${summary.css}`);
    logger.info(`   HTML: ${summary.html}`);
    logger.info(`   Other: ${summary.other}`);
  }
}

module.exports = AssetDiscovery;
