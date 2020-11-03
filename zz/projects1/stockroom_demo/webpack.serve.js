/**
 * 
 * "start": "webpack-serve ./webpack.config.js --host=localhost --port=3000 --open --static=public --silent --progress='minimal'"
*/

const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const webpack = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
var CleanObsoleteChunks = require('webpack-clean-obsolete-chunks');
var jetpack = require('fs-jetpack')

jetpack.remove('public')
jetpack.copy('static', 'public', {overwrite: true})

module.exports = {
  mode: 'development',
  stats: "minimal",
  //devtool: 'inline-source-map',
  entry: './src/index.jsx',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public'),
  },
  resolve: {
    alias:{
      "react":"preact/compat",
      "react-dom":"preact/compat"
    },
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
          experimentalFileCaching: false
        },
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
      },

      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },

      {
        test: /\.svg(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'images/[name].[ext]',
            mimetype: 'image/svg+xml'
          }
        }
      },
      {
        test: /\.(png|jpg)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'images/[name].[ext]'
          }
        }
      }


    ],
  },
  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       commons: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors',
  //         chunks: 'all',
  //       },
  //     },
  //   },
  // },
  plugins: [
    new CleanObsoleteChunks(),
    //new CopyPlugin([{from: __dirname + 'static', to: __dirname + 'public'}]),
    //new webpack.NamedModulesPlugin(),
    new ForkTsCheckerWebpackPlugin({
      workers: 1 //ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE,
    }),
  ]
}