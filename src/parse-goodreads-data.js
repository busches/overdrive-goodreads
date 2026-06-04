import {XMLParser} from 'fast-xml-parser';

function getResultMatchData(data, searchString) {
	const rating = data.average_rating;
	const bookId = data.best_book.id;
	return {
		bookId,
		rating,
		searchString,
	};
}

export async function parseGoodreadsData(xml, searchString) {
	const noMatchFound = {
		rating: '??',
		searchString,
	};
	const parser = new XMLParser();
	const data = parser.parse(xml);
	const numberOfResults = data.GoodreadsResponse.search['results-end']; // Total-results is sometimes just wrong

	console.log(`Search for ${searchString}`);

	if (numberOfResults > 1) {
		// Let's just assume the one with the most ratings is the one we're after
		const allResults = data.GoodreadsResponse.search.results.work;

		let highestRatedWork = allResults[0]; // Start with the first item

		for (const result of allResults) {
			const currentCount = result.ratings_count;
			const highestCount = highestRatedWork.ratings_count;

			if (currentCount > highestCount) {
				highestRatedWork = result;
			}
		}

		return getResultMatchData(highestRatedWork, searchString);
	}

	if (numberOfResults === 0) {
		return noMatchFound;
	}

	return getResultMatchData(
		data.GoodreadsResponse.search.results.work,
		searchString,
	);
}
