// d:\credence\Servers\Funds\Apps\ui\capps\packages\vue3-mfe\src\exposes\MyVue3ComponentEntry.js
import MyVue3Component from '../components/MyVue3Component.vue';
import { createMfeInterface } from '../utils/createMfeInterface';

// Use the utility to get the mount function (and its returned controls)
const mfeInterface = createMfeInterface(MyVue3Component);

// Expose the mount function, or the whole interface if you prefer
export const mount = mfeInterface.mount;
// Alternatively, to expose the whole object:
// export default mfeInterface;
// Your Vue3ComponentLoader expects `loadedModule.mount`, so exporting `mount` directly is fine.
