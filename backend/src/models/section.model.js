const mongoose = require("mongoose");

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
  chapters: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  },
  sectionQuiz: {
    type: [],
  },
});


const sectionModel = mongoose.model("Section",sectionSchema);

module.exports = sectionModel;