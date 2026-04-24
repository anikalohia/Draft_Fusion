import mongoose from "mongoose";

export const connectDB = async()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/Dfuse")
        console.log("Connected the database")
    } catch (error) {
        console.log(error)
    }
}