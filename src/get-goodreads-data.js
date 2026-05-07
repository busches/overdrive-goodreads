import memoize from 'memoize';
import secrets from 'secrets';
import {parseGoodreadsData} from './parse-goodreads-data.js';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

export const getGoodreadsData = memoize(
	async (searchTitle, searchAuthor) => {
		const searchString = `${searchTitle} ${searchAuthor}`;

		const response = await fetch(`https://www.goodreads.com/search/index?key=${
			secrets.goodreadsApiKey
		}&q=${encodeURIComponent(searchString)}`);
		const xml = await response.text();
		return parseGoodreadsData(xml, searchString);
	},
	{
		maxAge: ONE_WEEK,
	},
);
