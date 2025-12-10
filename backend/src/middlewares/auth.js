const jwt =  require("jsonwebtoken");
const userModel = require("../models/user.model");

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