/**
 @type {import('xo').FlatXoConfig}
 */
import globals from 'globals';

const xoConfig = [
	{
		ignores: [
			'utils/**',
			'webpack.config.cjs',
		],
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
	{
		files: ['**/package.json'],
		rules: {
			'package-json/prefer-files-field': 'off',
			'package-json/require-entry-point': 'off',
			'package-json/require-fields': 'off',
			'package-json/prefer-engines-range': 'off',
		},
	},
];

export default xoConfig;
