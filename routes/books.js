const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const methodOverride = require('method-override');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { bookSchema } = require('../schema.js');

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

// GET Route: display all book
router.get('/',catchAsync(async (req, res) => {
    const books = await Book.find({});
    res.render('books/index', { books });
}))

// New Route: add a book page
router.get('/new',catchAsync(async (req, res) => {
    res.render('books/new');
}))

// POST Route: post new book
router.post('/',validateBook, catchAsync(async (req, res) => {
    const book = new Book(req.body.book);
    console.log("Book POST:");
    console.log(book);
    await book.save();
    res.redirect(`/books/${book._id}`)
}))

// Show Route: show book detail
router.get('/:id',catchAsync(async (req, res) => {
    const book = await Book.findById(req.params.id).populate('reviews');
    res.render('books/show',{ book });
}))

// Edit Route: edit book form
router.get('/:id/edit',catchAsync(async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.render('books/edit',{ book });
}))

// Edit Route: update book
router.put('/:id',validateBook, catchAsync(async (req, res) => {
    const { id } = req.params;
    const book = await Book.findByIdAndUpdate(id, { ...req.body.book });
    res.redirect(`/books/${ book._id }`);
}))

// Delete Route: delete a book
router.delete('/:id',catchAsync(async (req, res) => {
    const { id } = req.params;
    await Book.findByIdAndDelete(id);
    res.redirect('/books');
}))

module.exports = router;