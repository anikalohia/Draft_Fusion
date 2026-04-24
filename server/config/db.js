import mongoose from "mongoose";

export const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected the database")
    } catch (error) {
        console.log(error)
    }
}