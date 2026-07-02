const User = require("../models/User");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");


const generateToken = async (user) => {
    return jwt.sign({ id: user._id, title: user.title, email: user.email }, process.env.JWT_SECRET, {expiresIn: "7d"})
}

const register = async (req, res, next) => {
    try {
        const {title, email, password, role} = req.body;
        
        const existingUser = await User.findOne({email});

        if(existingUser) {
            const error = new Error("User already exists");
            error.status = 400;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({title, email, password: hashedPassword, role})

        const token = await generateToken(user);
        
        return res.status(201).json({success: true, data: {token}})
    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        
        const user = await User.findOne({email});
        
        if(!user) {
            const error = new Error("Invalid credentials");
            error.status = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            const error = new Error("Invalid credentials");
            error.status = 401;
            throw error;
        }

        const token = await generateToken(user);

        return res.status(200).json({success: true, data: {token}})
    } catch (error) {
        next(error);
    }
}

module.exports = {register, login};
