const User = require("../models/User");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");


const generateToken = async (user) => {
    return jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"})
}

const register = async (req, res) => {
    try {
        const {title, email, password, role} = req.body;
        
        const existingUser = await User.findOne({email});

        if(existingUser) {
            throw new Error("User already exists")
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
            throw new Error("Invalid credentials")
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            throw new Error("Invalid credentials")
        }

        const token = await generateToken(user);

        return res.status(200).json({success: true, data: {token}})
    } catch (error) {
        next(error);
    }
}

module.exports = {register, login};
