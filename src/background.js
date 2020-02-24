import secrets from 'secrets';
import mem from 'mem';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

const getGoodreadsData = mem(async searchString => {
	// TODO Move this to API class
	const response = await fetch(`https://www.goodreads.com/search/index?key=${secrets.goodreadsApiKey}&q=${encodeURIComponent(searchString)}`);
	const xml = await response.text();
	const data = (new window.DOMParser()).parseFromString(xml, 'text/xml');
	const numberOfResults = data.querySelector('results-end').textContent; // total-results is sometimes just wrong

	// Swap to search by title, then attempt to match on author
	if (numberOfResults !== '1') {
		return {
			rating: '??',
			searchString
		};
	}

	const rating = data.querySelector('work average_rating').textContent;
	const bookId = data.querySelector('work best_book id').textContent;
	return {
		bookId,
		rating,
		searchString
	};
}, {
	maxAge: ONE_WEEK
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const searchString = `${request.title} ${request.author}`;
	getGoodreadsData(searchString).then(sendResponse);
	return true;
});
