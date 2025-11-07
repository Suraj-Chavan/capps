/**
 * Tailwind Content Scanner
 * Uses Tailwind's built-in content detection to track used classes
 */
const fs = require('fs');
const path = require('path');

function tailwindContentScanner(options = {}) {
  console.log('🎯 Tailwind Content Scanner Plugin: Initializing...');
  const usedClasses = new Set();
  let contentFiles = [];

  return {
    // Use Tailwind's content configuration with custom extractor
    content: {
      files: [
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./public/**/*.html",
        ...(options.extraPaths || [])
      ],
      extract: {
        // Custom extractor for Vue files
        vue: (content) => {
          const classes = extractTailwindClasses(content);
          classes.forEach(cls => usedClasses.add(cls));
          saveUsedClasses();
          return classes;
        },
        
        // Custom extractor for JS/TS files
        js: (content) => {
          const classes = extractTailwindClasses(content);
          classes.forEach(cls => usedClasses.add(cls));
          saveUsedClasses();
          return classes;
        },
        
        // Custom extractor for HTML files
        html: (content) => {
          const classes = extractTailwindClasses(content);
          classes.forEach(cls => usedClasses.add(cls));
          saveUsedClasses();
          return classes;
        }
      },
      
      // Transform functions for different file types
      transform: {
        vue: (content) => {
          // Log file being processed
          console.log('📝 Tailwind scanning Vue file...');
          return content;
        },
        js: (content) => {
          console.log('📝 Tailwind scanning JS/TS file...');
          return content;
        }
      }
    },

    // Plugin to capture the scanning process
    plugins: [
      function({ addUtilities, theme }) {
        // This runs after content scanning
        process.nextTick(() => {
          updateCombinedInfo();
        });
      }
    ]
  };

  /**
   * Extract Tailwind classes from content using multiple patterns
   */
  function extractTailwindClasses(content) {
    const classes = new Set();
    
    // Comprehensive patterns for different contexts
    const patterns = [
      // Vue template class attributes
      /class=["']([^"']*?)["']/g,
      /v-bind:class=["']([^"']*?)["']/g,
      /:class=["']([^"']*?)["']/g,
      
      // Dynamic class bindings
      /:class="\{([^}]*)\}"/g,
      
      // JavaScript className properties
      /className:\s*["']([^"']*?)["']/g,
      
      // Template literals with classes
      /`[^`]*class[^`]*:\s*["']([^"']*?)["'][^`]*`/g,
      
      // CSS @apply directives
      /@apply\s+([^;]+);/g,
      
      // Array class definitions
      /\[([^\]]*?["'][^"']*["'][^\]]*?)\]/g,
      
      // Object class definitions
      /\{\s*["']([a-zA-Z][a-zA-Z0-9:-]*?)["']\s*:/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const classString = match[1];
        if (classString) {
          parseClassString(classString, classes);
        }
      }
      pattern.lastIndex = 0;
    });

    return Array.from(classes);
  }

  /**
   * Parse class string and extract individual classes
   */
  function parseClassString(classString, classes) {
    if (!classString || typeof classString !== 'string') return;

    // Clean up the string
    const cleaned = classString
      .replace(/['"`,{}()]/g, ' ') // Remove quotes and syntax
      .replace(/\s+/g, ' ')        // Normalize whitespace
      .trim();

    const classList = cleaned.split(' ');
    
    classList.forEach(cls => {
      cls = cls.trim();
      if (cls && isTailwindClass(cls)) {
        classes.add(cls);
      }
    });
  }

  /**
   * Check if class is a Tailwind utility class
   */
  function isTailwindClass(className) {
    if (!className || typeof className !== 'string') return false;
    
    // Remove conditional syntax artifacts
    className = className.replace(/[{}()]/g, '').trim();
    if (!className) return false;
    
    // Tailwind class patterns
    const patterns = [
      // Variants
      /^(hover|focus|active|disabled|visited|first|last|odd|even|group-hover|focus-within|dark):/,
      /^(sm|md|lg|xl|2xl):/,
      
      // Layout
      /^(block|inline|inline-block|flex|inline-flex|table|grid|hidden|container)$/,
      
      // Spacing
      /^[mp][trblxy]?-(\d+(\.\d+)?|auto|px)$/,
      /^space-[xy]-(\d+(\.\d+)?|reverse)$/,
      /^gap(-x|-y)?-\d+(\.\d+)?$/,
      
      // Sizing  
      /^(w|h|min-w|min-h|max-w|max-h)-/,
      
      // Typography
      /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|left|center|right|justify)$/,
      /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|sans|serif|mono)$/,
      /^(leading|tracking)-/,
      
      // Colors
      /^(text|bg|border)-(inherit|current|transparent|black|white|gray|red|yellow|green|blue|indigo|purple|pink)-?\d*$/,
      /^(text|bg|border)-(slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-?\d*$/,
      
      // Borders
      /^border(-\d+|-[trblxy](-\d+)?|-(solid|dashed|dotted|double|none))?$/,
      /^rounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/,
      
      // Effects
      /^(shadow|opacity|blur)-/,
      
      // Flexbox & Grid
      /^(justify|items|self|content)-(start|end|center|between|around|evenly|stretch)$/,
      /^flex-(1|auto|initial|none|grow|shrink|row|col|wrap)$/,
      /^order-(\d+|first|last|none)$/,
      /^grid-(cols|rows)-\d+$/,
      
      // Position
      /^(static|fixed|absolute|relative|sticky)$/,
      /^(inset|top|right|bottom|left)-/,
      /^z-\d+$/,
      
      // Animation
      /^(animate|transition|duration|ease|delay)-/,
      
      // Common utilities
      /^(cursor|select|resize|outline|pointer-events|appearance|overflow)-/,
      /^(sr-only|not-sr-only|truncate|uppercase|lowercase|capitalize|underline|line-through|no-underline)$/
    ];
    
    return patterns.some(pattern => pattern.test(className));
  }

  /**
   * Save used classes to file with debouncing
   */
  let saveTimeout;
  function saveUsedClasses() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        const classesArray = Array.from(usedClasses).sort();
        
        const data = {
          generated_at: new Date().toISOString(),
          total_used_classes: classesArray.length,
          used_classes: classesArray,
          source: 'tailwind-content-scanner'
        };

        fs.writeFileSync(
          path.join(process.cwd(), 'tailwind-used-classes.json'),
          JSON.stringify(data, null, 2)
        );

        console.log(`🎯 Tailwind Content Scanner: ${classesArray.length} classes found in use`);
      } catch (error) {
        console.warn('Failed to save used classes:', error.message);
      }
    }, 1000); // Debounce for 1 second
  }

  /**
   * Update the combined info file
   */
  function updateCombinedInfo() {
    try {
      const combinedPath = path.join(process.cwd(), 'tailwind-classes-info.json');
      let combinedData = {};

      // Load existing combined data
      if (fs.existsSync(combinedPath)) {
        combinedData = JSON.parse(fs.readFileSync(combinedPath, 'utf8'));
      }

      // Update with used classes
      const usedClassesArray = Array.from(usedClasses).sort();
      combinedData.used_classes = usedClassesArray;
      combinedData.summary = combinedData.summary || {};
      combinedData.summary.total_used = usedClassesArray.length;
      
      // Calculate missing classes
      const generatedClasses = new Set(combinedData.generated_classes || []);
      const missingClasses = usedClassesArray.filter(cls => !generatedClasses.has(cls));
      combinedData.missing_classes = missingClasses;
      combinedData.summary.total_missing = missingClasses.length;
      
      combinedData.generated_at = new Date().toISOString();

      fs.writeFileSync(combinedPath, JSON.stringify(combinedData, null, 2));

      // Also save to public folder for dev server access
      const publicDir = path.join(process.cwd(), 'public');
      const publicPath = path.join(publicDir, 'tailwind-classes-info.json');
      
      // Ensure public directory exists
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      fs.writeFileSync(publicPath, JSON.stringify(combinedData, null, 2));

      console.log(`📊 Combined Info Updated: ${missingClasses.length} missing classes identified`);
    } catch (error) {
      console.warn('Failed to update combined info:', error.message);
    }
  }
}

module.exports = tailwindContentScanner;