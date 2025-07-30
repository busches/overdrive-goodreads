const path = require('node:path');
const fileSystem = require('node:fs');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const ErrorLoggerPlugin = require('error-logger-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

// Load the secrets
const alias = {};

const secretsPath = path.join(__dirname, ('secrets.js'));

if (fileSystem.existsSync(secretsPath)) {
	alias.secrets = secretsPath;
}

const options = {
	mode: process.env.NODE_ENV || 'development',
	entry: {
		background: path.join(__dirname, 'src', 'background.js'),
		content: path.join(__dirname, 'src', 'content.js'),
	},
	output: {
		path: path.join(__dirname, 'build'),
		filename: '[name].bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.(js)$/,
				use: [{
					loader: 'source-map-loader',
				}, {
					loader: 'babel-loader',
				}],
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		alias,
		extensions: ['.js'],
		fallback: {
			child_process: false,
			fs: false,
			net: false,
			tls: false,
		},
	},
	plugins: [
		new ErrorLoggerPlugin({verbose: false}),
		new NodePolyfillPlugin(),
		new webpack.ProgressPlugin(),
		// Clean the build folder
		new CleanWebpackPlugin({
			verbose: true,
			cleanStaleWebpackAssets: true,
		}),
		new CopyWebpackPlugin({
			patterns: [{
				from: 'src/manifest.json',
			}],
		}),
	],
	infrastructureLogging: {
		level: 'info',
	},
};
if (process.env.NODE_ENV !== 'production') {
	options.devtool = 'cheap-module-source-map';
}

module.exports = options;
