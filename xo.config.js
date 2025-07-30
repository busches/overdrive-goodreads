/** @type {import('xo').FlatXoConfig} */
import globals from 'globals';

const xoConfig = [
	{
		ignores: ['utils/*', 'webpack.config.js'],
	},
	{
		languageOptions: {
			globals: {
				chrome: true,
				...globals.browser,
			},
		},
		rules: {
			'no-unused-vars': [
				'error',
				{
					varsIgnorePattern: '^React$',
				},
			],
		},
	},
];

export default xoConfig;
