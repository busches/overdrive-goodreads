import secrets from 'secrets';
import mem from 'mem';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

const getGoodreadsData = mem(async searchString => {
	const noMatchFound = {
		rating: '??',
		searchString
	};

	// TODO Move this to API class
	const response = await fetch(`https://www.goodreads.com/search/index?key=${secrets.goodreadsApiKey}&q=${encodeURIComponent(searchString)}`);
	const xml = await response.text();
	const data = (new window.DOMParser()).parseFromString(xml, 'text/xml');
	const numberOfResults = data.querySelector('results-end').textContent; // Total-results is sometimes just wrong

	if (numberOfResults > 1) {
		const allResults = data.querySelectorAll('work');
		const filteredResults = [];
		allResults.forEach(searchResult => {
			// A lot of results start with 'Summary' we don't care about those
			const title = searchResult.querySelector('title').textContent;
			if (!title.startsWith('Summary')) {
				filteredResults.push(searchResult);
			}
		});

		// If all the remaining results have the same name, prefer the one with more results
		if (filteredResults.length > 1) {
			const allTitles = filteredResults.map(searchResult => searchResult.querySelectorAll('title').textContent);
			const firstTitle = allTitles[0];
			const allTitlesMatch = allTitles.every(title => title === firstTitle);

			if (allTitlesMatch) {
				let highestRatedResult = null;
				let highestRating = 0;

				filteredResults.forEach(searchResult => {
					const thisRating = parseInt(searchResult.querySelector('ratings_count').textContent, 10);
					if (thisRating > highestRating) {
						highestRating = thisRating;
						highestRatedResult = searchResult;
					}
				});

				return getResultMatchData(highestRatedResult, searchString);
			}
		} else if (filteredResults.length === 1) {
			return getResultMatchData(filteredResults[0], searchString);
		}
	} else if (numberOfResults === 0) {
		return noMatchFound;
	}

	return getResultMatchData(data, searchString);
}, {
	maxAge: ONE_WEEK
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const searchString = `${request.title} ${request.author}`;
	getGoodreadsData(searchString).then(sendResponse);
	return true;
});

function getResultMatchData(data, searchString) {
	const rating = data.querySelector('work average_rating').textContent;
	const bookId = data.querySelector('work best_book id').textContent;
	return {
		bookId,
		rating,
		searchString
	};
}
