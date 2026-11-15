process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const webpack = require('webpack');
const config = require('../webpack.config.cjs');

webpack(
	config,
	error => {
		if (error) {
			throw error;
		}
	},
);
