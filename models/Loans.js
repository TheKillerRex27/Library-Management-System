import mongoose from "mongoose";

const loansSchema = new mongoose.Schema({
    book_name: String,
    date_loaned: String,
    return_date: String,
    overdue: Boolean,
    returned: Boolean,
    loan_individual: String,
})

const Loan = mongoose.model("Loan", loansSchema)

export default Loan