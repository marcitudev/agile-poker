const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        exclude: [/node_modules/,/index.html/],
        use: ['html-loader']
      },
      {
        test: /\.scss$/,
        exclude: [/node_modules/],
        use: ['style-loader','css-loader', 'sass-loader']
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    historyApiFallback: true,
    port: 4200,
    open: true,
    hot: true,
  }
};