import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true, minlength: 3, maxlength: 30},
    email: {type: String, unique: true},
    password: {type: String, minlength: 6},
    createdAt: { type: Date, default: Date.now }
})



export const user = mongoose.model('User',userSchema)