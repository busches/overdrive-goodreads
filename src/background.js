import {getGoodreadsData} from './get-goodreads-data.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	(async () => {
		const response = await getGoodreadsData(request.title, request.author);
		sendResponse(response);
	})();

	return true;
});

