const express = require("express");
const userRouter = express.Router();
const {body, query} = require("express-validator");
const { sendOTP, verifyOTPandRegister, login, getProfile, getChapter, getAllCourses, addCourse, addSection, addChapter, editCourse, editChapter, editSection, deleteCourse, deleteChapter, deleteSection, getCourse, enrollCourse, createOrder, verifyOrder, resetPassword, addSectionQuiz, getSectionQuiz, submitSectionQuiz, addChapterQuiz, getChapterQuiz, submitChapterQuiz, getSection, updateCourseThumbnail, removeCourseIntroductionImage, addIntroductionImage, removeSectionVideo, addSectionVideos, addChapterExternalLinks, removeChapterExternalLink, updateChapterExternalLinks, updateChapterThumbnail, removeChapterFile, addChapterFiles, removeChapterVideo, addChapterVideos, giveAccessToCourse, giveAdminAccess, deleteSectionLink, addSectionLink, generateUrl, saveSectionVideoUrl, requestCreatorAccess, getCreatorRequests, handleCreatorRequest, requestEnrollment, getEnrollmentRequests, handleEnrollmentRequest, getMyScores, getCourseStudentScores } = require("../controllers/user.controllers");
const { userAuth, adminAuth, creatorAuth, manageAuth, courseOwnerCheck } = require("../middlewares/auth");
const { uploadCourseThumbnail } = require("../middlewares/upload");
const upload = require("../middlewares/upload");
const videoUpload = require("../middlewares/videoUpload");


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

userRouter.post("/addCourse",creatorAuth,upload.fields([
    { name: "courseThumbnailImage", maxCount: 1 },
    { name: "courseIntroductionImages", maxCount: 5 },
]),[
    body("courseName").isString().isLength({min:1}),
    body("shortDescription").isString().isLength({min:1}),
    body("price").optional(),
    body("enrollmentType").optional().isIn(["paid","request"]),
    body("googleFormLink").optional({checkFalsy:true}).isString(),
    body("courseIntroduction").isString().isLength({min:1}),
    body("longDescription").optional().isString()
],(req,res,next)=>{
    console.log("In route");
    next();
},addCourse)

userRouter.post("/addSection",creatorAuth,upload.array("sectionVideo", 5),courseOwnerCheck("course"),[
    body("sectionTitle").isString().isLength({min:1}),
    body("courseId").isMongoId(),
],addSection)

userRouter.post("/addChapter",creatorAuth,upload.fields([
    {name: "chapterThumbnailImage", maxCount:1},
    {name: "chapterFile", maxCount:5},
    {name: "chapterVideo", maxCount:5},
    {name: "chapterVideoThumbnailImage", maxCount:5},
]),courseOwnerCheck("section"),[
    body("chapterName").isString().isLength({min:1}),
    body("shortDescription").isString().isLength({min:1}),
    body("chapterSummary").optional().isString(),
    body("sectionId").isMongoId(),
    body("chapterVideoTitle").optional(),
],addChapter)

userRouter.post("/editCourse",manageAuth("course"),[
    body("courseId").isMongoId(),
    body("courseName").isString().isLength({min:1}),
    body("shortDescription").isString().isLength({min:1}),
    body("price").optional(),
    body("enrollmentType").optional().isIn(["paid","request"]),
    body("googleFormLink").optional({checkFalsy:true}).isString(),
    body("courseIntroduction").isString().isLength({min:1}),
    body("longDescription").optional().isString()
],editCourse)

userRouter.post("/editChapter",manageAuth("chapter"),[
    body("chapterId").isMongoId(),
    body("chapterName").isString().isLength({min:1}),
    body("shortDescription").isString().isLength({min:1}),
    body("chapterSummary").optional().isString(),
],editChapter)

userRouter.post("/editSection",manageAuth("section"),[
    body("sectionId").isMongoId(),
    body("sectionTitle").isString().isLength({min:1}),
    body("sectionDescription").isString(),
],editSection)

userRouter.get("/deleteCourse",manageAuth("course"),[
    query("courseId").isMongoId()
],deleteCourse)

userRouter.get("/deleteChapter",manageAuth("chapter"),[
    query("chapterId").isMongoId(),
    query("sectionId").isMongoId()
],deleteChapter)

userRouter.get("/deleteSection",manageAuth("section"),[
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


userRouter.post("/addSectionQuiz",manageAuth("section","id"),[
    body("id").isMongoId(),
    body("quizData").isArray({min:1})
],addSectionQuiz)

userRouter.post("/addChapterQuiz",manageAuth("chapter","id"),[
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

userRouter.get("/getSection",manageAuth("section"),[
    query("sectionId").isMongoId()
],getSection)

userRouter.post("/updateCourseThumbnail",creatorAuth,upload.single("courseThumbnailImage"),courseOwnerCheck("course"),[
    body("courseId").isMongoId()
],updateCourseThumbnail)

userRouter.post("/removeCourseIntroductionImage",manageAuth("course"),[
    body("courseId").isMongoId(),
    body("imageURL").isString().isLength({min:1})
],removeCourseIntroductionImage)

userRouter.post("/addIntroductionImages",creatorAuth,upload.array("courseIntroductionImages", 5),courseOwnerCheck("course"),[
    body("courseId").isMongoId()
],addIntroductionImage)

userRouter.post("/removeSectionVideo",manageAuth("section"),[
    body("sectionId").isMongoId(),
    body("videoURL").isString().isLength({min:1})
],removeSectionVideo)

userRouter.post("/addSectionVideos",creatorAuth,upload.array("sectionVideo",5),courseOwnerCheck("section"),[
    body("sectionId").isMongoId()
],addSectionVideos)

userRouter.post("/addChapterExternalLinks",manageAuth("chapter"),[
    body("chapterId").isMongoId(),
    body("externalLinks").isArray()
],addChapterExternalLinks)

userRouter.post("/removeChapterExternalLink",manageAuth("chapter"),[
    body("chapterId").isMongoId(),
    body("linkIndex").isNumeric()
],removeChapterExternalLink)

userRouter.post("/updateChapterExternalLinks",manageAuth("chapter"),[
    body("chapterId").isMongoId(),
    body("externalLinks").isArray()
],updateChapterExternalLinks)

userRouter.post("/updateChapterThumbnail",creatorAuth,upload.single("chapterThumbnailImage"),courseOwnerCheck("chapter"),[
    body("chapterId").isMongoId()
],updateChapterThumbnail)

userRouter.post("/removeChapterFile",manageAuth("chapter"),[
    body("chapterId").isMongoId(),
    body("fileURL").isString().isLength({min:1})
],removeChapterFile)

userRouter.post("/addChapterFiles",creatorAuth,upload.array("chapterFile", 5),courseOwnerCheck("chapter"),[
    body("chapterId").isMongoId()
],addChapterFiles)

userRouter.post("/removeChapterVideo",manageAuth("chapter"),[
    body("chapterId").isMongoId(),
    body("videoIndex").isNumeric()
],removeChapterVideo)

userRouter.post("/addChapterVideos",creatorAuth,upload.fields([
    {name: "chapterVideo", maxCount:5},
    {name: "chapterVideoThumbnailImage", maxCount:5}
]),courseOwnerCheck("chapter"),[
    body("chapterId").isMongoId(),
    body("chapterVideoTitle").optional()
],addChapterVideos)

userRouter.post("/giveCourseAccess",manageAuth("course"),[
    body("emailArray").isArray({min:1}),
    body("courseId").isMongoId()
],giveAccessToCourse)

userRouter.post("/giveAdminAccess",adminAuth,[
    body("email").isEmail().isLength({min:1})
],giveAdminAccess)


userRouter.post("/deleteSectionLink",manageAuth("section"),[
    body("sectionId").isMongoId(),
    body("label").isString().isLength({min:1})
],deleteSectionLink)

userRouter.post("/addSectionLink",manageAuth("section"),[
    body("sectionId").isMongoId(),
    body("sectionLink").isArray()
],addSectionLink)

userRouter.get("/generateUrl",generateUrl);

userRouter.post("/saveSectionVideoUrl",manageAuth("section"),[
    body("sectionId").isMongoId()
],saveSectionVideoUrl)


/* ---- Creator access requests ---- */
userRouter.post("/requestCreatorAccess",userAuth,requestCreatorAccess)

userRouter.get("/getCreatorRequests",adminAuth,getCreatorRequests)

userRouter.post("/handleCreatorRequest",adminAuth,[
    body("userId").isMongoId(),
    body("decision").isIn(["approve","reject"])
],handleCreatorRequest)


/* ---- Enrollment requests (request-access courses) ---- */
userRouter.post("/requestEnrollment",userAuth,[
    body("courseId").isMongoId()
],requestEnrollment)

userRouter.get("/getEnrollmentRequests",userAuth,[
    query("courseId").isMongoId()
],getEnrollmentRequests)

userRouter.post("/handleEnrollmentRequest",userAuth,[
    body("requestId").isMongoId(),
    body("decision").isIn(["approve","reject"])
],handleEnrollmentRequest)


/* ---- Test scores ---- */
userRouter.get("/getMyScores",userAuth,getMyScores)

userRouter.get("/getCourseStudentScores",userAuth,[
    query("courseId").isMongoId()
],getCourseStudentScores)

module.exports = userRouter;