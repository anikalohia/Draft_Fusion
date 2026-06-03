import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/Dfuse";
        await mongoose.connect(mongoURI);
        console.log("Connected to the database");
    } catch (error) {
        console.log("Database connection error:", error);
    }
};