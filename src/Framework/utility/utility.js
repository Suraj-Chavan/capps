export function createNullReturningProxy(target) {
    return new Proxy(target, {
        get: function (target, prop) {
            if (prop in target) {
                return typeof target[prop] === 'object' && target[prop] !== null ? createNullReturningProxy(target[prop]) : target[prop];
            }
            return null;
        },
        set: function (target, prop, value) {
            target[prop] = value;
            return true;
        }
    });
}

export function interpolate(str, vars) {
  return str.replace(/{([^}]+)}/g, (_, key) => vars[key] || "");
}