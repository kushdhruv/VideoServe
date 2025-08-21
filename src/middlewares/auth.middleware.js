import { jwt } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT =asyncHandler(async (req,res,next)=>{
    try {
        //1) check if token is present in the request header
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ",""); // as authorization is in the form of "Bearer token" and we only want token part so we will remove bearer from it
        if(!accessToken)
        {
            throw new ApiError(401,"Access Token Required")
        }
        //2) verify the token
        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
        //3) if token is valid...extract the user id from the token
        const user = User.findById(decodedToken.userId)
        if(!user)
        { throw new ApiError(401,"User Not Found")}
        //4) if user is present...attach the user to the request object
            req.user = user; // now we can access the user from req.user
            next();
    } catch (error) {
        throw new ApiError(401,"Invalid Token")
    }
})  
 //this middleware will be used to check if the user is authenticated or not
