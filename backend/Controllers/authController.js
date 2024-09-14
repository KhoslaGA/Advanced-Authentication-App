import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../Utils/generateTokenAndSetCookie.js";
import {
  sendResetPassword,
  sendVerificationEmail,
  sendResetSuccessEmail,
} from "../Mailtrap/emails.js";
import { sendWelcomeEmail } from "../Mailtrap/emails.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      throw new Error("All Fields are required");
    }
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    //*Create a random verification toke and save it to send it to user later on
    const verificationToken = Math.floor(
      100000 + Math.random() * 90000
    ).toString();

    // *Once everything is verified we will not create the user with req.body and save it
    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
      verificationToken: verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, //* 24hrs
    });
    await user.save();

    //*info is sent to jwt method to create and return a token
    generateTokenAndSetCookie(res, user._id);

    //*Send verification email to client with code
    await sendVerificationEmail(user.email, verificationToken);

    // *success message is sent to server with encrypted password
    res.status(201).json({
      message: "User Created Successfully",
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: "Some Error Occured please try again" });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    //*Send Welcome Email
    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      message: "Email verified successfully",
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (err) {
    console.log("Error in verifying email ", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { password, email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Password Incorrect. Please enter correct password",
      });
    }

    user.lastlogin = new Date();
    await user.save();

    return res.status(200).json({
      message: "Login Successful",
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (err) {
    console.log("Error in Login ", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found " });
    }
    // *Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 3 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    //*Send password reset email
    await sendResetPassword(
      user.email,
      `http://localhost:5173/reset-password/${resetToken}`,
      user.name
    );
    res
      .status(200)
      .json({ success: true, message: "Password Reset Link Sent to User" });
  } catch (err) {
    console.log("Error sending password reset email ", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpiresAt: { $gt: Date.now() },
//     });

//     if (!user) {
//       res.status(200).json({ success: false, message: "User not found" });
//     }

//     //* Update Password
//     const hashedPassword = await bcryptjs.hash(password, 10);
//     user.password = hashedPassword;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpiresAt = undefined;

//     // *Save updated password in database
//     await user.save();

//     //* send password reset successfull email
//     await sendResetSuccessEmail(user.email);
//   } catch (err) {
//     console.log("Error sending password reset success email ", err.message);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // update password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email, user.name);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (err) {
    console.log("Error in checkAuth", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
