const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
    },
    signature: {
        type: String,
    },
    status: {
        type: String,
        enum: ["created", "paid", "failed"],
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;