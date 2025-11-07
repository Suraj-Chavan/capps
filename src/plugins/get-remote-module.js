// src/plugins/get-remote-module.js (Conceptual - ensure your actual file reflects this)

// Store promises for loaded scripts to prevent redundant loading attempts for the same URL
const loadedScriptPromises = new Map();

const loadScript = (url, globalVarName) => {
    // If we already have a promise for this URL, return it to avoid re-fetching/re-evaluating
    if (loadedScriptPromises.has(url)) {
        console.log(`Reusing existing load promise for script "${url}" expecting global "${globalVarName}".`);
        return loadedScriptPromises.get(url);
    }

    const scriptPromise = new Promise((resolve, reject) => {
        // Check if the remote container is already available (script might have been loaded by other means or a previous call)
        if (window[globalVarName]) {
            console.log(`Remote container "${globalVarName}" already available globally.`);
            return resolve(window[globalVarName]);
        }

        // Check if a script tag with this URL already exists in the document
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
            console.warn(`Script tag for "${url}" already exists in DOM. Waiting for "${globalVarName}" to be defined. This might indicate a race condition or improper cleanup.`);
            // This scenario is tricky. The script is there, but the global isn't.
            // It might be still loading, or it failed.
            // A robust solution might involve attaching to its onload/onerror if possible, or a more sophisticated polling.
            // For simplicity here, we'll rely on the new script tag's onload, but this is a point of attention.
            // If this happens frequently, investigate why the global isn't set after the script tag is present.
        }

        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.defer = true; // Ensure it executes after the DOM is parsed but before DOMContentLoaded

        script.onload = () => {
            console.log(`Script "${url}" loaded via onload event. Checking for global "${globalVarName}".`);
            if (window[globalVarName]) {
                console.log(`Global "${globalVarName}" found:`, window[globalVarName]);
                resolve(window[globalVarName]);
            } else {
                console.error(`Script "${url}" loaded, but global variable "${globalVarName}" is UNDEFINED.`);
                reject(new Error(`Script "${url}" loaded but global variable "${globalVarName}" not found.`));
            }
        };

        script.onerror = (event) => {
            console.error(`Failed to load script "${url}":`, event);
            document.head.removeChild(script); // Clean up failed script tag
            loadedScriptPromises.delete(url); // Allow retrying if this was a transient error
            reject(new Error(`Failed to load script "${url}". Check network tab for details (CORS, 404, etc.).`));
        };

        console.log(`Appending script tag for "${url}" to load remote "${globalVarName}".`);
        document.head.appendChild(script);
    });

    loadedScriptPromises.set(url, scriptPromise);
    return scriptPromise;
};

const initializeShareScope = async (container) => {
    if (!container || typeof container.init !== 'function') {
        console.error('Invalid container passed to initializeShareScope:', container);
        throw new Error('Cannot initialize share scope: Invalid container.');
    }
    // __webpack_share_scopes__ is a global object provided by Webpack for Module Federation.
    if (typeof __webpack_share_scopes__ !== 'undefined' && __webpack_share_scopes__.default) {
        console.log('Initializing share scope with host default scope.');
        await container.init(__webpack_share_scopes__.default);
    } else {
        console.warn('Host share scope (__webpack_share_scopes__.default) not found. Initializing remote with an empty scope. This may affect shared dependencies.');
        await container.init({});
    }
    console.log(`Share scope initialized for container.`);
};

const getRemoteModule = async ({ remoteAppName, remoteURL, callback }) => {
    if (!remoteAppName || !remoteURL || !callback) {
        const errorMessage = 'remoteAppName, remoteURL, and callback are required for getRemoteModule.';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    console.log(`getRemoteModule called for: appName="${remoteAppName}", url="${remoteURL}"`);

    try {
        const container = await loadScript(remoteURL, remoteAppName);

        if (!container) { // Should be caught by loadScript's reject, but as a safeguard
            throw new Error(`Remote container "${remoteAppName}" could not be loaded or was undefined after script load.`);
        }
        if (typeof container.init !== 'function' || typeof container.get !== 'function') {
            throw new Error(`Object found for "${remoteAppName}" is not a valid Module Federation container. 'init' or 'get' method is missing.`);
        }

        await initializeShareScope(container);

        const loadComponentInternal = async (moduleToExpose) => {
            if (!moduleToExpose) {
                throw new Error('moduleToExpose (e.g., "./MyComponent") is required for loadComponentInternal.');
            }
            console.log(`Attempting to get module "${moduleToExpose}" from container "${remoteAppName}".`);
            const factory = await container.get(moduleToExpose);
            if (typeof factory !== 'function') {
                throw new Error(`Failed to get a factory function for module "${moduleToExpose}" from container "${remoteAppName}". Received: ${typeof factory}`);
            }
            const Module = await factory();
            console.log(`Module "${moduleToExpose}" loaded successfully from container "${remoteAppName}".`);
            return Module;
        };

        return callback(loadComponentInternal);

    } catch (error) {
        console.error(`Error in getRemoteModule for "${remoteAppName}" from "${remoteURL}":`, error.message);
        // Propagate the error so Vue3ComponentLoader can catch it and set errorLoading
        throw error;
    }
};

export default getRemoteModule;

