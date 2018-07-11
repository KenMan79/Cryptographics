const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = {
  entry: {
    app: ['babel-polyfill', path.resolve(__dirname, '../src/client-entry.js')],
  },
  output: {
    path: path.resolve(__dirname, '../../public'),
    filename: 'assets/js/[name].js',
  },
  resolve: {
    extensions: ['.vue', '.js', '.scss', '.eot', '.svg', '.ttf', '.woff', '.woff2', '.png', '.jpg'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.(scss|css)$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|jpeg|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: 'assets/images/[name].[ext]?[hash]'
        }
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/font-woff',
              name: 'fonts/[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: 'frontend/prod.html',
      filename: 'index.html',
      // favicon: 'src/favicon.ico',
      hash: true,
    }),
    new AddAssetHtmlPlugin([
      {
        filepath: require.resolve('../lib/ipfs.min.js'),
        includeSourcemap: false,
      },
    ]),
    new VueLoaderPlugin()
  ],
};

module.exports = config;
