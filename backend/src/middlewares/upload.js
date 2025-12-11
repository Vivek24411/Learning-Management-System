const multer = require('multer');
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        if(file.fieldname === "courseThumbnailImage"){
            console.log("Uploading course thumbnail");
            return {
                folder: "Edvance/CourseThumbnailImage",
                resource_type: "image",
                allowed_formats: ["jpg", "png", "jpeg"]
            }
        } else if(file.fieldname === "courseIntroductionImages"){
            console.log("Uploading course introduction images");
            return {
                folder: "Edvance/CourseIntroductionImages",
                resource_type: "image",
                allowed_formats: ["jpg", "png", "jpeg"]
            }
        } else if(file.fieldname === "chapterThumbnailImage"){
            console.log("Uploading chapter thumbnail");
            return {
                folder: "Edvance/ChapterThumbnailImage",
                resource_type: "image",
                allowed_formats: ["jpg", "png", "jpeg"]
            }
        } else if(file.fieldname === "chapterFile"){
            return {
                folder: "Edvance/ChapterFile",
                resource_type: "raw",
                allowed_formats: ["pdf", "doc", "docx", "ppt", "pptx"]
            }
        } else if(file.fieldname === "chapterVideo"){
            return {
                folder: "Edvance/ChapterVideo",
                resource_type: "video",
                allowed_formats: ["mp4", "mov", "avi", "mkv"]
            }
        } else if(file.fieldname === "chapterVideoThumbnailImage"){
            return {
                folder: "Edvance/ChapterVideoThumbnailImage",
                resource_type: "image",
                allowed_formats: ["jpg", "png", "jpeg"]
            }
        } else {
            return {
                folder: "Edvance/Other",
                resource_type: "auto"
            }
        }
    }
});

const upload = multer({storage:storage});

module.exports = upload;
