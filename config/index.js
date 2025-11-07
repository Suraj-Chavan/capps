import { CONFIG_FILE_URL } from "./applicationDetails";

const CONFIG_FILE_ERROR_MESSAGES = [
    "Configuration file not found",
    "Configuration file contains syntax errors"
];

const configLoader = function (callback) {
    if (configLoader.cache) return Promise.resolve(callback(configLoader.cache));

    if (configLoader.counter == null) configLoader.counter = 1;
    else configLoader.counter++;

    console.info(
        `Loading config file from ${CONFIG_FILE_URL}`,
        "\nconfigLoader.counter -::- ", configLoader.counter
    );

    return fetch(CONFIG_FILE_URL)
        .then(response => {
            if (response.status === 404) {
                throw new Error(CONFIG_FILE_ERROR_MESSAGES[0]);
            }
            return response.text();
        })
        .then(text => {
            let config;
            try {
                config = new Function(text + ";\n return config")();
                configLoader.cache = config;
            } catch {
                throw new Error(CONFIG_FILE_ERROR_MESSAGES[1]);
            }
            return callback(config);
        })
        .catch(async error => {
            if(!CONFIG_FILE_ERROR_MESSAGES.includes(error.message)) throw new Error(error);
            delete configLoader.cache;
            console.error("Error in configuration core `config.js` file :- ", error.message);
            const { default: Overlay} = await import("./Overlay");
            Overlay(error);
        })
};

export default configLoader;