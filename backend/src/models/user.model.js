const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  coursePurchased: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    default: [],
  },
  profilePhoto: {
    type: String,
  },
  sectionQuizAttempt: {
    type: [Object],
  },
  chapterQuizAttempt: {
    type: [Object],
  },
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.createToken = function () {
  return JWT.sign({ id: this._id }, process.env.SECRET_KEY);
};

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
