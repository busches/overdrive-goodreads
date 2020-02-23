var webpack = require("webpack"),
  path = require("path"),
  fileSystem = require("fs"),
  CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
  CopyWebpackPlugin = require("copy-webpack-plugin");

// load the secrets
var alias = {};

var secretsPath = path.join(__dirname, ("secrets.js"));

if (fileSystem.existsSync(secretsPath)) {
  alias["secrets"] = secretsPath;
}

var options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    background: path.join(__dirname, "src", "background.js"),
    content: path.join(__dirname, "src", "content.js")
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        loader: "babel-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: alias,
    extensions: [".js"]
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([{
      from: "src/manifest.json"
    }])
  ]
};

module.exports = options;
