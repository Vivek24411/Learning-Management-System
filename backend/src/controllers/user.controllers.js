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
const quizRetakeRequestModel = require("../models/quizRetakeRequest.model");
const crypto = require("crypto");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getPresignedUrl } = require("../config/s3Service");

function checkValidation(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }
}

const quizConfig = {
  section: {
    model: sectionModel,
    quizField: "sectionQuiz",
    titleField: "sectionQuizTitle",
    nameField: "sectionTitle",
    attemptField: "sectionQuizAttempt",
    attemptIdField: "sectionId",
  },
  chapter: {
    model: chapterModel,
    quizField: "chapterQuiz",
    titleField: "chapterQuizTitle",
    nameField: "chapterName",
    attemptField: "chapterQuizAttempt",
    attemptIdField: "chapterId",
  },
};

function normalizeQuizType(type) {
  const normalized = String(type || "").toLowerCase();
  return quizConfig[normalized] ? normalized : null;
}

async function resolveQuizContext(type, id) {
  const normalizedType = normalizeQuizType(type);
  const config = quizConfig[normalizedType];
  if (!config) return null;

  const target = await config.model.findById(id);
  if (!target) return null;

  let course;
  if (normalizedType === "section") {
    course = await courseModel.findOne({ sections: target._id });
  } else {
    const section = await sectionModel
      .findOne({ chapters: target._id })
      .select("_id");
    course = section
      ? await courseModel.findOne({ sections: section._id })
      : null;
  }

  return { type: normalizedType, config, target, course };
}

function userCanManageCourse(user, course) {
  return Boolean(
    user &&
      course &&
      (user.isAdmin ||
        (course.creator && course.creator.equals(user._id)))
  );
}

function userHasCourseAccess(user, course) {
  return Boolean(
    userCanManageCourse(user, course) ||
      user?.coursePurchased?.some(
        (courseId) => String(courseId) === String(course?._id)
      )
  );
}

function getQuizAttempts(user, context) {
  return (user?.[context.config.attemptField] || []).filter(
    (attempt) =>
      String(attempt?.[context.config.attemptIdField]) ===
      String(context.target._id)
  );
}

function sanitizeQuizForLearner(quiz) {
  return (quiz || []).map((question) => ({
    question: question.question,
    1: question["1"],
    2: question["2"],
    3: question["3"],
    4: question["4"],
  }));
}

function validateAndSanitizeQuiz(quizData) {
  if (!Array.isArray(quizData) || quizData.length === 0) return null;

  const sanitized = quizData.map((question) => ({
    question: String(question?.question || "").trim(),
    1: String(question?.["1"] || "").trim(),
    2: String(question?.["2"] || "").trim(),
    3: String(question?.["3"] || "").trim(),
    4: String(question?.["4"] || "").trim(),
    correct: Number(question?.correct),
  }));

  const invalid = sanitized.some(
    (question) =>
      !question.question ||
      !question["1"] ||
      !question["2"] ||
      !question["3"] ||
      !question["4"] ||
      ![1, 2, 3, 4].includes(question.correct)
  );

  return invalid ? null : sanitized;
}

function latestAttemptPayload(attempt) {
  if (!attempt) return null;
  const answers = Array.isArray(attempt.answeredQuizData)
    ? attempt.answeredQuizData
    : [];
  return {
    score: attempt.score,
    total: answers.length,
    review: buildReview(answers),
    attemptedAt: attempt.attemptedAt || null,
    title: attempt.quizTitle || "",
  };
}

async function getQuizAttemptState(user, context) {
  const attempts = getQuizAttempts(user, context);
  const requests = await quizRetakeRequestModel
    .find({
      user: user._id,
      quizType: context.type,
      quizId: context.target._id,
    })
    .sort({ createdAt: -1 });
  const availableApproval = requests.find(
    (request) => request.status === "approved" && !request.usedAt
  );
  const latestRequest = requests[0];

  return {
    attemptCount: attempts.length,
    canAttempt: attempts.length === 0 || Boolean(availableApproval),
    retakeRequestStatus: availableApproval
      ? "approved"
      : latestRequest?.status || "none",
    latestAttempt: latestAttemptPayload(attempts[attempts.length - 1]),
  };
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

  const sectionQuizStates = {};
  if (req.user) {
    await Promise.all(
      (course.sections || [])
        .filter((section) => section.sectionQuiz?.length > 0)
        .map(async (section) => {
          sectionQuizStates[String(section._id)] = await getQuizAttemptState(
            req.user,
            {
              type: "section",
              config: quizConfig.section,
              target: section,
              course,
            }
          );
        })
    );
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

  const coursePayload = course.toObject();
  const canManageCourse = userCanManageCourse(req.user, course);
  const hasCourseAccess = userHasCourseAccess(req.user, course);
  if (!canManageCourse) {
    coursePayload.sections = (coursePayload.sections || []).map((section) => {
      const learnerSection = {
        ...section,
        sectionQuiz: sanitizeQuizForLearner(section.sectionQuiz),
      };
      if (!hasCourseAccess) {
        learnerSection.sectionVideoUrl = [];
        learnerSection.externalLinks = [];
        // Preserve only the question count for the public course outline.
        learnerSection.sectionQuiz = (section.sectionQuiz || []).map(() => ({}));
      }
      return learnerSection;
    });
  }

  return res.json({
    success: true,
    course: coursePayload,
    enrollmentRequestStatus,
    sectionQuizStates,
  });
};

module.exports.getChapter = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, msg: errors.array() });
  }

  const { chapterId } = req.query;

  const chapter = await chapterModel.findById(chapterId);

  if (!chapter) {
    return res.json({ success: false, msg: "Chapter not found" });
  }

  const sectionId = await sectionModel
    .findOne({ chapters: chapterId })
    .select("_id");

  if (!sectionId) {
    return res.json({ success: false, msg: "Chapter is not assigned to a section" });
  }

  const course = await courseModel.findOne({ sections: sectionId._id });
  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  const canManage = userCanManageCourse(req.user, course);
  if (!userHasCourseAccess(req.user, course)) {
    return res.json({
      success: false,
      msg: "You do not have access to this chapter",
      courseId: course._id,
    });
  }
  const quizState = chapter.chapterQuiz?.length
    ? await getQuizAttemptState(req.user, {
        type: "chapter",
        config: quizConfig.chapter,
        target: chapter,
        course,
      })
    : {
        attemptCount: 0,
        canAttempt: true,
        retakeRequestStatus: "none",
        latestAttempt: null,
      };

  const chapterPayload = chapter.toObject();
  if (!canManage) {
    chapterPayload.chapterQuiz = sanitizeQuizForLearner(
      chapterPayload.chapterQuiz
    );
  }

  return res.json({
    success: true,
    chapter: chapterPayload,
    courseId: course._id,
    canManage,
    quizState,
  });
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

    const courseThumbnailImage =
      req.files?.courseThumbnailImage?.[0]?.path || "";
    const courseIntroductionImages = req.files?.courseIntroductionImages
      ? req.files.courseIntroductionImages.map((file) => file.path)
      : [];
    let courseIntroductionImageCaptions = [];
    if (req.body.courseIntroductionImageCaptions) {
      try {
        const parsedCaptions = JSON.parse(
          req.body.courseIntroductionImageCaptions
        );
        if (Array.isArray(parsedCaptions)) {
          courseIntroductionImageCaptions = courseIntroductionImages.map(
            (_, index) => String(parsedCaptions[index] || "").trim().slice(0, 240)
          );
        }
      } catch (error) {
        console.warn("Ignoring invalid gallery captions:", error.message);
      }
    }

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
      shortDescription: shortDescription || "",
      longDescription: longDescription || "",
      courseIntroduction: courseIntroduction || "",
      courseThumbnailImage,
      price: parseFloat(price) || 0,
      enrollmentType: type,
      googleFormLink: type === "request" ? googleFormLink || "" : "",
      creator: req.user._id,
      creatorName: req.user.name,
      courseIntroductionImages,
      courseIntroductionImageCaptions,
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
      chapterVideoThumbnailIndex,
      externalLinks,
    } = req.body;
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    // Handle file uploads
    const chapterFile = req.files?.chapterFile?.map((file) => file.path) || [];
    const chapterThumbnailImage = req.files?.chapterThumbnailImage?.[0]?.path || "";

    // Handle video files
    const chapterVideo =
      req.files?.chapterVideo?.map((video) => video.path) || [];
    const videoThumbnailImage =
      req.files?.chapterVideoThumbnailImage?.map((img) => img.path) || [];
    const videoThumbnailIndexes = Array.isArray(chapterVideoThumbnailIndex)
      ? chapterVideoThumbnailIndex
      : chapterVideoThumbnailIndex !== undefined
      ? [chapterVideoThumbnailIndex]
      : [];
    const videoThumbnailsByIndex = {};
    videoThumbnailImage.forEach((thumbnail, fileIndex) => {
      const videoIndex = Number(
        videoThumbnailIndexes[fileIndex] ?? fileIndex
      );
      if (Number.isInteger(videoIndex) && videoIndex >= 0) {
        videoThumbnailsByIndex[videoIndex] = thumbnail;
      }
    });

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
          videoThumbnail: videoThumbnailsByIndex[i] || null,
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
        parsedExternalLinks = JSON.parse(externalLinks).filter(
          (link) => link && (link.label?.trim() || link.url?.trim())
        );
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, msg: errors.array() });
  }

  const {
    courseId,
    courseName,
    shortDescription,
    longDescription,
    courseIntroduction,
    price,
    enrollmentType,
    googleFormLink,
    courseIntroductionImageCaptions,
  } = req.body;

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course not found" });
  }

  course.courseName = courseName;
  course.shortDescription = shortDescription || "";
  course.longDescription = longDescription || "";
  course.courseIntroduction = courseIntroduction || "";
  if (Array.isArray(courseIntroductionImageCaptions)) {
    course.courseIntroductionImageCaptions =
      course.courseIntroductionImages.map((_, index) =>
        String(courseIntroductionImageCaptions[index] || "")
          .trim()
          .slice(0, 240)
      );
  }

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, msg: errors.array() });
  }

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

  const { id, quizData, title } = req.body;
  const sanitizedQuiz = validateAndSanitizeQuiz(quizData);
  const quizTitle = String(title || "").trim().slice(0, 120);
  if (!sanitizedQuiz || !quizTitle) {
    return res.json({
      success: false,
      msg: "A quiz title and complete questions are required",
    });
  }

  const section = await sectionModel.findById(id);
  if (!section) {
    return res.json({ success: false, msg: "section does not exist" });
  }

  section.sectionQuiz = sanitizedQuiz;
  section.sectionQuizTitle = quizTitle;
  await section.save();

  return res.json({
    success: true,
    msg: "Quiz published successfully",
    quiz: section.sectionQuiz,
    title: section.sectionQuizTitle,
    courseId: req.course?._id,
  });
};

module.exports.getSectionQuiz = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  return getQuiz(req, res, "section");
};

module.exports.addChapterQuiz = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  const { id, quizData, title } = req.body;
  const sanitizedQuiz = validateAndSanitizeQuiz(quizData);
  const quizTitle = String(title || "").trim().slice(0, 120);
  if (!sanitizedQuiz || !quizTitle) {
    return res.json({
      success: false,
      msg: "A quiz title and complete questions are required",
    });
  }

  const chapter = await chapterModel.findById(id);
  if (!chapter) {
    return res.json({ success: false, msg: "chapter does not exist" });
  }

  chapter.chapterQuiz = sanitizedQuiz;
  chapter.chapterQuizTitle = quizTitle;
  await chapter.save();

  return res.json({
    success: true,
    msg: "Quiz published successfully",
    quiz: chapter.chapterQuiz,
    title: chapter.chapterQuizTitle,
    courseId: req.course?._id,
  });
};

module.exports.getChapterQuiz = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  return getQuiz(req, res, "chapter");
};

module.exports.submitSectionQuiz = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  return submitQuizAttempt(req, res, "section");
};

module.exports.submitChapterQuiz = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ success: false, msg: error.array() });
  }

  return submitQuizAttempt(req, res, "chapter");
};

async function getQuiz(req, res, type) {
  const { id } = req.query;
  const context = await resolveQuizContext(type, id);
  if (!context?.course) {
    return res.json({ success: false, msg: "Quiz not found" });
  }
  if (!userHasCourseAccess(req.user, context.course)) {
    return res.json({ success: false, msg: "You do not have access to this quiz" });
  }

  const isManager = userCanManageCourse(req.user, context.course);
  const quiz = context.target[context.config.quizField] || [];
  const attemptState = isManager
    ? {
        attemptCount: 0,
        canAttempt: false,
        retakeRequestStatus: "none",
        latestAttempt: null,
      }
    : await getQuizAttemptState(req.user, context);

  return res.json({
    success: true,
    quiz: isManager ? quiz : sanitizeQuizForLearner(quiz),
    title:
      context.target[context.config.titleField] ||
      `${context.target[context.config.nameField]} quiz`,
    targetName: context.target[context.config.nameField],
    courseId: context.course._id,
    isManager,
    ...attemptState,
  });
}

async function submitQuizAttempt(req, res, type) {
  const { id, answeredQuizData } = req.body;
  const context = await resolveQuizContext(type, id);
  if (!context?.course) {
    return res.json({ success: false, msg: "Quiz not found" });
  }
  if (!userHasCourseAccess(req.user, context.course)) {
    return res.json({ success: false, msg: "You do not have access to this quiz" });
  }

  const quiz = context.target[context.config.quizField] || [];
  if (!quiz.length) {
    return res.json({ success: false, msg: "This quiz is no longer available" });
  }
  if (
    !Array.isArray(answeredQuizData) ||
    answeredQuizData.length !== quiz.length
  ) {
    return res.json({
      success: false,
      msg: "Please submit one answer entry for every question",
    });
  }

  const user = req.user;
  const previousAttempts = getQuizAttempts(user, context);
  let consumedApproval = null;
  if (previousAttempts.length > 0) {
    consumedApproval = await quizRetakeRequestModel.findOneAndUpdate(
      {
        user: user._id,
        quizType: context.type,
        quizId: context.target._id,
        status: "approved",
        usedAt: null,
      },
      { $set: { usedAt: new Date() } },
      { sort: { createdAt: -1 }, new: true }
    );
    if (!consumedApproval) {
      const state = await getQuizAttemptState(user, context);
      return res.json({
        success: false,
        code: "retake_required",
        msg: "A course creator must approve your retake before you can submit again",
        ...state,
      });
    }
  }

  const answerSnapshot = quiz.map((question, index) => ({
    question: question.question,
    1: question["1"],
    2: question["2"],
    3: question["3"],
    4: question["4"],
    correct: Number(question.correct),
    chosenAnswer: [1, 2, 3, 4].includes(
      Number(answeredQuizData[index]?.chosenAnswer)
    )
      ? Number(answeredQuizData[index].chosenAnswer)
      : null,
  }));
  const score = answerSnapshot.reduce(
    (total, answer) =>
      total + (answer.chosenAnswer === answer.correct ? 1 : 0),
    0
  );
  const quizTitle =
    context.target[context.config.titleField] ||
    `${context.target[context.config.nameField]} quiz`;

  user[context.config.attemptField].push({
    [context.config.attemptIdField]: context.target._id,
    quizTitle,
    answeredQuizData: answerSnapshot,
    score,
    attemptedAt: new Date(),
  });

  try {
    await user.save();
  } catch (error) {
    if (consumedApproval) {
      await quizRetakeRequestModel.findByIdAndUpdate(consumedApproval._id, {
        $set: { usedAt: null },
      });
    }
    throw error;
  }

  return res.json({
    success: true,
    msg: "Quiz submitted successfully",
    score,
    total: answerSnapshot.length,
    title: quizTitle,
    review: buildReview(answerSnapshot),
    attemptCount: previousAttempts.length + 1,
    canAttempt: false,
    retakeRequestStatus: "none",
  });
}

module.exports.deleteSectionQuiz = async (req, res) =>
  deleteQuiz(req, res, "section");

module.exports.deleteChapterQuiz = async (req, res) =>
  deleteQuiz(req, res, "chapter");

async function deleteQuiz(req, res, type) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, msg: errors.array() });
  }

  const { id } = req.body;
  const context = await resolveQuizContext(type, id);
  if (!context) {
    return res.json({ success: false, msg: "Quiz not found" });
  }

  context.target[context.config.quizField] = [];
  context.target[context.config.titleField] = "";
  await context.target.save();
  await quizRetakeRequestModel.updateMany(
    {
      quizType: context.type,
      quizId: context.target._id,
      status: { $in: ["pending", "approved"] },
      usedAt: null,
    },
    {
      $set: {
        status: "rejected",
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
      },
    }
  );

  return res.json({ success: true, msg: "Quiz deleted successfully" });
}

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

  const { courseId, imageURL, imageIndex } = req.body;
  if (!courseId) {
    return res.json({ success: false, msg: "Course Not Found" });
  }

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course Not Found" });
  }

  const requestedIndex =
    imageIndex !== undefined
      ? Number(imageIndex)
      : course.courseIntroductionImages.findIndex((img) => img === imageURL);

  if (
    !Number.isInteger(requestedIndex) ||
    requestedIndex < 0 ||
    requestedIndex >= course.courseIntroductionImages.length
  ) {
    return res.json({ success: false, msg: "Gallery image not found" });
  }

  course.courseIntroductionImages.splice(requestedIndex, 1);
  if (course.courseIntroductionImageCaptions?.length > requestedIndex) {
    course.courseIntroductionImageCaptions.splice(requestedIndex, 1);
  }

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
  let captions = [];
  if (req.body.courseIntroductionImageCaptions) {
    try {
      const parsedCaptions = JSON.parse(
        req.body.courseIntroductionImageCaptions
      );
      if (Array.isArray(parsedCaptions)) {
        captions = introductionImages.map((_, index) =>
          String(parsedCaptions[index] || "").trim().slice(0, 240)
        );
      }
    } catch (error) {
      console.warn("Ignoring invalid gallery captions:", error.message);
    }
  }

  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course Not Found" });
  }

  course.courseIntroductionImages.push(...introductionImages);
  course.courseIntroductionImageCaptions.push(
    ...introductionImages.map((_, index) => captions[index] || "")
  );
  await course.save();

  return res.json({
    success: true,
    msg: "Introduction Images Added Successfully",
    course,
  });
};

module.exports.updateIntroductionImageCaption = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, msg: errors.array() });
  }

  const { courseId, imageIndex, caption = "" } = req.body;
  const course = await courseModel.findById(courseId);
  if (!course) {
    return res.json({ success: false, msg: "Course Not Found" });
  }

  const index = Number(imageIndex);
  if (index >= course.courseIntroductionImages.length) {
    return res.json({ success: false, msg: "Gallery image not found" });
  }

  while (course.courseIntroductionImageCaptions.length < course.courseIntroductionImages.length) {
    course.courseIntroductionImageCaptions.push("");
  }
  course.courseIntroductionImageCaptions[index] = String(caption)
    .trim()
    .slice(0, 240);
  course.markModified("courseIntroductionImageCaptions");
  await course.save();

  return res.json({
    success: true,
    msg: "Image caption updated",
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

  const normalizedEmails = emailArray.map((email) =>
    String(email).trim().toLowerCase()
  );
  const users = await userModel
    .find({ email: { $in: normalizedEmails } })
    .collation({ locale: "en", strength: 2 })
    .select("_id name email");
  await userModel.updateMany(
    { _id: { $in: users.map((user) => user._id) } },
    { $addToSet: { coursePurchased: courseId } }
  );
  const foundEmails = new Set(users.map((user) => user.email.toLowerCase()));
  const notFound = normalizedEmails.filter((email) => !foundEmails.has(email));

  return res.json({
    success: true,
    msg: "Access to course granted successfully",
    granted: users.length,
    notFound,
    learners: users,
  });
};

module.exports.getCourseLearners = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, msg: errors.array() });
  }

  const { courseId } = req.query;
  const learners = await userModel
    .find({ coursePurchased: courseId })
    .select("name email")
    .sort({ name: 1, email: 1 });

  return res.json({ success: true, learners });
};

module.exports.removeCourseAccess = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, msg: errors.array() });
  }

  const { courseId, userId } = req.body;
  const learner = await userModel
    .findByIdAndUpdate(
      userId,
      { $pull: { coursePurchased: courseId } },
      { new: true }
    )
    .select("name email coursePurchased");
  if (!learner) {
    return res.json({ success: false, msg: "Learner not found" });
  }

  await enrollmentRequestModel.updateMany(
    { user: userId, course: courseId, status: "approved" },
    { $set: { status: "revoked" } }
  );
  await quizRetakeRequestModel.updateMany(
    {
      user: userId,
      course: courseId,
      status: { $in: ["pending", "approved"] },
      usedAt: null,
    },
    {
      $set: {
        status: "rejected",
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
      },
    }
  );

  return res.json({
    success: true,
    msg: `Course access removed for ${learner.name}`,
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

/* ============================= QUIZ RETAKES ================================ */

module.exports.requestQuizRetake = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, msg: errors.array() });
  }

  const { quizType, quizId } = req.body;
  const context = await resolveQuizContext(quizType, quizId);
  if (!context?.course) {
    return res.json({ success: false, msg: "Quiz not found" });
  }
  if (!userHasCourseAccess(req.user, context.course)) {
    return res.json({ success: false, msg: "You do not have access to this quiz" });
  }
  if (getQuizAttempts(req.user, context).length === 0) {
    return res.json({
      success: false,
      msg: "Complete your first attempt before requesting a retake",
    });
  }

  const existing = await quizRetakeRequestModel.findOne({
    user: req.user._id,
    quizType: context.type,
    quizId: context.target._id,
    $or: [
      { status: "pending" },
      { status: "approved", usedAt: null },
    ],
  });
  if (existing) {
    return res.json({
      success: false,
      msg:
        existing.status === "pending"
          ? "Your retake request is already awaiting review"
          : "Your retake has already been approved",
      status: existing.status,
    });
  }

  const request = await quizRetakeRequestModel.create({
    user: req.user._id,
    course: context.course._id,
    quizType: context.type,
    quizId: context.target._id,
  });

  return res.json({
    success: true,
    msg: "Retake request sent to the course creator",
    status: request.status,
  });
};

module.exports.getQuizRetakeRequests = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, msg: errors.array() });
  }

  const { courseId } = req.query;
  const requests = await quizRetakeRequestModel
    .find({ course: courseId, status: "pending" })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  const sectionIds = requests
    .filter((request) => request.quizType === "section")
    .map((request) => request.quizId);
  const chapterIds = requests
    .filter((request) => request.quizType === "chapter")
    .map((request) => request.quizId);
  const [sections, chapters] = await Promise.all([
    sectionModel
      .find({ _id: { $in: sectionIds } })
      .select("sectionTitle sectionQuizTitle"),
    chapterModel
      .find({ _id: { $in: chapterIds } })
      .select("chapterName chapterQuizTitle"),
  ]);
  const titles = new Map();
  sections.forEach((section) =>
    titles.set(
      String(section._id),
      section.sectionQuizTitle || `${section.sectionTitle} quiz`
    )
  );
  chapters.forEach((chapter) =>
    titles.set(
      String(chapter._id),
      chapter.chapterQuizTitle || `${chapter.chapterName} quiz`
    )
  );

  return res.json({
    success: true,
    requests: requests.map((request) => ({
      ...request.toObject(),
      quizTitle: titles.get(String(request.quizId)) || "Deleted quiz",
    })),
  });
};

module.exports.handleQuizRetakeRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, msg: errors.array() });
  }

  const { requestId, decision } = req.body;
  const request = await quizRetakeRequestModel.findById(requestId);
  if (!request) {
    return res.json({ success: false, msg: "Retake request not found" });
  }
  const course = await courseModel.findById(request.course);
  if (!userCanManageCourse(req.user, course)) {
    return res.json({
      success: false,
      msg: "You are not authorized to handle this retake request",
    });
  }
  if (request.status !== "pending") {
    return res.json({ success: false, msg: "This request is already handled" });
  }

  request.status = decision === "approve" ? "approved" : "rejected";
  request.reviewedAt = new Date();
  request.reviewedBy = req.user._id;
  await request.save();

  return res.json({
    success: true,
    msg: `Retake request ${request.status}`,
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
    .select("sectionTitle sectionQuizTitle");
  const chapters = await chapterModel
    .find({ _id: { $in: chapterIds } })
    .select("chapterName chapterQuizTitle");
  const courses = await courseModel
    .find({ sections: { $in: sectionIds } })
    .select("courseName sections");

  const sectionTitle = {};
  sections.forEach(
    (s) =>
      (sectionTitle[s._id.toString()] =
        s.sectionQuizTitle || `${s.sectionTitle} quiz`)
  );
  const chapterName = {};
  chapters.forEach(
    (c) =>
      (chapterName[c._id.toString()] =
        c.chapterQuizTitle || `${c.chapterName} quiz`)
  );
  const courseOfSection = {};
  courses.forEach((c) =>
    (c.sections || []).forEach(
      (sid) => (courseOfSection[sid.toString()] = c.courseName)
    )
  );

  const sectionScores = sectionAttempts.map((a) => ({
    type: "Section",
    title: a.quizTitle || sectionTitle[String(a.sectionId)] || "Section quiz",
    courseName: courseOfSection[String(a.sectionId)] || "",
    score: a.score,
    total: Array.isArray(a.answeredQuizData) ? a.answeredQuizData.length : null,
    review: buildReview(a.answeredQuizData),
  }));

  const chapterScores = chapterAttempts.map((a) => ({
    type: "Chapter",
    title: a.quizTitle || chapterName[String(a.chapterId)] || "Chapter quiz",
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
    select: "sectionTitle sectionQuizTitle chapters",
    populate: {
      path: "chapters",
      select: "chapterName chapterQuizTitle",
    },
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
    sectionTitle[s._id.toString()] =
      s.sectionQuizTitle || `${s.sectionTitle} quiz`;
    (s.chapters || []).forEach((c) => {
      chapterIds.push(c._id.toString());
      chapterName[c._id.toString()] =
        c.chapterQuizTitle || `${c.chapterName} quiz`;
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
          title:
            a.quizTitle || sectionTitle[String(a.sectionId)] || "Section quiz",
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
          title:
            a.quizTitle || chapterName[String(a.chapterId)] || "Chapter quiz",
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
