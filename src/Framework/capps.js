export { rest } from "./JS API/REST/index.js";
export { rpc } from "./JS API/RPC/index.js";
export { ui } from "./JS API/UI/index.js";
export { loader } from "./JS API/Loader/index.js";
export { moduleContext as module } from "./Router/moduleContext.js";
export { application } from "./Application Configurations/index.js";
export * from "./JS API/Common Utilities/index.js";

// Phase 9: Asset Manifest Loader for bundled assets
// Phase 10: App Include Files (hooks-style loading for JS/CSS without bundler)
export { loadManifestAssets, loadAppIncludeFiles, clearAssetCache } from "./Asset Loader/AssetLoader.js";
