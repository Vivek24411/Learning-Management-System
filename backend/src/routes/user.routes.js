const express = require("express");
const userRouter = express.Router();
const {body, query} = require("express-validator");
const { sendOTP, verifyOTPandRegister, login, getProfile, getChapter, getAllCourses, addCourse, addSection, addChapter, editCourse, editChapter, editSection, deleteCourse, deleteChapter, deleteSection, getCourse, enrollCourse, createOrder, verifyOrder, resetPassword, addSectionQuiz, getSectionQuiz, submitSectionQuiz, addChapterQuiz, getChapterQuiz, submitChapterQuiz, getSection, updateCourseThumbnail, removeCourseIntroductionImage, addIntroductionImage, removeSectionVideo, addSectionVideos, addChapterExternalLinks, removeChapterExternalLink, updateChapterExternalLinks, updateChapterThumbnail, removeChapterFile, addChapterFiles, removeChapterVideo, addChapterVideos, giveAccessToCourse, giveAdminAccess } = require("../controllers/user.controllers");
const { userAuth, adminAuth } = require("../middlewares/auth");
const { uploadCourseThumbnail } = require("../middlewares/upload");
const upload = require("../middlewares/upload");


userRouter.post("/sendOTP",[
    body("email").isEmail().isLength({min:1})
],sendOTP)

userRouter.post("/verifyOTPandRegister",[
    body("email").isEmail().isLength({min:1}),
    body("name").isString().isLength({min:3}),
    body("password").isString().isLength({min:3}),
    body("OTP").isString().isLength({min:6})
],verifyOTPandRegister)

userRouter.post("/login",[
    body("email").isEmail().isLength({min:1}),
    body("password").isString().isLength({min:3})
],login)

userRouter.get("/getProfile",userAuth,getProfile)

userRouter.get("/getAllCourses",getAllCourses)

userRouter.get("/getCourse",userAuth,[
    query("courseId").isMongoId()
],getCourse)

userRouter.get("/getChapter",userAuth,[
    query("chapterId").isMongoId()
],getChapter)

userRouter.post("/addCourse",adminAuth,upload.fields([
    { name: "courseThumbnailImage", maxCount: 1 },
    { name: "courseIntroductionImages", maxCount: 5 },
]),[
    body("courseName").isString().isLength({min:1}),
    body("shortDescription").isString().isLength({min:1}),
    body("price").isNumeric(),
    body("courseIntroduction").isString().isLength({min:1}),
    body("longDescription").isString()
],(req,res,next)=>{
    console.log("In route");
    next();
},addCourse)

userRouter.post("/addSection",adminAuth,upload.array("sectionVideo", 5),[
    body("sectionTitle").isString().isLength({min:1}),
    body("courseId").isMongoId(),
],addSection)

userRouter.post("/addChapter",adminAuth,upload.fields([
    {name: "chapterThumbnailImage", maxCount:1},
    {name: "chapterFile", maxCount:5},
    {name: "chapterVideo", maxCount:5},
    {name: "chapterVideoThumbnailImage", maxCount:5},
]),[
    body("chapterName").isString().isLength({min:1}),
    body("shortDescription").isString().isLength({min:1}),
    body("chapterSummary").isString().isLength({min:1}),
    body("sectionId").isMongoId(),
    body("chapterVideoTitle").optional(),
],addChapter)

userRouter.post("/editCourse",adminAuth,[
    body("courseId").isMongoId(),
    body("courseName").isString().isLength({min:1}),
    body("shortDescription").isString().isLength({min:1}),
    body("price").isNumeric(),
    body("courseIntroduction").isString().isLength({min:1}),
    body("longDescription").isString()
],editCourse)

userRouter.post("/editChapter",adminAuth,[
    body("chapterId").isMongoId(),
    body("chapterName").isString().isLength({min:1}),
    body("shortDescription").isString().isLength({min:1}),
    body("chapterSummary").isString().isLength({min:1}),
],editChapter)

userRouter.post("/editSection",adminAuth,[
    body("sectionId").isMongoId(),
    body("sectionTitle").isString().isLength({min:1}),
    body("sectionDescription").isString(),
],editSection)

userRouter.get("/deleteCourse",adminAuth,[
    query("courseId").isMongoId()
],deleteCourse)

userRouter.get("/deleteChapter",adminAuth,[
    query("chapterId").isMongoId(),
    query("sectionId").isMongoId()
],deleteChapter)

userRouter.get("/deleteSection",adminAuth,[
    query("sectionId").isMongoId(),
],deleteSection)

userRouter.post("/enrollCourse",userAuth,[
    body("courseId").isMongoId()
],enrollCourse)

userRouter.post("/createOrder",userAuth,[
    body("courseId").isMongoId()
],createOrder)

userRouter.post("/verifyOrder",userAuth,[
    body("orderId").isString().isLength({min:1}),
    body("paymentId").isString().isLength({min:1}),
    body("signature").isString().isLength({min:1})
],verifyOrder)

userRouter.post("/resetPassword",[
    body("email").isEmail().isLength({min:1}),
    body("newPassword").isString().isLength({min:3}),
    body("OTP").isString().isLength({min:6})
],resetPassword)


userRouter.post("/addSectionQuiz",adminAuth,[
    body("id").isMongoId(),
    body("quizData").isArray({min:1})
],addSectionQuiz)

userRouter.post("/addChapterQuiz",adminAuth,[
    body("id").isMongoId(),
    body("quizData").isArray({min:1})
],addChapterQuiz)


userRouter.get("/getSectionQuiz",userAuth,[
    query("id").isMongoId()
],getSectionQuiz)

userRouter.get("/getChapterQuiz",userAuth,[
    query("id").isMongoId()
],getChapterQuiz)

userRouter.post("/submitSectionQuiz",userAuth,[
    body("id").isMongoId(),
    body("answeredQuizData").isArray({min:1})
],submitSectionQuiz)

userRouter.post("/submitChapterQuiz",userAuth,[
    body("id").isMongoId(),
    body("answeredQuizData").isArray({min:1})
],submitChapterQuiz)

userRouter.get("/getSection",adminAuth,[
    query("sectionId").isMongoId()
],getSection)

userRouter.post("/updateCourseThumbnail",adminAuth,upload.single("courseThumbnailImage"),[
    body("courseId").isMongoId()
],updateCourseThumbnail)

userRouter.post("/removeCourseIntroductionImage",adminAuth,[
    body("courseId").isMongoId(),
    body("imageURL").isString().isLength({min:1})
],removeCourseIntroductionImage)

userRouter.post("/addIntroductionImages",adminAuth,upload.array("courseIntroductionImages", 5),[
    body("courseId").isMongoId()
],addIntroductionImage)

userRouter.post("/removeSectionVideo",adminAuth,[
    body("sectionId").isMongoId(),
    body("videoURL").isString().isLength({min:1})
],removeSectionVideo)

userRouter.post("/addSectionVideos",adminAuth,upload.array("sectionVideo", 5),[
    body("sectionId").isMongoId()
],addSectionVideos)

userRouter.post("/addChapterExternalLinks",adminAuth,[
    body("chapterId").isMongoId(),
    body("externalLinks").isArray()
],addChapterExternalLinks)

userRouter.post("/removeChapterExternalLink",adminAuth,[
    body("chapterId").isMongoId(),
    body("linkIndex").isNumeric()
],removeChapterExternalLink)

userRouter.post("/updateChapterExternalLinks",adminAuth,[
    body("chapterId").isMongoId(),
    body("externalLinks").isArray()
],updateChapterExternalLinks)

userRouter.post("/updateChapterThumbnail",adminAuth,upload.single("chapterThumbnailImage"),[
    body("chapterId").isMongoId()
],updateChapterThumbnail)

userRouter.post("/removeChapterFile",adminAuth,[
    body("chapterId").isMongoId(),
    body("fileURL").isString().isLength({min:1})
],removeChapterFile)

userRouter.post("/addChapterFiles",adminAuth,upload.array("chapterFile", 5),[
    body("chapterId").isMongoId()
],addChapterFiles)

userRouter.post("/removeChapterVideo",adminAuth,[
    body("chapterId").isMongoId(),
    body("videoIndex").isNumeric()
],removeChapterVideo)

userRouter.post("/addChapterVideos",adminAuth,upload.fields([
    {name: "chapterVideo", maxCount:5},
    {name: "chapterVideoThumbnailImage", maxCount:5}
]),[
    body("chapterId").isMongoId(),
    body("chapterVideoTitle").optional()
],addChapterVideos)

userRouter.post("/giveCourseAccess",adminAuth,[
    body("emailArray").isArray({min:1}),
    body("courseId").isMongoId()
],giveAccessToCourse)

userRouter.post("/giveAdminAccess",adminAuth,[
    body("email").isEmail().isLength({min:1})
],giveAdminAccess)
module.exports = userRouter;