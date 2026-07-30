const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    questions: {
      type: [Object],
      default: [],
    },
  },
  { timestamps: true }
);

const chapterSchema = new mongoose.Schema({
  chapterName: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
  },
  chapterThumbnailImage: {
    type: String,
  },
  chapterFile: {
    type: [String],
  },
  chapterSummary: {
    type: String,
  },
  chapterVideoDetails: {
    type: [Object],
  },
  chapterQuiz: {
    type: [Object],
    default: [],
  },
  chapterQuizTitle: {
    type: String,
    default: "",
  },
  chapterQuizzes: {
    type: [quizSchema],
    default: [],
  },
  externalLinks: {
    type: [Object],
    default: [],
  },
});

const chapterModel = mongoose.model("Chapter", chapterSchema);

module.exports = chapterModel;
