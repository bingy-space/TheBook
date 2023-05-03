const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('./models/book');
const Review = require('./models/review');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const books = require('./routes/books');
const reviews = require('./routes/reviews');
const session = require('express-session');


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
// serve public directory
app.use(express.static(path.join(__dirname, 'public')))
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUnitialized: true,
    cookie: {
        httpOnly: true,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

// Book Routes
app.use('/books', books);

// Review Routes
app.use('/books/:id/reviews', reviews)

// Home Page Route
app.get('/', (req, res) => {
    res.render('home');
})

// Error Route
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