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
        default: 0
    },
    enrollmentType:{
        type:String,
        enum:["paid","request"],
        default:"paid"
    },
    // For "request" courses the fee (if any) is collected outside the app,
    // e.g. via a Google Form the learner fills in before being approved.
    googleFormLink:{
        type:String,
        default:""
    },
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    creatorName:{
        type:String
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