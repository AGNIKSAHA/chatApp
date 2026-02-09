import { RefreshToken } from "./refreshToken.model";
import {
  verifyRefreshToken,
  generateAccessToken,
} from "../../common/utils/jwt";
import mongoose from "mongoose";
import { AppError } from "../../common/middlewares/error.middleware";

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{ accessToken: string }> => {
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Check if refresh token exists in database
  const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

  if (!tokenDoc) {
    throw new AppError(401, "Invalid refresh token");
  }

  // Check if token is expired
  if (tokenDoc.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: tokenDoc._id });
    throw new AppError(401, "Refresh token expired");
  }

  // Generate new access token
  const accessToken = generateAccessToken(
    new mongoose.Types.ObjectId(decoded.userId),
    decoded.email,
  );

  return { accessToken };
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await RefreshToken.deleteOne({ token });
};

export const revokeAllUserTokens = async (
  userId: mongoose.Types.ObjectId,
): Promise<void> => {
  await RefreshToken.deleteMany({ userId });
};
