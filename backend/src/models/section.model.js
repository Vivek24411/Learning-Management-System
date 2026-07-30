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

const sectionSchema = new mongoose.Schema({
  sectionTitle: {
    type: String,
    required: true,
  },
  sectionDescription: {
    type: String,
    default: "",
  },
  sectionVideoUrl: {
    type: [String],
    default: [],
  },
  // Parallel to sectionVideoUrl so existing URL-only sections remain valid.
  sectionVideoTitles: {
    type: [String],
    default: [],
  },
  chapters: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  },
  sectionQuiz: {
    type: [],
    default: [],
  },
  sectionQuizTitle: {
    type: String,
    default: "",
  },
  // New quiz collection. The singular fields above are retained for seamless
  // compatibility with courses created before multiple quizzes were supported.
  sectionQuizzes: {
    type: [quizSchema],
    default: [],
  },
  externalLinks: {
    type: [Object],
    default: [],
  }
});


const sectionModel = mongoose.model("Section",sectionSchema);

module.exports = sectionModel;
