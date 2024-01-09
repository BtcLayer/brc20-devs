const webpack = require("webpack");

//flag checks
const Min = Boolean(Number(process.env.MINI));
module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === "ModuleScopePlugin"
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      webpackConfig.ignoreWarnings = [/Failed to parse source map/];

      return {
        ...webpackConfig,
        entry: {
          main: [
            env === "development" && require.resolve("react-dev-utils/webpackHotDevClient"),
            paths.appIndexJs
          ].filter(Boolean),

        },
        output: {
          ...webpackConfig.output,
          filename: "static/js/[name].js"
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
          minimize: Min
        },
        resolve: {
          ...webpackConfig.resolve,
          fallback: {
            ...webpackConfig.resolve.fallback,
            crypto: require.resolve("crypto-browserify"),
            buffer: require.resolve("buffer"),
            url: require.resolve("url/"),
            stream: require.resolve("stream-browserify"),
            util: require.resolve("util/"),
            assert: require.resolve("assert/"),
            https: require.resolve("https-browserify"),
            http: require.resolve("stream-http"),
            path: require.resolve("path-browserify"),
            zlib: require.resolve("browserify-zlib"),
            querystring: require.resolve("querystring-es3"),
            os: false,
            net:false,
            tls:false,
            process: require.resolve("browser-process"),
            vm: require.resolve("vm-browserify"),
            fs: require.resolve('browserify-fs')
          }
        },
        
        plugins: [
          ...webpackConfig.plugins,
          new webpack.ProvidePlugin({
            process: 'process/browser',
          }),
          new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"]
          })
        ]
      };
    }
  }
};

