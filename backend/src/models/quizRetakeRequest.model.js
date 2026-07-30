const mongoose = require("mongoose");

const quizRetakeRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  quizType: {
    type: String,
    enum: ["section", "chapter"],
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  // An approval grants exactly one additional submission.
  usedAt: {
    type: Date,
    default: null,
  },
});

quizRetakeRequestSchema.index({
  course: 1,
  status: 1,
  createdAt: -1,
});

const quizRetakeRequestModel = mongoose.model(
  "QuizRetakeRequest",
  quizRetakeRequestSchema
);

module.exports = quizRetakeRequestModel;
