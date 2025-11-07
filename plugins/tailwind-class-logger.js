/**
 * Native Tailwind CSS Plugin for Class Logging
 * Uses Tailwind's built-in APIs to track generated and used classes
 */
const fs = require('fs');
const path = require('path');

function tailwindClassLogger(options = {}) {
  console.log('🔧 Tailwind Class Logger Plugin: Initializing...');
  
  return function({ addUtilities, addComponents, addBase, matchUtilities, theme, corePlugins }) {
    console.log('🔧 Tailwind Class Logger Plugin: Running during build...');
    const logData = {
      generated_classes: new Set(),
      used_classes: new Set(),
      theme_values: {},
      build_info: {
        timestamp: new Date().toISOString(),
        node_env: process.env.NODE_ENV,
        tailwind_version: require('tailwindcss/package.json').version
      }
    };

    // Capture theme configuration
    logData.theme_values = {
      colors: theme('colors') || {},
      spacing: theme('spacing') || {},
      screens: theme('screens') || {},
      fontFamily: theme('fontFamily') || {}
    };

    // Hook into Tailwind's utility generation process
    const originalAddUtilities = addUtilities;
    addUtilities = function(utilities, options) {
      // Extract class names from utilities being added
      Object.keys(utilities).forEach(selector => {
        // Handle various selector formats
        const classNames = extractClassNamesFromSelector(selector);
        classNames.forEach(className => {
          if (className && isTailwindUtility(className)) {
            logData.generated_classes.add(className);
          }
        });
      });
      
      return originalAddUtilities(utilities, options);
    };

    // Hook into component generation (less common but useful)
    const originalAddComponents = addComponents;
    addComponents = function(components, options) {
      Object.keys(components).forEach(selector => {
        const classNames = extractClassNamesFromSelector(selector);
        classNames.forEach(className => {
          if (className && isTailwindUtility(className)) {
            logData.generated_classes.add(className);
          }
        });
      });
      
      return originalAddComponents(components, options);
    };

    // Save the log data during build process
    process.nextTick(() => {
      saveClassLogs(logData);
    });

    // Also save on process exit to ensure we capture everything
    if (!process.listeners('exit').some(fn => fn.name === 'tailwindLogger')) {
      const exitHandler = function tailwindLogger() {
        saveClassLogs(logData);
      };
      process.on('exit', exitHandler);
      process.on('SIGINT', exitHandler);
      process.on('SIGTERM', exitHandler);
    }
  };
}

/**
 * Extract class names from CSS selectors
 */
function extractClassNamesFromSelector(selector) {
  const classNames = [];
  
  // Handle different selector formats
  const patterns = [
    // Standard class: .class-name
    /\.([a-zA-Z][a-zA-Z0-9_-]*)/g,
    // Escaped class: .hover\:bg-blue-500
    /\.([a-zA-Z][a-zA-Z0-9_\\:-]*)/g
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(selector)) !== null) {
      let className = match[1];
      
      // Convert escaped CSS class back to Tailwind format
      className = className.replace(/\\\\/g, '').replace(/\\:/g, ':');
      
      if (className) {
        classNames.push(className);
      }
    }
    pattern.lastIndex = 0; // Reset regex
  });

  return classNames;
}

/**
 * Check if a class name is a Tailwind utility
 */
function isTailwindUtility(className) {
  if (!className || typeof className !== 'string') return false;
  
  // Skip CSS-only classes that aren't Tailwind utilities
  const skipPatterns = [
    /^[a-f0-9]{6,8}$/, // Hex colors
    /^\d+px$/, // Pixel values
    /^#/,  // IDs
    /^:/,  // Pseudo selectors without class
  ];
  
  if (skipPatterns.some(pattern => pattern.test(className))) {
    return false;
  }

  // Tailwind utility patterns
  const utilityPatterns = [
    // Variants (responsive, state, etc.)
    /^(sm|md|lg|xl|2xl|hover|focus|active|disabled|first|last|odd|even|dark):/,
    
    // Layout utilities
    /^(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)$/,
    
    // Container
    /^container$/,
    
    // Box sizing
    /^box-(border|content)$/,
    
    // Display
    /^(block|inline-block|inline|flex|inline-flex|table|grid|hidden)$/,
    
    // Floats
    /^float-(right|left|none)$/,
    
    // Clear
    /^clear-(left|right|both|none)$/,
    
    // Object fit/position
    /^object-(contain|cover|fill|none|scale-down)$/,
    /^object-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/,
    
    // Overflow
    /^overflow-(auto|hidden|clip|visible|scroll|x-auto|x-hidden|x-clip|x-visible|x-scroll|y-auto|y-hidden|y-clip|y-visible|y-scroll)$/,
    
    // Position
    /^(static|fixed|absolute|relative|sticky)$/,
    
    // Top/right/bottom/left
    /^(inset|top|right|bottom|left)-/,
    
    // Visibility
    /^(visible|invisible|collapse)$/,
    
    // Z-index
    /^z-/,
    
    // Flexbox
    /^flex-/,
    /^(justify|items|self|content)-/,
    /^(order)-/,
    
    // Grid
    /^(grid-cols|col-|grid-rows|row-|gap|row-gap|col-gap)-/,
    
    // Spacing (padding, margin)
    /^[mp][trblxy]?-/,
    /^space-[xy]-/,
    
    // Sizing
    /^(w|h|min-w|min-h|max-w|max-h)-/,
    
    // Typography
    /^(font|text|leading|tracking|break|hyphens|indent|align|whitespace|word-break|content)-/,
    
    // Backgrounds
    /^bg-/,
    
    // Borders
    /^(border|divide|outline|ring)-/,
    /^rounded-/,
    
    // Effects
    /^(shadow|opacity|mix-blend|bg-blend)-/,
    
    // Filters
    /^(blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|backdrop-blur|backdrop-brightness|backdrop-contrast|backdrop-grayscale|backdrop-hue-rotate|backdrop-invert|backdrop-opacity|backdrop-saturate|backdrop-sepia)-/,
    
    // Tables
    /^(border-collapse|border-separate|table-auto|table-fixed|caption-top|caption-bottom)-/,
    
    // Transitions & Animation
    /^(transition|duration|ease|delay|animate)-/,
    
    // Transforms
    /^(transform|transform-gpu|transform-none|origin|scale|rotate|translate|skew)-/,
    
    // Interactivity
    /^(appearance|cursor|caret|pointer-events|resize|scroll|select|outline)-/,
    
    // SVG
    /^(fill|stroke)-/,
    
    // Accessibility
    /^(sr-only|not-sr-only)$/,
    
    // Common patterns
    /^(truncate|uppercase|lowercase|capitalize|normal-case|underline|overline|line-through|no-underline|antialiased|subpixel-antialiased)$/
  ];
  
  return utilityPatterns.some(pattern => pattern.test(className));
}

/**
 * Save class logs to files
 */
function saveClassLogs(logData) {
  try {
    const outputDir = process.cwd();
    
    // Convert Sets to Arrays for JSON serialization
    const generatedClasses = Array.from(logData.generated_classes).sort();
    const usedClasses = Array.from(logData.used_classes).sort();
    
    // Save generated classes
    const generatedData = {
      generated_at: logData.build_info.timestamp,
      total_generated_classes: generatedClasses.length,
      generated_classes: generatedClasses,
      build_info: logData.build_info,
      theme_summary: {
        total_colors: Object.keys(logData.theme_values.colors || {}).length,
        total_spacing_values: Object.keys(logData.theme_values.spacing || {}).length,
        screens: Object.keys(logData.theme_values.screens || {})
      }
    };

    fs.writeFileSync(
      path.join(outputDir, 'tailwind-generated-classes.json'),
      JSON.stringify(generatedData, null, 2)
    );

    // Create combined info file
    const combinedData = {
      generated_at: logData.build_info.timestamp,
      summary: {
        total_generated: generatedClasses.length,
        total_used: usedClasses.length,
        build_env: logData.build_info.node_env
      },
      generated_classes: generatedClasses,
      used_classes: usedClasses,
      missing_classes: [], // Will be populated by content scanning
      build_info: logData.build_info,
      theme_info: logData.theme_values
    };

    fs.writeFileSync(
      path.join(outputDir, 'tailwind-classes-info.json'),
      JSON.stringify(combinedData, null, 2)
    );

    // Also save to public folder for dev server access
    const publicDir = path.join(outputDir, 'public');
    const publicPath = path.join(publicDir, 'tailwind-classes-info.json');
    
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(publicPath, JSON.stringify(combinedData, null, 2));

    console.log(`✅ Tailwind Class Logger: ${generatedClasses.length} classes generated`);
    
  } catch (error) {
    console.warn('Failed to save Tailwind class logs:', error.message);
  }
}

module.exports = tailwindClassLogger;