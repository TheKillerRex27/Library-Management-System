import mongoose from "mongoose";

const weeklyReportSchema = new mongoose.Schema({
    weekStart: {
      type: Date,
      required: true,
      unique: true,
    },
    weekEnd: {
      type: Date,
      required: true,
    },

    booksLoaned: {
      type: Number,
      required: true,
    },
    booksCollected: {
      type: Number,
      default: 0,
    },
    booksReturned: {
      type: Number,
      default: 0,
    },
    patronsRegistered: {
      type: Number,
      default: 0,
    },
    lateReturns: {
      type: Number,
      default: 0,
    },
  });

  const WeeklyReport = mongoose.model("WeeklyReport", weeklyReportSchema);

  export default WeeklyReport;