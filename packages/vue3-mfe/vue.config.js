const path = require('path');
const webpack = require('webpack')
const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;

const IS_PROD = process.env.NODE_ENV === 'production';
const APP_NAME1 = "capps_vue3_package";
const entry = (IS_PROD) ? {
    [APP_NAME1]: "./setup-public-path.js",
} : {};

const folderName = path.basename(__dirname);
const buildRoot = path.resolve(__dirname, '../../');
const outputDir = path.resolve(buildRoot, `dist__${folderName}`);

module.exports = {
  outputDir,
  publicPath: IS_PROD ? './' : `https://127.0.0.1:7979/`,
  runtimeCompiler: true,
  configureWebpack: {
    entry,
    devtool: "source-map",
    devServer: {
      port: 7979,
      https: true,
      allowedHosts: 'auto',
      hot: 'only',
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
      client: {
        overlay: {
          errors: false,
          warnings: false,
          runtimeErrors: false,
        },
      }
    },
    resolve: {},
    externals: {
      config: "config",
      capps: "capps"
    },
    optimization: {
      splitChunks: false,
    },
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(true), // or false, based on your needs
        // Other feature flags if needed
      }),
      new ModuleFederationPlugin({
        name: APP_NAME1,
        filename: APP_NAME1 + ".js",
        remotes: {},
        exposes: {
          './MyVue3Component': './src/exposes/MyVue3ComponentEntry.js',
          './DataTable': './src/exposes/DataTableEntry.js',
          './MenuBar': './src/exposes/MenuBar.js',
          "./RecordSummaryDetails": "./src/exposes/RecordSummaryDetails.js",
          "./AccordionPanel": "./src/exposes/AccordionPanelEntry.js",
          "./Vue2ComponentLoader": "./src/exposes/Vue2ComponentLoaderEntry.js",
        },
        shared: {
          'vue': { singleton: true, requiredVersion: '^3.5.13', eager: true, },
          'primevue': { singleton: true, requiredVersion: '^4.2.0' },
          'primeicons': { singleton: true, requiredVersion: '^7.0.0' },
          'primeflex': { singleton: true, requiredVersion: '^4.0.0' },
          'primevue/resources': { singleton: true, requiredVersion: '^4.2.0' },
          'primevue/resources/themes/lara-light-blue': { singleton: true, requiredVersion: '^4.2.0' },
          'primevue/resources/themes/lara-light-blue/theme.css': { singleton: true, requiredVersion: '^4.2.0' },
          'primevue/resources/themes/lara-light-blue/theme.css.map': { singleton: true, requiredVersion: '^4.2.0' },
        },
      })
    ]
  },
};