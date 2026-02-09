import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}
