import setupPrimeVue from "../plugins/primevue-setup.js";
import Vue2ComponentLoaderComponent from '../components/Vue2ComponentLoader/Vue2ComponentLoader.vue';
import { createMfeInterface } from '../utils/createMfeInterface';

const mfeInterface = createMfeInterface(Vue2ComponentLoaderComponent, setupPrimeVue);
export const mount = mfeInterface.mount;
