import { Router } from "express";
import {
  signup,
  login,
  getProfile,
  logout,
  getAllUsers,
  verifyEmail,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "./user.controller";
import { validate } from "../../common/middlewares/validate.middleware";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { catchAsync } from "../../common/middlewares/catch.middleware";
import { userValidation } from "./user.validation";
import { authRateLimiter } from "../../common/middlewares/rateLimit.middleware";

const router = Router();

// Public routes
router.post(
  "/auth/signup",
  authRateLimiter,
  validate(userValidation.signup),
  catchAsync(signup),
);
router.post(
  "/auth/login",
  authRateLimiter,
  validate(userValidation.login),
  catchAsync(login),
);
router.post("/auth/refresh", catchAsync(refreshToken));

router.get("/auth/verify-email", authRateLimiter, catchAsync(verifyEmail));
router.post(
  "/auth/forgot-password",
  authRateLimiter,
  validate(userValidation.forgotPassword),
  catchAsync(forgotPassword),
);
router.post(
  "/auth/reset-password",
  authRateLimiter,
  validate(userValidation.resetPassword),
  catchAsync(resetPassword),
);

// Protected routes
router.get("/auth/profile", authMiddleware, catchAsync(getProfile));
router.post("/auth/logout", authMiddleware, catchAsync(logout));
router.get("/users", authMiddleware, catchAsync(getAllUsers));

export default router;
