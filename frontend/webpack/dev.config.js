const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BASE_CONFIG = require('./base.config');
const PATHS = {
  src: path.resolve(__dirname, '../src'),
  dist: path.resolve(__dirname, '../dist'),
  cache: path.resolve(__dirname, '../cache'),
};

module.exports = merge(BASE_CONFIG, {
  mode: 'development',
  stats: {
    colors: true
  },
  cache: {
    type: 'filesystem',
    name: 'plasticine',
    store: 'pack',
    cacheDirectory: PATHS.cache,
    idleTimeoutForInitialStore: 0
  },
  output: {
    path: PATHS.dist,
    filename: '[name].bundle.js',
    pathinfo: false,
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(PATHS.src, 'index.html'),
      favicon: path.join(PATHS.src, 'favicon.dev.ico'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      inject: true,
      hash: true,
    }),
  ],
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    hot: false,
    client: false,
    compress: true,
    liveReload: false,
    allowedHosts: 'all',
    port: process.env.SERVICE_PORT,
    historyApiFallback: true,
  },
  optimization: {
    minimize: false,
  },
});
