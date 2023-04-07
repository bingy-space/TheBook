const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    title: String,
    author: String,
    language: String,
    description: String,
    ISBN: Number
})

module.exports = mongoose.model('Book', BookSchema)