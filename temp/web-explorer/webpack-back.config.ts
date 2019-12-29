import path from 'path';

import CleanPlugin from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

module.exports = (env: IEnv = {}) => ({
  mode: env.dev ? 'development' : 'production',

  target: 'node',

  node: {
    __dirname: false,
    __filename: false,
  },

  context: __dirname,

  entry: {
    app: './src/back.entry.ts',
  },

  output: {
    path: path.join(__dirname, './dist/back'),
    filename: '[name].js',
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
    ],
  },

  plugins: [
    new CleanPlugin('./dist/back'),

    new CopyPlugin([
      { from: './src/back/pages', to: './pages' },
    ]),
  ],

  devtool: 'source-map',
});

interface IEnv {
  dev?: boolean;
}
