/**
 * ManifestGenerator - Generates manifest.json for bundled assets
 *
 * Responsibilities:
 * - Read bundled files from output directory
 * - Map bundle names to hashed filenames
 * - Generate metadata (size, hash, timestamp)
 * - Create manifest.json
 * - Provide manifest for framework asset loading
 */

const path = require('path');
const crypto = require('crypto');
const glob = require('glob');
const FileUtils = require('../lib/FileUtils');
const logger = require('../lib/Logger');

class ManifestGenerator {
  constructor(appDir, outputDir, entryPoints = null, bundlePriority = null) {
    this.appDir = appDir;
    this.outputDir = outputDir;
    this.entryPoints = entryPoints; // Original entry points for mapping
    this.bundlePriority = bundlePriority || []; // Priority order for bundles

    // Calculate bundle_dir relative to public directory (since manifest.json is in public root)
    const publicDir = FileUtils.getPublicDir(appDir);
    const bundleDirRelative = path.relative(publicDir, outputDir).replace(/\\/g, '/');

    this.manifest = {
      version: 1,
      generated: new Date().toISOString(),
      assets: {},           // NEW: Maps source files to bundled files
      bundles: {},
      metadata: {
        app_dir: appDir,
        output_dir: outputDir,
        bundle_dir: bundleDirRelative, // Relative to public directory (e.g., "dist", "build")
        file_count: 0,
        total_size_kb: 0
      }
    };
  }

  /**
   * Generate manifest by scanning output directory
   * Creates both bundles and assets mappings
   * Also generates a single entry point file for optimal loading
   * @returns {Promise<Object>} Generated manifest
   */
  async generate() {
    try {
      // Check if output directory exists
      if (!FileUtils.dirExists(this.outputDir)) {
        throw new Error(`Output directory not found: ${this.outputDir}`);
      }

      // List all files in output directory recursively using glob
      const pattern = path.join(this.outputDir, '**/*').replace(/\\/g, '/');
      const files = glob.sync(pattern, { nodir: true });

      if (files.length === 0) {
        logger.warn('No bundled files found in output directory');
        return this.manifest;
      }

      // Group files by type (js, css, etc.)
      const bundleMap = new Map();

      for (const file of files) {
        const basename = path.basename(file);
        const relPath = path.relative(this.outputDir, file);

        // Extract bundle name (e.g., 'app-abc123.js' -> 'app')
        const bundleName = this.extractBundleName(basename);
        const ext = path.extname(basename);

        if (!bundleMap.has(bundleName)) {
          bundleMap.set(bundleName, []);
        }

        // Get file stats
        const sizeKb = FileUtils.getFileSizeKb(file);
        const hash = await this.calculateFileHash(file);

        bundleMap.get(bundleName).push({
          filename: basename,
          relPath: relPath,
          type: ext.substring(1), // Remove leading dot
          size_kb: sizeKb,
          hash: hash
        });
      }

      // Build manifest bundles object
      let totalSize = 0;
      for (const [bundleName, bundleFiles] of bundleMap) {
        const bundleEntry = {
          files: {},
          total_size_kb: 0
        };

        for (const file of bundleFiles) {
          const ext = file.type;
          bundleEntry.files[ext] = {
            filename: file.filename,
            path: file.relPath,
            size_kb: file.size_kb,
            hash: file.hash
          };
          bundleEntry.total_size_kb += file.size_kb;
          totalSize += file.size_kb;
        }

        this.manifest.bundles[bundleName] = bundleEntry;
      }

      // Create assets mapping if entry_points provided
      if (this.entryPoints && Object.keys(this.entryPoints).length > 0) {
        this.createAssetsMapping(bundleMap);
      }

      // Generate single entry point file that imports all bundles
      const entryPointFilename = await this.generateEntryPointFile(bundleMap);

      // Update manifest with entry_point reference (with hash for cache busting)
      this.manifest.entry_point = entryPointFilename;

      // Check if babel-config.js was generated and add to manifest
      const babelConfigPath = path.join(this.outputDir, 'babel-config.js');
      if (FileUtils.fileExists(babelConfigPath)) {
        this.manifest.babel_config_path = 'babel-config.js';
        logger.debug('Added babel-config.js to manifest');
      }

      // Update metadata
      this.manifest.metadata.file_count = files.length;
      this.manifest.metadata.total_size_kb = Math.round(totalSize * 100) / 100;
      this.manifest.generated = new Date().toISOString();

      return this.manifest;
    } catch (error) {
      throw new Error(`Failed to generate manifest: ${error.message}`);
    }
  }

  /**
   * Create assets mapping from entry_points to bundled files
   * Maps: source_file_path -> bundled_file_path
   * Example:
   *   "public/layout/menu.js" -> "layout-menu-abc123def.js"
   * @private
   */
  createAssetsMapping(bundleMap) {
    // Build a reverse lookup: bundleName -> bundleFiles
    const bundleByName = {};
    for (const [bundleName, bundleFiles] of bundleMap) {
      bundleByName[bundleName] = bundleFiles;
    }

    // For each entry point, map source to bundled file
    for (const [bundleName, sourceFile] of Object.entries(this.entryPoints)) {
      // Get the bundle files for this entry point
      const bundleFiles = bundleByName[bundleName];

      if (!bundleFiles || bundleFiles.length === 0) {
        // Entry point not found in bundles (possible if file was excluded)
        continue;
      }

      // For JS files, map to JS bundle; for CSS/SCSS, map to CSS bundle
      const sourceExt = path.extname(sourceFile).toLowerCase();
      let targetFile = null;

      for (const file of bundleFiles) {
        if (sourceExt === '.js' && file.type === 'js') {
          targetFile = file;
          break;
        } else if (['.css', '.scss'].includes(sourceExt) && file.type === 'css') {
          targetFile = file;
          break;
        }
      }

      // If no exact match, take the first file
      if (!targetFile && bundleFiles.length > 0) {
        targetFile = bundleFiles[0];
      }

      if (targetFile) {
        // Store mapping with relative path
        const relativePath = path.relative(this.appDir, sourceFile).replace(/\\/g, '/');
        const bundledPath = path.join(this.outputDir, targetFile.relPath)
          .replace(/\\/g, '/');
        const bundledRelPath = path.relative(this.appDir, bundledPath).replace(/\\/g, '/');

        this.manifest.assets[relativePath] = bundledRelPath;
      }
    }
  }

  /**
   * Sort bundles according to configured priority
   * Priority rules:
   * - Bundles listed in bundlePriority load in that order
   * - "*" wildcard catches all unlisted bundles in filesystem order
   * - Unlisted bundles (if no "*") load after priority bundles
   * @private
   * @param {Map} bundleMap - Map of bundle names to files
   * @returns {Map} Ordered Map with sorted bundles
   */
  sortBundlesByPriority(bundleMap) {
    if (!this.bundlePriority || this.bundlePriority.length === 0) {
      // No priority configured, return as-is
      return bundleMap;
    }

    const orderedMap = new Map();
    const bundleNames = new Set(bundleMap.keys());
    let wildcardIndex = -1;

    // Find wildcard position in priority
    for (let i = 0; i < this.bundlePriority.length; i++) {
      if (this.bundlePriority[i] === '*') {
        wildcardIndex = i;
        break;
      }
    }

    // Process priority list
    for (let i = 0; i < this.bundlePriority.length; i++) {
      const priority = this.bundlePriority[i];

      if (priority === '*') {
        // Add all remaining bundles in their filesystem order
        for (const bundleName of bundleNames) {
          if (!orderedMap.has(bundleName)) {
            orderedMap.set(bundleName, bundleMap.get(bundleName));
          }
        }
      } else if (bundleMap.has(priority)) {
        // Add specific bundle by name
        orderedMap.set(priority, bundleMap.get(priority));
        bundleNames.delete(priority);
      }
    }

    // If no wildcard, add any remaining bundles at the end
    if (wildcardIndex === -1) {
      for (const bundleName of bundleNames) {
        orderedMap.set(bundleName, bundleMap.get(bundleName));
      }
    }

    return orderedMap;
  }

  /**
   * Generate app-entry.js file that imports all bundles
   * This creates a single entry point for the framework to load
   * Handles both JS imports and CSS injection
   * File is created with cache-busting hash in filename
   * @private
   * @returns {Promise<string>} Hashed filename (e.g., 'app-entry-abc123.js')
   */
  async generateEntryPointFile(bundleMap) {
    try {
      const fs = require('fs');

      // Sort bundles according to priority configuration
      const sortedBundleMap = this.sortBundlesByPriority(bundleMap);

      let entryContent = `/**
 * Auto-generated Entry Point for App Assets
 * This file imports all bundled assets for the application
 * Generated by: ${new Date().toISOString()}
 *
 * The CAPPS Framework loads this single entry point,
 * which then imports all other bundles via ES module imports
 * and injects CSS stylesheets dynamically.
 */

`;

      // Collect all JS and CSS files
      const jsImports = [];
      const cssFiles = [];

      for (const [bundleName, bundleFiles] of sortedBundleMap) {
        for (const file of bundleFiles) {
          const filename = file.filename;
          const ext = file.type;

          if (ext === 'js' && !filename.includes('.map')) {
            jsImports.push(`import './${filename}';`);
          } else if (ext === 'css') {
            cssFiles.push(filename);
          }
        }
      }

      // Write JS imports
      if (jsImports.length > 0) {
        entryContent += `// JavaScript Bundles\n${jsImports.join('\n')}\n\n`;
      }

      // Write CSS injection code (CSS can't be imported as ES modules)
      if (cssFiles.length > 0) {
        entryContent += `// CSS/Style Bundles - Injected dynamically\n`;
        entryContent += `(function() {\n`;
        entryContent += `  const cssFiles = ${JSON.stringify(cssFiles)};\n`;
        entryContent += `  cssFiles.forEach(filename => {\n`;
        entryContent += `    const link = document.createElement('link');\n`;
        entryContent += `    link.rel = 'stylesheet';\n`;
        entryContent += `    link.href = new URL(filename, import.meta.url).href;\n`;
        entryContent += `    link.crossOrigin = 'anonymous';\n`;
        entryContent += `    document.head.appendChild(link);\n`;
        entryContent += `    console.debug('[App Entry Point] Loaded CSS:', filename);\n`;
        entryContent += `  });\n`;
        entryContent += `})();\n\n`;
      }

      entryContent += `console.log('[App Entry Point] All assets loaded successfully');`;

      // Calculate hash of content for cache busting
      const hash = crypto.createHash('sha256');
      hash.update(entryContent);
      const contentHash = hash.digest('hex').substring(0, 8);

      // Create filename with hash
      const hashedFilename = `app-entry-${contentHash}.js`;
      const entryPath = path.join(this.outputDir, hashedFilename);
      fs.writeFileSync(entryPath, entryContent, 'utf8');

      logger.debug(`Generated entry point: ${hashedFilename}`);
      return hashedFilename;
    } catch (error) {
      logger.warn(`Could not generate entry point file: ${error.message}`);
      // Fallback to non-hashed filename if error occurs
      return 'app-entry.js';
    }
  }

  /**
   * Extract bundle name from filename
   * e.g., 'app-abc123.js' -> 'app'
   * @private
   */
  extractBundleName(filename) {
    // Remove extension
    let name = filename.split('.')[0];

    // Remove hash (if filename contains dash and last part looks like hash)
    const parts = name.split('-');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      // Check if last part is hash-like (8 char hex)
      if (/^[a-f0-9]{8}$/i.test(lastPart)) {
        parts.pop();
        name = parts.join('-');
      }
    }

    return name;
  }

  /**
   * Calculate SHA-256 hash of file
   * @private
   */
  async calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const fs = require('fs');

      const stream = fs.createReadStream(filePath);
      stream.on('error', reject);
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => {
        resolve(hash.digest('hex').substring(0, 8)); // Use first 8 chars
      });
    });
  }

  /**
   * Write manifest to file
   * @param {string} manifestPath - Path to write manifest.json
   * @returns {Promise<void>}
   */
  async write(manifestPath = null) {
    const path = manifestPath || this.getDefaultManifestPath();

    try {
      const content = JSON.stringify(this.manifest, null, 2);
      await FileUtils.writeFile(path, content);
      logger.success(`Manifest created: ${path}`);
    } catch (error) {
      throw new Error(`Failed to write manifest: ${error.message}`);
    }
  }

  /**
   * Get default manifest path (public/manifest.json)
   * Manifest goes to public root, separate from bundled assets
   * @returns {string}
   */
  getDefaultManifestPath() {
    const publicDir = FileUtils.getPublicDir(this.appDir);
    return path.join(publicDir, 'manifest.json');
  }

  /**
   * Get current manifest
   * @returns {Object}
   */
  getManifest() {
    return this.manifest;
  }

  /**
   * Print manifest summary
   */
  printSummary() {
    logger.newline();
    logger.section('Bundle Manifest Summary');

    const bundles = this.manifest.bundles;
    const bundleCount = Object.keys(bundles).length;

    console.log(`Total Bundles: ${bundleCount}`);
    console.log(`Total Files: ${this.manifest.metadata.file_count}`);
    console.log(`Total Size: ${this.manifest.metadata.total_size_kb} KB`);
    console.log(`Generated: ${this.manifest.generated}`);
    console.log('');

    console.log('Bundles:');
    for (const [name, bundle] of Object.entries(bundles)) {
      console.log(`  ${name}`);
      for (const [type, file] of Object.entries(bundle.files)) {
        console.log(`    - ${file.filename} (${file.size_kb} KB)`);
      }
    }

    logger.newline();
  }
}

module.exports = ManifestGenerator;
