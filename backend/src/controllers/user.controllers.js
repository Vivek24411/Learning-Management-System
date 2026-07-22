const { validationResult } = require("express-validator");
const { createOTP, sendOTP, createHash } = require("../services/user.services");
const otpModel = require("../models/otp.model");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const courseModel = require("../models/course.model");
const chapterModel = require("../models/chapter.model");
const sectionModel = require("../models/section.model");
const Razorpay = require("razorpay");
const orderModel = require("../models/order.model");
const enrollmentRequestModel = require("../models/enrollmentRequest.model");
const crypto = require("crypto");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getPresignedUrl } = require("../config/s3Service");

function checkValidation(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }
}

module.exports.sendOTP = async (req, res, next) => {
  try {
    checkValidation(req, res);

    const OTP = createOTP();
    console.log(OTP);
    const hashedOTP = createHash(OTP);
    console.log(hashedOTP);
    const { email } = req.body;

    const savedOTP = await otpModel.findOne({
      email,
    });

    if (savedOTP) {
      savedOTP.OTP = hashedOTP;
      savedOTP.createdAt = Date.now();
      await savedOTP.save();
    } else {
      const savedOTP2 = await otpModel.create({
        email,
        OTP: hashedOTP,
      });
    }

    await sendOTP(email, OTP);

    return res.json({ success: true, msg: "OTP Sent Successfully" });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
};

module.exports.verifyOTPandRegister = async (req, res, next) => {
  checkValidation(req, res);

  const { email, name, password, OTP } = req.body;
  const hashedOTP = createHash(OTP);
  console.log(hashedOTP);
  const savedOTP = await otpModel.findOne({
    email,
    OTP: hashedOTP,
  });
  if (!savedOTP) {
    return res.json({ success: false, msg: "Invalid or Expired OTP" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    email,
    name,
    password: hashedPassword,
  });

  const token = user.createToken();
  console.log("Generated token for user:", token);
  console.log("User registered:", user._id);

  await otpModel.deleteOne({ _id: savedOTP._id });

  return res.json({ success: true, msg: "Registered Successfully", token });
};

module.exports.login = async (req, res, next) => {
  checkValidation(req, res);

  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.json({ success: false, msg: "User not found" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.json({ success: false, msg: "Invalid Credentials" });
  }

  const token = user.createToken();

  return res.json({ success: true, msg: "Login Successful", token });
};

module.exports.getProfile = (req, res, next) => {
  return res.json({ success: true, user: req.user });
};

module.exports.getAllCourses = async (req, res, next) => {
  const courses = await courseModel
    .find()
    .select(
      "courseName shortDescription price courseThumbnailImage publishedDate creatorName creator enrollmentType googleFormLink"
    );
  return res.json({ success: true, courses });
};

module.exports.getCourse = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, msg: errors.array() });
  }

  const { courseId } = req.query;
  const course = await courseModel.findById(courseId).populate({
    path: "sections",
    populate: {
      path: "chapters",
      select: "chapterName shortDescription chapterThumbnailImage",
    },
  });

  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  // Surface this user's enrollment-request status (for "request access" courses)
  let enrollmentRequestStatus = "none";
  if (req.user) {
    const existingRequest = await enrollmentRequestModel
      .findOne({ user: req.user._id, course: courseId })
      .sort({ createdAt: -1 });
    if (existingRequest) {
      enrollmentRequestStatus = existingRequest.status;
    }
  }

  return res.json({ success: true, course, enrollmentRequestStatus });
};

module.exports.getChapter = async (req, res, next) => {
  checkValidation(req, res);

  const { chapterId } = req.query;

  const chapter = await chapterModel.findById(chapterId);

  if (!chapter) {
    return res.json({ success: false, msg: "Chapter not found" });
  }

  const sectionId = await sectionModel
    .findOne({ chapters: chapterId })
    .select("_id");

  console.log("sectionId:", sectionId._id);

  const courseId = await courseModel
    .findOne({ sections: sectionId })
    .select("_id");

  console.log("courseId:", courseId._id);

  return res.json({ success: true, chapter, courseId: courseId._id });
};

module.exports.addCourse = async (req, res, next) => {
  try {
    console.log("addCourse controller called");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("User:", req.user);
    console.log("Is Admin:", req.user?.isAdmin);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.json({ success: false, msg: errors.array() });
    }

    const {
      courseName,
      shortDescription,
      longDescription,
      courseIntroduction,
      price,
      enrollmentType,
      googleFormLink,
    } = req.body;

    console.log("Extracted form data:", {
      courseName,
      shortDescription,
      longDescription,
      courseIntroduction,
      price,
      enrollmentType,
      googleFormLink,
    });

    // Check if required files exist
    if (!req.files || !req.files.courseThumbnailImage) {
      console.log("Files missing:", req.files);
      return res.json({
        success: false,
        msg: "Course thumbnail image is required",
      });
    }

    console.log("Files validation passed");

    const courseThumbnailImage = req.files.courseThumbnailImage[0].path;
    const courseIntroductionImages = req.files.courseIntroductionImages
      ? req.files.courseIntroductionImages.map((file) => file.path)
      : [];

    console.log("File paths extracted:", {
      courseThumbnailImage,
      courseIntroductionImages,
    });

    console.log("Creating course in database...");

    const type = enrollmentType === "request" ? "request" : "paid";

    // Both course types may carry a price. For "paid" it is charged in-app via
    // Razorpay; for "request" it is shown for information and collected through
    // the Google Form, with the owner approving once payment is confirmed.
    const courseData = {
      courseName,
      shortDescription,
      longDescription,
      courseIntroduction,
      courseThumbnailImage,
      price: parseFloat(price) || 0,
      enrollmentType: type,
      googleFormLink: type === "request" ? googleFormLink || "" : "",
      creator: req.user._id,
      creatorName: req.user.name,
      courseIntroductionImages,
    };

    console.log("Course data to be saved:", courseData);

    const course = await courseModel.create(courseData);

    console.log("Course created successfully:", course._id);

    return res.json({
      success: true,
      msg: "Course added successfully",
      course,
    });
  } catch (error) {
    console.error("Error in addCourse - Full error object:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return res
      .status(500)
      .json({ success: false, msg: error.message, error: error.toString() });
  }
};

module.exports.addSection = async (req, res, next) => {
  checkValidation(req, res);

  const { sectionTitle, sectionDescription, courseId, externalLinks } =
    req.body;
  console.log(req.files);
  const sectionVideo = req.files.map((file) => file.path) || [];
  console.log("Section videos paths:", sectionVideo);

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  const section = await sectionModel.create({
    sectionTitle,
    sectionDescription,
    sectionVideoUrl: sectionVideo,
    externalLinks: JSON.parse(externalLinks),
  });

  course.sections.push(section._id);
  await course.save();

  return res.json({
    success: true,
    msg: "Section added successfully",
    section,
  });
};

module.exports.addChapter = async (req, res, next) => {
  try {
    console.log("addChapter controller called");
    // Check validation and return early if there are errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ success: false, msg: errors.array() });
    }

    const {
      chapterName,
      shortDescription,
      chapterSummary,
      sectionId,
      chapterVideoTitle,
      externalLinks,
    } = req.body;
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    // Handle file uploads
    const chapterFile = req.files.chapterFile?.map((file) => file.path) || [];
    const chapterThumbnailImage = req.files.chapterThumbnailImage?.[0].path;

    // Handle video files
    const chapterVideo =
      req.files.chapterVideo?.map((video) => video.path) || [];
    const videoThumbnailImage =
      req.files.chapterVideoThumbnailImage?.map((img) => img.path) || [];

    // Handle video titles - they come as an array from FormData
    const videoTitleArray = Array.isArray(chapterVideoTitle)
      ? chapterVideoTitle
      : chapterVideoTitle
      ? [chapterVideoTitle]
      : [];
    console.log("Video titles array:", videoTitleArray);

    // Create video details array
    let chapterVideoDetails = [];
    if (chapterVideo && chapterVideo.length > 0) {
      for (let i = 0; i < chapterVideo.length; i++) {
        chapterVideoDetails.push({
          video: chapterVideo[i],
          videoThumbnail: videoThumbnailImage[i] || null,
          title: videoTitleArray[i] || `Video ${i + 1}`,
        });
      }
    }

    // Find the section
    const section = await sectionModel.findById(sectionId);
    if (!section) {
      return res.json({ success: false, msg: "Section Not Found" });
    }

    // Parse external links
    let parsedExternalLinks = [];
    if (externalLinks) {
      try {
        parsedExternalLinks = JSON.parse(externalLinks);
      } catch (error) {
        console.error("Error parsing external links:", error);
      }
    }

    // Create chapter
    const chapter = await chapterModel.create({
      chapterName,
      shortDescription,
      chapterSummary,
      chapterThumbnailImage,
      chapterFile,
      chapterVideoDetails,
      externalLinks: parsedExternalLinks,
    });

    // Add chapter to section
    section.chapters.push(chapter._id);
    await section.save(); // Fixed: was missing parentheses

    return res.json({
      success: true,
      msg: "Chapter Added Successfully",
      chapter,
    });
  } catch (error) {
    console.error("Error in addChapter:", error);
    return res.json({ success: false, msg: error.message });
  }
};

module.exports.editCourse = async (req, res, next) => {
  checkValidation(req, res);

  const {
    courseId,
    courseName,
    shortDescription,
    longDescription,
    courseIntroduction,
    price,
    enrollmentType,
    googleFormLink,
  } = req.body;

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  course.courseName = courseName;
  course.shortDescription = shortDescription;
  course.longDescription = longDescription;
  course.courseIntroduction = courseIntroduction;

  if (enrollmentType === "paid" || enrollmentType === "request") {
    course.enrollmentType = enrollmentType;
  }

  // Both types may show a price; request courses collect it via the Google Form
  course.price = parseFloat(price) || 0;

  if (course.enrollmentType === "request") {
    if (googleFormLink !== undefined) {
      course.googleFormLink = googleFormLink || "";
    }
  } else {
    course.googleFormLink = "";
  }

  await course.save();

  return res.json({
    success: true,
    msg: "Course updated successfully",
    course,
  });
};

module.exports.editChapter = async (req, res, next) => {
  checkValidation(req, res);

  const { chapterId, chapterName, shortDescription, chapterSummary } = req.body;

  const chapter = await chapterModel.findById(chapterId);
  if (!chapter) {
    return res.json({ success: false, msg: "Chapter not found" });
  }

  chapter.chapterName = chapterName;
  chapter.shortDescription = shortDescription;
  chapter.chapterSummary = chapterSummary;

  await chapter.save();

  return res.json({
    success: true,
    msg: "Chapter updated successfully",
    chapter,
  });
};

module.exports.editSection = async (req, res, next) => {
  checkValidation(req, res);

  const { sectionId, sectionTitle, sectionDescription } = req.body;

  const section = await sectionModel.findById(sectionId);
  if (!section) {
    return res.json({ success: false, msg: "Section not found" });
  }

  section.sectionTitle = sectionTitle;
  section.sectionDescription = sectionDescription;

  await section.save();

  return res.json({
    success: true,
    msg: "Section updated successfully",
    section,
  });
};

module.exports.deleteCourse = async (req, res, next) => {
  checkValidation(req, res);

  const { courseId } = req.query;

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  await course.deleteOne();

  return res.json({ success: true, msg: "Course deleted successfully" });
};

module.exports.deleteChapter = async (req, res, next) => {
  checkValidation(req, res);

  const { chapterId, sectionId } = req.query;

  const chapter = await chapterModel.findById(chapterId);
  if (!chapter) {
    return res.json({ success: false, msg: "Chapter not found" });
  }

  const section = await sectionModel.findById(sectionId);
  if (!section) {
    return res.json({ success: false, msg: "Section not found" });
  }

  section.chapters.pull(chapter._id);
  await section.save();

  await chapter.deleteOne();

  return res.json({ success: true, msg: "Chapter deleted successfully" });
};

module.exports.deleteSection = async (req, res, next) => {
  checkValidation(req, res);

  const { sectionId } = req.query;

  const section = await sectionModel.findById(sectionId);
  if (!section) {
    return res.json({ success: false, msg: "Section not found" });
  }

  const chapters = section.chapters;
  for (let chapter of chapters) {
    const chapterData = await chapterModel.findById(chapter);
    await chapterData.deleteOne();
  }

  const course = await courseModel.findOne({ sections: section._id });
  if (course) {
    course.sections.pull(section._id);
    await course.save();
  }
  await section.deleteOne();

  return res.json({ success: true, msg: "Section deleted successfully" });
};

module.exports.enrollCourse = async (req, res, next) => {
  checkValidation(req, res);

  const { courseId } = req.body;
  const user = req.user;

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  if (user.coursePurchased.includes(courseId)) {
    return res.json({ success: false, msg: "Course already enrolled" });
  }

  // Request-access courses must go through instructor approval
  if (course.enrollmentType === "request") {
    return res.json({
      success: false,
      msg: "This course requires the instructor's approval. Please send an enrollment request.",
    });
  }

  // Paid courses must go through the payment flow
  if (course.price > 0) {
    return res.json({
      success: false,
      msg: "This is a paid course. Please complete the payment to enroll.",
    });
  }

  user.coursePurchased.push(courseId);
  await user.save();

  return res.json({ success: true, msg: "Course enrolled successfully" });
};

module.exports.createOrder = async (req, res, next) => {
  checkValidation(req, res);
  console.log("createOrder controller called");
  const { courseId } = req.body;
  const user = req.user;

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  if (user.coursePurchased.includes(courseId)) {
    return res.json({ success: false, msg: "Course already purchased" });
  }

  console.log("Creating Razorpay order");

  const razorPay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const order = await razorPay.orders.create({
    amount: course.price * 100,
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
  });

  console.log("Razorpay order created:", order);

  if (!order) {
    return res.json({ success: false, msg: "Order creation failed" });
  }

  const orderData = await orderModel.create({
    userId: user._id,
    courseId: course._id,
    orderId: order.id,
    status: "created",
  });

  return res.json({ success: true, msg: "Order created successfully", order });
};

module.exports.verifyOrder = async (req, res, next) => {
  try {
    const error = validationResult(req);

    if (!error) {
      return res.json({ success: false, msg: error.array() });
    }

    const { orderId, paymentId, signature } = req.body;

    const order = await orderModel.findOne({ orderId });

    if (!order) {
      return res.json({ success: false, msg: "Order not found" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      return res.json({ success: false, msg: "Invalid signature" });
    }

    order.paymentId = paymentId;
    order.signature = signature;
    order.status = "paid";

    await order.save();

    req.user.coursePurchased.push(order.courseId);
    await req.user.save();

    return res.json({ success: true, msg: "Course enrolled successfully" });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
};

module.exports.resetPassword = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { email, newPassword, OTP } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.json({
      success: false,
      msg: "You are not registered, please sign up",
    });
  }

  const isPasswordSame = await user.comparePassword(newPassword);
  if (isPasswordSame) {
    return res.json({
      success: false,
      msg: "New password cannot be the same as the old password",
    });
  }

  const hashedOTP = createHash(OTP);

  const savedOTP = await otpModel.findOne({
    email,
    OTP: hashedOTP,
  });

  if (!savedOTP) {
    return res.json({ success: false, msg: "Invalid or expired OTP" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  await otpModel.deleteOne({ _id: savedOTP._id });

  return res.json({ success: true, msg: "Password reset successfully" });
};

module.exports.addSectionQuiz = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { id, quizData } = req.body;

  const section = await sectionModel.findById(id);
  if (!section) {
    return res.json({ success: false, msg: "section does not exist" });
  }

  section.sectionQuiz = quizData;
  await section.save();
  console.log(section.sectionQuiz);

  return res.json({ success: true, msg: "Quiz added successfully" });
};

module.exports.getSectionQuiz = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { id } = req.query;

  const section = await sectionModel.findById(id);
  if (!section) {
    return res.json({ success: false, msg: "section does not exist" });
  }

  return res.json({ success: true, quiz: section.sectionQuiz });
};

module.exports.addChapterQuiz = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { id, quizData } = req.body;

  const chapter = await chapterModel.findById(id);
  if (!chapter) {
    return res.json({ success: false, msg: "chapter does not exist" });
  }

  chapter.chapterQuiz = quizData;
  await chapter.save();
  console.log(chapter.chapterQuiz);

  return res.json({ success: true, msg: "Quiz added successfully" });
};

module.exports.getChapterQuiz = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { id } = req.query;

  const chapter = await chapterModel.findById(id);
  if (!chapter) {
    return res.json({ success: false, msg: "chapter does not exist" });
  }

  return res.json({ success: true, quiz: chapter.chapterQuiz });
};

module.exports.submitSectionQuiz = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { id, answeredQuizData } = req.body;

  const section = await sectionModel.findById(id);
  if (!section) {
    return res.json({ success: false, msg: "section does not exist" });
  }
  let score = 0;
  for (let i = 0; i < answeredQuizData.length; i++) {
    if (answeredQuizData[i].chosenAnswer === answeredQuizData[i].correct) {
      score += 1;
    }
  }

  const user = req.user;

  user.sectionQuizAttempt.push({
    sectionId: id,
    answeredQuizData,
    score,
  });

  await user.save();

  return res.json({ success: true, msg: "Quiz submitted successfully", score });
};

module.exports.submitChapterQuiz = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { id, answeredQuizData } = req.body;

  const chapter = await chapterModel.findById(id);
  if (!chapter) {
    return res.json({ success: false, msg: "chapter does not exist" });
  }
  let score = 0;
  for (let i = 0; i < answeredQuizData.length; i++) {
    if (answeredQuizData[i].chosenAnswer === answeredQuizData[i].correct) {
      score += 1;
    }
  }

  const user = req.user;

  user.chapterQuizAttempt.push({
    chapterId: id,
    answeredQuizData,
    score,
  });

  await user.save();

  return res.json({ success: true, msg: "Quiz submitted successfully", score });
};

module.exports.getSection = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { sectionId } = req.query;

  const section = await sectionModel.findById(sectionId);
  if (!section) {
    return res.json({ success: false, msg: "Section not found" });
  }

  return res.json({ success: true, section });
};

module.exports.updateCourseThumbnail = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { courseId } = req.body;
  if (!courseId) {
    return res.json({ success: false, msg: "Course Not Found" });
  }

  const courseThumbnailImage = req.file.path;

  const course = await courseModel.findByIdAndUpdate(
    courseId,
    { courseThumbnailImage },
    { new: true }
  );

  return res.json({
    success: true,
    course,
    msg: "Course Thumbnail Updated Successfully",
  });
};

module.exports.removeCourseIntroductionImage = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { courseId, imageURL } = req.body;
  if (!courseId) {
    return res.json({ success: false, msg: "Course Not Found" });
  }

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course Not Found" });
  }

  course.courseIntroductionImages = course.courseIntroductionImages.filter(
    (img) => img !== imageURL
  );

  await course.save();

  return res.json({
    success: true,
    msg: "Course Introduction Image Removed Successfully",
    course,
  });
};

module.exports.addIntroductionImage = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { courseId } = req.body;
  if (!courseId) {
    return res.json({ success: false, msg: "Course Not Found" });
  }

  const introductionImages = req.files.map((file) => file.path) || [];

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course Not Found" });
  }

  course.courseIntroductionImages.push(...introductionImages);
  await course.save();

  return res.json({
    success: true,
    msg: "Introduction Images Added Successfully",
    course,
  });
};

module.exports.removeSectionVideo = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { sectionId, videoURL } = req.body;
  if (!sectionId) {
    return res.json({ success: false, msg: "Section Not Found" });
  }

  const section = await sectionModel.findById(sectionId);
  if (!section) {
    return res.json({ success: false, msg: "Section Not Found" });
  }

  section.sectionVideoUrl = section.sectionVideoUrl.filter(
    (video) => video !== videoURL
  );

  await section.save();

  return res.json({
    success: true,
    msg: "Section Video Removed Successfully",
    section,
  });
};

module.exports.addSectionVideos = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { sectionId } = req.body;
  if (!sectionId) {
    return res.json({ success: false, msg: "Section Not Found" });
  }

  const sectionVideos = req.files.map((file) => file.path) || [];

  const section = await sectionModel.findById(sectionId);
  if (!section) {
    return res.json({ success: false, msg: "Section Not Found" });
  }

  section.sectionVideoUrl.push(...sectionVideos);
  await section.save();

  return res.json({
    success: true,
    msg: "Section Videos Added Successfully",
    section,
  });
};

module.exports.addChapterExternalLinks = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { chapterId, externalLinks } = req.body;
  if (!chapterId) {
    return res.json({ success: false, msg: "Chapter Not Found" });
  }

  const chapter = await chapterModel.findById(chapterId);
  if (!chapter) {
    return res.json({ success: false, msg: "Chapter Not Found" });
  }

  chapter.externalLinks = externalLinks;
  await chapter.save();

  return res.json({
    success: true,
    msg: "Chapter External Links Added Successfully",
    chapter,
  });
};

module.exports.removeChapterExternalLink = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { chapterId, linkIndex } = req.body;
  if (!chapterId) {
    return res.json({ success: false, msg: "Chapter Not Found" });
  }

  const chapter = await chapterModel.findById(chapterId);
  if (!chapter) {
    return res.json({ success: false, msg: "Chapter Not Found" });
  }

  if (chapter.externalLinks && chapter.externalLinks.length > linkIndex) {
    chapter.externalLinks.splice(linkIndex, 1);
    await chapter.save();
  }

  return res.json({
    success: true,
    msg: "Chapter External Link Removed Successfully",
    chapter,
  });
};

module.exports.updateChapterExternalLinks = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { chapterId, externalLinks } = req.body;
  if (!chapterId) {
    return res.json({ success: false, msg: "Chapter Not Found" });
  }

  const chapter = await chapterModel.findById(chapterId);
  if (!chapter) {
    return res.json({ success: false, msg: "Chapter Not Found" });
  }

  chapter.externalLinks = externalLinks;
  await chapter.save();

  return res.json({
    success: true,
    msg: "Chapter External Links Updated Successfully",
    chapter,
  });
};

module.exports.updateChapterThumbnail = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { chapterId } = req.body;
  if (!chapterId) {
    return res.json({ success: false, msg: "Chapter ID is required" });
  }

  const chapterThumbnailImage = req.file.path;

  const chapter = await chapterModel.findByIdAndUpdate(
    chapterId,
    { chapterThumbnailImage },
    { new: true }
  );

  return res.json({
    success: true,
    chapter,
    msg: "Chapter Thumbnail Updated Successfully",
  });
};

module.exports.removeChapterFile = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { chapterId, fileURL } = req.body;
  if (!chapterId) {
    return res.json({ success: false, msg: "Chapter ID is required" });
  }

  const chapter = await chapterModel.findById(chapterId);
  if (!chapter) {
    return res.json({ success: false, msg: "Chapter not found" });
  }

  chapter.chapterFile = chapter.chapterFile.filter((file) => file !== fileURL);

  await chapter.save();

  return res.json({
    success: true,
    msg: "Chapter File Removed Successfully",
    chapter,
  });
};

module.exports.addChapterFiles = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { chapterId } = req.body;
  if (!chapterId) {
    return res.json({ success: false, msg: "Chapter ID is required" });
  }

  const chapterFiles = req.files.map((file) => file.path) || [];

  const chapter = await chapterModel.findById(chapterId);
  if (!chapter) {
    return res.json({ success: false, msg: "Chapter not found" });
  }

  chapter.chapterFile.push(...chapterFiles);
  await chapter.save();

  return res.json({
    success: true,
    msg: "Chapter Files Added Successfully",
    chapter,
  });
};

module.exports.removeChapterVideo = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { chapterId, videoIndex } = req.body;
  if (!chapterId) {
    return res.json({ success: false, msg: "Chapter ID is required" });
  }

  const chapter = await chapterModel.findById(chapterId);
  if (!chapter) {
    return res.json({ success: false, msg: "Chapter not found" });
  }

  if (
    chapter.chapterVideoDetails &&
    chapter.chapterVideoDetails.length > videoIndex
  ) {
    chapter.chapterVideoDetails.splice(videoIndex, 1);
    await chapter.save();
  }

  return res.json({
    success: true,
    msg: "Chapter Video Removed Successfully",
    chapter,
  });
};

module.exports.addChapterVideos = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { chapterId, chapterVideoTitle } = req.body;
  if (!chapterId) {
    return res.json({ success: false, msg: "Chapter ID is required" });
  }

  const chapterVideo = req.files.chapterVideo?.map((video) => video.path) || [];
  const videoThumbnailImage =
    req.files.chapterVideoThumbnailImage?.map((img) => img.path) || [];

  const videoTitleArray = Array.isArray(chapterVideoTitle)
    ? chapterVideoTitle
    : chapterVideoTitle
    ? [chapterVideoTitle]
    : [];

  let newVideoDetails = [];
  if (chapterVideo && chapterVideo.length > 0) {
    chapterVideo.forEach((video, index) => {
      newVideoDetails.push({
        video: video,
        videoThumbnail: videoThumbnailImage[index] || null,
        title: videoTitleArray[index] || `Video ${index + 1}`,
      });
    });
  }

  const chapter = await chapterModel.findById(chapterId);
  if (!chapter) {
    return res.json({ success: false, msg: "Chapter not found" });
  }

  chapter.chapterVideoDetails.push(...newVideoDetails);
  await chapter.save();

  return res.json({
    success: true,
    msg: "Chapter Videos Added Successfully",
    chapter,
  });
};

module.exports.giveAccessToCourse = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { emailArray, courseId } = req.body;

  emailArray.forEach(async (email) => {
    await userModel.findOneAndUpdate(
      { email },
      { $addToSet: { coursePurchased: courseId } }
    );
  });

  return res.json({
    success: true,
    msg: "Access to course granted successfully",
  });
};

module.exports.giveAdminAccess = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.json({ success: false, msg: "User not found" });
  }

  user.isAdmin = true;
  await user.save();

  return res.json({
    success: true,
    msg: "Admin access granted successfully",
  });
};

module.exports.deleteSectionLink = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { sectionId, label } = req.body;

  const section = await sectionModel.findById(sectionId);

  section.externalLinks = section.externalLinks.filter((ext) => {
    return ext.label !== label;
  });

  await section.save();

  return res.json({ success: true, externalLinks: section.externalLinks });
};

module.exports.addSectionLink = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { sectionId, sectionLink } = req.body;

  const section = await sectionModel.findById(sectionId);
  section.externalLinks = [...section.externalLinks, ...sectionLink];
  await section.save();

  return res.json({ success: true, externalLinks: section.externalLinks });
};

module.exports.generateUrl = async (req, res, next) => {
  const { fileName, fileType } = req.query;
  console.log(fileName);
  console.log(fileType);
  
  
  try {
    const data = await getPresignedUrl(fileName, fileType);
    console.log(data);
    
    res.json({ success: true, data });
  } catch (error) {
    res.json({ success: false, msg: error.message });
  }
};

module.exports.saveSectionVideoUrl = async(req,res)=>{
  const error = validationResult(req);
  if(!error.isEmpty()){
    return res.json({ success: false, msg: error.array() });
  }

  const {sectionId,videoUrl}=req.body;

  console.log(sectionId,videoUrl);
  

  const section=await sectionModel.findById(sectionId);
  if(!section){
    return res.json({ success: false, msg: "Section not found" });
  }

  section.sectionVideoUrl.push(videoUrl);
  await section.save();
  return res.json({ success: true, msg: "Video URLs saved successfully" });
}

/* ============================ CREATOR REQUESTS ============================ */

// A logged-in user asks to become a course creator
module.exports.requestCreatorAccess = async (req, res) => {
  const user = req.user;

  if (user.isCreator) {
    return res.json({ success: false, msg: "You are already a creator" });
  }
  if (user.creatorRequestStatus === "pending") {
    return res.json({ success: false, msg: "Your request is already pending" });
  }

  user.creatorRequestStatus = "pending";
  await user.save();

  return res.json({
    success: true,
    msg: "Creator access requested. An admin will review your request.",
    creatorRequestStatus: user.creatorRequestStatus,
  });
};

// Admin: list users who requested creator access
module.exports.getCreatorRequests = async (req, res) => {
  const requests = await userModel
    .find({ creatorRequestStatus: "pending" })
    .select("name email creatorRequestStatus");

  return res.json({ success: true, requests });
};

// Admin: approve or reject a creator request
module.exports.handleCreatorRequest = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { userId, decision } = req.body;

  const user = await userModel.findById(userId);
  if (!user) {
    return res.json({ success: false, msg: "User not found" });
  }

  if (decision === "approve") {
    user.isCreator = true;
    user.creatorRequestStatus = "approved";
  } else if (decision === "reject") {
    user.isCreator = false;
    user.creatorRequestStatus = "rejected";
  } else {
    return res.json({ success: false, msg: "Invalid decision" });
  }

  await user.save();

  return res.json({
    success: true,
    msg: `Creator request ${decision === "approve" ? "approved" : "rejected"} successfully`,
  });
};

/* =========================== ENROLLMENT REQUESTS =========================== */

// Student requests enrollment into a "request access" course
module.exports.requestEnrollment = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { courseId } = req.body;
  const user = req.user;

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  if (course.enrollmentType !== "request") {
    return res.json({
      success: false,
      msg: "This course does not use the request access system",
    });
  }

  if (user.coursePurchased.includes(courseId)) {
    return res.json({ success: false, msg: "You are already enrolled" });
  }

  const existing = await enrollmentRequestModel.findOne({
    user: user._id,
    course: courseId,
    status: "pending",
  });
  if (existing) {
    return res.json({
      success: false,
      msg: "You already have a pending request for this course",
    });
  }

  await enrollmentRequestModel.create({ user: user._id, course: courseId });

  return res.json({
    success: true,
    msg: "Enrollment request sent. The instructor will review it soon.",
  });
};

// Owner: list pending enrollment requests for one of their courses
module.exports.getEnrollmentRequests = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { courseId } = req.query;

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  if (!course.creator || !course.creator.equals(req.user._id)) {
    return res.json({
      success: false,
      msg: "Only the course owner can view enrollment requests",
    });
  }

  const requests = await enrollmentRequestModel
    .find({ course: courseId, status: "pending" })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return res.json({ success: true, requests });
};

// Owner: approve or reject an enrollment request
module.exports.handleEnrollmentRequest = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { requestId, decision } = req.body;

  const request = await enrollmentRequestModel.findById(requestId);
  if (!request) {
    return res.json({ success: false, msg: "Request not found" });
  }

  const course = await courseModel.findById(request.course);
  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  if (!course.creator || !course.creator.equals(req.user._id)) {
    return res.json({
      success: false,
      msg: "Only the course owner can handle enrollment requests",
    });
  }

  if (request.status !== "pending") {
    return res.json({ success: false, msg: "This request is already handled" });
  }

  if (decision === "approve") {
    request.status = "approved";
    await request.save();
    await userModel.findByIdAndUpdate(request.user, {
      $addToSet: { coursePurchased: course._id },
    });
  } else if (decision === "reject") {
    request.status = "rejected";
    await request.save();
  } else {
    return res.json({ success: false, msg: "Invalid decision" });
  }

  return res.json({
    success: true,
    msg: `Enrollment request ${decision === "approve" ? "approved" : "rejected"} successfully`,
  });
};

/* ================================ TEST SCORES ============================== */

// Turn a stored attempt's answeredQuizData into a review-friendly shape:
// each question with its options, the correct option and the chosen one.
function buildReview(answeredQuizData) {
  return (answeredQuizData || []).map((q) => ({
    question: q.question,
    options: { 1: q["1"], 2: q["2"], 3: q["3"], 4: q["4"] },
    correct: q.correct,
    chosen: q.chosenAnswer ?? null,
    isCorrect: q.chosenAnswer === q.correct,
  }));
}

// Student: their own quiz attempts, enriched with titles + course names
module.exports.getMyScores = async (req, res) => {
  const user = req.user;

  const sectionAttempts = user.sectionQuizAttempt || [];
  const chapterAttempts = user.chapterQuizAttempt || [];

  const sectionIds = sectionAttempts.map((a) => a.sectionId).filter(Boolean);
  const chapterIds = chapterAttempts.map((a) => a.chapterId).filter(Boolean);

  const sections = await sectionModel
    .find({ _id: { $in: sectionIds } })
    .select("sectionTitle");
  const chapters = await chapterModel
    .find({ _id: { $in: chapterIds } })
    .select("chapterName");
  const courses = await courseModel
    .find({ sections: { $in: sectionIds } })
    .select("courseName sections");

  const sectionTitle = {};
  sections.forEach((s) => (sectionTitle[s._id.toString()] = s.sectionTitle));
  const chapterName = {};
  chapters.forEach((c) => (chapterName[c._id.toString()] = c.chapterName));
  const courseOfSection = {};
  courses.forEach((c) =>
    (c.sections || []).forEach(
      (sid) => (courseOfSection[sid.toString()] = c.courseName)
    )
  );

  const sectionScores = sectionAttempts.map((a) => ({
    type: "Section",
    title: sectionTitle[String(a.sectionId)] || "Section quiz",
    courseName: courseOfSection[String(a.sectionId)] || "",
    score: a.score,
    total: Array.isArray(a.answeredQuizData) ? a.answeredQuizData.length : null,
    review: buildReview(a.answeredQuizData),
  }));

  const chapterScores = chapterAttempts.map((a) => ({
    type: "Chapter",
    title: chapterName[String(a.chapterId)] || "Chapter quiz",
    courseName: "",
    score: a.score,
    total: Array.isArray(a.answeredQuizData) ? a.answeredQuizData.length : null,
    review: buildReview(a.answeredQuizData),
  }));

  return res.json({
    success: true,
    scores: [...sectionScores, ...chapterScores],
  });
};

// Owner/Admin: quiz scores of all students for a given course
module.exports.getCourseStudentScores = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { courseId } = req.query;

  const course = await courseModel.findById(courseId).populate({
    path: "sections",
    select: "sectionTitle chapters",
    populate: { path: "chapters", select: "chapterName" },
  });
  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  const isOwner = course.creator && course.creator.equals(req.user._id);
  if (!req.user.isAdmin && !isOwner) {
    return res.json({
      success: false,
      msg: "You are not authorized to view these scores",
    });
  }

  const sectionTitle = {};
  const chapterName = {};
  const sectionIds = [];
  const chapterIds = [];
  (course.sections || []).forEach((s) => {
    sectionIds.push(s._id.toString());
    sectionTitle[s._id.toString()] = s.sectionTitle;
    (s.chapters || []).forEach((c) => {
      chapterIds.push(c._id.toString());
      chapterName[c._id.toString()] = c.chapterName;
    });
  });

  // Students who attempted any quiz belonging to this course
  const students = await userModel
    .find({
      $or: [
        { "sectionQuizAttempt.sectionId": { $in: sectionIds } },
        { "chapterQuizAttempt.chapterId": { $in: chapterIds } },
      ],
    })
    .select("name email sectionQuizAttempt chapterQuizAttempt");

  const report = students.map((student) => {
    const attempts = [];
    (student.sectionQuizAttempt || []).forEach((a) => {
      if (sectionIds.includes(String(a.sectionId))) {
        attempts.push({
          type: "Section",
          title: sectionTitle[String(a.sectionId)] || "Section quiz",
          score: a.score,
          total: Array.isArray(a.answeredQuizData)
            ? a.answeredQuizData.length
            : null,
          review: buildReview(a.answeredQuizData),
        });
      }
    });
    (student.chapterQuizAttempt || []).forEach((a) => {
      if (chapterIds.includes(String(a.chapterId))) {
        attempts.push({
          type: "Chapter",
          title: chapterName[String(a.chapterId)] || "Chapter quiz",
          score: a.score,
          total: Array.isArray(a.answeredQuizData)
            ? a.answeredQuizData.length
            : null,
          review: buildReview(a.answeredQuizData),
        });
      }
    });
    return {
      name: student.name,
      email: student.email,
      attempts,
    };
  });

  return res.json({ success: true, report });
};