const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/temp");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const videoUpload = multer({
    storage: storage,
    limits: {fileSize: 500*1024*1024},
    fileFilter: (req,file,cb)=>{
        if(file.mimetype.startsWith("video/")){
            cb(null, true);
        }else{
            cb(new Error("Only Videos Are Allowed Here"));
        }
    }
})

module.exports = videoUpload;
