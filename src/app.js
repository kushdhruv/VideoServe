import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

//SET SO THAT WE CAN RECEIVE JSON FROM WEB...LIMIT TO SET THE SIZE OF JSON
app.use(express.json,({limit:"16kb"}))

//EVERY WEB ENGINE HAVE THEIR OWN SETTINGS...SO TO ADJUST ACCORDINGLY WE DO THIS
app.use(urlencoded({extended:true, limit:"16kb"}))

//IN PUBLIC WE STORE IMGS FEVICON
app.use(express.static("public"))
app.use(cookieParser())

export { app }