require("@credenceanalytics/inject-vue-app-version");
const overrideVueConfigs = require("@credenceanalytics/micro-frontend-common-setup");
const path = require('path');

const VueConfig = {
  publicPath: './',
  runtimeCompiler: true,
  configureWebpack: {
    devtool: "source-map",
    entry: {
      tailwind: "./src/tailwind-entry.js",
    },
    devServer: {
      port: 8888,
      client: {
        overlay: false,
      },
    },
    resolve: {
      alias: {
        'config.js': path.resolve(__dirname, "./config")
      }
    },
    externals: {
      Plotly: "Plotly",
      config: "config",
      capps: "capps"
    },
    plugins: [],
  },
  css: {
    extract: {
      filename: "css/[name].[contenthash:8].css",
      chunkFilename: "css/[name].[contenthash:8].css",
    },
  },
  chainWebpack: (config) => {
    // Route Tailwind CSS to separate directory
    if (config.plugins.has('extract-css')) {
      config.plugin('extract-css').tap((args) => {
        const options = args[0] || {};
        const originalFilename = options.filename;

        options.filename = (pathData) => {
          const name = pathData.chunk?.name || "app";
          if (name.includes("tailwind") || name.includes("tw-scope")) {
            return "css/tailwind/tailwind.[contenthash:8].css";
          }
          return typeof originalFilename === 'function'
            ? originalFilename(pathData)
            : originalFilename;
        };

        const originalChunkFilename = options.chunkFilename;
        options.chunkFilename = (pathData) => {
          const name = pathData.chunk?.name || "chunk";
          if (name.includes("tailwind") || name.includes("tw-scope")) {
            return "css/tailwind/tailwind.[contenthash:8].css";
          }
          return typeof originalChunkFilename === 'function'
            ? originalChunkFilename(pathData)
            : originalChunkFilename;
        };

        return [options];
      });
    }
  },
  productionSourceMap: true,
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
};


const VUE_CLI_CONFIGS = overrideVueConfigs(VueConfig, {
  app_name: "capps_app",
  port: 8888
});

VUE_CLI_CONFIGS.devServer.client = {
  overlay: false,
};

module.exports = VUE_CLI_CONFIGS;