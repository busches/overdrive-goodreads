import React from 'dom-chef';

const addReview = (book, bookData) => {
	book.querySelector('span i').parentElement.append(
		<span style={{float: 'right'}}>
            GR {bookData.rating}
		</span>
	);
};

const searchGoodReads = (title, author, book) => {
	chrome.runtime.sendMessage(
		{title, author},
		bookData => addReview(book, bookData)
	);
};

const getBooks = () => document.querySelectorAll('li.js-titleCard');

const searchForBooks = () => {
	// TODO Trash this
	console.log('searching');

	// TODO do this smarter
	const foundBooks = getBooks();
	if (foundBooks.length === 0) {
		setTimeout(searchForBooks, 1000);
	} else {
		foundBooks.forEach(book => {
			const title = book.querySelector('h3').title;
			const author = book.querySelector('.title-author a').title;

			searchGoodReads(title, author, book);
		});
	}
};

// TODO replace with the library RGH uses
document.addEventListener('DOMContentLoaded', searchForBooks);

// TODO bring in select
// TODO why does this have a menu icon in chrome
