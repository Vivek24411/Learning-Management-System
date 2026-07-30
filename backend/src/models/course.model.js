const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type :String,
        required:true
    },
    shortDescription:{
        type:String,
        default:""
    },
    longDescription:{
        type:String,
        default:""
    },
    courseIntroduction:{
        type:String,
        default:""
    },
    courseThumbnailImage:{
        type:String,
        default:""
    },
    courseIntroductionImages:{
        type:[String],
        default:[]
    },
    // Kept as a parallel array so existing courses that store image URLs as
    // strings continue to work without a migration.
    courseIntroductionImageCaptions:{
        type:[String],
        default:[]
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
