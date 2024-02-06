require('dotenv/config');

const path = require('path');
const childProcess = require('child_process');
const { DefinePlugin, ProvidePlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const PATHS = {
  src: path.resolve(__dirname, '../src'),
};

const GIT_DIR = path.resolve(__dirname, '../.git');

const METADATA = {
  build: '',
  branch: '',
  date: '',
};

try {
  METADATA.build = childProcess.execSync(`git --git-dir=${GIT_DIR} rev-list HEAD --count`).toString().trim();
} catch (error) {
  // console.log(error)
}

try {
  METADATA.branch = childProcess.execSync(`git --git-dir=${GIT_DIR} rev-parse --abbrev-ref HEAD`).toString().trim();
} catch (error) {
  // console.log(error)
}

try {
  METADATA.date = childProcess.execSync(`git --git-dir=${GIT_DIR} log -1 --format=%at origin/develop | xargs -I{} date -d @{} +"%m-%d-%Y %H:%M:%S"`).toString().trim();
} catch (error) {
  // console.log(error)
}

module.exports = {
  entry: path.join(PATHS.src, 'index.js'),
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new DefinePlugin({
      __VERSION__: JSON.stringify('0.1.0'),
      __BUILD__: JSON.stringify(METADATA.build),
      __BRANCH__: JSON.stringify(METADATA.branch),
      __DATE__: JSON.stringify(METADATA.date),
    }),
    new ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheCompression: false,
          cacheDirectory: true,
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: MiniCssExtractPlugin.loader, options: { esModule: false } }, 'css-loader'],
      },
      {
        test: /\.(jpg|png|gif|ico)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(svg)$/,
        type: 'asset/inline',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/inline',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    fallback: { fs: false },
    alias: {
      process: 'process/browser',
    },
  },
};
