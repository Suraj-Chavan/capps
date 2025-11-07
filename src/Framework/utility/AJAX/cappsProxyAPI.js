import { getDependency } from '../DEPENDENCIES_INHERITANCE/getDependency';

export default function (arg) {
    arg = arg || {};
    let routePrefix = arg.routePrefix || "";
    // A function that will handle the fetch operation
    function fetchData(url, vObj, configurations = {}, headers = {}) {
        const _this = getDependency('applicationInstance');
        configurations.loader !== false && _this.$store.commit('loading', true);
        return _this.$credCAPI
        .collection(url)
        .read({ body: vObj, configurations, headers })
        .then(response => {
            configurations.loader !== false && _this.$store.commit('loading', false);
            return response;
        })
        .catch(error => {
            configurations.loader !== false &&  _this.$store.commit('loading', false);
            return error
        });
    }

    // Recursive function to create the proxy
    function createAPIProxy(rootUrl) {
        return new Proxy(() => { }, {
            apply: function (target, thisArg, argumentsList) {
                return fetchData(routePrefix + rootUrl, ...argumentsList);
            },
            get: function (target, property) {
                return createAPIProxy(`${rootUrl}/${property}`);
            }
        });
    }

    // Initialize the proxy for the main object
    return new Proxy({}, {
        get: function (target, property) {
            return createAPIProxy(property);
        }
    });
}