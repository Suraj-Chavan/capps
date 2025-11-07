/**
 * JSX Transpiler - Runtime JSX transpilation for templates
 *
 * Provides synchronous JSX transpilation for inline scripts loaded at runtime.
 * Used by page-builder to transpile JSX in template script tags before execution.
 *
 * Features:
 * - Synchronous transpilation using Babel.transform()
 * - Can be called directly: transpileJSX(code)
 * - Or automatic via MutationObserver for dynamically added scripts
 *
 * Note: JSX in bundled .js files is transpiled at build time via Vite plugin.
 * This module handles inline JSX in Nunjucks templates and page-builder.
 */

let isInitialized = false;

/**
 * Transpile JSX code to JavaScript
 * Used by page-builder to transpile template scripts before execution
 * @param {string} code - JSX code to transpile
 * @returns {string} - Transpiled JavaScript code
 * @throws {Error} - If transpilation fails or Babel is not available
 */
export function transpileJSX(code) {
  if (typeof window === 'undefined' || !window.Babel) {
    throw new Error('[JSX Transpiler] Babel standalone is required for JSX transpilation. Make sure babel.min.js is loaded.');
  }

  try {
    const result = window.Babel.transform(code, {
      presets: [
        ['react', { runtime: 'classic' }],
        'env'
      ],
      plugins: [
        ['transform-react-jsx', { runtime: 'classic' }]
      ],
      sourceType: 'module',
      compact: false
    });

    if (!result || !result.code) {
      throw new Error('Babel transpilation produced empty result');
    }

    return result.code;
  } catch (error) {
    console.error('[JSX Transpiler] Transpilation error:', error);
    throw error;
  }
}

/**
 * Initialize automatic JSX transpilation
 * Sets up a MutationObserver to watch for script tags and transpile JSX automatically
 */
export function initializeJSXTranspiler() {
  if (isInitialized) {
    return;
  }

  if (typeof window === 'undefined') {
    console.debug('[JSX Transpiler] Not in browser environment');
    return;
  }

  // Wait for Babel to be available
  const checkBabelAndInit = setInterval(() => {
    if (window.Babel && window.React && window.ReactDOM) {
      clearInterval(checkBabelAndInit);
      setupMutationObserver();
      isInitialized = true;
      console.debug('[JSX Transpiler] Initialized with MutationObserver for inline JSX');
    }
  }, 100);

  // Timeout after 30 seconds
  setTimeout(() => {
    if (!isInitialized) {
      clearInterval(checkBabelAndInit);
      console.warn('[JSX Transpiler] Babel/React not available after 30s, auto-transpilation disabled');
    }
  }, 30000);
}

/**
 * Set up MutationObserver to watch for script tags
 * @private
 */
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check for added nodes
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if this is a script tag with JSX
          if (node.tagName === 'SCRIPT' && node.getAttribute('type') === 'text/jsx') {
            transpileScriptTag(node);
          }
          // Check children for script tags
          const scripts = node.querySelectorAll?.('script[type="text/jsx"]');
          if (scripts) {
            scripts.forEach(transpileScriptTag);
          }
        }
      });
    });
  });

  // Start observing the document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also process any existing JSX scripts
  const existingScripts = document.querySelectorAll('script[type="text/jsx"]');
  if (existingScripts.length > 0) {
    console.debug(`[JSX Transpiler] Found ${existingScripts.length} existing inline JSX script(s)`);
    existingScripts.forEach(transpileScriptTag);
  }
}

/**
 * Transpile and execute a single script tag
 * @private
 * @param {HTMLScriptElement} scriptTag - The script tag to transpile
 */
function transpileScriptTag(scriptTag) {
  // Skip if already processed
  if (scriptTag._jsnxProcessed) {
    return;
  }

  try {
    const code = scriptTag.textContent;
    if (!code.trim()) {
      return;
    }

    console.debug('[JSX Transpiler] Transpiling inline JSX script');

    // Transpile JSX to JavaScript using Babel
    const result = window.Babel.transform(code, {
      presets: [
        ['react', { runtime: 'classic' }],
        'env'
      ],
      plugins: [
        ['transform-react-jsx', { runtime: 'classic' }]
      ],
      sourceType: 'module',
      compact: false
    });

    if (!result || !result.code) {
      throw new Error('Babel transpilation produced empty result');
    }

    console.debug('[JSX Transpiler] Successfully transpiled JSX code');

    // Create a script element with the transpiled code
    const transpiledScript = document.createElement('script');
    transpiledScript.type = 'module';
    transpiledScript.textContent = `
      (async function() {
        const React = window.React;
        const ReactDOM = window.ReactDOM;
        const module = { exports: {} };

        ${result.code}

        // Handle lifecycle methods if exported
        if (module.exports && typeof module.exports.mounted === 'function') {
          await module.exports.mounted();
        }
      })().catch(err => {
        console.error('[JSX Transpiler] Error executing transpiled code:', err);
      });
    `;

    // Replace original script with transpiled one
    scriptTag.parentNode?.replaceChild(transpiledScript, scriptTag);

    // Mark as processed
    scriptTag._jsnxProcessed = true;

    console.info('[JSX Transpiler] JSX script transpiled and executed');
  } catch (error) {
    console.error('[JSX Transpiler] Error transpiling inline JSX:', error);
  }
}
