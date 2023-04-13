const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    title: String,
    author: String,
    language: String,
    description: String,
    isbn: String,
    image: String,
})

module.exports = mongoose.model('Book', BookSchema)