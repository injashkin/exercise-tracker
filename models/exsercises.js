const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var exercises = new Schema({
  userId: mongoose.Schema.Types.ObjectId,
  username: { type: String, ref: "Users" },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

var Exercises = mongoose.model("Exercises", exercises);

module.exports = Exercises;
