// d:\credence\Servers\Funds\Apps\ui\capps\packages\vue3-mfe\src\exposes\DataTableEntry.js
import MenuBar from '../components/MenuBar/MenuBar.vue';
import { createMfeInterface } from '../utils/createMfeInterface';
import setupPrimeVue from "../plugins/primevue-setup.js";

// Pass the Vue component and the setup handler to createMfeInterface
const mfeInterface = createMfeInterface(MenuBar, setupPrimeVue);

// Expose the mount function, which is what Vue3ComponentLoader expects
export const mount = mfeInterface.mount;
