import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { user as User } from '../Models/user.js';
import dotenv from 'dotenv';
dotenv.config();

export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });
        res.status(201).json({ success: true, message: "User created" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const foundUser = await User.findOne({ email });
        if (!foundUser) return res.status(400).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ success: true, token, user: { id: foundUser._id, username: foundUser.username, email: foundUser.email } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const foundUser = await User.findById(req.userId).select('-password');
        res.status(200).json({ success: true, user: foundUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
