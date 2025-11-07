/**
 * Tailwind Used Classes Scanner
 * Scans Vue/JS/HTML files to track actually used Tailwind classes
 */
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const glob = require('glob');

class TailwindUsedClassesScanner {
  constructor() {
    this.usedClasses = new Set();
    this.isWatching = false;
    this.debounceTimer = null;
  }

  /**
   * Extract Tailwind classes from file content
   */
  extractClassesFromContent(content, filePath) {
    const classes = new Set();
    
    // Different patterns for different file types
    const patterns = [
      // Vue template: class="..." or :class="..."
      /(?:class|:class)=["']([^"']*?)["']/g,
      // Vue template: v-bind:class or :class with objects
      /:class=["'][^"']*["']/g,
      // JavaScript/TypeScript: className or class properties
      /(?:className|class):\s*["']([^"']*?)["']/g,
      // Template literals
      /`[^`]*?(?:class|className)[:=]\s*["']([^"']*?)["'][^`]*?`/g,
      // HTML class attributes
      /class=["']([^"']*?)["']/g,
      // Dynamic class bindings in objects { 'class-name': condition }
      /\{\s*["']([a-zA-Z][a-zA-Z0-9-_:]*?)["']\s*:/g,
      // Array class definitions ['class1', 'class2']
      /\[([^\]]*?)\]/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const classString = match[1] || match[0];
        this.parseClassString(classString, classes);
      }
    });

    // Special handling for Vue SFC style sections with @apply
    const applyMatches = content.match(/@apply\s+([^;]+);/g);
    if (applyMatches) {
      applyMatches.forEach(match => {
        const classString = match.replace(/@apply\s+/, '').replace(';', '');
        this.parseClassString(classString, classes);
      });
    }

    return Array.from(classes);
  }

  /**
   * Parse class string and extract individual Tailwind classes
   */
  parseClassString(classString, classes) {
    if (!classString) return;

    // Handle different formats
    const normalizedString = classString
      .replace(/['"`]/g, '') // Remove quotes
      .replace(/,/g, ' ')     // Replace commas with spaces
      .replace(/\s+/g, ' ')   // Normalize whitespace
      .trim();

    const classList = normalizedString.split(' ');
    
    classList.forEach(cls => {
      cls = cls.trim();
      if (cls && this.isTailwindClass(cls)) {
        classes.add(cls);
      }
    });
  }

  /**
   * Enhanced Tailwind class detection
   */
  isTailwindClass(className) {
    if (!className || typeof className !== 'string') return false;
    
    // Remove any conditional syntax
    className = className.replace(/[{}()]/g, '');
    
    // Tailwind class patterns (similar to the PostCSS plugin but for detection)
    const patterns = [
      // State variants
      /^(hover|focus|active|disabled|visited|first|last|odd|even|group-hover|focus-within):/,
      // Responsive variants
      /^(sm|md|lg|xl|2xl):/,
      // Dark mode
      /^(dark|light):/,
      
      // Layout
      /^(block|inline|inline-block|flex|inline-flex|table|grid|hidden)$/,
      /^(container)$/,
      
      // Spacing
      /^[mp][trblxy]?-(\d+(\.\d+)?|auto|px)$/,
      /^space-[xy]-(\d+(\.\d+)?|reverse)$/,
      /^gap-(\d+(\.\d+)?|x|y)$/,
      
      // Sizing
      /^(w|h|min-w|min-h|max-w|max-h)-/,
      
      // Typography
      /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|left|center|right|justify)$/,
      /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|sans|serif|mono)$/,
      /^(leading|tracking)-/,
      
      // Colors (text, background, border)
      /^(text|bg|border)-(inherit|current|transparent|black|white|gray|red|yellow|green|blue|indigo|purple|pink)-?\d*$/,
      /^(text|bg|border)-(slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-?\d*$/,
      
      // Borders & Border Radius
      /^border(-\d+|-[trblxy](-\d+)?|-(solid|dashed|dotted|double|none))?$/,
      /^rounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full|-[trbl](-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?)?$/,
      
      // Effects
      /^(shadow|opacity|blur|brightness|contrast)(-none|-sm|-md|-lg|-xl|-2xl|\d+)?$/,
      
      // Flexbox & Grid
      /^(flex|grid)-(row|col|flow)(-reverse)?$/,
      /^(justify|items|self|content)-(start|end|center|between|around|evenly|stretch)$/,
      /^flex-(1|auto|initial|none|grow|shrink)$/,
      /^order-(\d+|first|last|none)$/,
      
      // Position
      /^(static|fixed|absolute|relative|sticky)$/,
      /^(inset|top|right|bottom|left)-(\d+(\.\d+)?|auto|px)$/,
      /^z-(\d+|auto)$/,
      
      // Animation & Transitions
      /^(animate|transition|duration|ease|delay)-/,
      /^transform(-gpu|-none)?$/,
      /^(scale|rotate|translate|skew)/,
      
      // Interactivity
      /^(cursor|select|resize|outline|pointer-events)-/,
      /^appearance-(none|auto)$/,
      
      // Overflow
      /^overflow-(auto|hidden|visible|scroll|x-auto|x-hidden|x-visible|x-scroll|y-auto|y-hidden|y-visible|y-scroll)$/,
      
      // Common utility patterns
      /^(sr-only|not-sr-only|truncate|uppercase|lowercase|capitalize|underline|line-through|no-underline)$/
    ];
    
    return patterns.some(pattern => pattern.test(className));
  }

  /**
   * Scan all project files for used classes
   */
  async scanAllFiles() {
    const patterns = [
      './src/**/*.vue',
      './src/**/*.js',
      './src/**/*.ts',
      './src/**/*.jsx',
      './src/**/*.tsx',
      './public/**/*.html'
    ];

    console.log('🔍 Scanning files for used Tailwind classes...');
    this.usedClasses.clear();

    for (const pattern of patterns) {
      try {
        const files = glob.sync(pattern, { cwd: path.resolve('.') });
        
        for (const file of files) {
          await this.scanFile(path.resolve(file));
        }
      } catch (error) {
        console.warn(`Error scanning pattern ${pattern}:`, error.message);
      }
    }

    await this.saveUsedClasses();
    return Array.from(this.usedClasses);
  }

  /**
   * Scan individual file
   */
  async scanFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) return;
      
      const content = fs.readFileSync(filePath, 'utf8');
      const classes = this.extractClassesFromContent(content, filePath);
      
      classes.forEach(cls => this.usedClasses.add(cls));
    } catch (error) {
      console.warn(`Error scanning file ${filePath}:`, error.message);
    }
  }

  /**
   * Setup file watcher for development mode
   */
  setupWatcher() {
    if (this.isWatching) return;

    const watchPaths = [
      './src/**/*.vue',
      './src/**/*.js',
      './src/**/*.ts',
      './src/**/*.jsx',
      './src/**/*.tsx',
      './public/**/*.html'
    ];

    console.log('👀 Setting up file watcher for Tailwind classes...');

    const watcher = chokidar.watch(watchPaths, {
      ignored: ['node_modules', '.git', 'dist'],
      persistent: true
    });

    watcher.on('change', (filePath) => {
      this.handleFileChange(filePath);
    });

    watcher.on('add', (filePath) => {
      this.handleFileChange(filePath);
    });

    this.isWatching = true;
  }

  /**
   * Handle file change with debouncing
   */
  handleFileChange(filePath) {
    // Debounce to avoid excessive scanning
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      console.log(`📝 File changed: ${path.relative(process.cwd(), filePath)}`);
      await this.scanFile(filePath);
      await this.saveUsedClasses();
    }, 500);
  }

  /**
   * Save used classes to info file
   */
  async saveUsedClasses() {
    try {
      const classesArray = Array.from(this.usedClasses).sort();
      
      const infoData = {
        generated_at: new Date().toISOString(),
        total_used_classes: classesArray.length,
        used_classes: classesArray,
        source: 'file-scanner'
      };

      const outputPath = path.resolve('./tailwind-used-classes.json');
      fs.writeFileSync(outputPath, JSON.stringify(infoData, null, 2));

      console.log(`✅ Tailwind Used Classes: ${classesArray.length} classes tracked`);
      
      // Also create a combined info file
      await this.createCombinedInfo();
    } catch (error) {
      console.warn('Failed to save used classes:', error.message);
    }
  }

  /**
   * Create combined info file with both generated and used classes
   */
  async createCombinedInfo() {
    try {
      let generatedClasses = [];
      let usedClasses = Array.from(this.usedClasses).sort();

      // Try to read generated classes
      const generatedPath = path.resolve('./tailwind-generated-classes.json');
      if (fs.existsSync(generatedPath)) {
        const generatedData = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
        generatedClasses = generatedData.generated_classes || [];
      }

      // Find missing classes (used but not generated)
      const generatedSet = new Set(generatedClasses);
      const missingClasses = usedClasses.filter(cls => !generatedSet.has(cls));

      const combinedData = {
        generated_at: new Date().toISOString(),
        summary: {
          total_generated: generatedClasses.length,
          total_used: usedClasses.length,
          total_missing: missingClasses.length
        },
        generated_classes: generatedClasses,
        used_classes: usedClasses,
        missing_classes: missingClasses.sort()
      };

      const outputPath = path.resolve('./tailwind-classes-info.json');
      fs.writeFileSync(outputPath, JSON.stringify(combinedData, null, 2));

      console.log(`📊 Combined Info: ${missingClasses.length} classes need generation`);
    } catch (error) {
      console.warn('Failed to create combined info:', error.message);
    }
  }

  /**
   * Get missing classes that need to be generated
   */
  async getMissingClasses() {
    const infoPath = path.resolve('./tailwind-classes-info.json');
    if (!fs.existsSync(infoPath)) {
      await this.scanAllFiles();
    }

    try {
      const data = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
      return data.missing_classes || [];
    } catch (error) {
      console.warn('Failed to get missing classes:', error.message);
      return [];
    }
  }
}

module.exports = TailwindUsedClassesScanner;