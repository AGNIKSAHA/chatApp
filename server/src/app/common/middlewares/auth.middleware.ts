import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JWTPayload } from "../utils/jwt";
import mongoose from "mongoose";

export interface AuthRequest extends Request {
  user?: {
    userId: mongoose.Types.ObjectId;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    let token = req.cookies.accessToken;

    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const decoded: JWTPayload = verifyAccessToken(token);

    req.user = {
      userId: new mongoose.Types.ObjectId(decoded.userId),
      email: decoded.email,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
