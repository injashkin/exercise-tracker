const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var exercises = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
  },
  description: String,
  duration: Number,
  date: { type: Date }
});

var Exercises = mongoose.model("Exercises", exercises);

module.exports = Exercises;
