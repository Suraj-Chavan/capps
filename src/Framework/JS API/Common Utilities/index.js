import { getDependency } from '../../utility/DEPENDENCIES_INHERITANCE/getDependency';
import moment from 'moment';

/**
 * Copies attributes from one DOM node to another, excluding specified attributes.
 * @param {Element} source - The source element.
 * @param {Element} target - The target element.
 * @param {string[]} exclude - Array of attribute names to exclude.
 */
function copyAttributes(source, target, exclude = []) {
    for (const attr of source.attributes) {
        if (!exclude.includes(attr.name.toLowerCase())) {
            target.setAttribute(attr.name, attr.value);
        }
    }
}

/**
 * Loads an embedded script node, handling both inline and external scripts.
 * Preserves type attribute for Babel transpilation (type="text/babel") and other script types.
 * @param {Element} scriptNode - The script element to load.
 * @param {string} baseUrl - The base URL for resolving relative src.
 * @returns {Promise<void>}
 */
async function loadEmbeddedScript(scriptNode, baseUrl) {
    return new Promise((resolve, reject) => {
        const scriptType = scriptNode.getAttribute('type') || 'text/javascript';
        const isBabelScript = scriptType === 'text/babel';
        const originalSrc = scriptNode.getAttribute('src');

        if (originalSrc) {
            try {
                const resolvedSrc = new URL(originalSrc, baseUrl).href;

                if (isBabelScript && window.Babel && window.Babel.transform) {
                    // For Babel scripts, fetch and transform using Babel's default presets
                    fetch(resolvedSrc)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Failed to load script: ${resolvedSrc}, status: ${response.status}`);
                            }
                            return response.text();
                        })
                        .then(code => {
                            // Transform using Babel with recommended presets for JSX and ES6+
                            try {
                                const result = window.Babel.transform(code, {
                                    plugins: ['transform-react-jsx']
                                });
                                const newScript = document.createElement('script');
                                newScript.textContent = result.code;
                                document.body.appendChild(newScript);
                                resolve();
                            } catch (e) {
                                reject(new Error(`Error transforming Babel script: ${e.message}`));
                            }
                        })
                        .catch(reject);
                } else {
                    // Regular script loading (type="text/javascript" or other types)
                    const newScript = document.createElement('script');
                    copyAttributes(scriptNode, newScript, ['src']);
                    newScript.src = resolvedSrc;
                    newScript.onload = () => resolve();
                    newScript.onerror = () => reject(new Error(`Failed to load embedded script: ${newScript.src} from HTML ${baseUrl}.`));
                    document.head.appendChild(newScript);
                }
            } catch (e) {
                return reject(new Error(`Invalid URL for embedded script src: "${originalSrc}" in HTML ${baseUrl}. Error: ${e.message}`));
            }
        } else if (scriptNode.textContent) {
            const newScript = document.createElement('script');
            copyAttributes(scriptNode, newScript, []);
            newScript.textContent = scriptNode.textContent;
            document.body.appendChild(newScript);
            resolve();
        } else {
            resolve();
        }
    });
}

/**
 * Loads an embedded link node (stylesheet).
 * @param {Element} linkNode - The link element to load.
 * @param {string} baseUrl - The base URL for resolving relative href.
 * @returns {Promise<void>}
 */
async function loadEmbeddedLink(linkNode, baseUrl) {
    return new Promise((resolve, reject) => {
        const originalHref = linkNode.getAttribute('href');
        if (!originalHref) return resolve();
        const newLink = document.createElement('link');
        copyAttributes(linkNode, newLink);
        newLink.rel = 'stylesheet';
        try {
            newLink.href = new URL(originalHref, baseUrl).href;
        } catch (e) {
            return reject(new Error(`Invalid URL for embedded stylesheet href: "${originalHref}" in HTML ${baseUrl}. Error: ${e.message}`));
        }
        newLink.onload = () => resolve();
        newLink.onerror = () => reject(new Error(`Failed to load embedded stylesheet: ${newLink.href} from HTML ${baseUrl}.`));
        document.head.appendChild(newLink);
    });
}

// Asset cache to avoid duplicate loads
const assetCache = new Map();

/**
 * Loads external assets (js, css, html, json) and executes a callback when done.
 * Returns a promise that resolves to the loaded results.
 * @param {string|string[]} assets - Asset URL(s) to load.
 * @param {Function} [callback] - Optional callback to execute after loading.
 * @returns {Promise<any|any[]>}
 */
/**
 * Loads external assets (js, css, html, json) and executes a callback when done.
 * Returns a promise that resolves to the loaded results.
 * @param {string|string[]} assets - Asset URL(s) to load.
 * @param {Function} [callback] - Optional callback to execute after loading.
 * @param {Object} [options] - Optional options object. If options.asModule is true, JS files are loaded as data modules.
 * @returns {Promise<any|any[]>}
 */
export async function require(assets, callback, options = {}) {
    const assetList = Array.isArray(assets) ? assets : [assets];
    const loadPromises = assetList.map(async assetUrlInput => {
        if (assetCache.has(assetUrlInput)) {
            return assetCache.get(assetUrlInput);
        }
        let resolvedFullAssetUrl;
        let extension;
        const urlObject = new URL(assetUrlInput, document.baseURI);
        resolvedFullAssetUrl = urlObject.href;
        const pathname = urlObject.pathname;
        const parts = pathname.split('.');
        if (parts.length > 1) {
            const lastPart = parts.pop();
            if (lastPart && !lastPart.includes('/')) {
                extension = lastPart.toLowerCase();
            }
        }
        if (!extension) throw new Error(`Cannot determine asset type from URL (no valid extension in path): ${resolvedFullAssetUrl}`);
        let promise;
        if (extension === 'js') {
            // If asModule is true, load as data/config module (not as script)
            if (options.asModule) {
                promise = (async () => {
                    const response = await fetch(resolvedFullAssetUrl);
                    if (!response.ok) throw new Error(`Failed to load JS module: ${resolvedFullAssetUrl}, status: ${response.status}`);
                    let code = await response.text();                    
                    code += `\n//# sourceURL=${resolvedFullAssetUrl}`;
                    // Support ES module default export
                    if (/export\s+default/.test(code)) {
                        code = code.replace(/export\s+default/, 'module.exports =');
                    }
                    const module = { exports: {} };
                    // Optionally, pass a context object for dynamic modules
                    const context = options.context || {};
                    try {
                        new Function('module', 'exports', 'context', code)(module, module.exports, context);
                    } catch (e) {
                        throw new Error(`Error evaluating JS module ${resolvedFullAssetUrl}: ${e.message}`);
                    }
                    // If export is a function, call it with context
                    return typeof module.exports === 'function' ? module.exports(context) : module.exports;
                })();
            } else {
                // Default: load as script tag
                promise = new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = resolvedFullAssetUrl;
                    script.async = true;
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error(`Failed to load script: ${assetUrlInput}`));
                    document.head.appendChild(script);
                });
            }
        } else if (extension === 'css') {
            promise = new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = resolvedFullAssetUrl;
                link.onload = () => resolve();
                link.onerror = () => reject(new Error(`Failed to load stylesheet: ${resolvedFullAssetUrl}`));
                document.head.appendChild(link);
            });
        } else if (extension === 'html' || extension === 'htm') {
            promise = (async () => {
                const response = await fetch(resolvedFullAssetUrl);
                if (!response.ok) throw new Error(`Failed to load HTML: ${resolvedFullAssetUrl}, status: ${response.status}`);
                const htmlContent = await response.text();
                const template = document.createElement('template');
                template.innerHTML = htmlContent;
                const fragment = template.content;
                const scriptNodes = Array.from(fragment.querySelectorAll('script'));
                const linkNodes = Array.from(fragment.querySelectorAll('link[rel="stylesheet"]'));
                const embeddedAssetLoadPromises = [];
                for (const scriptNode of scriptNodes) {
                    embeddedAssetLoadPromises.push(loadEmbeddedScript(scriptNode, resolvedFullAssetUrl));
                }
                for (const linkNode of linkNodes) {
                    embeddedAssetLoadPromises.push(loadEmbeddedLink(linkNode, resolvedFullAssetUrl));
                }
                // Remove original script and link nodes from the fragment
                scriptNodes.forEach(node => node.remove());
                linkNodes.forEach(node => node.remove());
                if (embeddedAssetLoadPromises.length > 0) {
                    try {
                        await Promise.all(embeddedAssetLoadPromises)
                    } catch (error) {
                        console.error('Error processing embedded assets in HTML:', error);
                        return "There was an error loading embedded assets.";
                    }
                }
                return template.innerHTML;
            })();
        } else if (extension === 'json') {
            promise = (async () => {
                const response = await fetch(resolvedFullAssetUrl);
                if (!response.ok) throw new Error(`Failed to load JSON: ${resolvedFullAssetUrl}, status: ${response.status}`);
                return await response.json();
            })();
        } else {
            throw new Error(`Unsupported asset type based on extension ".${extension}" from URL: ${assetUrlInput}`);
        }
        assetCache.set(assetUrlInput, promise);
        return promise;
    });
    const results = await Promise.all(loadPromises);
    if (typeof callback === 'function') {
        if (assetList.length === 1 && results.length === 1) {
            callback(results[0]);
        } else {
            callback(results);
        }
    }
    return assetList.length === 1 ? results[0] : results;
}

export const get_route = function () {
    const applicationInstance = getDependency('applicationInstance');
    
    // Get current route path
    const currentRoute = applicationInstance.$route.path;
    const routeParts = currentRoute.split('/').filter(Boolean);
    
    const docType = routeParts[1];

    // Validate route structure
    if (routeParts.length < 3 || !['doc', 'pages'].includes(docType)) {
        console.error('Invalid route structure');
        return [];
    }
    
    // Extract app name and collection name from current route
    const appName = routeParts[0];
    let documentName = routeParts[2];
    
    // Get the rest of the path after collection name
    const restPath = routeParts.slice(3);
    
    // Return route as array
    return [appName, docType, documentName, ...restPath];
}

export const set_route = function (route, options = {}) {
    const applicationInstance = getDependency('applicationInstance');
    
    // Get app name and collection name from current route
    const currentRoute = applicationInstance.$route.path;
    const routeParts = currentRoute.split('/').filter(Boolean);
    const docType = routeParts[1];
    const redirectToDocument = (Array.isArray(route) && route.includes('doc') || route.includes('pages')) || route.includes('/doc/') || route.includes('/pages/');
    
    // Validate current route structure
    if (!redirectToDocument && (routeParts.length < 3 || !['doc', 'pages'].includes(docType))) {
        console.error('Invalid current route structure');
        return;
    }
    
    // Extract app name and collection name from current route
    const appName = routeParts[0];
    let documentName = routeParts[2];
    
    // Handle different types of route inputs
    let path;
    if (Array.isArray(route)) {
        // Construct path with current app and collection names
        if(redirectToDocument) {
            path = "/" + route.join('/');
        } else {
            path = `/${appName}/${docType}/${documentName}/${route.join('/')}`;
        }
    } else if (typeof route === 'string') {
        // Use string route directly
        if(redirectToDocument) {
            path = "/" + route;
        } else {
            path = `/${appName}/${docType}/${documentName}/${route}`;
        }
    } else {
        console.error('Invalid route format');
        return;
    }

    // Valid query parameters
    const validKeys = ['filter', 'defaults', 'showRecordSummary'];
    
    // Only include valid keys that are provided
    const query = new URLSearchParams();
    validKeys.forEach(key => {
        if (options[key] !== undefined && options[key] !== null && options[key] !== '') {
            // Convert object to JSON string for filters and default
            const value = typeof options[key] === 'object' ? 
                JSON.stringify(options[key]) : 
                options[key];
            query.append(key, value);
        }
    });

    // Add any other keys that are not filters or default
    Object.entries(options).forEach(([key, value]) => {
        if (!validKeys.includes(key) && value !== undefined && value !== null && value !== '') {
            query.append(key, value);
        }
    });

    const queryString = query.toString();
    path = queryString ? `${path}?${queryString}` : path;

    // Validate the path against the router configuration
    const resolvedRoute = applicationInstance.$router.resolve(path);

    // Defensive check:
    // For Vue Router 3.x, `resolve` returns an object. This object should have a `route`
    // property, which in turn contains the `matched` array of route records.
    if (!resolvedRoute || !resolvedRoute.route || !Array.isArray(resolvedRoute.route.matched)) {
        console.error(
            `Error: Vue Router's resolve method returned an unexpected or incomplete result for path "${path}". ` +
            `Cannot validate route. Expected 'resolvedRoute.route.matched' to be an array. Navigation aborted.`,
            "Resolved route object:", resolvedRoute
        );
        return;
    }

    // Access the matched routes via resolvedRoute.route.matched
    if (resolvedRoute.route.matched.length === 0) {
        // This case is rare if a wildcard/404 route is configured,
        // but it means absolutely no route matches.
        console.error(`Error: The path "${path}" does not resolve to any configured route. Navigation aborted.`);
        return;
    }

    // Check if the path resolves to a "Not Found" or similar catch-all route.
    // Replace 'NotFound' with the actual name of your "Not Found" / 404 route.
    // If your 404 route isn't named, you might need to check resolvedRoute.route.matched
    // for a specific path pattern (e.g., '/:pathMatch(.*)*').
    const isNotFoundRoute = resolvedRoute.route.name === 'not-found'; // Adjust 'NotFound' as needed

    if (isNotFoundRoute) {
        console.warn(`Warning: The path "${path}" resolves to the 'not-found' route. This might indicate an issue with the generated path or a missing specific route configuration.`);
        // Depending on requirements, you might still want to proceed to show the 404 page,
        // or you might want to abort here if set_route should only navigate to "valid" specific pages.
        // For now, we'll let it proceed to show the 404 page.
    }

    // Use Vue Router to navigate
    applicationInstance.$router.push(path);
}

export const format = function(value, options = {}) {
    // If value is null or undefined, return empty string
    if (value === null || value === undefined) {
        return '';
    }

    // Handle date formatting
    if (options.fieldtype === 'Date' || options.fieldtype === 'Datetime') {
        // Get input format from options or use config format
        const inputFormat = options.inputFormat || 
            (options.fieldtype === 'Date' ? 
                window.config.globalDateFormatShort : 
                window.config.globalDateFormatLong);

        // Parse date with specified input format
        const date = moment(value, inputFormat, true);

        if (!date.isValid()) {
            console.warn(`Invalid date format. Expected format: ${inputFormat}`);
            return value;
        }

        // Get output format from options or use config format
        const outputFormat = options.format || 
            (options.fieldtype === 'Date' ? 
                window.config.globalDateFormatShort : 
                window.config.globalDateFormatLong);

        // Format the date
        return date.format(outputFormat);
    }

    // Handle currency formatting
    if (options.fieldtype === 'Currency') {
        const number = parseFloat(value);
        if (isNaN(number)) {
            return value;
        }

        // Get currency symbol from options
        const currency = options.currency || '';
        
        // Format number with commas and 2 decimal places
        const formattedNumber = number.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return `${currency}${formattedNumber}`;
    }

    // Handle number formatting
    if (options.fieldtype === 'Int' || options.fieldtype === 'Float') {
        const number = parseFloat(value);
        if (isNaN(number)) {
            return value;
        }

        // Get precision from options or use default
        const precision = options.precision || (options.fieldtype === 'Int' ? 0 : 2);
        
        // Format number with commas and specified precision
        return number.toLocaleString('en-US', {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
        });
    }

    // Return original value for other types
    return value;
}