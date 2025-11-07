// d:\credence\Servers\Funds\Apps\ui\capps\packages\vue3-mfe\src\utils\createMfeInterface.js
import { createApp, h, reactive } from 'vue';

export function createMfeInterface(Vue3Component, setupApp) {
  return {
    mount: (el, initialProps) => {
      console.log(`[MFE Wrapper] Mounting component: ${Vue3Component.name || 'UnnamedComponent'} with initialProps:`, initialProps);
      // All props, including those that are event handlers (e.g., onMyEvent),
      // are made reactive.
      const reactiveProps = reactive({ ...initialProps });

      const app = createApp({
        render: () => h(Vue3Component, reactiveProps),
      });

      if (typeof setupApp === 'function') {
        setupApp(app);
      }

      app.mount(el);

      return {
        unmount: () => {
          if (app) {
            app.unmount();
            console.log(`[MFE Wrapper] Unmounted component: ${Vue3Component.name || 'UnnamedComponent'}`);
          }
        },
        update: (newProps) => {
          console.log(`[MFE Wrapper] Updating component (${Vue3Component.name || 'UnnamedComponent'}) with new props:`, newProps);
          if (!reactiveProps || !app) {
            console.warn('[MFE Wrapper] Update called but component is not mounted or reactiveProps not initialized.');
            return;
          }

          // Update existing props and add new ones
          for (const key in newProps) {
            if (Object.prototype.hasOwnProperty.call(newProps, key)) {
              reactiveProps[key] = newProps[key]; // This will update event handler props too
            }
          }
          // Remove props that were in reactiveProps but are not in newProps
          for (const key in reactiveProps) {
            if (
              Object.prototype.hasOwnProperty.call(reactiveProps, key) &&
              !Object.prototype.hasOwnProperty.call(newProps, key)
            ) {
              delete reactiveProps[key];
            }
          }
        },
      };
    },
  };
}
