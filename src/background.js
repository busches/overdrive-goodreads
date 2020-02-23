import secrets from 'secrets';
import mem from 'mem';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

const getGoodreadsData = mem(async searchString => {
	const response = await fetch(`https://www.goodreads.com/search/index?key=${secrets.goodreadsApiKey}&q=${encodeURIComponent(searchString)}`);
	const xml = await response.text();
	const data = (new window.DOMParser()).parseFromString(xml, 'text/xml');
	const numberOfResults = data.querySelector('total-results').textContent;

	if (numberOfResults === '0') {
		return '??';
	}

	const rating = data.querySelector('work average_rating').textContent;
	return {
		rating
	};
}, {
	maxAge: ONE_WEEK
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const searchString = `${request.title} ${request.author}`;
	getGoodreadsData(searchString).then(sendResponse);
	return true;
});
