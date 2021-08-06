const express = require("express");
const database = require("./database")

const bookApi = express();

bookApi.use(express.json());

/*
Route			/
Description		Get all the books
Access			PUBLIC
Parameters		NONE
Method			GET
*/

bookApi.get("\/", (req,res) => {
	return res.json({books: database.books});
});


/*
Route			/is
Description		Get specific books with ISBN
Access			PUBLIC
Parameters		isbn
Method			GET
*/

bookApi.get("\/is\/:isbn", (req,res) => {
	const getSpectificBook = database.books.filter((book) => book.ISBN === req.params.isbn);
	if (getSpectificBook.length === 0) {
		return res.json({error: `No book found for the ISBN of '${req.params.isbn}'`});
	}

	return res.json({book: getSpectificBook});
});


/*
Route			/c
Description		Get specific book based on category
Access			PUBLIC
Parameters		category
Method			GET
*/

bookApi.get("\/c\/:category", (req, res) => {
	const getSpectificBook = database.books.filter((book) => book.category.includes(req.params.category));
	if (getSpectificBook.length === 0) {
		return res.json({error: `No books found for the category ${req.params.category}`});
	}

	return res.json({book: getSpectificBook});
});


/*
Route			/author
Description		Get all authors
Access			PUBLIC
Parameters		NONE
Method			GET
*/

bookApi.get("\/author", (req, res) => {
	return res.json({authors: database.author});
});


/*
Route			/author/book
Description		Get all author based on specific book
Access			PUBLIC
Parameters		isbn
Method			GET
*/

bookApi.get("\/author\/book\/:isbn", (req, res) => {
	const getSpectificAuthor = database.author.filter((author) => author.books.includes(req.params.isbn));

	if (getSpectificAuthor.length === 0)
		return res.json({error: `No author found for the book of ${req.params.isbn}`});

	return res.json({authors: getSpectificAuthor});
});


/*
Route			/publications
Description		Get all publications
Access			PUBLIC
Parameters		NONE
Method			GET
*/

bookApi.get("\/publications", (req, res) => {
	return res.json({publications: database.publications});
});

bookApi.listen(3000, () => {
	console.log("Server is up at 3000");
});