const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (user) => {
return jwt.sign(
{
id: user._id,
email: user.email,
role: user.role || "user",
tokenVersion: user.tokenVersion
},
process.env.JWT_SECRET,
{
expiresIn: process.env.JWT_EXPIRES_IN || "1d"
}
);
};

const login = async (req, res) => {
try {
const { email, password } = req.body;


    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
        email: normalizedEmail
    });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    // Increment tokenVersion to invalidate previous sessions.
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $inc: { tokenVersion: 1 } },
        { new: true }
    );

    const token = generateToken(updatedUser);

    return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role || "user"
        }
    });

} catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}


};

const register = async (req, res) => {
try {
console.log("REGISTER API HIT");


    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
        email: normalizedEmail
    });

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "User already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "user"
    });

    return res.status(201).json({
        success: true,
        message: "Registration successful",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });

} catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "User already exists"
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}


};

const logout = async (req, res) => {
try {
console.log("LOGOUT API HIT");


    return res.status(200).json({
        success: true,
        message: "Logout successful. Remove the token from the client."
    });

} catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}


};

const getProfile = async (req, res) => {
try {
console.log("GET PROFILE API HIT");


    return res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        user: req.user
    });

} catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}


};

module.exports = {
login,
register,
logout,
getProfile
};
