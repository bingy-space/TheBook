// Will run this file on its own separately from our Node app
// Any time we want to seed our database: any time we make changes to the model or to our data
// > node seeds/index.js

const mongoose = require('mongoose');
const Book = require('../models/book');
const { author } = require('./author');
const { title } = require('./seedHelpers');

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

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Book.deleteMany({});
    for(let i=0; i<50; i++){
        // const random1000 = Math.floor(Math.random() * 1000);
        const theBook = new Book({
            author: `${sample(author)}`,
            title: `${sample(title)}`,
            image: 'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
            description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
            isbn: '0590353403',
            language: 'English'
        })
        await theBook.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});