const Chapter = require("../models/chapter.model");
const Section = require("../models/section.model");

/* =========================
   ADMIN: ADD / UPDATE CHAPTER QUIZ
========================= */

exports.addChapterQuiz = async (req, res) => {
  try {
    const { chapterId, quiz } = req.body;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, msg: "Chapter not found" });
    }

    chapter.quiz = {
      title: quiz.title || "Chapter Quiz",
      description: quiz.description || "",
      duration: quiz.duration || 600,
      questions: quiz.questions || [],
    };

    await chapter.save();

    res.json({
      success: true,
      msg: "Chapter quiz saved successfully",
    });
  } catch (err) {
    console.error("addChapterQuiz error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

/* =========================
   USER: GET CHAPTER QUIZ
========================= */

exports.getChapterQuiz = async (req, res) => {
  try {
    const { chapterId } = req.query;

    const chapter = await Chapter.findById(chapterId).select("quiz");
    if (!chapter) {
      return res.status(404).json({ success: false, msg: "Chapter not found" });
    }

    res.json({
      success: true,
      quiz: chapter.quiz || null,
    });
  } catch (err) {
    console.error("getChapterQuiz error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

/* =========================================================
   ================== SECTION QUIZ =========================
   ========================================================= */

/* =========================
   ADMIN: ADD / UPDATE SECTION QUIZ
========================= */

exports.addSectionQuiz = async (req, res) => {
  try {
    const { sectionId, quiz } = req.body;

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ success: false, msg: "Section not found" });
    }

    section.quiz = {
      title: quiz.title || "Section Quiz",
      description: quiz.description || "",
      duration: quiz.duration || 600,
      questions: quiz.questions || [],
    };

    await section.save();

    res.json({
      success: true,
      msg: "Section quiz saved successfully",
    });
  } catch (err) {
    console.error("addSectionQuiz error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

/* =========================
   USER: GET SECTION QUIZ
========================= */

exports.getSectionQuiz = async (req, res) => {
  try {
    const { sectionId } = req.query;

    const section = await Section.findById(sectionId).select("quiz");
    if (!section) {
      return res.status(404).json({ success: false, msg: "Section not found" });
    }

    res.json({
      success: true,
      quiz: section.quiz || null,
    });
  } catch (err) {
    console.error("getSectionQuiz error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
