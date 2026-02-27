import { Request, Response } from "express";
import { User } from "./user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../common/utils/jwt";
import mongoose from "mongoose";
import { sanitizeUser, sanitizeUsers } from "./user.helpers";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshToken } from "../token/refreshToken.model";
import { AppError } from "../../common/middlewares/error.middleware";
import crypto from "crypto";
import { sendEmail } from "../../common/utils/mail";
import { env } from "../../common/config/env";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body as SignupDto;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new AppError(
      400,
      existingUser.email === email
        ? "Email already registered"
        : "Username already taken",
    );
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create new user
  const user = new User({
    username,
    email,
    password,
    verificationToken,
    verificationTokenExpires,
    isVerified: false,
  });

  await user.save();

  // Send verification email
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  try {
    await sendEmail({
      to: email,
      subject: "Verify your email address",
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Continue anyway, user can request resend later (feature to be added)
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.email);
  const refreshToken = generateRefreshToken(user._id, user.email);

  // Save refresh token
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
  });

  // Set cookies
  const cookieOptions: any = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    message:
      "User registered successfully. Please check your email to verify your account.",
    user: sanitizeUser(user),
  });
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.query;

  if (!token) {
    throw new AppError(400, "Verification token is required");
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(400, "Invalid or expired verification token");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({
    message: "Email verified successfully",
  });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    throw new AppError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    // Return 200 to avoid email harvesting
    res.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpires;
  await user.save();

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Password Reset</h1>
          <p>You requested a password reset. Please click the link below to reset your password:</p>
          <div style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </div>
          <p>Alternatively, copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send reset email:", error);
    throw new AppError(500, "Failed to send reset email");
  }

  res.json({ message: "Reset link sent to your email" });
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new AppError(400, "Token and password are required");
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(400, "Invalid or expired reset token");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    message:
      "Password reset successfully. You can now login with your new password.",
  });
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new AppError(401, "Refresh token required");
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const existingToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded.userId,
    });

    if (!existingToken) {
      throw new AppError(403, "Refreh token is not valid!");
    }

    const newAccessToken = generateAccessToken(
      new mongoose.Types.ObjectId(decoded.userId),
      decoded.email,
    );

    const cookieOptions: any = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ message: "Token refreshed" });
  } catch (error) {
    throw new AppError(403, "Invalid refresh token");
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginDto;

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid credentials");
  }

  // Check if user is verified
  if (!user.isVerified) {
    throw new AppError(
      401,
      "Please verify your email address before logging in",
    );
  }

  // Update online status
  user.isOnline = true;
  await user.save();

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.email);
  const refreshToken = generateRefreshToken(user._id, user.email);

  // Save refresh token
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
  });

  // Set cookies
  const cookieOptions: any = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    message: "Login successful",
    user: sanitizeUser(user),
  });
};

export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError(401, "Unauthorized");
  }

  const user = await User.findById(req.user.userId).select("-password");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  res.json({
    user: sanitizeUser(user),
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError(401, "Unauthorized");
  }

  // Update user status
  await User.findByIdAndUpdate(req.user.userId, {
    isOnline: false,
    lastSeen: new Date(),
  });

  // Delete refresh tokens
  await RefreshToken.deleteMany({ userId: req.user.userId });

  // Clear cookies
  const cookieOptions: any = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.json({ message: "Logout successful" });
};

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError(401, "Unauthorized");
  }

  const users = await User.find({ _id: { $ne: req.user.userId } }).select(
    "-password",
  );

  res.json({
    users: sanitizeUsers(users),
  });
};
