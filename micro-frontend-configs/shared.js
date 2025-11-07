const deps = require('../package.json').dependencies;
module.exports = {
    ...deps,
    vue: {
        import: "vue", // the "react" package will be used a provided and fallback module
        shareKey: "vue", // under this name the shared module will be placed in the share scope
        shareScope: "default", // share scope with this name will be used
        singleton: true, // only a single version of the shared module is allowed
        requiredVersion: deps.vue,
        // eager: true,
    }
}