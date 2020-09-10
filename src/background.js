import secrets from 'secrets';
import mem from 'mem';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

// https://bridges.overdrive.com/bridges-kirkendall/content/search/creatorId?query=453001&sortBy=newlyadded&format=audiobook-overdrive
// Alice and wonderland goes to wrong result
// Lots of classics link to wrong version
// https://www.goodreads.com/search/index?key=m&q=Alice%27s%20Adventures%20in%20Wonderland%20Lewis%20Carroll

const getGoodreadsData = mem(async (searchTitle, searchAuthor) => {
	const searchString = `${searchTitle} ${searchAuthor}`;
	const noMatchFound = {
		rating: '??',
		searchString
	};

	// TODO Move this to API class
	const response = await fetch(`https://www.goodreads.com/search/index?key=${secrets.goodreadsApiKey}&q=${encodeURIComponent(searchString)}`);
	const xml = await response.text();
	const data = (new window.DOMParser()).parseFromString(xml, 'text/xml');
	const numberOfResults = data.querySelector('results-end').textContent; // Total-results is sometimes just wrong

	console.log(`Search for ${searchString}`)

	if (numberOfResults > 1) {
		const allResults = data.querySelectorAll('work');
		const filteredResults = [];
		allResults.forEach(searchResult => {
			// A lot of results start with 'Summary' we don't care about those
			// Also don't care about books with no ratings
			const title = searchResult.querySelector('title').textContent;
			const ratingsCount = parseInt(searchResult.querySelector('ratings_count').textContent, 10);
			if (!title.startsWith('Summary') && ratingsCount > 0) {
				filteredResults.push(searchResult);
			}
		});

		console.log(searchString, 'Filtered results count', filteredResults.length)

		// If all the remaining results have the same name, prefer the one with more results
		if (filteredResults.length > 1) {
			console.log(searchString, 'Filtered results', filteredResults)
			const allTitles = filteredResults.map(searchResult => {
				console.log(searchString, "Search Result:", searchResult);
				return searchResult.querySelector('title').textContent.toLowerCase()
			});
			const firstTitle = allTitles[0];
			const allTitlesMatch = allTitles.every(title => title === firstTitle);
			
			console.log(searchString, "All Titles Match", allTitlesMatch)
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
			} else {
				const exactTitleMatches = [];
				filteredResults.forEach(searchResult => {
					const title = searchResult.querySelector('title').textContent;
					if (title === searchTitle) {
						exactTitleMatches.push(searchResult);
					}
				});

				// This isn't perfect either: https://www.goodreads.com/search/index?key=m&q=The%20Story%20of%20My%20Life%20Helen%20Keller
				if (exactTitleMatches.length === 1) {
					return getResultMatchData(exactTitleMatches[0], searchString)
				}

				// Too many matches
				// Options to do this, we can find a match on author and take highest number of ratings
				// Highest number of ratings without author doesn't work here: https://www.goodreads.com/search?q=Common%20Sense%20Thomas%20Paine
				return noMatchFound;
			}
		} else if (filteredResults.length === 1) {
			return getResultMatchData(filteredResults[0], searchString);
		}
	} else if (numberOfResults === '0') {
		return noMatchFound;
	}

	return getResultMatchData(data, searchString);
}, {
	maxAge: ONE_WEEK
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	getGoodreadsData(request.title, request.author).then(sendResponse);
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
