// Expose entry for AccordionPanel component
import setupPrimeVue from "../plugins/primevue-setup.js";
import AccordionPanelComponent from '../components/AccordionPanel/AccordionPanel.vue';
import { createMfeInterface } from '../utils/createMfeInterface';

// Pass the Vue component and the setup handler to createMfeInterface
const mfeInterface = createMfeInterface(AccordionPanelComponent, setupPrimeVue);

// Expose the mount function, which is what Vue3ComponentLoader expects
export const mount = mfeInterface.mount;
