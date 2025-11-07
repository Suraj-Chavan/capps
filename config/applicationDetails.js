const cacheBuster = Math.round(new Date().getTime() / 1000);

export const PUBLIC_URL = process.env.BASE_URL;

export const CONFIG_FILE_URL = (PUBLIC_URL || __webpack_public_path__) + "./config.js?cb='" + cacheBuster + "'";

export const LOCALE_DIR_URL = (PUBLIC_URL || __webpack_public_path__) + "./locales";