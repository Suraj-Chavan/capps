// d:\credence\Servers\Funds\Apps\ui\capps\packages\vue3-mfe\src\exposes\DataTableEntry.js
import setupPrimeVue from "../plugins/primevue-setup.js";
import DataTableComponent from '../components/DataTable/DataTable.vue';
import { createMfeInterface } from '../utils/createMfeInterface';

// Pass the Vue component and the setup handler to createMfeInterface
const mfeInterface = createMfeInterface(DataTableComponent, setupPrimeVue);

// Expose the mount function, which is what Vue3ComponentLoader expects
export const mount = mfeInterface.mount;
