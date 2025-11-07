/**
 * Module Context Manager
 * Tracks current module being viewed
 * Accessible to iframe/page-builder via capps.module
 *
 * Usage:
 * Parent (CAPPS): capps.module.setCurrentModule('moduleName')
 * Page-builder: capps.module.getCurrentModule()
 */

let currentModule = null;

export const moduleContext = {
    /**
     * Set the current module (called from router or parent CAPPS)
     * @param {string} moduleName - Name of current module
     */
    setCurrentModule: (moduleName) => {
        currentModule = moduleName;
        console.debug(`[Module Context] Current module set to: ${moduleName}`);
    },

    /**
     * Get the current module (accessible from page-builder or any child context)
     * @returns {string|null} Current module name
     */
    getCurrentModule: () => {
        return currentModule;
    },

    /**
     * Clear current module
     */
    clearCurrentModule: () => {
        currentModule = null;
    },

    /**
     * Check if module context is available
     * @returns {boolean} true if module is set
     */
    hasModule: () => {
        return currentModule !== null;
    }
};
