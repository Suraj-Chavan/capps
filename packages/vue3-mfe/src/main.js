// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'; // Assuming your MFE package has a root App.vue

// Import the centralized PrimeVue setup function
import setupPrimeVue from '@/plugins/primevue-setup';

// Import any other plugins or configurations needed for the main app
// import router from './router'; // Example

const app = createApp(App);
// Use the setup function to initialize PrimeVue for the main app instance
setupPrimeVue(app);

// Use other plugins for the main app
// app.use(router); // Example

app.mount('#app'); // Or your MFE's mount point