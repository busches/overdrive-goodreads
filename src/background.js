import secrets from "secrets";

const getGoodReadsRating = async (searchString) => {
    const response = await fetch(`https://www.goodreads.com/search/index?key=${secrets.goodreadsApiKey}&q=${encodeURIComponent(searchString)}`);
    const xml = await response.text();
    const data = (new window.DOMParser()).parseFromString(xml, "text/xml");
    const rating = data.querySelector('work average_rating').textContent;
    return rating;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const searchString = `${request.title} ${request.author}`
    getGoodReadsRating(searchString).then(sendResponse);
    return true;
});
