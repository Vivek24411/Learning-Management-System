const jwt =  require("jsonwebtoken");
const userModel = require("../models/user.model");
const courseModel = require("../models/course.model");
const sectionModel = require("../models/section.model");

module.exports.userAuth = async(req,res,next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        if(!token){
            return res.json({success:false, msg:"Unauthorized Access"});
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await userModel.findById(decoded.id);
        if(!user){
            return res.json({success:false, msg:"Unauthorized Access"});
        }
        req.user = user;
        next();
    }catch(error){
        return res.json({success:false, msg:"Unauthorized Access"});
    }
}

module.exports.adminAuth = async(req,res,next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        if(!token){
            return res.json({success:false, msg:"Unauthorized Access"});
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await userModel.findById(decoded.id);
        if(!user || !user.isAdmin){
            return res.json({success:false, msg:"Unauthorized Access"});
        }
        req.user = user;
        next();
    }catch(error){
        return res.json({success:false, msg:"Unauthorized Access"});
    }
}

// Allows admins and approved creators (used for creating new courses)
module.exports.creatorAuth = async(req,res,next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        if(!token){
            return res.json({success:false, msg:"Unauthorized Access"});
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await userModel.findById(decoded.id);
        if(!user || (!user.isAdmin && !user.isCreator)){
            return res.json({success:false, msg:"Only creators or admins can perform this action"});
        }
        req.user = user;
        next();
    }catch(error){
        return res.json({success:false, msg:"Unauthorized Access"});
    }
}

// Resolve the target course from the request, given the id type and which
// request field holds the id. idType: "course" | "section" | "chapter".
async function resolveCourse(req, idType, field) {
    const readId = (key) => req.body?.[key] ?? req.query?.[key];

    if(idType === "course"){
        const courseId = readId(field || "courseId");
        return courseId ? await courseModel.findById(courseId) : null;
    }
    if(idType === "section"){
        const sectionId = readId(field || "sectionId");
        return sectionId ? await courseModel.findOne({ sections: sectionId }) : null;
    }
    if(idType === "chapter"){
        const chapterId = readId(field || "chapterId");
        if(!chapterId) return null;
        const section = await sectionModel.findOne({ chapters: chapterId }).select("_id");
        return section ? await courseModel.findOne({ sections: section._id }) : null;
    }
    return null;
}

// Allow only admins OR the course owner. Returns false (and responds) if denied.
function authorizeOwner(user, course, res) {
    if(!course){
        res.json({success:false, msg:"Course not found"});
        return false;
    }
    const isOwner = course.creator && course.creator.equals(user._id);
    if(!user.isAdmin && !isOwner){
        res.json({success:false, msg:"You are not authorized to manage this course"});
        return false;
    }
    return true;
}

// Full check (verify token + resolve course + authorize) for JSON/query routes
// where the body is already parsed before the route middleware runs.
module.exports.manageAuth = (idType, field) => async(req,res,next)=>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        if(!token){
            return res.json({success:false, msg:"Unauthorized Access"});
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await userModel.findById(decoded.id);
        if(!user){
            return res.json({success:false, msg:"Unauthorized Access"});
        }

        const course = await resolveCourse(req, idType, field);
        if(!authorizeOwner(user, course, res)) return;

        req.user = user;
        req.course = course;
        next();
    }catch(error){
        return res.json({success:false, msg:"Unauthorized Access"});
    }
}

// Ownership-only check. Assumes a prior middleware (e.g. creatorAuth) already
// set req.user. Use this AFTER multer on multipart routes, so the id in the
// form body is available when the course is resolved.
module.exports.courseOwnerCheck = (idType, field) => async(req,res,next)=>{
    try{
        if(!req.user){
            return res.json({success:false, msg:"Unauthorized Access"});
        }
        const course = await resolveCourse(req, idType, field);
        if(!authorizeOwner(req.user, course, res)) return;

        req.course = course;
        next();
    }catch(error){
        return res.json({success:false, msg:"Unauthorized Access"});
    }
}