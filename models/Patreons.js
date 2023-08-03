import mongoose from "mongoose";

let date = new Date();

function formatDate() {
    let currentDate = []
    currentDate[0] = date.getFullYear();
    currentDate[1] = date.getMonth()
    currentDate[2] = date.getDate();

    let newDate = currentDate[0] + "-" + currentDate[1] + "-" + currentDate[2]
    return newDate;
}

const patreonsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    reg_num: {
        type: String,
        uppercase: true,
        required: true,
    },
    profile_pic: {
        type: String,
        default: "/public/img/patreon-pics/no-image.png"
    },
    dept: {
        type: String,
        required: true,
    },
    date_registered: {
        type: String,
        default: formatDate(),
        immutable: true,
    },
    last_updated: String,
    profile_pic: String,
    books_loaned: Number,
    books_overdue: Number,
});

patreonsSchema.pre("save", function (next) {
    this.last_updated = formatDate();
    next();
});

const Patreon = mongoose.model("Patreon", patreonsSchema);

export default Patreon;
