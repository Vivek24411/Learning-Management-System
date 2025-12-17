const mongoose = require("mongoose");

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
  quiz: {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    duration: {
      type: Number,
      default: 600, // seconds
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
        },
        correctIndex: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

const chapterModel = mongoose.model("Chapter", chapterSchema);

module.exports = chapterModel;
