const express = require("express");
const userRouter = express.Router();
const {body, query} = require("express-validator");
const { sendOTP, verifyOTPandRegister, login, getProfile, getChapter, getAllCourses, addCourse, addSection, addChapter, editCourse, editChapter, editSection, deleteCourse, deleteChapter, deleteSection, getCourse, enrollCourse, createOrder, verifyOrder, resetPassword, addSectionQuiz, getSectionQuiz, submitSectionQuiz, addChapterQuiz, getChapterQuiz, submitChapterQuiz, deleteSectionQuiz, deleteChapterQuiz, requestQuizRetake, getQuizRetakeRequests, handleQuizRetakeRequest, getSection, updateCourseThumbnail, removeCourseIntroductionImage, addIntroductionImage, updateIntroductionImageCaption, removeSectionVideo, addSectionVideos, updateSectionVideoTitle, addChapterExternalLinks, removeChapterExternalLink, updateChapterExternalLinks, updateChapterThumbnail, removeChapterFile, addChapterFiles, removeChapterVideo, addChapterVideos, giveAccessToCourse, getCourseLearners, removeCourseAccess, giveAdminAccess, deleteSectionLink, addSectionLink, generateUrl, saveSectionVideoUrl, requestCreatorAccess, getCreatorRequests, handleCreatorRequest, requestEnrollment, getEnrollmentRequests, handleEnrollmentRequest, getMyScores, getCourseStudentScores } = require("../controllers/user.controllers");
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
    body("shortDescription").optional({nullable:true}).isString(),
    body("price").optional(),
    body("enrollmentType").optional().isIn(["paid","request"]),
    body("googleFormLink").optional({checkFalsy:true}).isString(),
    body("courseIntroduction").optional({nullable:true}).isString(),
    body("longDescription").optional({nullable:true}).isString(),
    body("courseIntroductionImageCaptions").optional({nullable:true}).isString()
],(req,res,next)=>{
    console.log("In route");
    next();
},addCourse)

userRouter.post("/addSection",creatorAuth,upload.array("sectionVideo", 5),courseOwnerCheck("course"),[
    body("sectionTitle").isString().isLength({min:1}),
    body("courseId").isMongoId(),
    body("sectionVideoTitle").optional(),
],addSection)

userRouter.post("/addChapter",creatorAuth,upload.fields([
    {name: "chapterThumbnailImage", maxCount:1},
    {name: "chapterFile", maxCount:10},
    {name: "chapterVideo", maxCount:5},
    {name: "chapterVideoThumbnailImage", maxCount:5},
]),courseOwnerCheck("section"),[
    body("chapterName").isString().isLength({min:1}),
    body("shortDescription").optional({nullable:true}).isString(),
    body("chapterSummary").optional({nullable:true}).isString(),
    body("sectionId").isMongoId(),
    body("chapterVideoTitle").optional(),
    body("chapterVideoThumbnailIndex").optional(),
],addChapter)

userRouter.post("/editCourse",manageAuth("course"),[
    body("courseId").isMongoId(),
    body("courseName").isString().isLength({min:1}),
    body("shortDescription").optional({nullable:true}).isString(),
    body("price").optional(),
    body("enrollmentType").optional().isIn(["paid","request"]),
    body("googleFormLink").optional({checkFalsy:true}).isString(),
    body("courseIntroduction").optional({nullable:true}).isString(),
    body("longDescription").optional({nullable:true}).isString(),
    body("courseIntroductionImageCaptions").optional({nullable:true}).isArray()
],editCourse)

userRouter.post("/editChapter",manageAuth("chapter"),[
    body("chapterId").isMongoId(),
    body("chapterName").isString().isLength({min:1}),
    body("shortDescription").optional({nullable:true}).isString(),
    body("chapterSummary").optional({nullable:true}).isString(),
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
    body("quizId").optional({checkFalsy:true}).isMongoId(),
    body("quizData").isArray({min:1}),
    body("title").isString().trim().isLength({min:1,max:120})
],addSectionQuiz)

userRouter.post("/addChapterQuiz",manageAuth("chapter","id"),[
    body("id").isMongoId(),
    body("quizId").optional({checkFalsy:true}).isMongoId(),
    body("quizData").isArray({min:1}),
    body("title").isString().trim().isLength({min:1,max:120})
],addChapterQuiz)

userRouter.post("/deleteSectionQuiz",manageAuth("section","id"),[
    body("id").isMongoId(),
    body("quizId").optional({checkFalsy:true}).isMongoId()
],deleteSectionQuiz)

userRouter.post("/deleteChapterQuiz",manageAuth("chapter","id"),[
    body("id").isMongoId(),
    body("quizId").optional({checkFalsy:true}).isMongoId()
],deleteChapterQuiz)


userRouter.get("/getSectionQuiz",userAuth,[
    query("id").isMongoId(),
    query("quizId").optional({checkFalsy:true}).isMongoId()
],getSectionQuiz)

userRouter.get("/getChapterQuiz",userAuth,[
    query("id").isMongoId(),
    query("quizId").optional({checkFalsy:true}).isMongoId()
],getChapterQuiz)

userRouter.post("/submitSectionQuiz",userAuth,[
    body("id").isMongoId(),
    body("quizId").optional({checkFalsy:true}).isMongoId(),
    body("answeredQuizData").isArray({min:1})
],submitSectionQuiz)

userRouter.post("/submitChapterQuiz",userAuth,[
    body("id").isMongoId(),
    body("quizId").optional({checkFalsy:true}).isMongoId(),
    body("answeredQuizData").isArray({min:1})
],submitChapterQuiz)

userRouter.post("/requestQuizRetake",userAuth,[
    body("quizType").isIn(["section","chapter"]),
    body("quizId").isMongoId(),
    body("assessmentId").optional({checkFalsy:true}).isMongoId()
],requestQuizRetake)

userRouter.get("/getSection",manageAuth("section"),[
    query("sectionId").isMongoId()
],getSection)

userRouter.post("/updateCourseThumbnail",creatorAuth,upload.single("courseThumbnailImage"),courseOwnerCheck("course"),[
    body("courseId").isMongoId()
],updateCourseThumbnail)

userRouter.post("/removeCourseIntroductionImage",manageAuth("course"),[
    body("courseId").isMongoId(),
    body("imageURL").optional().isString().isLength({min:1}),
    body("imageIndex").optional().isInt({min:0})
],removeCourseIntroductionImage)

userRouter.post("/addIntroductionImages",creatorAuth,upload.array("courseIntroductionImages", 5),courseOwnerCheck("course"),[
    body("courseId").isMongoId(),
    body("courseIntroductionImageCaptions").optional({nullable:true}).isString()
],addIntroductionImage)

userRouter.post("/updateIntroductionImageCaption",manageAuth("course"),[
    body("courseId").isMongoId(),
    body("imageIndex").isInt({min:0}),
    body("caption").optional({nullable:true}).isString().isLength({max:240})
],updateIntroductionImageCaption)

userRouter.post("/removeSectionVideo",manageAuth("section"),[
    body("sectionId").isMongoId(),
    body("videoURL").isString().isLength({min:1})
],removeSectionVideo)

userRouter.post("/addSectionVideos",creatorAuth,upload.array("sectionVideo",5),courseOwnerCheck("section"),[
    body("sectionId").isMongoId(),
    body("sectionVideoTitle").optional()
],addSectionVideos)

userRouter.post("/updateSectionVideoTitle",manageAuth("section"),[
    body("sectionId").isMongoId(),
    body("videoIndex").isInt({min:0}),
    body("title").optional({nullable:true}).isString().isLength({max:120})
],updateSectionVideoTitle)

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

userRouter.get("/getCourseLearners",manageAuth("course"),[
    query("courseId").isMongoId()
],getCourseLearners)

userRouter.post("/removeCourseAccess",manageAuth("course"),[
    body("courseId").isMongoId(),
    body("userId").isMongoId()
],removeCourseAccess)

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
    body("sectionId").isMongoId(),
    body("videoTitle").optional({nullable:true}).isString().isLength({max:120})
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

/* ---- Quiz retake requests ---- */
userRouter.get("/getQuizRetakeRequests",manageAuth("course"),[
    query("courseId").isMongoId()
],getQuizRetakeRequests)

userRouter.post("/handleQuizRetakeRequest",userAuth,[
    body("requestId").isMongoId(),
    body("decision").isIn(["approve","reject"])
],handleQuizRetakeRequest)


/* ---- Test scores ---- */
userRouter.get("/getMyScores",userAuth,getMyScores)

userRouter.get("/getCourseStudentScores",userAuth,[
    query("courseId").isMongoId()
],getCourseStudentScores)

module.exports = userRouter;
