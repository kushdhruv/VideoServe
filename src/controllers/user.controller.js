import {asyncHandler} from "../utils//asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

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
    const {fullname , username , email , password} = req.body
    console.log(`Email ${email}`)


//2)Validation
    // if(fullname ==="")
    // {
    //     throw new ApiError(400,"Fullname is required")
    // }//and like this we can check for all OR we can do like this
    if(
        [fullname,username,email,password].some((field) => field?.trim() ==="")
    ){
        throw new ApiError(400,"All fileds are required")
    }
//3)check if user is already existed
    const existedUser = User.findOne({
        //$or expects an array of conditions, where each condition is an object.
        $or : [{ username },{ email }]
    })
    if(existedUser)
        {
            throw new ApiError(409,"User with this email or username already exists")
        } 
//4)check for avatar and images
        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;
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
            new ApiResponse(200,createdUser,"User reegistered Successfully")
        )

})

export {
    registerUser,
}