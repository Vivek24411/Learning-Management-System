const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type :String,
        required:true
    },
    shortDescription:{
        type:String
    },
    longDescription:{
        type:String
    },
    courseIntroduction:{
        type:String
    },
    courseThumbnailImage:{
        type:String
    },
    courseIntroductionImages:{
        type:[String]
    },
    price:{
        type:Number,
    },
    publishedDate:{
        type:Date,
        default: Date.now
    },
    sections:{
        type:[{type:mongoose.Schema.Types.ObjectId, ref: "Section"}],
        default:[]
    } 
})

const courseModel = mongoose.model("Course",courseSchema);

module.exports = courseModel;