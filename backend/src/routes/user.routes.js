const express = require("express");
const userRouter = express.Router();
const { body, query } = require("express-validator");

/* =========================
   CONTROLLERS
========================= */

const {
  sendOTP,
  verifyOTPandRegister,
  login,
  getProfile,
  getChapter,
  getAllCourses,
  addCourse,
  addSection,
  addChapter,
  editCourse,
  editChapter,
  editSection,
  deleteCourse,
  deleteChapter,
  deleteSection,
  getCourse,
  enrollCourse,
  createOrder,
  verifyOrder,
  resetPassword,
  addSectionVideo, // ✅ IMPORTANT: FIXED IMPORT
} = require("../controllers/user.controllers");

const quizController = require("../controllers/quiz.controller");

/* =========================
   MIDDLEWARE
========================= */

const { userAuth, adminAuth } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

/* ========================= AUTH ========================= */

userRouter.post("/sendOTP", [body("email").isEmail()], sendOTP);

userRouter.post(
  "/verifyOTPandRegister",
  [
    body("email").isEmail(),
    body("name").isString().isLength({ min: 3 }),
    body("password").isString().isLength({ min: 3 }),
    body("OTP").isString().isLength({ min: 6 }),
  ],
  verifyOTPandRegister
);

userRouter.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").isString().isLength({ min: 3 }),
  ],
  login
);

userRouter.post(
  "/resetPassword",
  [
    body("email").isEmail(),
    body("newPassword").isString().isLength({ min: 3 }),
    body("OTP").isString().isLength({ min: 6 }),
  ],
  resetPassword
);

/* ========================= USER ========================= */

userRouter.get("/getProfile", userAuth, getProfile);
userRouter.get("/getAllCourses", getAllCourses);

userRouter.get(
  "/getCourse",
  userAuth,
  [query("courseId").isMongoId()],
  getCourse
);

userRouter.get(
  "/getChapter",
  userAuth,
  [query("chapterId").isMongoId()],
  getChapter
);

userRouter.post(
  "/enrollCourse",
  userAuth,
  [body("courseId").isMongoId()],
  enrollCourse
);

/* ========================= ADMIN – COURSE ========================= */

userRouter.post(
  "/addCourse",
  adminAuth,
  upload.fields([
    { name: "courseThumbnailImage", maxCount: 1 },
    { name: "courseIntroductionImages", maxCount: 5 },
  ]),
  [
    body("courseName").isString(),
    body("shortDescription").isString(),
    body("price").isNumeric(),
    body("courseIntroduction").isString(),
    body("longDescription").isString(),
  ],
  addCourse
);

userRouter.post(
  "/editCourse",
  adminAuth,
  [
    body("courseId").isMongoId(),
    body("courseName").isString(),
    body("shortDescription").isString(),
    body("price").isNumeric(),
    body("courseIntroduction").isString(),
    body("longDescription").isString(),
  ],
  editCourse
);

userRouter.get(
  "/deleteCourse",
  adminAuth,
  [query("courseId").isMongoId()],
  deleteCourse
);

/* ========================= ADMIN – SECTION ========================= */

userRouter.post(
  "/addSection",
  adminAuth,
  [
    body("sectionTitle").isString(),
    body("courseId").isMongoId(),
  ],
  addSection
);

userRouter.post(
  "/editSection",
  adminAuth,
  [
    body("sectionId").isMongoId(),
    body("sectionTitle").isString(),
    body("sectionDescription").optional().isString(),
  ],
  editSection
);

userRouter.get(
  "/deleteSection",
  adminAuth,
  [query("sectionId").isMongoId()],
  deleteSection
);

/* ========================= ADMIN – CHAPTER ========================= */

userRouter.post(
  "/addChapter",
  adminAuth,
  upload.fields([
    { name: "chapterThumbnailImage", maxCount: 1 },
    { name: "chapterFile", maxCount: 5 },
    { name: "chapterVideo", maxCount: 5 },
    { name: "chapterVideoThumbnailImage", maxCount: 5 },
  ]),
  [
    body("chapterName").isString(),
    body("shortDescription").isString(),
    body("chapterSummary").isString(),
    body("sectionId").isMongoId(),
  ],
  addChapter
);

userRouter.post(
  "/editChapter",
  adminAuth,
  [
    body("chapterId").isMongoId(),
    body("chapterName").isString(),
    body("shortDescription").isString(),
    body("chapterSummary").isString(),
  ],
  editChapter
);

userRouter.get(
  "/deleteChapter",
  adminAuth,
  [
    query("chapterId").isMongoId(),
    query("sectionId").isMongoId(),
  ],
  deleteChapter
);

/* ========================= QUIZ – CHAPTER ========================= */

userRouter.post(
  "/addChapterQuiz",
  adminAuth,
  [
    body("chapterId").isMongoId(),
    body("quiz").isObject(),
    body("quiz.questions").isArray({ min: 1 }),
  ],
  quizController.addChapterQuiz
);

userRouter.get(
  "/getChapterQuiz",
  userAuth,
  [query("chapterId").isMongoId()],
  quizController.getChapterQuiz
);

/* ========================= QUIZ – SECTION ========================= */

userRouter.post(
  "/addSectionQuiz",
  adminAuth,
  [
    body("sectionId").isMongoId(),
    body("quiz").isObject(),
    body("quiz.questions").isArray({ min: 1 }),
  ],
  quizController.addSectionQuiz
);

userRouter.get(
  "/getSectionQuiz",
  userAuth,
  [query("sectionId").isMongoId()],
  quizController.getSectionQuiz
);

/* ========================= SECTION VIDEOS ========================= */

userRouter.post(
  "/addSectionVideo",
  adminAuth,
  upload.fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]),
  [
    body("sectionId").isMongoId(),
    body("title").isString(),
  ],
  addSectionVideo
);

module.exports = userRouter;
