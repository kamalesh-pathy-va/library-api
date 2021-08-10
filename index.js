require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");

const database = require("./database/database");

// Model
const BookModel = require("./database/book");
const AuthorModel = require("./database/author");
const PublicationModel = require("./database/publication");

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

bookApi.get("\/", async (req,res) => {
	const getAllBooks = await BookModel.find();
	return res.json(getAllBooks);
});


/*
Route			/is
Description		Get specific books with ISBN
Access			PUBLIC
Parameters		isbn
Method			GET
*/

bookApi.get("\/is\/:isbn", async (req,res) => {
	const getSpectificBook = await BookModel.findOne({ISBN: req.params.isbn});
	// If no book is found mongoDB returns 'null' so we are using '!' so that the condition becomes true
	if (!getSpectificBook) {
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

bookApi.get("\/c\/:category", async (req, res) => {
	const getSpectificBook = await BookModel.findOne({category: req.params.category});

	if (!getSpectificBook) {
		return res.json({error: `No book found for the category of '${req.params.category}'`});
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

bookApi.get("\/language\/:lan", async (req, res) => {
	const getSpectificBook = await BookModel.findOne({language: req.params.lan});
	if (!getSpectificBook)
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

bookApi.get("\/author", async (req, res) => {
	const getAllAuthors = await AuthorModel.find();
	return res.json(getAllAuthors);
});


/*
Route			/author
Description		Get all authors
Access			PUBLIC
Parameters		id
Method			GET
*/

bookApi.get("\/author\/:id", async (req, res) => {
	const getSpecificAuthor = await AuthorModel.findOne({id: parseInt(req.params.id)});
	if (!getSpecificAuthor)
		return res.json({error: `No author found for the ID of ${req.params.id}`});

	return res.json({authors: getSpecificAuthor});
});


/*
Route			/author/book
Description		Get all author based on specific book
Access			PUBLIC
Parameters		isbn
Method			GET
*/

bookApi.get("\/author\/book\/:isbn", async (req, res) => {
	const getSpecificAuthor = await AuthorModel.findOne({books: req.params.isbn});
	if (!getSpecificAuthor)
		return res.json({error: `No author found for the book of ${req.params.isbn}`});

	return res.json({authors: getSpecificAuthor});
});


/*
Route			/publications
Description		Get all publications
Access			PUBLIC
Parameters		NONE
Method			GET
*/

bookApi.get("\/publications", async (req, res) => {
	const getAllPublications = await PublicationModel.find();
	return res.json(getAllPublications);
});


/*
Route			/publications
Description		Get specific publications based on id
Access			PUBLIC
Parameters		id
Method			GET
*/

bookApi.get("\/publications\/:id", async (req, res) => {
	const getSpecificPublication = await PublicationModel.findOne({id: parseInt(req.params.id)});
	// const getSpectificPublication = database.publications.filter((publication) => publication.id === parseInt(req.params.id));
	if (!getSpecificPublication)
		return res.json({error: `No publication found for the id of ${req.params.id}`});

	return res.json({publications: getSpecificPublication});
});


/*
Route			/publications/book
Description		Get specific publications based on isbn
Access			PUBLIC
Parameters		isbn
Method			GET
*/

bookApi.get("\/publications\/book\/:isbn", async (req, res) => {
	const getSpecificPublication = await PublicationModel.findOne({books: req.params.isbn});

	if (!getSpecificPublication)
		return res.json({error: `No publication found for the book of ${req.params.isbn}`});

	return res.json({publications: getSpecificPublication});
});


bookApi.post("\/book\/new", async (req, res) => {
	const {newBook} = req.body;
	const addNewBook = BookModel.create(newBook);
	return res.json({
		books: addNewBook,
		message: "Book was Added"
	});
	// const existingBooks = database.books.filter((book) => book.ISBN === newBook.ISBN);
	// if (existingBooks.length === 0)
	// 	database.books.push(newBook);
	// else {
	// 	const indexOfBook = database.books.indexOf(existingBooks[0]);
	// 	database.books.splice(indexOfBook, 1, newBook);
	// }
});

bookApi.post("\/author\/new", async (req, res) => {
	const {newAuthor} = req.body;
	const addNewAuthor = AuthorModel.create(newAuthor);
	return res.json({
		authors: addNewAuthor,
		message: "Author was Added"
	});
	// const existingAuthor = database.author.filter((author) => author.id === parseInt(newAuthor.id));
	// if (existingAuthor.length === 0)
	// 	database.author.push(newAuthor);
	// else {
	// 	const indexOfAuthor = database.author.indexOf(existingAuthor[0]);
	// 	database.author.splice(indexOfAuthor, 1, newAuthor);
	// }
	// return res.json(database.author);
});

bookApi.post("\/publications\/new", async (req, res) => {
	const {newPublication} = req.body;
	const addNewPublication = PublicationModel.create(newPublication);
	return res.json({
		publications: addNewPublication,
		message: "Publication was Added"
	});
	// const existingPublication = database.publications.filter((publication) => publication.id === newPublication.id);
	// if (existingPublication.length === 0)
	// 	database.publications.push(newPublication);
	// else {
	// 	const indexOfPublication = database.publications.indexOf(existingPublication[0]);
	// 	database.publications.splice(indexOfPublication, 1, newPublication);
	// }
	// return res.json(database.publications);
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