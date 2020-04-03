const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var users = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: {
    type: String,
    required: true
  }
});

var Users = mongoose.model("Users", users);

module.exports = Users;
