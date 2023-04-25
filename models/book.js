const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const BookSchema = new Schema({
    title: String,
    author: String,
    language: String,
    description: String,
    isbn: String,
    image: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

BookSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Book', BookSchema)