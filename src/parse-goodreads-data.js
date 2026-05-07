import xml2js from 'xml2js';

function getResultMatchData(data, searchString) {
	const rating = data.average_rating[0];
	const bookId = data.best_book[0].id[0]._;
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
	const parser = new xml2js.Parser();
	const data = await parser.parseStringPromise(xml);
	const numberOfResults = Number.parseInt(
		data.GoodreadsResponse.search[0]['results-end'],
		10,
	); // Total-results is sometimes just wrong

	console.log(`Search for ${searchString}`);

	if (numberOfResults > 1) {
		// Let's just assume the one with the most ratings is the one we're after
		const allResults = data.GoodreadsResponse.search[0].results[0].work;

		let highestRatedWork = allResults[0]; // Start with the first item

		for (const result of allResults) {
			const currentCount = Number.parseInt(result.ratings_count[0], 10);
			const highestCount = Number.parseInt(highestRatedWork.ratings_count[0], 10);

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
		data.GoodreadsResponse.search[0].results[0].work[0],
		searchString,
	);
}
