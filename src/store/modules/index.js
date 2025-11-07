import { PageBuilderModules } from "./pageBuilderModules";

console.log("PageBuilderModules ", PageBuilderModules);

const requireModule = require.context('.', false, /\.store\.js$/);
const modules = {
    ...PageBuilderModules,
};

requireModule.keys().forEach(filename => {
    // create the module name from fileName
    // remove the store.js extension and capitalize
    const moduleName = filename
        .replace(/(\.\/|\.store\.js)/g, '')
        .replace(/^\w/, c => c.toUpperCase());

    modules[moduleName] = requireModule(filename).default || requireModule(filename);
});

export default modules;
