import React from 'dom-chef';

const addReview = (book, bookData) => {
	// TODO Display series name here too
	let rating = `GR ${bookData.rating}`;
	if (bookData.bookId) {
		rating = <a href={`https://www.goodreads.com/book/show/${bookData.bookId}`} target="_blank" rel="noopener noreferrer">{rating}</a>;
	}

	book.querySelector('span i').parentElement.append(
		<span style={{float: 'right'}}>
			{rating}
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
