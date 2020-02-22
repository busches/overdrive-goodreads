const addReview = (book, rating) => {
    const ratingElement = document.createElement('span');
    ratingElement.style.float = "right";
    const ratingText = document.createTextNode(`GR ${rating}`);
    ratingElement.appendChild(ratingText);

    book.querySelector('.icon-audiobook').parentElement.appendChild(ratingElement);
};

const searchGoodReads = (title, author, book) => {
    chrome.runtime.sendMessage(
        { title, author },
        rating => addReview(book, rating)
    );
}

const getBookList = () => document.querySelectorAll('.js-title-collection-view li.js-titleCard');

const searchForBooks = () => {
    console.log("searching")

    const foundBooks = getBookList();
    if (foundBooks.length === 0) {
        setTimeout(searchForBooks, 1000);
    } else {
        foundBooks.forEach(book => {
            const title = book.querySelector("a[data-type='audiobook']").dataset.title;
            const author = book.querySelector(".title-author a").title;

            searchGoodReads(title, author, book);
        });
    }
};

document.addEventListener('DOMContentLoaded', searchForBooks);
