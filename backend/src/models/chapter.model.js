const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
    chapterName:{
        type:String,
        required:true
    },
    shortDescription:{
        type:String
    },
    chapterThumbnailImage:{
        type:String
    },
    chapterFile:{
        type:[String]
    },
    chapterSummary:{
        type:String
    },
    chapterVideoDetails:{
        type:[Object]
    },
    chapterQuiz:{
        type: [Object],
    }
})

const chapterModel = mongoose.model("Chapter",chapterSchema);

module.exports = chapterModel;