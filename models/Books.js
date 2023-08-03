import mongoose from "mongoose";

const booksSchema =  new mongoose.Schema({
    serial_num: Number,
    book_name: String,
    author: String,
    year: Number
    
})

const Book = mongoose.model("Book", booksSchema)

export default Book