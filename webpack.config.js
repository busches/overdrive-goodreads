const path = require('path');
const fileSystem = require('fs');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
		content: path.join(__dirname, 'src', 'content.js')
	},
	output: {
		path: path.join(__dirname, 'build'),
		filename: '[name].bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.(js)$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		alias,
		extensions: ['.js']
	},
	plugins: [
		// Clean the build folder
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin([{
			from: 'src/manifest.json'
		}])
	]
};

module.exports = options;
