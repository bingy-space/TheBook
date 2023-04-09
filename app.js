const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('./models/book');

// Call mongoose.connect
mongoose.connect('mongodb://localhost:27017/the-book', {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () =>{
    console.log("Database connected");
})

const app = express();

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
// parses incoming requests
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('home');
})

// Route to display book list
app.get('/books', async (req, res) => {
    const books = await Book.find({});
    res.render('books/index', { books });
})

// New Route: add a book page
app.get('/books/new', async (req, res) => {
    res.render('books/new');
})

// POST new book
app.post('/books', async (req, res) => {
    const book = new Book(req.body.book);
    await book.save();
    res.redirect(`/books/${book._id}`)
})

// Show Route: to show book detail
app.get('/books/:id', async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.render('books/show',{ book });
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})