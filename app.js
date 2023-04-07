const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Book = require('./models/book');

// Call mongoose.connect
mongoose.connect('mongodb://localhost:27017/discover-museum', {
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

app.get('/', (req, res) => {
    res.render('home');
})

// Creating a new book
app.get('/makebook', async (req, res) => {
    const book = new Book({title: 'Sherlock Holmes: The Complete Novels and Stories, Vol. 1', author: 'Sir Arthur Conan Doyle'})
    await book.save();
    res.send(book);
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})