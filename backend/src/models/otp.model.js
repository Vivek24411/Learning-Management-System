const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        reqired:true
    },
    OTP:{
        type:String,
        required:true
    },
    createdAt:{
        type: Date,
        default: Date.now,
        expires: 300       // you can expires onyl with type Date object
    }
})

const otpModel = mongoose.model("OTP", otpSchema);

module.exports = otpModel;