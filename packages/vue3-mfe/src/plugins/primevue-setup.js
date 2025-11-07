// Import PrimeVue core and components
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';
import Aura from '@primeuix/themes/aura';

// import '@primeuix/themes/theme-aura.css'; // eg: theme-lara-light-indigo.css
/**
 * Sets up PrimeVue for a given Vue 3 application instance.
 * @param {import('vue').App} app - The Vue 3 application instance.
 */
export default function setupPrimeVue(app) {
    console.log('[PrimeVue Setup] Initializing PrimeVue with Aura theme preset...');
    app.use(PrimeVue, {
        ripple: true,
        theme: {
            preset: Aura,                  // token-based styling applying CSS variables
            options: {
                prefix: 'p',
                darkModeSelector: 'light',
                cssLayer: false
            }
        }
    });
    // You can register commonly used components globally here if desired
}