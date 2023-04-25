const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('./models/book');
const Review = require('./models/review');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { bookSchema } = require('./schema.js');

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

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
// parses incoming requests
app.use(express.urlencoded({ extended: true }));
// method-override
app.use(methodOverride('_method'));

// Middleware
const validateBook = (req,res,next) => {
    const { error } = bookSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}
const validateReview = (req,res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
})

// Route to display book list
app.get('/books',catchAsync(async (req, res) => {
    const books = await Book.find({});
    res.render('books/index', { books });
}))

// New Route: add a book page
app.get('/books/new',catchAsync(async (req, res) => {
    res.render('books/new');
}))

// POST new book
app.post('/books',validateBook, catchAsync(async (req, res) => {
    const book = new Book(req.body.book);
    console.log("Book POST:");
    console.log(book);
    await book.save();
    res.redirect(`/books/${book._id}`)
}))

// Show Route: to show book detail
app.get('/books/:id',catchAsync(async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.render('books/show',{ book });
}))

// Edit Route: edit book form
app.get('/books/:id/edit',catchAsync(async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.render('books/edit',{ book });
}))

// Edit Route: update book
app.put('/books/:id',validateBook, catchAsync(async (req, res) => {
    const { id } = req.params;
    const book = await Book.findByIdAndUpdate(id, { ...req.body.book });
    res.redirect(`/books/${ book._id }`);
}))

// Review POST route: add review
app.post('/books/:id/reviews',validateReview, catchAsync(async (req, res) => {
    const book = await Book.findById(req.params.id);
    const review = new Review(req.body.review);
    book.reviews.push(review);
    await review.save();
    await book.save();
    res.redirect(`/books/${book._id}`);
}))

// Delete Route: delete a book
app.delete('/books/:id',catchAsync(async (req, res) => {
    const { id } = req.params;
    await Book.findByIdAndDelete(id);
    res.redirect('/books');
}))

// Route Error
app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404));
})

// Error message
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong'} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})