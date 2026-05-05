import userModel from "../models/userModels.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import otpGenerator from "otp-generator";
import OTP from "../models/OtpModel.js";
import { sendEmail } from "../config/mail.js";

// JWT Token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};


//  LOGIN WITH PASSWORD

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "Password is incorrect" });
        }

        const token = createToken(user._id);

        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error in login" });
    }
};


//  REGISTER USER

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const exists = await userModel.findOne({ email });

        if (exists) {
            return res.json({ success: false, message: "Email already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email" });
        }

        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error in register" });
    }
};

const sendOtp = async (req, res) => {
    const { email } = req.body;

    const otp = otpGenerator.generate(6, {
        digits: true,
        upperCase: false,
        alphabets: false,
        specialChars: false,
    });

    await OTP.deleteMany({ email });

    await OTP.create({
        email,
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendEmail(
        email,
        "Your OTP Code",
        `Your OTP is ${otp}`
    );

    res.json({ success: true, message: "OTP sent" });
};

//  VERIFY OTP LOGIN

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const record = await OTP.findOne({ email, otp });

        if (!record) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (record.expiresAt < Date.now()) {
            return res.json({ success: false, message: "OTP expired" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // delete OTP after success
        await OTP.deleteMany({ email });

        const token = createToken(user._id);

        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error verifying OTP" });
    }
};

export { loginUser, registerUser, sendOtp, verifyOtp };