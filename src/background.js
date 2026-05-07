import {getGoodreadsData} from './get-goodreads-data.js';

// https://bridges.overdrive.com/bridges-kirkendall/content/search/creatorId?query=453001&sortBy=newlyadded&format=audiobook-overdrive
// Alice and wonderland goes to wrong result
// Lots of classics link to wrong version
// https://www.goodreads.com/search/index?key=m&q=Alice%27s%20Adventures%20in%20Wonderland%20Lewis%20Carroll

// This goes to wrong book review as it has series in the tile
// https://bridges.overdrive.com/bridges-kirkendall/content/media/5201290?cid=37479
// Maybe exclude anything after --, then we'd search this https://www.goodreads.com/search?utf8=%E2%9C%93&q=The+Awakening+Nora+Roberts&search_type=books
// Exclude books under X ratings?

// This one will be tricky
// https://www.goodreads.com/search?q=A%20Life%20on%20Our%20Planet%20David%20Attenborough
// https://www.goodreads.com/search?q=The%20Happiness%20Hypothesis%20Jonathan%20Haidt

// Maybe easy
// https://www.goodreads.com/search?q=The%20House%20of%20Silk%20Anthony%20Horowitz

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	(async () => {
		const response = await getGoodreadsData(request.title, request.author);
		sendResponse(response);
	})();

	return true;
});

