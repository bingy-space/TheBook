const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('./models/book');
const Review = require('./models/review');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { bookSchema, reviewSchema } = require('./schema.js');
const books = require('./routes/books');

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

// Book Routes
app.use('/books', books);

// Middleware
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

// Review POST route: add review
app.post('/books/:id/reviews',validateReview, catchAsync(async (req, res) => {
    const book = await Book.findById(req.params.id);
    const review = new Review(req.body.review);
    book.reviews.push(review);
    await review.save();
    await book.save();
    res.redirect(`/books/${book._id}`);
}))

// Review DELETE route: delete a review
app.delete('/books/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const  {id, reviewId } = req.params;
    await Book.findByIdAndUpdate(id, { $pull: { reviews: reviewId }})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/books/${id}`);
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