const User = require("../models/users");
const redisClient = require("../config/redis");
const jwt = require('jsonwebtoken');
const adminMiddleware = async(req,res,next)=>{
    try{
       const {token} = req.cookies;
    if(!token)
        throw new Error("Token not found");
    const payload = jwt.verify(token,process.env.JWT_KEY);

    const {_id} = payload;
    const result = await User.findById(_id);
    if(!result)
        throw new Error("User Doesn't exists..");
    if(result.role !== 'admin')
        throw new Error("Invalid token");

    // Check is the token is present in the redis db or not ..
     const isBlacklisted = await redisClient.exists(`token:${token}`);
     if(isBlacklisted)
        throw new Error("Access Denied");
     

    req.user = result;
    next();

    }catch(err){
        return res.status(401).send("Error :"+err.message);
    } 
}
module.exports = adminMiddleware;