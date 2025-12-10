const express = require("express");
const userRouter = express.Router();
const {body, query} = require("express-validator");
const { sendOTP, verifyOTPandRegister, login, getProfile, getChapter, getAllCourses, addCourse, addSection, addChapter, editCourse, editChapter, editSection, deleteCourse, deleteChapter, deleteSection, getCourse, enrollCourse } = require("../controllers/user.controllers");
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
]),(req,res,next)=>{
    console.log("In route");
    next();
},[
    body("courseName").isString().isLength({min:1}),
    body("shortDescription").isString().isLength({min:1}),
    body("price").isNumeric(),
    body("courseIntroduction").isString().isLength({min:1}),
    body("longDescription").isString().isLength({min:1}),
],addCourse)

userRouter.post("/addSection",adminAuth,[
    body("sectionTitle").isString().isLength({min:1}),
    body("sectionDescription").isString(),
    body("courseId").isMongoId()
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
    body("longDescription").isString().isLength({min:1}),
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



module.exports = userRouter;