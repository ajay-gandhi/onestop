/* global require, module, __dirname */

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: "./index.html",
  filename: "index.html",
  inject: "body",
});

module.exports = {
  context: path.resolve(__dirname, "view"),
  entry: "./index.js",
  output: {
    path: path.resolve("public"),
    filename: "bundle.js",
    publicPath: "/",
  },
  resolve: {
    modules: [
      path.resolve(__dirname, "view"),
      "node_modules"
    ],
    extensions: [".js", ".jsx"],
  },
  devServer: {
    historyApiFallback: true,
  },
  module: {
    rules: [
      { test: /\.jsx?$/, use: "babel-loader", exclude: /node_modules/ },
      { test: /\.s?css$/, use: ["style-loader", "css-loader", "sass-loader"] },
    ],
  },
  plugins: [HtmlWebpackPluginConfig],
};
