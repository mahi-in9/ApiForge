const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    try {
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];

        }
        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, no token" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "User no longer exists" });
        }
        req.user = user;
        return next(); // Explicit return stops execution
    } catch (error) {
        console.error(error);
        return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }


}

module.exports = { protect };