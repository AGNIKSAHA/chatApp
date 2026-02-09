import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // Log unexpected errors
  console.error("Unexpected error:", err);

  res.status(500).json({
    status: "error",
    message:
      env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};
