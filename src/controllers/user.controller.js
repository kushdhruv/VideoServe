import {asyncHandler} from "../utils//asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import mongoose from "mongoose"

//method to generate token
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false}); //to save the refreshToken in database without validation of password
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating token")
    }
}

const registerUser=asyncHandler( async (req,res)=>{
   
    //BLUEPRINT

    //1 get user detail from frontend
    //2 validation - not empty
    //3 check if uer already exists : username or by email
    //4 check for images , check for avatar
    //5 upload them to cloudinary , avatar
    //6 create user object - create entry in db
    //7 remove password and refresh tokken field from response
    //8 check for user creation
    //9 return response

//1) get user detail from frontend
    //req.body -> is used to capture the body which is requested
    // to get details from frontend when any post etc req is sent
    //by this we can just handle JSON typr data not file handling 
    const {fullName , username , email , password} = req.body
   // console.log(`Email ${email}`)


//2)Validation
    // if(fullname ==="")
    // {
    //     throw new ApiError(400,"Fullname is required")
    // }//and like this we can check for all OR we can do like this
    if(
        [fullName,username,email,password].some((field) => field?.trim() ==="")
    ){
        throw new ApiError(400,"All fileds are required")
    }
//3)check if user is already existed
    const existedUser =await User.findOne({
        //$or expects an array of conditions, where each condition is an object.
        $or : [{ username },{ email }]
    })
    if(existedUser)
        {
            throw new ApiError(409,"User with this email or username already exists")
        } 
//4)check for avatar and images
        const avatarLocalPath = req.files?.avatar[0]?.path;
        
        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        if(!avatarLocalPath)
        {
            throw new ApiError(400,"Avatar is required")
        }
//5)upload avatar , image on cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if(!avatar)
        {
            throw new ApiError(400,"Avatar is required")
        }

//6)create object and do entry
       const user = await User.create({
            fullName,
            avatar : avatar.url,
            coverImage : coverImage.url || "", //if coverImage does not exist then empty string....cas coverImage is not a must thing
            email,
            password,
            username : username.toLowerCase()
        })

//7)remove refreshToken and password from response
        const createdUser = await User.findById(user._id /* if user is successfully created*/).select(
            "-password  -refreshToken" //this will help to remove password and refreshToken from response
        )
//8)
        if(!createdUser)
        {
            throw new ApiError(500,"Something went wrong while registering the user")
        }
//9)return response
        return res.status(201).json(
            new ApiResponse(200,createdUser,"User registered Successfully")
        )

})

const loginUser = asyncHandler(async (req,res)=>{
 //req body ->data from frontend
 //username or email to validate
 //find the user
 //check for password
 //access and refresh token generation
 //send cookies with token to frontend  

 const {email , username , password} = req.body;
    if(!email && !username)
    {
        throw new ApiError(400,"Email or Username is required")
    }
    const user = await User.findOne({
        $or : [{email},{username}] // find by either email or username
    })
    if(!user)
    {
        throw new ApiError(404,"User not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid)
    {
        throw new ApiError(401,"Invalid Password")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); 

    const options = {
        httpOnly : true,
        secure: true
    }//to make the cookie secure so that it can't be accessed/edit by fontend

    return res.status(200)
    .cookie("accessToken",accessToken,options) //to send the cookie to frontend .cookie(key,value,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully")
    )
}) 

const logoutUser = asyncHandler(async (req,res)=>{
    User.findByIdAndUpdate(req.user._id,{
        $set : {
            refreshToken : ""
        },
    }, {new:true}//to get the updated user 
    )
    const options = {
        httpOnly : true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged out successfully")
    )
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"Refresh Token Required")
    }
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if(!user)
    {
        throw new ApiError(401,"User Not Found")
    }
    if(user.refreshToken !== incomingRefreshToken)
    {
        throw new ApiError(401,"Invalid Refresh Token or expired")
    }
    const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    const options = {
        httpOnly : true,
        secure: true
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(200,{accessToken,newRefreshToken},"Token Refreshed Successfully")
    )

})

const changePassword = asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword} = req.body;
    if(!oldPassword || !newPassword)
    {
        throw new ApiError(400,"Old Password and New Password are required")
    }
    const user = await User.findById(req.user._id);
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid)
    {
        throw new ApiError(401,"Invalid Password")
    }
    user.password = newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(
        new ApiResponse(200,{},"Password Changed Successfully")
    )
})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,{user:req.user},"User Details")
    )
})

const updateDetails = asyncHandler(async (req,res)=>{
    const {fullName,email} = req.body;
    if(!fullName || !email)
    {
        throw new ApiError(400,"Fullname or Email is required")
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
       $set : {
        fullName : fullName,
        email : email
       }
    },{new:true}).select("-password");
     
    return res.status(200).json(
        new ApiResponse(200,{user},"User Details Updated Successfully")
    )
})

const updateAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar)
    {
        throw new ApiError(400,"Avatar is required")
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set : {
            avatar : avatar.url
        }
    },{new:true}).select("-password");
    return res.status(200).json(
        new ApiResponse(200,{user},"Avatar Updated Successfully")
    )
})

const updateCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath)
    {
        throw new ApiError(400,"coverImage is required")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage)
    {
        throw new ApiError(400,"coverImage is required")
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set : {
            coverImage : coverImage.url
        }
    },{new:true}).select("-password");
    return res.status(200)
    .json(
        new ApiResponse(200,{user},"CoverImage Updated Successfully")
    )
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req.params;
    if(!username?.trim()) // used trim() to remove any extra spaces from username as it is a string
    {
        throw new ApiError(400,"Username is required/not found")
    }
    //User.aggregate([{},{},{},{}...so on]) //this is how we write stages in aggregate pipeline in mongoose and it returns an array
    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase(),
            } // first stage to get user details of the given username
        },
        //to get how many subscribers a channel have we need to find all subscriber from subscriptionmodel who have subscribed channel(who have that name in its channel part) as the one we want and then count all of it
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
            },
            //to get how many channels we have subscribed
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            },
            //to add fields in it
            //we use $ when we are dealing with variable of field like subscribers or subscribedTo
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                channelSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        if : {$in : [req.user?._id , "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
    {
        $project : {
            fullName : 1,
            username : 1,
            avatar : 1,
            coverImage : 1,
            subscribersCount : 1,
            channelSubscribedToCount : 1,
            isSubscribed : 1,
            email : 1
        }
        }
    ])
})

const watchHistory = asyncHandler(async(req,res)=>{
    const user = User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user?._id) // actual id we send to mongoose is kinf of Object("id" : "wefwefwe") so convert are normal id into this we used it...User.find(_id) this funct by defaults automatically converts so we dont write it here
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                //to add nested pipeline
                pipeline : [{
                    $lookup : {
                        from : "users",
                        localField : "owner",
                        foreignField : "_id",
                        as : "owner",
                        pipeline : [{
                            $project : {
                                fullName : 1,
                                username : 1,
                                avatar : 1
                            }
                        }]
                    }
                },
                {
                    $addFields : {
                        owner : {
                            $first : "$owner" //to get first element from array owner
                        }
                    }
                }]
            }
        }
    ])

    return res.status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory , "Watch history fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    watchHistory,
}