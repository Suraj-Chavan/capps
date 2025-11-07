/**
 * TailwindBuilder - Tailwind CSS generation for CAPPS applications
 *
 * Migrated from tailwind-utilities-service with full feature set
 * Configuration loaded from assets.json (capps-bundle)
 *
 * Configuration via assets.json:
 * {
 *   "tailwind": {
 *     "cappsUIPath": "D:\\...\\ui\\capps",    // Path to CAPPS framework
 *     "outputPath": "public/assets/css",      // Where to save generated CSS
 *     "cssSource": "production",              // OPTIONAL: 'production' (default) or 'development'
 *     "useScopeWrapper": true,                // Wrap CSS in .tw-scope selector
 *     "verboseLogging": false                 // Enable debug output
 *   }
 * }
 *
 * Default Behavior:
 * - cssSource defaults to 'production' (scans CAPPS framework dist/css)
 * - Set cssSource: 'development' in assets.json to scan public/css instead
 *
 * Features:
 * - Scan CAPPS apps for CSS classes
 * - Generate missing Tailwind CSS using Tailwind CLI
 * - Filter and scope-wrap generated CSS
 * - Load CSS from filesystem or dev server
 * - Analyze app without generating CSS
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const Logger = require('../lib/Logger').Logger;

class TailwindBuilder {
  constructor(options = {}) {
    // Configuration from assets.json passed via options
    const appConfig = options.config || {};
    const tailwindConfig = appConfig.tailwind || {};

    // Initialize logger
    this.logger = new Logger({
      prefix: chalk.cyan('[Tailwind]'),
      debug: options.verbose || tailwindConfig.verboseLogging || false
    });

    // App paths
    this.appPath = path.normalize(
      options.appPath ||
      this.getDefaultAppPath()
    );

    // Store CAPPS UI path separately (for accessing core CSS)
    this.cappsUIPath = path.normalize(
      options.cappsUIPath ||
      tailwindConfig.cappsUIPath ||
      path.resolve(process.cwd(), '../../../Apps/ui/capps')
    );

    this.devServerUrl = options.devServerUrl ||
                       tailwindConfig.devServerUrl ||
                       this.getDefaultDevServerUrl();

    this.outputPath = options.outputPath ||
                     path.join(this.appPath, tailwindConfig.outputPath || 'public/assets/css');

    this.configPath = options.configPath ||
                     path.join(this.appPath, 'tailwind.config.js');

    this.existingCSSPath = options.existingCSSPath ||
                          path.join(this.appPath, 'public');

    this.verbose = options.verbose !== undefined ? options.verbose :
                  (tailwindConfig.verboseLogging || false);

    this.cssSource = tailwindConfig.cssSource || 'production';
    this.useScopeWrapper = tailwindConfig.useScopeWrapper !== false;

    // Store full config for reference
    this.config = appConfig;
    this.appName = path.basename(path.normalize(this.appPath));

    // Get build output directory from config (default: public/dist)
    this.buildOutputDir = options.buildOutputDir ||
                         (appConfig.build && appConfig.build.output_dir) ||
                         'public/dist';

    // Statistics
    this.stats = {
      filesScanned: 0,
      classesFound: 0,
      tailwindClasses: 0,
      missingClasses: 0,
      existingClasses: 0,
      cssFilesGenerated: 0
    };
  }

  /**
   * Get default app path (current directory or CAPPS core)
   */
  getDefaultAppPath() {
    const cwd = process.cwd();

    // Check if current directory is a CAPPS app
    const packageJsonPath = path.join(cwd, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.name &&
            (packageJson.name.includes('capps') ||
             (packageJson.dependencies && packageJson.dependencies.vue))) {
          return cwd;
        }
      } catch (error) {
        // Ignore parse errors
      }
    }

    // Fallback to CAPPS UI core
    return path.resolve(cwd, '../../../Apps/ui/capps');
  }

  /**
   * Get default dev server URL
   */
  getDefaultDevServerUrl() {
    return 'https://localhost:8888';
  }


  /**
   * Scan application files for CSS classes
   */
  async scanApplicationFiles() {
    this.logger.info(`Starting CAPPS application file scan for: ${this.appName}`);

    const patterns = [
      'public/**/*.html',
      'public/**/*.js',
      'public/**/*.css',
      'public/**/*.vue',
      'src/**/*.vue',
      'src/**/*.js',
      'config/**/*.js',
      'rest/**/*.js',
      'pages/**/*.njk',
      'pages/**/*.html',
      '*.js',
      '*.html',
      '*.njk'
    ];

    // Dynamically add build output directory from config
    const ignorePatterns = [
      'node_modules/**',
      'public/assets/css/**',
      '.git/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      `${this.buildOutputDir}/**`,  // Exclude bundled output directory
      '*.min.js',
      '*.bundle.js',
      'e2e/**'
    ];

    let allClasses = new Set();
    let allFiles = [];

    for (const pattern of patterns) {
      try {
        const files = glob.sync(pattern, {
          cwd: this.appPath,
          ignore: ignorePatterns,
          absolute: true
        });
        allFiles.push(...files);
      } catch (error) {
        this.logger.warn(`Error scanning pattern ${pattern}: ${error.message}`);
      }
    }

    this.logger.debug(`Found ${allFiles.length} files to scan`);

    for (const filePath of allFiles) {
      try {
        await this.scanFile(filePath, allClasses);
        this.stats.filesScanned++;
      } catch (error) {
        this.logger.warn(`Error scanning ${filePath}: ${error.message}`);
      }
    }

    this.stats.classesFound = allClasses.size;
    this.logger.info(
      `Scanned ${this.stats.filesScanned} files, found ${this.stats.classesFound} unique CSS classes`
    );

    return Array.from(allClasses);
  }

  /**
   * Scan a single file for CSS classes
   */
  async scanFile(filePath, classSet) {
    const ext = path.extname(filePath).toLowerCase();
    const content = await fs.readFile(filePath, 'utf8');

    this.logger.debug(`Scanning: ${path.relative(this.appPath, filePath)}`);

    let extractedClasses = [];

    switch (ext) {
      case '.html':
        extractedClasses = this.extractFromHTML(content);
        break;
      case '.njk':
        // Nunjucks templates can contain JSX, so extract with JS regex patterns
        extractedClasses = this.extractFromJS(content);
        break;
      case '.vue':
        extractedClasses = this.extractFromVue(content);
        break;
      case '.js':
      case '.jsx':
      case '.ts':
      case '.tsx':
        extractedClasses = this.extractFromJS(content);
        break;
      default:
        extractedClasses = this.extractFromHTML(content);
    }

    extractedClasses.forEach(cls => classSet.add(cls));
    return extractedClasses;
  }

  /**
   * Extract classes from HTML content
   */
  extractFromHTML(content) {
    const classes = [];
    const classRegex = /class\s*=\s*["']([^"']+)["']/gi;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      const classList = match[1].trim().split(/\s+/);
      classes.push(...classList);
    }

    return [...new Set(classes)];
  }

  /**
   * Extract classes from Vue files
   */
  extractFromVue(content) {
    let classes = [];

    // Template section
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    if (templateMatch) {
      classes.push(...this.extractFromHTML(templateMatch[1]));
    }

    // Script section
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      classes.push(...this.extractFromJS(scriptMatch[1]));
    }

    // Style section
    const styleMatches = content.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
    if (styleMatches) {
      styleMatches.forEach(style => {
        classes.push(...this.extractFromCSS(style));
      });
    }

    return [...new Set(classes)];
  }

  /**
   * Extract classes from JavaScript content
   */
  extractFromJS(content) {
    const classes = [];

    // First: Extract className attributes with template literals (including multi-line)
    // This handles: className={`...`} and className={`${...} ...`}
    const classNameLiterals = /className\s*=\s*{?\s*`([\s\S]*?)`\s*}?/g;
    let match;
    while ((match = classNameLiterals.exec(content)) !== null) {
      const literalContent = match[1];
      // Extract all space-separated class names from the literal
      // This handles both plain strings and template expressions
      const classMatches = literalContent.match(/[a-z][\w\-:]*(?:\.[0-9]+)?(?:\/[\w.\-]+)?/gi);
      if (classMatches) {
        classes.push(...classMatches);
      }
    }

    const patterns = [
      /(?:class|className)(?:Name)?(?:\s*[:=]\s*["'`])([^"'`]+)["'`]/gi,
      /classList\.(?:add|remove|toggle)\s*\(\s*["'`]([^"'`]+)["'`]/g,
      /class(?:Name)?[^=]*=\s*["'`]([^"'`]+)["'`]/g,
      /(?:template|html|content)\s*[:=]\s*`([^`]*class\s*=\s*["']([^"']*?)["'][^`]*)`/gs,
      /add_html\s*\([^,]*,\s*["'`]([^"'`]*class\s*=\s*["']([^"']*?)["'][^"'`]*)["'`]/gs,
      /<[^>]+class\s*=\s*["']([^"']*?)["'][^>]*>/g,
      /["'`]\s*([a-z][\w-]*(?:\.[0-9]+)?(?:\/[\w.]+)?(?:\s+[a-z][\w-]*(?:\.[0-9]+)?(?:\/[\w.]+)?)*)\s*["'`]/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        let classString = '';

        if (pattern.source.includes('template|html|content') || pattern.source.includes('add_html')) {
          classString = match[2] || match[1];
        } else if (pattern.source.includes('<[^>]+class')) {
          classString = match[1];
        } else {
          classString = match[1];
        }

        if (classString && classString.trim()) {
          const classList = classString.trim().split(/\s+/).filter(cls => cls && cls.length > 0);
          classes.push(...classList);
        }
      }
    });

    return [...new Set(classes)];
  }

  /**
   * Extract classes from CSS content
   */
  extractFromCSS(content) {
    const classes = [];
    const classRegex = /\.([a-zA-Z][a-zA-Z0-9_\-]*(?:\[[^\]]+\])*)/g;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      classes.push(match[1]);
    }

    return [...new Set(classes)];
  }

  /**
   * Locate CAPPS CSS bundles across environment
   */
  async locateCAPPSCSSBundles() {
    const cssPaths = [];

    this.logger.info(`CSS discovery mode: ${this.cssSource}`);

    // Find CAPPS UI path
    const possibleCAPPSUIPaths = [
      path.resolve(this.appPath, '../ui/capps'),
      path.resolve(this.appPath, '../../ui/capps'),
      path.resolve(this.appPath, '../../../Apps/ui/capps'),
      path.resolve(process.cwd(), '../Apps/ui/capps'),
      path.resolve(process.cwd(), 'Apps/ui/capps'),
      'D:\\credence\\Servers\\Funds\\Apps\\ui\\capps'
    ];

    let cappsUIPath = null;
    for (const testPath of possibleCAPPSUIPaths) {
      if (await fs.pathExists(testPath)) {
        cappsUIPath = testPath;
        this.logger.debug(`Found CAPPS UI at: ${cappsUIPath}`);
        break;
      }
    }

    if (!cappsUIPath) {
      this.logger.warn('Warning: Could not locate CAPPS UI directory');
      return cssPaths;
    }

    if (this.cssSource === 'production') {
      const cappsDistPath = path.join(cappsUIPath, 'dist/css');
      if (await fs.pathExists(cappsDistPath)) {
        const distFiles = glob.sync('*.css', { cwd: cappsDistPath, absolute: true });
        cssPaths.push(...distFiles);
        this.logger.debug(`Found CAPPS UI production CSS: ${distFiles.length} files`);
      }

      const cappsPublicPath = path.join(cappsUIPath, 'public/css');
      if (await fs.pathExists(cappsPublicPath)) {
        const publicFiles = glob.sync('*.css', { cwd: cappsPublicPath, absolute: true });
        cssPaths.push(...publicFiles);
        this.logger.debug(`Found CAPPS UI public CSS: ${publicFiles.length} files`);
      }
    } else {
      const cappsPublicPath = path.join(cappsUIPath, 'public/css');
      if (await fs.pathExists(cappsPublicPath)) {
        const publicFiles = glob.sync('*.css', { cwd: cappsPublicPath, absolute: true });
        cssPaths.push(...publicFiles);
        this.logger.debug(`Found CAPPS UI development CSS: ${publicFiles.length} files`);
      }

      const srcAssetsPath = path.join(cappsUIPath, 'src/assets/css');
      if (await fs.pathExists(srcAssetsPath)) {
        const srcFiles = glob.sync('*.css', { cwd: srcAssetsPath, absolute: true });
        cssPaths.push(...srcFiles);
        this.logger.debug(`Found CAPPS UI source CSS: ${srcFiles.length} files`);
      }
    }

    // App-specific CSS
    const appPublicPath = path.join(this.appPath, 'public');
    if (await fs.pathExists(appPublicPath)) {
      const appFiles = glob.sync('**/*.css', {
        cwd: appPublicPath,
        absolute: true,
        ignore: ['**/tailwind-css/**', '**/tailwind-missing.css', '**/tailwind-missing.scss']
      });
      cssPaths.push(...appFiles);
      this.logger.debug(`Found app-specific CSS: ${appFiles.length} files`);
    }

    return [...new Set(cssPaths)];
  }

  /**
   * Load CSS from filesystem
   */
  async loadCSSFromFilesystem() {
    const cssFiles = await this.locateCAPPSCSSBundles();

    if (cssFiles.length === 0) {
      this.logger.warn('No existing CSS bundles found - will generate all classes');
      return new Set();
    }

    const existingClasses = new Set();

    for (const cssFile of cssFiles) {
      try {
        const content = await fs.readFile(cssFile, 'utf8');
        const classes = this.extractFromCSS(content);
        classes.forEach(cls => existingClasses.add(cls));
        this.logger.debug(
          `Loaded ${classes.length} classes from: ${path.relative(this.appPath, cssFile)}`
        );
      } catch (error) {
        this.logger.warn(`Error reading CSS file ${cssFile}: ${error.message}`);
      }
    }

    return existingClasses;
  }

  /**
   * Fetch URL content (for dev server CSS loading)
   */
  async fetchURL(url) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const http = require('http');
      const urlLib = require('url');

      const parsedUrl = urlLib.parse(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const options = {
        ...parsedUrl,
        rejectUnauthorized: false
      };

      client.get(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Load CSS from dev server
   */
  async loadCSSFromDevServer() {
    const devServerUrl = this.devServerUrl;
    const cssPaths = ['/css/app.css', '/css/chunk-vendors.css'];

    this.logger.info(`Fetching CSS from dev server: ${devServerUrl}`);

    const existingClasses = new Set();

    for (const cssPath of cssPaths) {
      try {
        const fullUrl = devServerUrl + cssPath;
        this.logger.debug(`Fetching: ${fullUrl}`);

        const content = await this.fetchURL(fullUrl);
        const classes = this.extractFromCSS(content);
        classes.forEach(cls => existingClasses.add(cls));

        this.logger.debug(`Loaded ${classes.length} classes from: ${cssPath}`);
      } catch (error) {
        this.logger.warn(`Error fetching CSS from ${cssPath}: ${error.message}`);
      }
    }

    return existingClasses;
  }

  /**
   * Load existing CSS classes to avoid duplication
   */
  async loadExistingCSS() {
    this.logger.info('Loading existing CSS bundles...');

    // Check if this is CAPPS core
    const isCAPPSCore = this.appName === 'capps' ||
                       this.appPath.includes('Apps/ui/capps') ||
                       this.appPath.includes('Apps\\ui\\capps');

    if (isCAPPSCore) {
      this.logger.info('Building CAPPS core - generating all classes');
      return new Set();
    }

    // Load classes from CAPPS core's centralized Tailwind CSS file
    try {
      const possiblePaths = [
        path.resolve(this.appPath, '../ui/capps'),
        path.resolve(this.appPath, '../../ui/capps'),
        path.resolve(this.appPath, '../../../Apps/ui/capps'),
        'D:/credence/Servers/Funds/Apps/ui/capps',
        'D:\\credence\\Servers\\Funds\\Apps\\ui\\capps'
      ];

      for (const cappsPath of possiblePaths) {
        // Look for centralized Tailwind CSS in dist/css/tailwind/
        const tailwindCSSDir = path.join(cappsPath, 'dist/css/tailwind');

        if (await fs.pathExists(tailwindCSSDir)) {
          // Find tailwind.*.css files (with contenthash)
          const tailwindCSSFiles = glob.sync('tailwind.*.css', {
            cwd: tailwindCSSDir,
            absolute: true
          });

          if (tailwindCSSFiles.length > 0) {
            // Use the most recent file (in case multiple exist)
            const tailwindCSSPath = tailwindCSSFiles[tailwindCSSFiles.length - 1];
            const content = await fs.readFile(tailwindCSSPath, 'utf8');
            const coreClasses = new Set(this.extractFromCSS(content));

            this.logger.info(
              `Loaded ${coreClasses.size} classes from CAPPS core centralized Tailwind CSS (${path.relative(cappsPath, tailwindCSSPath)})`
            );
            return coreClasses;
          }
        }
      }

      this.logger.info('CAPPS core centralized Tailwind CSS not found, generating all classes for this app');
      return new Set();
    } catch (error) {
      this.logger.warn(`Error loading CAPPS core classes: ${error.message}`);
      return new Set();
    }
  }

  /**
   * Detect missing classes (not in CAPPS core)
   */
  async detectMissingClasses(allClasses, existingClasses, options = {}) {
    this.logger.info('Analyzing classes and detecting missing Tailwind utilities...');

    const missingClasses = allClasses.filter(cls => !existingClasses.has(cls));
    const existingInCore = allClasses.filter(cls => existingClasses.has(cls));

    this.stats.classesFound = allClasses.length;
    this.stats.missingClasses = missingClasses.length;
    this.stats.existingClasses = existingInCore.length;

    this.logger.info(`Total classes found: ${this.stats.classesFound}`);
    this.logger.success(`Already in CAPPS core: ${this.stats.existingClasses}`);
    this.logger.warn(`Missing from core: ${this.stats.missingClasses}`);

    if (this.verbose && missingClasses.length > 0) {
      const displayClasses = missingClasses.slice(0, 20).join(', ');
      const suffix = missingClasses.length > 20 ? '...' : '';
      this.logger.debug(`Missing classes: ${displayClasses}${suffix}`);
    }

    return missingClasses;
  }

  /**
   * Create dummy HTML file with missing classes for Tailwind to process
   */
  createDummyHTML(classes) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CAPPS Tailwind Classes - ${this.appName}</title>
</head>
<body>
    <!-- Auto-generated dummy HTML for Tailwind CSS content scanning -->
    <!-- App: ${this.appName} -->
    <!-- Generated: ${new Date().toISOString()} -->
    <!-- Classes found in CAPPS app files but missing from existing CSS bundles -->
    ${classes.map(cls => `    <div class="${cls}"></div>`).join('\n')}
</body>
</html>`;
  }

  /**
   * Filter generated CSS to only include requested classes and wrap in scope
   */
  filterGeneratedCSS(generatedCSS, requestedClasses) {
    const lines = generatedCSS.split('\n');
    const requestedSet = new Set(requestedClasses);
    const generatedClassNames = [];

    const headerLines = [];
    const themeLines = [];
    const utilityLines = [];
    const propertyLines = [];
    const keyframesLines = [];
    const layerPropertiesLines = [];

    let insideClassRule = false;
    let currentClassName = null;
    let classRuleLines = [];
    let classRuleBraceDepth = 0;
    let insideRootHost = false;
    let insideProperty = false;
    let insideKeyframes = false;
    let insideLayerProperties = false;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceDepth += openBraces - closeBraces;

      if (
        line.startsWith('/*!') ||
        line.startsWith('/*') ||
        line.startsWith('@layer properties;')
      ) {
        headerLines.push(line);
        continue;
      }

      if (line.match(/^:root,\s*:host\s*{/) || insideRootHost) {
        themeLines.push(line);
        if (!insideRootHost) insideRootHost = true;
        if (line.trim() === '}' && braceDepth === 0) {
          insideRootHost = false;
        }
        continue;
      }

      if (line.startsWith('@property') || insideProperty) {
        propertyLines.push(line);
        if (!insideProperty) insideProperty = true;
        if (line.trim() === '}' && braceDepth === 0) {
          insideProperty = false;
        }
        continue;
      }

      if (line.startsWith('@keyframes') || insideKeyframes) {
        keyframesLines.push(line);
        if (!insideKeyframes) insideKeyframes = true;
        if (line.trim() === '}' && braceDepth === 0) {
          insideKeyframes = false;
        }
        continue;
      }

      if (line.startsWith('@layer properties') || insideLayerProperties) {
        layerPropertiesLines.push(line);
        if (!insideLayerProperties) insideLayerProperties = true;
        if (line.trim() === '}' && braceDepth === 0) {
          insideLayerProperties = false;
        }
        continue;
      }

      const classMatch = line.match(/^\.([a-zA-Z0-9_:-]+(?:\\[^\s]+)*)\s*{/);
      if (classMatch || insideClassRule) {
        if (classMatch && !insideClassRule) {
          insideClassRule = true;
          currentClassName = classMatch[1].replace(/\\/g, '');
          classRuleLines = [line];
          classRuleBraceDepth = 1;
        } else if (insideClassRule) {
          classRuleLines.push(line);

          const openBraces = (line.match(/{/g) || []).length;
          const closeBraces = (line.match(/}/g) || []).length;
          classRuleBraceDepth += openBraces - closeBraces;

          if (classRuleBraceDepth === 0) {
            if (requestedSet.has(currentClassName)) {
              utilityLines.push(...classRuleLines);
              generatedClassNames.push(currentClassName);
            }
            insideClassRule = false;
            currentClassName = null;
            classRuleLines = [];
          }
        }
        continue;
      }

      if (line.trim() === '') {
        continue;
      }
    }

    const finalLines = [];

    finalLines.push(...headerLines);
    finalLines.push(...themeLines);

    // Wrap utilities in .tw-scope if enabled
    if (this.useScopeWrapper && utilityLines.length > 0) {
      finalLines.push('.tw-scope {');
      // Indent utility lines for SCSS nesting
      const indentedLines = utilityLines.map(line => '  ' + line);
      finalLines.push(...indentedLines);
      finalLines.push('}');
    } else if (utilityLines.length > 0) {
      finalLines.push(...utilityLines);
    }

    finalLines.push(...propertyLines);
    finalLines.push(...keyframesLines);
    finalLines.push(...layerPropertiesLines);

    return {
      filteredCSS: finalLines.join('\n'),
      generatedClasses: generatedClassNames,
      requestedClasses: requestedClasses.length
    };
  }

  /**
   * Run Tailwind CLI to generate CSS
   */
  async runTailwindCLI(contentFile, outputFile, missingClasses) {
    try {
      this.logger.debug('Generating CSS for specific classes using Tailwind CSS v4...');

      const htmlContent = await fs.readFile(contentFile, 'utf8');
      console.log(`[CAPPS Tailwind] Content file contains ${htmlContent.length} chars`);

      const postcss = require('postcss');
      const tailwindcss = require('@tailwindcss/postcss');

      const normalizedContentFile = contentFile.replace(/\\/g, '/');

      // Check if this is CAPPS core - only CAPPS core should include theme in output
      const isCAPPSCore = this.appName === 'capps' ||
                         this.appPath.includes('Apps/ui/capps') ||
                         this.appPath.includes('Apps\\ui\\capps');

      // Always include theme for generation (so color utilities can be generated with theme awareness)
      // For CAPPS core: output includes theme + utilities
      // For apps: output includes only utilities (theme is filtered out)
      const inputCSS = `@import 'tailwindcss/theme';
@import 'tailwindcss/utilities';
@source "${normalizedContentFile}";`;

      this.logger.debug(`Processing CSS with Tailwind v4... (${isCAPPSCore ? 'theme + utilities in output' : 'utilities only, theme filtered'})`);

      const cliDirectory = path.dirname(__filename);
      const result = await postcss([tailwindcss()]).process(inputCSS, {
        from: path.join(cliDirectory, 'virtual.css'),
        to: outputFile
      });

      if (!result.css || result.css.length === 0) {
        console.error(`[CAPPS Tailwind] PostCSS returned empty CSS result!`);
        throw new Error('PostCSS generated empty CSS result');
      }

      console.log(`[CAPPS Tailwind] Generated CSS size: ${result.css.length} bytes`);

      // Filter and scope wrap
      let { filteredCSS, generatedClasses, requestedClasses } =
        this.filterGeneratedCSS(result.css, missingClasses);

      // For non-CAPPS apps, remove theme layer from output to avoid duplication
      if (!isCAPPSCore) {
        filteredCSS = this.removeThemeLayerFromCSS(filteredCSS);
      }

      console.log(
        `[CAPPS Tailwind] Requested ${requestedClasses} classes, Tailwind generated ${generatedClasses.length} valid classes`
      );

      await fs.writeFile(outputFile, filteredCSS);

      this.logger.debug(`Generated CSS written to: ${outputFile}`);
      this.logger.debug(
        `Filtered CSS size: ${filteredCSS.length} bytes (original: ${result.css.length} bytes)`
      );

      return {
        generatedClasses: generatedClasses,
        requestedClasses: requestedClasses,
        outputFile: outputFile
      };
    } catch (error) {
      console.error(`[CAPPS Tailwind] PostCSS generation failed: ${error.message}`);
      console.error(`[CAPPS Tailwind] Stack: ${error.stack}`);
      this.logger.debug(`Tailwind CSS generation failed: ${error.message}`);
      throw new Error(`Failed to generate CSS with Tailwind v4: ${error.message}`);
    }
  }

  /**
   * Get variables defined in CAPPS core CSS
   * Reads the centralized Tailwind CSS file and extracts all variable definitions
   */
  getCAPPSCoreVariables() {
    try {
      const cappsDistPath = path.join(this.cappsUIPath, 'dist', 'css', 'tailwind');

      // Check if directory exists
      if (!fs.existsSync(cappsDistPath)) {
        this.logger.debug(`CAPPS tailwind CSS directory not found: ${cappsDistPath}`);
        return new Set();
      }

      // Find the tailwind CSS file in the dist directory
      const files = fs.readdirSync(cappsDistPath);
      const tailwindFile = files.find(f => f.startsWith('tailwind.') && f.endsWith('.css'));

      if (!tailwindFile) {
        this.logger.debug('CAPPS core CSS file not found');
        return new Set();
      }

      const coreCSSPath = path.join(cappsDistPath, tailwindFile);
      const coreCSS = fs.readFileSync(coreCSSPath, 'utf8');

      // Extract all variable definitions from :root, :host block
      const coreVariables = new Set();
      const varRegex = /--([a-z0-9-]+)\s*:/g;
      let match;

      while ((match = varRegex.exec(coreCSS)) !== null) {
        coreVariables.add(match[1]);
      }

      this.logger.debug(`Found ${coreVariables.size} variables in CAPPS core CSS`);
      return coreVariables;
    } catch (error) {
      this.logger.debug(`Error reading CAPPS core CSS: ${error.message}`);
      return new Set();
    }
  }

  /**
   * Remove theme layer from generated CSS (for app builds to avoid duplication)
   * Keeps utilities but removes the :root/:host variables and @property declarations
   * EXCEPT: Keep any variables that are:
   *   1. Actually referenced by generated utilities, AND
   *   2. NOT already defined in CAPPS core CSS
   */
  removeThemeLayerFromCSS(css) {
    // Get variables that are already defined in CAPPS core
    const coreVariables = this.getCAPPSCoreVariables();

    // Collect all CSS variables that are referenced in the utilities
    const referencedVariables = new Set();
    const varRegex = /var\(--([a-z0-9-]+)\)/g;
    let match;
    while ((match = varRegex.exec(css)) !== null) {
      referencedVariables.add(match[1]);
    }

    const lines = css.split('\n');
    const resultLines = [];
    const rootHostVariables = [];
    let insideRootHost = false;
    let braceDepth = 0;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Detect :root, :host block
      if (line.match(/^:root,\s*:host\s*{/)) {
        insideRootHost = true;
        braceDepth = 1;
        i++;
        continue;
      }

      // Collect variables inside :root/:host
      if (insideRootHost) {
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        braceDepth += openBraces - closeBraces;

        i++;
        // Collect lines inside :root/:host
        if (braceDepth > 0) {
          // Check if this line defines a variable that's:
          // 1. Used in utilities AND
          // 2. NOT already in CAPPS core
          const varMatch = line.match(/--([a-z0-9-]+)\s*:/);
          if (varMatch && referencedVariables.has(varMatch[1]) && !coreVariables.has(varMatch[1])) {
            rootHostVariables.push(line);
          }
          continue;
        } else {
          // Exit the block
          insideRootHost = false;
          continue;
        }
      }

      // Skip @property declarations (part of theme)
      if (line.match(/^@property\s+--/)) {
        // Skip until closing brace
        while (i < lines.length && !lines[i].trim().match(/^}$/)) {
          i++;
        }
        i++; // Skip the closing brace
        continue;
      }

      // Skip @layer theme
      if (line.match(/^@layer\s+theme/)) {
        while (i < lines.length && !lines[i].trim().match(/^}$/)) {
          i++;
        }
        i++; // Skip the closing brace
        continue;
      }

      // Keep other lines
      resultLines.push(line);
      i++;
    }

    // If we collected any root/host variables that are needed, prepend them wrapped in :root
    if (rootHostVariables.length > 0) {
      resultLines.unshift(':root {');
      rootHostVariables.forEach(varLine => {
        resultLines.splice(1, 0, varLine);
      });
      resultLines.splice(1 + rootHostVariables.length, 0, '}');
    }

    // Clean up multiple blank lines
    let result = resultLines.join('\n');
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n');

    return result.trim();
  }

  /**
   * Generate CSS for missing classes
   */
  async generateMissingCSS(missingClasses) {
    if (missingClasses.length === 0) {
      this.logger.success('No missing classes found - build complete!');
      const outputFile = path.join(this.outputPath, 'tailwind-missing.scss');
      await fs.ensureDir(this.outputPath);
      await fs.writeFile(
        outputFile,
        '// No missing Tailwind classes found - build complete!\n'
      );
      return outputFile;
    }

    this.logger.info(
      `Generating CSS using Tailwind CLI for ${missingClasses.length} missing classes...`
    );

    try {
      const dummyHTML = this.createDummyHTML(missingClasses);
      const tempHtmlFile = path.join(this.appPath, '.temp-tailwind-classes.html');
      await fs.writeFile(tempHtmlFile, dummyHTML);

      await fs.ensureDir(this.outputPath);

      const outputFile = path.join(this.outputPath, 'tailwind-missing.scss');
      const generationResult = await this.runTailwindCLI(tempHtmlFile, outputFile, missingClasses);

      if (!this.verbose) {
        await fs.unlink(tempHtmlFile);
      } else {
        this.logger.debug(`Temp file kept for debugging: ${tempHtmlFile}`);
      }

      const css = await fs.readFile(outputFile, 'utf8');

      const buildInfo = {
        appName: this.appName,
        buildTime: new Date().toISOString(),
        classesRequested: missingClasses.length,
        classesGenerated: generationResult.generatedClasses.length,
        cssSize: css.length,
        requestedClasses: missingClasses,
        generatedClasses: generationResult.generatedClasses,
        version: '2.0.0',
        method: 'tailwind-cli-filtered'
      };

      const metadataFile = path.join(this.outputPath, 'build-info.json');
      await fs.writeFile(metadataFile, JSON.stringify(buildInfo, null, 2));

      this.stats.cssFilesGenerated = 1;
      this.logger.success(
        `Generated CSS saved to: ${path.relative(this.appPath, outputFile)}`
      );
      this.logger.info(
        `Build metadata saved to: ${path.relative(this.appPath, metadataFile)}`
      );
      this.logger.info(`Generated CSS size: ${(css.length / 1024).toFixed(2)} KB`);

      return outputFile;
    } catch (error) {
      this.logger.error(`Error generating CSS: ${error.message}`);
      throw error;
    }
  }

  /**
   * Main build method
   */
  async build() {
    const startTime = Date.now();

    try {
      this.logger.info(chalk.cyan('🚀 CAPPS Tailwind Build Process Started'));
      this.logger.info(`App Path: ${this.appPath}`);
      this.logger.debug(`Output Path: ${this.outputPath}`);
      this.logger.info(`Dev Server URL: ${this.devServerUrl}`);

      const allClasses = await this.scanApplicationFiles();
      const existingClasses = await this.loadExistingCSS();
      const missingClasses = await this.detectMissingClasses(allClasses, existingClasses);
      const outputFile = await this.generateMissingCSS(missingClasses);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(chalk.green('\n✅ Build Complete!'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(`Files scanned: ${this.stats.filesScanned}`);
      console.log(`Classes found: ${this.stats.classesFound}`);
      console.log(`Missing classes: ${this.stats.missingClasses}`);
      console.log(`CSS files generated: ${this.stats.cssFilesGenerated}`);
      console.log(`Build time: ${duration}s`);
      console.log(chalk.gray('─'.repeat(50)));

      if (outputFile) {
        console.log(chalk.cyan(`📁 Output: ${path.relative(this.appPath, outputFile)}`));
      }

      return {
        success: true,
        outputFile,
        stats: this.stats
      };
    } catch (error) {
      this.logger.error(`Build failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Main analyze method (without generating CSS)
   */
  async analyze() {
    try {
      const allClasses = await this.scanApplicationFiles();
      const existingClasses = await this.loadExistingCSS();
      const missingClasses = await this.detectMissingClasses(allClasses, existingClasses);

      return {
        success: true,
        stats: this.stats,
        missingClasses,
        allClasses,
        existingClasses: Array.from(existingClasses)
      };
    } catch (error) {
      this.logger.error(`Analysis failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = TailwindBuilder;
