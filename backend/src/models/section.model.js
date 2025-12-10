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
  chapters: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  },
});


const sectionModel = mongoose.model("Section",sectionSchema);

module.exports = sectionModel;