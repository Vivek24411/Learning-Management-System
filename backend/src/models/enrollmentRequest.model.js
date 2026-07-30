const mongoose = require("mongoose");

const enrollmentRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "revoked"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const enrollmentRequestModel = mongoose.model("EnrollmentRequest", enrollmentRequestSchema);

module.exports = enrollmentRequestModel;
