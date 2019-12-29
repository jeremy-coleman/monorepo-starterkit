import CleanPlugin from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { DefinePlugin } from 'webpack';
import ManifestPlugin from 'webpack-manifest-plugin';

import { FRONT_PAGES_FOLDER } from './src/config';

const excludedManifestAssets = [
  'service-worker.js',
  'manifest.json'
];

module.exports = (env: IEnv = {}) => ({
  mode: env.dev ? 'development' : 'production',

  target: 'web',

  context: __dirname,

  entry: {
    app: './src/front.entry.ts',
  },

  output: {
    path: path.join(__dirname, './dist/front'),
    filename: env.dev ? '[name].js' : '[name].[hash].js',
    publicPath: './',
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

      {
        test: /\.scss$/,
        use: [
          env.dev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },

      {
        test: /\.css$/,
        use: [
          env.dev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },

      // Removed: because of the <link rel="manifest" href="manifest.json">
      /*{
        test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: [':src', 'link:href'],
          },
        },
      },*/

      {
        test: /\.(png|jpg|gif|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images/',
              name: '[name].[hash].[ext]',
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new CleanPlugin('./dist/front'),

    new CopyPlugin([
      { from: './src/front/pages', to: `./${FRONT_PAGES_FOLDER}` },
      { from: './src/front/assets', to: `./assets` },
      { from: './src/front/service-worker.js' },
      { from: './src/front/manifest.json' },
    ]),

    new MiniCssExtractPlugin({
      filename: env.dev ? '[name].css' : '[name].[hash].css',
      chunkFilename: env.dev ? '[id].css' : '[id].[hash].css',
    }),

    new HtmlPlugin({
      template: './src/front/index.html',
    }),

    new ManifestPlugin({
      fileName: 'assets.json',
      filter: options => excludedManifestAssets.indexOf(options.path) === -1
    }),

    new DefinePlugin({
      PRODUCTION: JSON.stringify(!env.dev),
    })
  ],

  /*
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  */

  devtool: 'source-map',

  devServer: {
    contentBase: path.join(__dirname, './dist/front'),
    compress: true,
    host: '127.0.0.1',
    port: 3000,
    historyApiFallback: {
      rewrites: [
        { from: /^\/content/, to: '/index.html' },
      ],
    },
  },
});

interface IEnv {
  dev?: boolean;
}
