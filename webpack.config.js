var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: __dirname,
    filename: "dist/bundle.js"
  },
  module: {
    loaders: [
      // { test: /\.css$/, loader: "style!css" },
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, "css"),
        ],
        loader: 'style-loader!css-loader?modules'
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src"),
        ],
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime', 'transform-exponentiation-operator'],
        }
      }
  ]
  }
};
