const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    sectionTitle: {
      type: String,
      required: true,
    },

    sectionDescription: {
      type: String,
      default: "",
    },

    // chapters under this section
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],

    /* =========================
       SECTION VIDEOS
    ========================= */

    sectionVideos: [
      {
        title: {
          type: String,
          required: true,
        },
        videoUrl: {
          type: String,
          required: true,
        },
        thumbnail: {
          type: String,
          default: "",
        },
      },
    ],

    /* =========================
       SECTION QUIZ (EMBEDDED)
    ========================= */

    quiz: {
      title: {
        type: String,
        default: "Section Quiz",
      },
      description: {
        type: String,
        default: "",
      },
      duration: {
        type: Number, // seconds
        default: 600,
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
  },
  { timestamps: true }
);

const Section = mongoose.model("Section", sectionSchema);

module.exports = Section;
