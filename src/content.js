import React from 'dom-chef';

const addReview = (bookElement, bookData) => {
	// TODO Display series name here too
	let rating = `GR ${bookData.rating}`;
	if (bookData.bookId) {
		rating = <a href={`https://www.goodreads.com/book/show/${bookData.bookId}`} target="_blank" rel="noopener noreferrer">{rating}</a>;
	} else {
		rating = <a href={`https://www.goodreads.com/search?q=${encodeURIComponent(bookData.searchString)}`} target="_blank" rel="noopener noreferrer">{rating}</a>;
	}

	bookElement.querySelector('span i').parentElement.append(
		<span style={{float: 'right'}}>
			{rating}
		</span>
	);
};

const searchGoodReads = (title, author, bookElement) => {
	chrome.runtime.sendMessage(
		{title, author},
		bookData => addReview(bookElement, bookData)
	);
};

const searchForBooks = container => {
	container.querySelectorAll('li.js-titleCard').forEach(book => {
		const title = book.querySelector('h3').title;
		const author = book.querySelector('.title-author a').title;

		searchGoodReads(title, author, book);
	});
};

const startListener = () => {
	// .js-relatedTitlesContainer is used for "You may also like"
	// .js-dynamic-content is for all collection pages
	// .RTLRecommendations is used for "Didn't find what you were looking for?"
	document.querySelectorAll('.js-relatedTitlesContainer, .js-dynamic-content, .RTLRecommendations').forEach(updatable => {
		const observer = new MutationObserver(() => {
			searchForBooks(updatable);
		});
		observer.observe(updatable, {childList: true});

		// Search once content is loaded, as there's no guarantee our extension will load before the page already loads in the data
		searchForBooks(updatable);
	});
};

document.addEventListener('DOMContentLoaded', startListener);

// TODO bring in select
// TODO why does this have a menu icon in chrome
