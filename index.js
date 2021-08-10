require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");

const database = require("./database");

const bookApi = express();

bookApi.use(bodyParser.urlencoded({extended: true}));
bookApi.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
})
.then(() => console.log("DB Connected"));

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
Route			/language
Description		Get specific book based on Language
Access			PUBLIC
Parameters		lan
Method			GET
*/

bookApi.get("\/language\/:lan", (req, res) => {
	const getSpectificBook = database.books.filter((book) => book.language === req.params.lan);
	if (getSpectificBook.length === 0)
		return res.json({error: `No books found for the language ${req.params.lan}`});

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
Route			/author
Description		Get all authors
Access			PUBLIC
Parameters		id
Method			GET
*/

bookApi.get("\/author\/:id", (req, res) => {
	const getSpectificAuthor = database.author.filter((author) => author.id === parseInt(req.params.id));
	if (getSpectificAuthor.length === 0)
		return res.json({error: `No author found for the ID of ${req.params.id}`});

	return res.json({authors: getSpectificAuthor});
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


/*
Route			/publications
Description		Get specific publications based on id
Access			PUBLIC
Parameters		id
Method			GET
*/

bookApi.get("\/publications\/:id", (req, res) => {
	const getSpectificPublication = database.publications.filter((publication) => publication.id === parseInt(req.params.id));
	if (getSpectificPublication.length === 0)
		return res.json({error: `No publication found for the id of ${req.params.id}`});

	return res.json({publications: getSpectificPublication});
});


/*
Route			/publications/book
Description		Get specific publications based on isbn
Access			PUBLIC
Parameters		isbn
Method			GET
*/

bookApi.get("\/publications\/book\/:isbn", (req, res) => {
	const getSpectificPublication = database.publications.filter((publication) => publication.books.includes(req.params.isbn));

	if (getSpectificPublication.length === 0)
		return res.json({error: `No publication found for the book of ${req.params.isbn}`});

	return res.json({publications: getSpectificPublication});
});


bookApi.post("\/book\/new", (req, res) => {
	const newBook = req.body;
	const existingBooks = database.books.filter((book) => book.ISBN === newBook.ISBN);
	if (existingBooks.length === 0)
		database.books.push(newBook);
	else {
		const indexOfBook = database.books.indexOf(existingBooks[0]);
		database.books.splice(indexOfBook, 1, newBook);
	}
	return res.json({updatedBooks: database.books});
});

bookApi.post("\/author\/new", (req, res) => {
	const newAuthor = req.body;
	const existingAuthor = database.author.filter((author) => author.id === parseInt(newAuthor.id));
	if (existingAuthor.length === 0)
		database.author.push(newAuthor);
	else {
		const indexOfAuthor = database.author.indexOf(existingAuthor[0]);
		database.author.splice(indexOfAuthor, 1, newAuthor);
	}
	return res.json(database.author);
});

bookApi.post("\/publications\/new", (req, res) => {
	const newPublication = req.body;
	const existingPublication = database.publications.filter((publication) => publication.id === newPublication.id);
	if (existingPublication.length === 0)
		database.publications.push(newPublication);
	else {
		const indexOfPublication = database.publications.indexOf(existingPublication[0]);
		database.publications.splice(indexOfPublication, 1, newPublication);
	}
	return res.json(database.publications);
});


bookApi.put("\/publications\/update\/book\/:isbn", (req, res) => {
	// Update publication database
	database.publications.forEach((publication) => {
		if (publication.id === req.body.pubId)
			return publication.books.push(req.params.isbn);
	});

	database.books.forEach((book) => {
		if (book.ISBN === req.params.isbn) {
			book.publications = req.body.pubId;
			return;
		}
	});

	return res.json({
		books: database.books,
		publications: database.publications,
		message: "Updated successfully"
	});
});


bookApi.delete("\/book\/delete\/:isbn", (req, res) => {
	// Whichever book that does not match with the isbn, just send it to updatedBookDatabase array and rest will be filtered out
	const updatedBookDatabase = database.books.filter((book) => book.ISBN !== req.params.isbn);
	database.books = updatedBookDatabase;

	return res.json({books: database.books});
});


bookApi.delete("\/book\/delete\/author\/:isbn\/:authorId", (req, res) => {
	// Update the book database
	database.books.forEach((book) => {
		if (book.ISBN === req.params.isbn) {
			const newAuthorList = book.author.filter((eachAuthor) => eachAuthor !== parseInt(req.params.authorId));
			book.author = newAuthorList;
			return;
		}
	});

	// Update the author database
	database.author.forEach((eachAuthor) => {
		if(eachAuthor.id === parseInt(req.params.authorId)) {
			const newBookList = eachAuthor.books.filter((book) => book !== req.params.isbn);
			eachAuthor.books = newBookList;
			return;
		}
	});

	return res.json({
		books: database.books,
		author: database.author,
		message: "Author was deleted"
	});
});

bookApi.listen(3000, () => {
	console.log("Server is up at 3000");
});