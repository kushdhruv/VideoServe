import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=new Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true   //make it more easy to search.....a heavy thing to do..make code slow
        },

        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
        },

        fullName : {
            type : String,
            required : true,
            trim : true,
            index : true   //make it more easy to search
        },
        avatar : {
            type:String, //cloudinary url
            required:true,
        },
        coverimage : {
            type : String, // cloudinary url
        },
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        password : {
            type:String,
            required : [true,'Password is Required']
        },
        refreshToken : {
            type : String,
        }
     },
    {
        timestamps:true
    }
)
userSchema.pre("save", async function (next) {
    if(!this.isModified()) 
        return next(); //if password is not changed...directly return null 
    
    this.password= await bcrypt.hash(this.password,10) //to encrypt password
    next();
}) //when "funtion"(here it is save....so just before saving something on database it will run this) is going to perform  this middleware will do something just before that

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}            //.methods.name this allows to create a method called name and we can perform anything with this 

// to generate token....tokens are used to authenticate user and to give access to user to do something

//access token is used to access the user for a short period of time
userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
//refresh token is used to refresh the access token when it expires 
//jwt.sign is used to edit the token and to give access to user
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)