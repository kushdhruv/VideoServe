import {v2 as cloudinary} from "cloudinary"
import fs from "fs" //a nodejs library used to handle,edit files

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;

        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto" //this will automatically detect if it is image pdf or video
        })

        //file has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saved temperoray file when operation got failed
        return null;
    }
}

export {uploadOnCloudinary}