export function getDependency(key) {
    if (!capps.__proto__.$capps?.[key]) {
        console.error(`[CAPPS Framework Error]: ${key} dependency is not injected. Please ensure you have injected it using capps.injectDependencies("${key}", value)`);
        throw new Error(`${key} is not available`);
    }
    return capps.__proto__.$capps[key];
}

// Multiple dependencies एकदम get करण्यासाठी
export function getDependencies(...keys) {
    return keys.reduce((acc, key) => {
        acc[key] = getDependency(key);
        return acc;
    }, {});
} 