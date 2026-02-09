import jwt, { SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../config/env";

export interface JWTPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (
  userId: mongoose.Types.ObjectId,
  email: string,
): string => {
  const payload: JWTPayload = {
    userId: userId.toString(),
    email,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
};

export const generateRefreshToken = (
  userId: mongoose.Types.ObjectId,
  email: string,
): string => {
  const payload: JWTPayload = {
    userId: userId.toString(),
    email,
  };

  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};
