import configLoader from "config.js";

configLoader(async function (config) {
    window.config = config;

    import("./bootstrap");
});