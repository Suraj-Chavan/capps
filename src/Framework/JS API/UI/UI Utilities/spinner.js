/**
 * Global Spinner Handler for CAPPS Framework
 * Uses pure DOM-based spinner (no Vue dependency)
 * Works reliably during route navigation and before Vue component mount
 *
 * Usage:
 * capps.ui.showSpinner('Loading...');
 * capps.ui.updateSpinnerMessage('New message');
 * capps.ui.hideSpinner();
 * capps.ui.hideSpinnerAfter(1000);
 */

let domSpinnerInitialized = false;
let lastMessageUpdateTime = 0;
const MESSAGE_VISIBILITY_DURATION = 600; // Minimum milliseconds each message should be visible

/**
 * Initialize DOM-based fallback spinner (no Vue dependency)
 * Used before Vue component is mounted
 */
function initializeDomSpinner() {
    if (domSpinnerInitialized) return;

    const style = document.createElement('style');
    style.id = 'capps-spinner-styles';
    style.textContent = `
        #capps-dom-spinner {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.3);
            z-index: 9999;
            animation: fadeIn 0.3s ease-in;
        }

        #capps-dom-spinner.show {
            display: flex !important;
            justify-content: center;
            align-items: center;
        }

        .capps-dom-spinner-container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            text-align: center;
            min-width: 320px;
        }

        .capps-dom-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: capps-spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        .capps-dom-spinner-message {
            margin: 0;
            color: #333;
            font-size: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-weight: 500;
            line-height: 1.4;
        }

        @keyframes capps-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    const spinner = document.createElement('div');
    spinner.id = 'capps-dom-spinner';
    spinner.innerHTML = `
        <div class="capps-dom-spinner-container">
            <div class="capps-dom-spinner"></div>
            <p class="capps-dom-spinner-message">Loading...</p>
        </div>
    `;
    document.body.appendChild(spinner);

    domSpinnerInitialized = true;
    console.debug('[CAPPS UI] DOM spinner fallback initialized');
}

/**
 * Show DOM spinner (fallback when Vue component not ready)
 */
function showDomSpinner(message = 'Loading...') {
    if (!domSpinnerInitialized) {
        initializeDomSpinner();
    }
    const spinner = document.getElementById('capps-dom-spinner');
    const msgEl = spinner.querySelector('.capps-dom-spinner-message');
    if (msgEl) msgEl.textContent = message;
    spinner.classList.add('show');
    lastMessageUpdateTime = Date.now(); // Track initial message time
}

/**
 * Update DOM spinner message with minimum visibility duration
 * Ensures each message is visible for at least MESSAGE_VISIBILITY_DURATION ms
 */
async function updateDomSpinnerMessage(message) {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastMessageUpdateTime;

    // If not enough time has passed, wait before updating
    if (timeSinceLastUpdate < MESSAGE_VISIBILITY_DURATION) {
        const delayNeeded = MESSAGE_VISIBILITY_DURATION - timeSinceLastUpdate;
        await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }

    const spinner = document.getElementById('capps-dom-spinner');
    if (spinner) {
        const msgEl = spinner.querySelector('.capps-dom-spinner-message');
        if (msgEl) msgEl.textContent = message;
        lastMessageUpdateTime = Date.now();
    }
}

/**
 * Hide DOM spinner
 */
function hideDomSpinner() {
    const spinner = document.getElementById('capps-dom-spinner');
    if (spinner) {
        spinner.classList.remove('show');
        // Ensure visibility is removed
        spinner.style.display = 'none';
        console.debug('[CAPPS UI] DOM Spinner hidden - show class removed and display set to none');
    } else {
        console.debug('[CAPPS UI] DOM Spinner element not found');
    }
}

/**
 * Show spinner with message
 * @param {string} message - Message to display
 */
function showSpinner(message = 'Loading...') {
    showDomSpinner(message);
    console.debug(`[CAPPS UI] Spinner shown: "${message}"`);
}

/**
 * Update spinner message with automatic minimum visibility delay
 * @param {string} message - New message to display
 * @returns {Promise} Promise that resolves when message is updated
 */
function updateSpinnerMessage(message) {
    return updateDomSpinnerMessage(message);
}

/**
 * Hide spinner immediately
 */
function hideSpinner() {
    console.debug('[CAPPS UI] hideSpinner called');
    hideDomSpinner();
    console.info('[CAPPS UI] Spinner hidden');
}

/**
 * Hide spinner after a delay
 * @param {number} delay - Milliseconds to wait (default: 1000)
 */
function hideSpinnerAfter(delay = 1000) {
    setTimeout(() => {
        hideDomSpinner();
    }, delay);
}

export {
    showSpinner,
    updateSpinnerMessage,
    hideSpinner,
    hideSpinnerAfter
};