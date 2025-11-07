if (document.currentScript) {
    // This is relative nginx public path will be used in host
    const VERSIONED_URL = document.currentScript.src;
    const INDEX = VERSIONED_URL.indexOf("?") === -1 ? undefined : VERSIONED_URL.indexOf("?");
    const URL = VERSIONED_URL.slice(0, INDEX);
    __webpack_public_path__ = URL + '/../';
}