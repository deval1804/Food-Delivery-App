import express from "express";
import {
  loginUser,
  registerUser,
  sendOtp,
  verifyOtp
} from "../controllers/userController.js";

const userRouter = express.Router();

// 🔐 Password based
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// 🔥 OTP based
userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);

export default userRouter;