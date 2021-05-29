import mem from 'mem';
import xml2js from 'xml2js';
import secrets from 'secrets';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

// https://bridges.overdrive.com/bridges-kirkendall/content/search/creatorId?query=453001&sortBy=newlyadded&format=audiobook-overdrive
// Alice and wonderland goes to wrong result
// Lots of classics link to wrong version
// https://www.goodreads.com/search/index?key=m&q=Alice%27s%20Adventures%20in%20Wonderland%20Lewis%20Carroll

// This goes to wrong book review as it has series in the tile
// https://bridges.overdrive.com/bridges-kirkendall/content/media/5201290?cid=37479
// Maybe exclude anything after --, then we'd search this https://www.goodreads.com/search?utf8=%E2%9C%93&q=The+Awakening+Nora+Roberts&search_type=books
// Exclude books under X ratings?

// Ignore Study Guides
// https://www.goodreads.com/search?q=The%20Disappearing%20Spoon%20Sam%20Kean
// And lesson plans https://www.goodreads.com/search?q=Shadow%20of%20the%20Almighty%20Elisabeth%20Elliot

// This one will be tricky
// https://www.goodreads.com/search?q=A%20Life%20on%20Our%20Planet%20David%20Attenborough
// https://www.goodreads.com/search?q=The%20Happiness%20Hypothesis%20Jonathan%20Haidt

// Should have narrowed it down, ignore () crap from GoodReads
// https://www.goodreads.com/search?q=Mrs.%20Jeffries%20Dusts%20for%20Clues%20Emily%20Brightwell

// Maybe easy
// https://www.goodreads.com/search?q=The%20House%20of%20Silk%20Anthony%20Horowitz

const getGoodreadsData = mem(async (searchTitle, searchAuthor) => {
	const searchString = `${searchTitle} ${searchAuthor}`;
	const noMatchFound = {
		rating: '??',
		searchString
	};

	// TODO Move this to API class
	const response = await fetch(`https://www.goodreads.com/search/index?key=${secrets.goodreadsApiKey}&q=${encodeURIComponent(searchString)}`);
	const xml = await response.text();
	const parser = new xml2js.Parser();
	const data = await parser.parseStringPromise(xml);
	const numberOfResults = Number.parseInt(data.GoodreadsResponse.search[0]['results-end'], 10); // Total-results is sometimes just wrong

	console.log(`Search for ${searchString}`);

	if (numberOfResults > 1) {
		const allResults = data.GoodreadsResponse.search[0].results[0].work;
		const filteredResults = [];
		for (const searchResult of allResults) {
			// A lot of results start with 'Summary' we don't care about those
			// Also don't care about books with no ratings
			const title = searchResult.best_book[0].title[0];
			const ratingsCount = Number.parseInt(searchResult.ratings_count[0]._, 10);
			if (!title.toLowerCase().startsWith('summary') && !title.toLowerCase().startsWith('analysis') && !title.toLowerCase().includes('collection') && ratingsCount > 0) {
				filteredResults.push(searchResult);
			}
		}

		console.log(searchString, 'Filtered results count', filteredResults.length);

		// If all the remaining results have the same name, prefer the one with more results
		if (filteredResults.length > 1) {
			console.log(searchString, 'Filtered results', filteredResults);
			const allTitles = filteredResults.map(searchResult => {
				console.log(searchString, 'Search Result:', searchResult);
				return searchResult.best_book[0].title[0].toLowerCase();
			});
			const firstTitle = allTitles[0];
			const allTitlesMatch = allTitles.every(title => title === firstTitle);

			console.log(searchString, 'All Titles Match', allTitlesMatch);
			if (allTitlesMatch) {
				let highestRatedResult = null;
				let highestRating = 0;

				for (const searchResult of filteredResults) {
					const thisRating = Number.parseInt(searchResult.ratings_count[0]._, 10);
					if (thisRating > highestRating) {
						highestRating = thisRating;
						highestRatedResult = searchResult;
					}
				}

				return getResultMatchData(highestRatedResult, searchString);
			}

			const exactTitleMatches = [];
			for (const searchResult of filteredResults) {
				const title = searchResult.best_book[0].title[0];
				if (title === searchTitle) {
					exactTitleMatches.push(searchResult);
				}
			}

			// This isn't perfect either: https://www.goodreads.com/search/index?key=m&q=The%20Story%20of%20My%20Life%20Helen%20Keller
			if (exactTitleMatches.length === 1) {
				return getResultMatchData(exactTitleMatches[0], searchString);
			}

			// Too many matches
			// Options to do this, we can find a match on author and take highest number of ratings
			// Highest number of ratings without author doesn't work here: https://www.goodreads.com/search?q=Common%20Sense%20Thomas%20Paine
			return noMatchFound;
		}

		if (filteredResults.length === 1) {
			return getResultMatchData(filteredResults[0], searchString);
		}
	} else if (numberOfResults === '0') {
		return noMatchFound;
	}

	return getResultMatchData(data.GoodreadsResponse.search[0].results[0].work[0], searchString);
}, {
	maxAge: ONE_WEEK
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	getGoodreadsData(request.title, request.author).then(sendResponse);
	return true;
});

function getResultMatchData(data, searchString) {
	const rating = data.average_rating[0];
	const bookId = data.best_book[0].id[0]._;
	return {
		bookId,
		rating,
		searchString
	};
}
