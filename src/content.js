import React from 'dom-chef';

const addReview = (bookElement, bookData) => {
	// TODO Display series name here too
	const url = bookData.bookId ? `https://www.goodreads.com/book/show/${bookData.bookId}` : `https://www.goodreads.com/search?q=${encodeURIComponent(bookData.searchString)}`;
	bookElement.querySelector('span i').parentElement.append(<span style={{float: 'right'}}>
		<a href={url} target='_blank' rel='noopener noreferrer'>GR {bookData.rating}</a>
	</span>);
};

const searchGoodReads = (title, author, bookElement) => {
	chrome.runtime.sendMessage(
		{title, author},
		bookData => addReview(bookElement, bookData),
	);
};

const searchForBooks = container => {
	for (const book of container.querySelectorAll('li.js-titleCard')) {
		const {title} = book.querySelector('h3');
		const author = book.querySelector('.title-author a').title;

		searchGoodReads(title, author, book);
	}
};

const startListener = () => {
	// .js-relatedTitlesContainer is used for "You may also like"
	// .js-dynamic-content is for all collection pages
	// .RTLRecommendations is used for "Didn't find what you were looking for?"
	for (const updatable of document.querySelectorAll('.js-relatedTitlesContainer, .js-dynamic-content, .RTLRecommendations')) {
		const observer = new MutationObserver(() => {
			searchForBooks(updatable);
		});
		observer.observe(updatable, {childList: true});

		// Search once content is loaded, as there's no guarantee our extension will load before the page already loads in the data
		searchForBooks(updatable);
	}
};

document.addEventListener('DOMContentLoaded', startListener);

// TODO bring in select
// TODO why does this have a menu icon in chrome
