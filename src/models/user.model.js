import mongoose , {Schema} from "mongoose";
import jwr from "jsonwebtoken";
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

        fullname : {
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
        return next(); //is password is not changed...directly return null 
    
    this.password=bcrypt.hash(this.password,10) //to encrypt password
    next();
}) //when "funtion"(here it is save....so just before saving something on database it will run this) is going to perform  this middleware will do something just before that

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}            //.methods.name this allows to create a method called name and we can perform anything with this 

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