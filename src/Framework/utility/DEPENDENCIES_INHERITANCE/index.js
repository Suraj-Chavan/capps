import { getDependency, getDependencies } from './getDependency.js';

export default function injectDependencies(capps) {
    const proto = Object.getPrototypeOf(capps);
    
    // Using '$capps' as namespace for framework dependencies
    if (!proto.$capps) {
        Object.defineProperty(proto, '$capps', {
            value: Object.create(null),
            enumerable: false,
            configurable: true
        });
    }

    // Add injectDependencies to prototype
    Object.defineProperty(proto, 'injectDependencies', {
        enumerable: false,
        configurable: true,
        value: function(key, properties) {
            if (!key || typeof key !== 'string') return;
            
            // Don't override if exists
            if (key === "applicationInstance" && proto.$capps[key]) return;
            
            // Keep original prototype
            const originalProto = Object.getPrototypeOf(properties);
            
            // Create object with original prototype
            const obj = Object.create(originalProto);
            
            // Copy properties
            Object.getOwnPropertyNames(properties).forEach(prop => {
                const descriptor = Object.getOwnPropertyDescriptor(properties, prop);
                Object.defineProperty(obj, prop, descriptor);
            });
            
            // Simply add to $capps
            proto.$capps[key] = obj;
            
            return obj;
        }
    });

    Object.defineProperty(proto, 'getDependency', {
        enumerable: false,
        configurable: true,
        value: getDependency
    });

    Object.defineProperty(proto, 'getDependencies', {
        enumerable: false,
        configurable: true,
        value: getDependencies
    });
}