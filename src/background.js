import secrets from "secrets";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const searchString = `${request.title} ${request.author}`
    fetch(`https://www.goodreads.com/search/index?key=${secrets.goodreadsApiKey}&q=${encodeURIComponent(searchString)}`)
        .then(response => response.text())
        .then(xml => (new window.DOMParser()).parseFromString(xml, "text/xml"))
        .then(data => sendResponse(data.querySelector('work average_rating').textContent))
        .catch(console.error);

        
    return true;
});
